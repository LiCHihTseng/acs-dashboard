import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Button,
  Menu,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

// 注册 Chart.js 组件
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BarChartComponent = () => {
  const [platforms, setPlatforms] = useState([]); // 所有平台列表
  const [selectedPlatform, setSelectedPlatform] = useState(""); // 选中的单一平台
  const [topN, setTopN] = useState(5); // 默认 Top 5
  const [chartData, setChartData] = useState(null); // 图表数据

  const [anchorEl, setAnchorEl] = useState(null); // 控制菜单
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // 获取可用平台列表
  useEffect(() => {
    fetch("http://localhost:8081/transactionDetailTable_platform")
      .then((res) => res.json())
      .then((data) => {
        const platformList = data.map((item) => item.platform);
        setPlatforms(platformList);
        if (platformList.length > 0) {
          setSelectedPlatform(platformList[0]); // 默认选中第一个平台
          fetchChartData(platformList[0], topN); // 加载默认数据
        }
      })
      .catch((err) => console.error("Error fetching platform list:", err));
  }, []);

  // 获取图表数据
  const fetchChartData = (platform, limit) => {
    if (!platform) return;
  
    fetch(
      `http://localhost:8081/transactionDetailTable_shoesTop?platform=${platform}&limit=${limit}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          // 按照总数量排序并限制数据量
          const topData = data.slice(0, limit);
  
          // X 轴标签为鞋型型号
          const labels = topData.map((item) => item.shoe_model);
  
          // 准备数据
          const datasets = [
            {
              label: platform,
              data: topData.map((item) => item.quantity || 0),
              backgroundColor: "rgba(255, 0, 0, 0.6)",
            },
          ];
  
          setChartData({
            labels,
            datasets,
          });
        }
      })
      .catch((err) => console.error("Error fetching chart data:", err));
  };

  // 处理用户选择平台
  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
    fetchChartData(platform, topN);
    handleMenuClose(); // 关闭菜单
  };

  // 处理 Top N 的更改
  const handleTopNChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setTopN(value);
      fetchChartData(selectedPlatform, value); // 更新图表数据
    }
  };

  return (
    <div className="bg-white m-5 p-5 rounded shadow">
      {/* 打开过滤菜单按钮 */}
      <div className="flex justify-between items-center">
        <h1 className="font-title font-semibold">Top Selling Shoes</h1>
        <Button
          aria-controls={open ? "platform-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleMenuClick}
          sx={{
            color: "black",
            backgroundColor: "white",
            "&:hover": {
              backgroundColor: "#f0f0f0",
            },
            boxShadow: "none",
            marginBottom: 2
          }} 
          
        >
          Open Filter Menu
          <FontAwesomeIcon icon={faChevronDown} className="fa-xs pl-3" />
        </Button>
      </div>

      {/* 菜单 */}
      <Menu
  id="platform-menu"
  anchorEl={anchorEl}
  open={open}
  onClose={handleMenuClose}
  anchorOrigin={{
    vertical: "bottom",
    horizontal: "left",
  }} // 菜单显示在按钮正下方
  PaperProps={{
    style: {
      maxWidth: "300px", // 固定宽度
      padding: "10px",
    },
  }}
>
  {/* 滚动的单选列表 */}
  <div style={{ maxHeight: "200px", overflowY: "auto" }}>
    <RadioGroup
      value={selectedPlatform}
      onChange={(e) => handlePlatformChange(e.target.value)}
    >
      {platforms.map((platform, index) => (
        <FormControlLabel
          key={platform}
          value={platform}
          control={<Radio />}
          label={platform}
        />
      ))}
    </RadioGroup>
  </div>

  {/* 固定的 TextField */}
  <div style={{ paddingTop: "10px", borderTop: "1px solid #ddd" }} className="flex justify-between items-center">
    <h2 className="font-title font-semibold">Display Shoes</h2>
  <TextField
    label="Top N"
    type="number"
    value={topN}
    onChange={handleTopNChange}
    InputProps={{ inputProps: { min: 1 } }}
    fullWidth={false} // 取消全宽显示
    sx={{
      width: "30%", // 设置宽度
      height: "50px", // 设置高度
      "& .MuiInputBase-root": {
        height: "100%", // 内部输入框调整高度
      },
    }}
  />
</div>
</Menu>


      {/* Top N 输入框 */}


      {/* 图表展示 */}
      <div className="mt-5">
        {chartData && (
          <Bar
            data={chartData}
            options={{
              indexAxis: "y", // 横向显示
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
                tooltip: {
                  callbacks: {
                    label: function (tooltipItem) {
                      return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
                    },
                  },
                },
              },
              scales: {
                x: {
                  beginAtZero: true,
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default BarChartComponent;
