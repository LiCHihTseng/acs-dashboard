import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { TextField, Button, Menu, MenuItem } from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const DonutChartComponent = () => {
  const [chartData, setChartData] = useState(null); // Chart data
  const [totalSales, setTotalSales] = useState(0); // Total sales for display
  const [year, setYear] = useState("2024"); // Default year to 2024
  const [month, setMonth] = useState(""); // Default month to January
  const [day, setDay] = useState(""); // User input for day
  const [anchorEl, setAnchorEl] = useState(null); // Control menu
  const open = Boolean(anchorEl);

  const MONTH_NAMES = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ];

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Fetch chart data
  const fetchChartData = () => {
    const query = new URLSearchParams({
      year: year || "",
      month: month || "",
      day: day || "",
    });

    fetch(
      `http://localhost:8081/transactionDetailTable_platformTopN?${query.toString()}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const labels = data.map((item) => item.platform); // Platform names
          const quantities = data.map((item) => item.total_quantity); // Sales quantities
          const total = quantities.reduce((sum, quantity) => sum + quantity, 0);

          setTotalSales(total); // Update total sales

          setChartData({
            labels,
            datasets: [
              {
                data: quantities,
                backgroundColor: ["#32FF7E", "#E7A300", "#FF3F34", "#00C9A7", "#9C89B8"], // Custom colors
                hoverOffset: 4,
              },
            ],
          });
        }
      })
      .catch((err) => console.error("Error fetching chart data:", err));
  };

  // Fetch data on initial load
  useEffect(() => {
    fetchChartData(); // Load default data on initial render
  }, []); // Empty dependency array ensures it runs once

  return (
    <div className="bg-white m-5 p-5 rounded shadow">
      <div className="flex justify-between">
        <div className="">
          <h1 className="font-title font-semibold text-lg mb-2">
            Top Selling Platforms
          </h1>
          <p className="text-gray-500 text-sm font-semibold">
            {year} {month && MONTH_NAMES[parseInt(month, 10) - 1]}{" "}
            {day && ` ${day}th`}
          </p>
        </div>

        {/* Menu for Filters */}
        <Button
          aria-controls={open ? "filter-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleMenuClick}
          className="mt-4"
          sx={{
            color: "black",
            backgroundColor: "white",
            "&:hover": {
              backgroundColor: "#f0f0f0",
            },
            boxShadow: "none",
            marginBottom: 2,
          }}
        >
          Open Filters
          <FontAwesomeIcon icon={faChevronDown} className="fa-xs pl-3" />
        </Button>
      </div>

      <Menu
        id="filter-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
      >
        <MenuItem>
          <TextField
            label="Year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            InputProps={{ inputProps: { min: 2000 } }}
            fullWidth
          />
        </MenuItem>
        <MenuItem>
          <TextField
            label="Month"
            type="number"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            InputProps={{ inputProps: { min: 1, max: 12 } }}
            fullWidth
          />
        </MenuItem>
        <MenuItem>
          <TextField
            label="Day"
            type="number"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            InputProps={{ inputProps: { min: 1, max: 31 } }}
            fullWidth
          />
        </MenuItem>
        <MenuItem>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              fetchChartData();
              handleMenuClose();
            }}
            fullWidth
          >
            Update Chart
          </Button>
        </MenuItem>
      </Menu>

      {/* Chart Display */}
      <div className="flex flex-wrap justify-center items-start gap-8 mt-5">
        <div
          className="mt-5"
          style={{ width: "100%", maxWidth: "300px", margin: "0 auto" }}
        >
          {chartData && (
            <div style={{ position: "relative", width: "100%" }}>
              <Doughnut
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true, // Ensure responsiveness
                  cutout: "75%", // Adjusts the thickness of the donut ring (70% creates a thin ring)
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: function (tooltipItem) {
                          return `${tooltipItem.label}: ${tooltipItem.raw}`;
                        },
                      },
                    },
                  },
                  elements: {
                    arc: {
                      borderWidth: 2, // Thinner border for the segments
                    },
                  },
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "48%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                }}
              >
                <p className="text-2xl font-semibold">Total</p>
                <p className="text-2xl font-bold">{totalSales.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        {chartData && (
          <div className="mt-8">
            {chartData.labels.map((label, index) => (
              <div key={index} className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center">
                  <span
                    style={{
                      display: "inline-block",
                      width: "10px",
                      height: "22px",
                      backgroundColor:
                        chartData.datasets[0].backgroundColor[index],
                      marginRight: "10px",
                      borderRadius: "20%",
                    }}
                  ></span>
                  <span className=" font-title">{label}</span>
                </div>
                <span className="">{chartData.datasets[0].data[index].toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonutChartComponent;
