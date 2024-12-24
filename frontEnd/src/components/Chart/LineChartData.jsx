import React, { useState, useEffect } from "react";
import {
  Menu,
  MenuItem,
  Button,
  Divider,
  Checkbox,
  FormControlLabel,
  TextField,
  Select,
  MenuItem as MuiMenuItem,
  Collapse,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 250, // 固定Menu寬度，避免移動
    color: theme.palette.grey[800],
    boxShadow: "rgba(0, 0, 0, 0.1) 0px 10px 15px",
  },
}));

const SaleChartWithMenu = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [timeRange, setTimeRange] = useState("month");

  const [yearFilter, setYearFilter] = useState("2024");
  const [monthFilter, setMonthFilter] = useState("");

  const [platformsOpen, setPlatformsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // 初始數據加載
  useEffect(() => {
    fetch("http://localhost:8081/transactionDetailTable_saleDetail")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        const platforms = [...new Set(data.map((item) => item.platform))];
        setPlatforms(platforms);
        setSelectedPlatforms(platforms);
        setFilteredData(formatMonthlyData(data, platforms));
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  const formatMonthlyData = (data, platforms) => {
    const months = [
      ...new Set(data.map((item) => `${item.year}-${item.month}`)),
    ];
    return months.map((month) => {
      const [year, monthNumber] = month.split("-");
      const monthData = { month: `${year}-${monthNumber}` };
      platforms.forEach((platform) => {
        const platformData = data.find(
          (item) =>
            item.platform === platform &&
            item.year === parseInt(year) &&
            item.month === parseInt(monthNumber)
        );
        monthData[platform] = platformData ? platformData.total_quantity : 0;
      });
      return monthData;
    });
  };

  const handlePlatformChange = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((item) => item !== platform)
        : [...prev, platform]
    );
  };

  const applyFilters = () => {
    setFilteredData(formatMonthlyData(data, selectedPlatforms));
  };

  return (
    <div className="bg-white rounded-md mr-5">
      <div className="flex justify-between p-5">
        <h1 className="font-title font-bold" style={{ fontSize: "24px" }}>
          Sales Detail
        </h1>
        <Button
          id="filter-menu-button"
          aria-controls={open ? "filter-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          variant="contained"
          disableElevation
          onClick={handleClick}
          endIcon={<KeyboardArrowDownIcon />}
        >
          Filters
        </Button>
        <StyledMenu
          id="filter-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{ disablePadding: true }} // 防止額外空間導致問題
        >
          <MenuItem
            disableRipple
            onClick={() => setPlatformsOpen(!platformsOpen)}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <strong>Platforms</strong>
            <KeyboardArrowDownIcon
              style={{
                transform: platformsOpen ? "rotate(180deg)" : "rotate(0)",
              }}
            />
          </MenuItem>

          <Collapse in={platformsOpen} timeout="auto" unmountOnExit>
            <div
              style={{
                padding: "8px 16px",
                display: "flex",
                flexDirection: "column",
                maxHeight: "200px", // 設置最大高度，避免超出畫面
                overflowY: "auto", // 加入滾動條
              }}
            >
              {platforms.map((platform) => (
                <FormControlLabel
                  key={platform}
                  control={
                    <Checkbox
                      checked={selectedPlatforms.includes(platform)}
                      onChange={() => handlePlatformChange(platform)}
                    />
                  }
                  label={platform}
                />
              ))}
            </div>
          </Collapse>

          <Divider sx={{ my: 0.5 }} />
          <MenuItem disableRipple>
            <strong>Time Range</strong>
          </MenuItem>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            fullWidth
            style={{ marginBottom: "8px" }}
          >
            <MuiMenuItem value="month">Monthly</MuiMenuItem>
            <MuiMenuItem value="daily">Daily</MuiMenuItem>
          </Select>
          {timeRange === "daily" && (
            <>
              <TextField
                label="Year"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                placeholder="e.g., 06 for June"
                fullWidth
                margin="dense"
              />
            </>
          )}

          <Button
            variant="contained"
            onClick={applyFilters}
            fullWidth
            sx={{ mt: 1 }}
          >
            Apply Filters
          </Button>
        </StyledMenu>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={filteredData}
          margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={timeRange === "daily" ? "day" : "month"} />
          <YAxis />
          <Tooltip />
          <Legend layout="horizontal" verticalAlign="top" align="center" />
          {selectedPlatforms.map((platform, index) => (
            <Line
              key={platform}
              type="monotone"
              dataKey={platform}
              name={platform}
              stroke={`hsl(${
                (index * 360) / selectedPlatforms.length
              }, 70%, 60%)`}
              dot={false}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SaleChartWithMenu;
