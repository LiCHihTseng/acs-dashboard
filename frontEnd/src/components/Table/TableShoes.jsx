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
import {
  faChevronUp,
  faChevronDown,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";

const TableShoes = () => {
  const [data, setData] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sorting, setSorting] = useState([]);
  const [isMonthFilterOpen, setIsMonthFilterOpen] = useState(false);
  const [isPlatformFilterOpen, setIsPlatformFilterOpen] = useState(false);
  const [isTimeRangeFilterOpen, setIsTimeRangeFilterOpen] = useState(false);
  const [isDayFilterOpen, setIsDayFilterOpen] = useState(false);

  const [startYear, setStartYear] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [endYear, setEndYear] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [startDay, setStartDay] = useState("");
  const [endDay, setEndDay] = useState("");
  const [timeRange, setTimeRange] = useState({ start: "", end: "" });

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const isTimeRangeDisabled = Boolean(
    startYear && startMonth && endYear && endMonth
  );

  const isDayRangeDisabled = Boolean(
    startYear && startMonth && endYear && endMonth
  );

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
      startYear: startYear || "",
      startMonth: startMonth || "",
      endYear: endYear || "",
      endMonth: endMonth || "",
      dayStart: startDay || "",
      dayEnd: endDay || "",
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
    startYear,
    startMonth,
    endYear,
    endMonth,
    startDay,
    endDay,
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

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-md">
      {/* Filter Menu */}
      <div className="mb-4 flex justify-between">
        <h1 className="font-title font-bold">Sale Detail</h1>
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
          }}
        >
          <FontAwesomeIcon icon={faFilter} className="mr-2" />
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
              width: 400,
            },
          }}
        >
          {/* Platform Filter */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-800">
              Select Platform (Optional)
            </h3>
            <Select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              fullWidth
            >
              <Option value="">All Platforms</Option>
              {platforms.map((platform) => (
                <Option key={platform} value={platform}>
                  {platform}
                </Option>
              ))}
            </Select>
          </div>

          {/* Start Year and Month */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-800">
              Select Start Year and Month
            </h3>
            <div className="flex items-center space-x-4">
              <TextField
                label="Start Year"
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                fullWidth
              />
              <TextField
                label="Start Month"
                type="number"
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                fullWidth
              />
            </div>
          </div>

          {/* End Year and Month */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-800">
              Select End Year and Month (Optional)
            </h3>
            <div className="flex items-center space-x-4">
              <TextField
                label="End Year"
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                fullWidth
              />
              <TextField
                label="End Month"
                type="number"
                value={endMonth}
                onChange={(e) => setEndMonth(e.target.value)}
                fullWidth
              />
            </div>
          </div>

          {/* Start and End Day */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-800">
              Select Day Range (Optional)
            </h3>
            <div className="flex items-center space-x-4">
              <TextField
                label="Start Day"
                type="number"
                value={startDay}
                onChange={(e) => setStartDay(e.target.value)}
                fullWidth
                disabled={Boolean(endYear)}
              />
              <span className="text-gray-600 font-medium">to</span>
              <TextField
                label="End Day"
                type="number"
                value={endDay}
                onChange={(e) => setEndDay(e.target.value)}
                fullWidth
                disabled={Boolean(endYear)}
              />
            </div>
          </div>

          {/* Time Range */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-800">
              Select Time Range (Optional)
            </h3>
            <div className="flex items-center space-x-4">
              <TextField
                label="Start Time"
                type="time"
                value={timeRange.start}
                onChange={(e) =>
                  setTimeRange((prev) => ({ ...prev, start: e.target.value }))
                }
                fullWidth
                disabled={Boolean(endYear)}
              />
              <span className="text-gray-600 font-medium">to</span>
              <TextField
                label="End Time"
                type="time"
                value={timeRange.end}
                onChange={(e) =>
                  setTimeRange((prev) => ({ ...prev, end: e.target.value }))
                }
                fullWidth
                disabled={Boolean(endYear)}
              />
            </div>
          </div>

          {/* Confirm Button */}
          <div className="p-4 flex justify-end">
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                fetchData(); // Execute the filter query logic
                handleMenuClose(); // Close the filter menu
              }}
            >
              Confirm
            </Button>
          </div>
        </Menu>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-red-100 rounded-md">
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
                        <ArrowUpDown
                          className="ml-2 text-black-400"
                          size={14}
                        />
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
