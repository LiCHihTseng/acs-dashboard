import React, { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import {
  Menu,
  MenuItem,
  Button,
  Select,
  MenuItem as Option,
  TextField,
} from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown, faFilter } from "@fortawesome/free-solid-svg-icons";

const TableShoes = () => {
  const [data, setData] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sorting, setSorting] = useState([]);
  const [isMonthFilterOpen, setIsMonthFilterOpen] = useState(false); // 用於控制月份過濾展開/關閉
  const [isYearFilterOpen, setIsYearFilterOpen] = useState(false);
  const [isPlatformFilterOpen, setIsPlatformFilterOpen] = useState(false);
  const [isDayFilterOpen, setIsDayFilterOpen] = useState(false);
  const [isTimeRangeFilterOpen, setIsTimeRangeFilterOpen] = useState(false);

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [timeRange, setTimeRange] = useState({ start: "", end: "" });

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const columns = [
    { accessorKey: "shoe_model", header: "Shoe ID", enableSorting: true },
    { accessorKey: "platform", header: "Platform", enableSorting: true },
    { accessorKey: "total_quantity", header: "Qty", enableSorting: true },
    {
      accessorKey: "transactionTimestamp",
      header: "Transaction Time",
      enableSorting: true,
      cell: (info) => {
        const date = new Date(info.getValue());
        return date.toLocaleString("en-US");
      },
    },
  ];

  useEffect(() => {
    fetch("http://localhost:8081/transactionDetailTable_platform")
      .then((res) => res.json())
      .then((data) => setPlatforms(data.map((item) => item.platform)))
      .catch((err) => console.error("Error fetching platform list:", err));
  }, []);

  const fetchData = () => {
    const offset = pageIndex * pageSize;

    const params = new URLSearchParams({
      platform: selectedPlatform || "",
      year: year || "",
      month: month || "",
      day: day || "",
      startTime: timeRange.start || "",
      endTime: timeRange.end || "",
      limit: pageSize,
      offset,
      sortBy: sorting[0]?.id || "",
      sortDirection: sorting[0]?.desc ? "desc" : "asc",
    });

    const url = `http://localhost:8081/transactionDetailTable_shoesDetail?${params.toString()}`;

    fetch(url)
      .then((res) => res.json())
      .then(({ data, totalRecords }) => {
        setData(data);
        setTotalRecords(totalRecords || 0);
      })
      .catch((err) => console.error("Error fetching data:", err));
  };

  useEffect(() => {
    fetchData();
  }, [
    selectedPlatform,
    year,
    month,
    day,
    timeRange,
    pageSize,
    pageIndex,
    sorting,
  ]);

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: { pageIndex, pageSize },
      sorting,
    },
    manualPagination: true,
    manualSorting: true,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  const getDaysInMonth = (year, month) => {
    if (!year || !month) return 31;
    return new Date(year, month, 0).getDate();
  };
  

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-md">
      {/* Filter Menu */}
      <div className="mb-4 flex justify-between">
        <h1 className="font-title font-bold ">Sale Detail</h1>
        <Button
          id="filter-menu-button"
          aria-controls={open ? "filter-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleMenuClick}
          variant="contained"
          sx={{
            color: "black",
            backgroundColor: "white",
            "&:hover": {
              backgroundColor: "#f0f0f0",
            },
            boxShadow: "none",
          }}
        >
          <FontAwesomeIcon icon={faFilter}  className="mr-2"/>
          Open Filters
        </Button>
        <Menu
          id="filter-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          MenuListProps={{
            "aria-labelledby": "filter-menu-button",
          }}
          PaperProps={{  
            style: {  
              width: 300,  
            },  
         }} 
        >
          <MenuItem>
            <div
              className="flex items-center w-full block text-sm font-medium text-gray-700 cursor-pointer"
              onClick={() => setIsPlatformFilterOpen((prev) => !prev)} // 切換展開狀態
            >
              <span className="mr-2 block text-sm font-medium text-gray-700">
                {isPlatformFilterOpen ? (
                  <FontAwesomeIcon icon={faChevronUp} className="fa-2xs" />
                ) : (
                  <FontAwesomeIcon icon={faChevronDown} className="fa-2xs" />
                )}
              </span>
              Platform
            </div>
          </MenuItem>
          {isPlatformFilterOpen && (
            <div className="m-2 flex justify-between items-center">
              <p className="font-title font-semibold">Select Platform</p>
              <Select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-1/2"
              >
                <Option value="">All Platforms</Option>
                {platforms.map((platform) => (
                  <Option key={platform} value={platform}>
                    {platform}
                  </Option>
                ))}
              </Select>
            </div>
          )}

          <MenuItem>
            <div
              className="flex items-center w-full block text-sm font-medium text-gray-700 cursor-pointer"
              onClick={() => setIsYearFilterOpen((prev) => !prev)} // 切換展開狀態
            >
              <span className="mr-2 block text-sm font-medium text-gray-700">
                {isYearFilterOpen ? (
                  <FontAwesomeIcon icon={faChevronUp} className="fa-2xs" />
                ) : (
                  <FontAwesomeIcon icon={faChevronDown} className="fa-2xs" />
                )}
              </span>
              Year
            </div>
          </MenuItem>
          {isYearFilterOpen && (
            <div className="m-2 flex justify-between items-center">
              <p className="font-title font-semibold">Select Year</p>
              <Select
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  setMonth("");
                  setDay("");
                }}
                className="w-1/4"
              >
                <Option value="">Select Year</Option>
                {[2023, 2024].map((y) => (
                  <Option key={y} value={y}>
                    {y}
                  </Option>
                ))}
              </Select>
            </div>
          )}

          <MenuItem>
            <div
              className="flex items-center w-full block text-sm font-medium text-gray-700"
              onClick={() => setIsMonthFilterOpen((prev) => !prev)}
            >
              <span className="mr-2 block text-sm font-medium text-gray-700">
                {isMonthFilterOpen ? (
                  <FontAwesomeIcon icon={faChevronUp} className="fa-2xs" />
                ) : (
                  <FontAwesomeIcon icon={faChevronDown} className="fa-2xs" />
                )}
              </span>
              Month
            </div>
          </MenuItem>
          {isMonthFilterOpen && (
            <div className="m-2 flex justify-between items-center ">
              <p className="font-title font-semibold">Select month</p>
              <Select
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  setDay("");
                }}
                disabled={!year}
                className="w-1/4"
              >
                <Option value="">Select Month</Option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <Option key={m} value={m}>
                    {m.toString().padStart(2, "0")}
                  </Option>
                ))}
              </Select>
            </div>
          )}

          <MenuItem>
            <div
              className="flex items-center w-full block text-sm font-medium text-gray-700 cursor-pointer"
              onClick={() => setIsDayFilterOpen((prev) => !prev)} // 切換展開狀態
            >
              <span className="mr-2 block text-sm font-medium text-gray-700">
                {isDayFilterOpen ? (
                  <FontAwesomeIcon icon={faChevronUp} className="fa-2xs" />
                ) : (
                  <FontAwesomeIcon icon={faChevronDown} className="fa-2xs" />
                )}
              </span>
              Day
            </div>
          </MenuItem>
          {isDayFilterOpen && (
            <div className="m-2 flex justify-between items-center">
              <p className="font-title font-semibold">Select Day</p>
              <Select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                disabled={!month}
                className="w-1/2"
              >
                <Option value="">Select Day</Option>
                {Array.from(
                  { length: getDaysInMonth(year, month) },
                  (_, i) => i + 1
                ).map((d) => (
                  <Option key={d} value={d}>
                    {d.toString().padStart(2, "0")}
                  </Option>
                ))}
              </Select>
            </div>
          )}

          <MenuItem>
            <div
              className="flex items-center w-full block text-sm font-medium text-gray-700 cursor-pointer"
              onClick={() => setIsTimeRangeFilterOpen((prev) => !prev)} // 切換展開狀態
            >
              <span className="mr-2 block text-sm font-medium text-gray-700">
                {isTimeRangeFilterOpen ? (
                  <FontAwesomeIcon icon={faChevronUp} className="fa-2xs" />
                ) : (
                  <FontAwesomeIcon icon={faChevronDown} className="fa-2xs" />
                )}
              </span>
              Time Range
            </div>
          </MenuItem>
          {isTimeRangeFilterOpen && (
            <div className="m-2">
              <p className="font-title font-semibold">Select Time Range</p>
              <div className="flex items-center space-x-2">
                <TextField
                  type="time"
                  value={timeRange.start}
                  onChange={(e) =>
                    setTimeRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  fullWidth
                />
                <span>to</span>
                <TextField
                  type="time"
                  value={timeRange.end}
                  onChange={(e) =>
                    setTimeRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  fullWidth
                />
              </div>
            </div>
          )}
        </Menu>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    {...{
                      className: header.column.getCanSort()
                        ? "cursor-pointer select-none px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b"
                        : "px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b",
                      onClick: header.column.getToggleSortingHandler(),
                    }}
                  >
                    <div className="flex items-center">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() ? (
                        <ArrowUpDown
                          className={`ml-2 ${
                            header.column.getIsSorted() === "desc"
                              ? "rotate-180"
                              : ""
                          }`}
                          size={14}
                        />
                      ) : (
                        <ArrowUpDown className="ml-2 text-gray-400" size={14} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-2 text-sm text-gray-700 border-b"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-700">
          Page {pageIndex + 1} of {Math.ceil(totalRecords / pageSize)}
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPageIndex(0)}
            disabled={pageIndex === 0}
            className="px-2 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            {"<<"}
          </button>
          <button
            onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
            disabled={pageIndex === 0}
            className="px-2 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            {"<"}
          </button>
          <button
            onClick={() =>
              setPageIndex((prev) =>
                Math.min(prev + 1, Math.ceil(totalRecords / pageSize) - 1)
              )
            }
            disabled={pageIndex >= Math.ceil(totalRecords / pageSize) - 1}
            className="px-2 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            {">"}
          </button>
          <button
            onClick={() => setPageIndex(Math.ceil(totalRecords / pageSize) - 1)}
            disabled={pageIndex >= Math.ceil(totalRecords / pageSize) - 1}
            className="px-2 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            {">>"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableShoes;
