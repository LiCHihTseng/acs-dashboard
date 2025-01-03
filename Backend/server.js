const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());

// MySQL Database Connection Setup
const db = mysql.createConnection({
    host: "52.45.202.45",
    user: "jason.tseng",
    password: "2024WinterProject",
    database: "dashboardProject"
});

// Root Endpoint to Test Backend Status
app.get('/', (req, res) => {
    return res.json("From Backend Side");
});

// API 1: Get Top Platform by Current Month Sales with Growth Percentage
app.get('/transactionDetailTable', (req, res) => {
    const sql = `
        SELECT platform, current_month_sales, previous_month_sales, 
               ROUND((current_month_sales - previous_month_sales) / NULLIF(previous_month_sales, 0) * 100, 2) AS growth_percentage
        FROM (
            SELECT platform,
                   SUM(CASE WHEN MONTH(transactionTimestamp) = MONTH(CURRENT_DATE) AND YEAR(transactionTimestamp) = YEAR(CURRENT_DATE) THEN qty ELSE 0 END) AS current_month_sales,
                   SUM(CASE WHEN MONTH(transactionTimestamp) = MONTH(CURRENT_DATE) - 1 AND YEAR(transactionTimestamp) = YEAR(CURRENT_DATE) THEN qty ELSE 0 END) AS previous_month_sales
            FROM transactionDetailTable 
            GROUP BY platform
        ) sales_data 
        ORDER BY current_month_sales DESC 
        LIMIT 1;
    `;
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

// API 2: Get Top Shoe Model by Total Quantity Sold Last Month
app.get('/transactionDetailTable_sellerID', (req, res) => {
    const sql = `
        SELECT REPLACE(SUBSTRING_INDEX(sku, ',', 1), '{', '') AS shoe_model, 
               SUM(qty) AS total_quantity 
        FROM transactionDetailTable 
        WHERE (
            (MONTH(CURRENT_DATE) = 1 AND MONTH(transactionTimestamp) = 12 AND YEAR(transactionTimestamp) = YEAR(CURRENT_DATE) - 1) 
            OR 
            (MONTH(CURRENT_DATE) != 1 AND MONTH(transactionTimestamp) = MONTH(CURRENT_DATE) - 1 AND YEAR(transactionTimestamp) = YEAR(CURRENT_DATE))
        )
        GROUP BY shoe_model 
        ORDER BY total_quantity DESC 
        LIMIT 1;
    `;

    db.query(sql, (err, data) => {
        if (err) return res.json(err);

        if (data.length === 0) {
            // 返回一个默认的占位数据
            return res.json([{
                shoe_model: "No Data",
                total_quantity: 0
            }]);
        }

        return res.json(data);
    });
});

// API 3: Get Order Growth Percentage Between Current and Previous Month
app.get('/transactionDetailTable_totalOrder', (req, res) => {
    const sql = `
        SELECT current_month_orders, previous_month_orders, 
               ROUND((current_month_orders - previous_month_orders) / NULLIF(previous_month_orders, 0) * 100, 2) AS growth_percentage 
        FROM (
            SELECT COUNT(*) AS current_month_orders 
            FROM transactionDetailTable 
            WHERE MONTH(transactionTimestamp) = MONTH(CURRENT_DATE) AND YEAR(transactionTimestamp) = YEAR(CURRENT_DATE)
        ) current_month_data, 
        (
            SELECT COUNT(*) AS previous_month_orders 
            FROM transactionDetailTable 
            WHERE MONTH(transactionTimestamp) = MONTH(CURRENT_DATE) - 1 AND YEAR(transactionTimestamp) = YEAR(CURRENT_DATE)
        ) previous_month_data;
    `;
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

// API 4: Get the Last Transaction Deal Details
app.get('/transactionDetailTable_lastDeal', (req, res) => {
    const sql = `
        SELECT REPLACE(SUBSTRING_INDEX(sku, ',', 1), '{', '') AS shoe_model, 
               transactionDate, transactionTimestamp, sku, qty, totalPayment, currency 
        FROM transactionDetailTable 
        ORDER BY transactionTimestamp DESC 
        LIMIT 1;
    `;
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

// API 5: Get Total Sales Quantity Grouped by Year, Month, and Platform
app.get('/transactionDetailTable_saleDetail', (req, res) => {
    const sql = `
        SELECT YEAR(transactionTimestamp) AS year, 
               MONTH(transactionTimestamp) AS month, 
               platform, SUM(qty) AS total_quantity 
        FROM transactionDetailTable 
        WHERE transactionTimestamp IS NOT NULL AND transactionTimestamp != '0000-00-00' 
        GROUP BY YEAR(transactionTimestamp), MONTH(transactionTimestamp), platform 
        HAVING year != 0 AND month != 0 
        ORDER BY year, month, platform;
    `;
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

// API 6: Get Distinct Platforms from the Table
app.get('/transactionDetailTable_platform', (req, res) => {
    const sql = `SELECT DISTINCT platform FROM transactionDetailTable;`;
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

// API 7: Get Daily Sales Details Based on Year and Month
app.get('/transactionDetailTable_dailyDetail', (req, res) => {
    const { year, month } = req.query;
    if (!year || !month) {
        return res.status(400).json({ error: "Year and Month are required." });
    }

    const sql = `
        SELECT DAY(transactionTimestamp) AS day, platform, SUM(qty) AS daily_quantity 
        FROM transactionDetailTable 
        WHERE YEAR(transactionTimestamp) = ? AND MONTH(transactionTimestamp) = ? 
        GROUP BY DAY(transactionTimestamp), platform 
        ORDER BY day;
    `;
    db.query(sql, [year, month], (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

app.get('/transactionDetailTable_shoesDetail', (req, res) => {
    const { platform, limit, offset, year, month, day, timeRange, startTime, endTime, sortBy, sortDirection } = req.query;

    let sql = `
        SELECT
           REPLACE(SUBSTRING_INDEX(sku, ',', 1), '{', '') AS shoe_model,
           platform,
           qty AS total_quantity,
           transactionTimestamp
        FROM transactionDetailTable
        WHERE 1=1
    `;
    let countSql = `
        SELECT COUNT(*) AS totalRecords
        FROM transactionDetailTable
        WHERE 1=1
    `;
    const queryParams = [];
    const countParams = [];

    // 平台篩選
    if (platform) {
        sql += ` AND platform = ?`;
        countSql += ` AND platform = ?`;
        queryParams.push(platform);
        countParams.push(platform);
    }

    // 日期篩選
    if (year) {
        sql += ` AND YEAR(transactionTimestamp) = ?`;
        countSql += ` AND YEAR(transactionTimestamp) = ?`;
        queryParams.push(parseInt(year, 10));
        countParams.push(parseInt(year, 10));
    }

    if (month) {
        sql += ` AND MONTH(transactionTimestamp) = ?`;
        countSql += ` AND MONTH(transactionTimestamp) = ?`;
        queryParams.push(parseInt(month, 10));
        countParams.push(parseInt(month, 10));
    }

    if (day) {
        sql += ` AND DAY(transactionTimestamp) = ?`;
        countSql += ` AND DAY(transactionTimestamp) = ?`;
        queryParams.push(parseInt(day, 10));
        countParams.push(parseInt(day, 10));
    }

    // 時間範圍篩選
    if (startTime && endTime) {
        sql += ` AND TIME(transactionTimestamp) BETWEEN ? AND ?`;
        countSql += ` AND TIME(transactionTimestamp) BETWEEN ? AND ?`;
        queryParams.push(startTime, endTime);
        countParams.push(startTime, endTime);
    }

    if (timeRange) {
        const currentTime = new Date();
        const pastTime = new Date(currentTime.getTime() - parseInt(timeRange, 10) * 60 * 60 * 1000);
        sql += ` AND transactionTimestamp >= ?`;
        countSql += ` AND transactionTimestamp >= ?`;
        queryParams.push(pastTime.toISOString().slice(0, 19).replace('T', ' '));
        countParams.push(pastTime.toISOString().slice(0, 19).replace('T', ' '));
    }

    // 排序
    if (sortBy) {
        const validColumns = ['shoe_model', 'platform', 'total_quantity', 'transactionTimestamp'];
        if (validColumns.includes(sortBy)) {
            const direction = sortDirection === 'desc' ? 'DESC' : 'ASC';
            sql += ` ORDER BY ${mysql.escapeId(sortBy)} ${direction}`;
        } else {
            sql += ` ORDER BY transactionTimestamp DESC`;
        }
    } else {
        sql += ` ORDER BY transactionTimestamp DESC`;
    }

    // 分頁
    if (limit) {
        sql += ` LIMIT ?`;
        queryParams.push(parseInt(limit, 10));
    }

    if (offset) {
        sql += ` OFFSET ?`;
        queryParams.push(parseInt(offset, 10));
    }

    db.query(countSql, countParams, (countErr, countResult) => {
        if (countErr) return res.status(500).json(countErr);

        const totalRecords = countResult[0]?.totalRecords || 0;

        db.query(sql, queryParams, (err, data) => {
            if (err) return res.status(500).json(err);

            return res.json({ data, totalRecords });
        });
    });
});


app.get('/transactionDetailTable_shoesTop', (req, res) => {
    // 提取平台和 Top N 參數
    const platform = req.query.platform; // 單一平台，例如 "Amazon"
    const limit = parseInt(req.query.limit, 10) || 5; // 默認限制為 5

    // 驗證平台是否提供
    if (!platform) {
        return res.status(400).json({ error: 'Platform parameter is required' });
    }

    // 動態 SQL 查詢，按單一平台查詢
    const sql = `
        SELECT 
            REPLACE(SUBSTRING_INDEX(sku, ',', 1), '{', '') AS shoe_model,
            SUM(CASE WHEN platform = '${platform}' THEN qty ELSE 0 END) AS quantity,
            SUM(qty) AS total_quantity
        FROM transactionDetailTable
        WHERE platform = '${platform}' 
        GROUP BY REPLACE(SUBSTRING_INDEX(sku, ',', 1), '{', '')
        ORDER BY quantity DESC
        LIMIT ${limit}; -- 使用動態的 LIMIT
    `;

    // 執行查詢
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query failed' });
        }

        res.json(results);
    });
});


// Start the Backend Server on Port 8081
app.listen(8081, () => {
    console.log("Backend server is running on http://localhost:8081");
});
