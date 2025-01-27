import React, { useState } from "react";
import "./App.css";
import { Navbar } from "./components/Navbar/Navbar";
import BestPlatform from "./components/DataGrid/BestPlatform";
import BestSellerID from "./components/DataGrid/BestSellerID";
import TotalOrder from "./components/DataGrid/TotalOrder";
import LastDeal from "./components/DataGrid/LastDeal";
import TableShoes from "./components/Table/TableShoes";
import BarChartComponent from "./components/Bar/BarChartComponent";
import DonutChartComponent from "./components/Pie/DonutChartComponent";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleReset = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (

      <div className="container mx-auto p-5">
        <div className="flex justify-between ">
          {/* Reset Button */}
          <Navbar />
          <div>
          <button
            onClick={handleReset}
            className="bg-blue-500 text-white rounded p-4hover:bg-blue-600"
          >
            Reset All
          </button>
          </div>

        </div>
        {/* Top Cards Section */}
        <div className="grid lg:grid-cols-4 sm:grid-cols-4">
          <BestSellerID />
          <BestPlatform />
          <TotalOrder />
          <LastDeal />
        </div>

        {/* TableShoes Section */}
        <div className="p-5">
          <TableShoes key={refreshKey} />
        </div>

        {/* Chart Section */}
        <div className="grid lg:grid-cols-6 sm:grid-cols-1">
          <div className="lg:col-span-3 sm:col-span-1">
            <BarChartComponent key={refreshKey} />
          </div>
          <div className="lg:col-span-3 sm:grid-cols-1">
            <DonutChartComponent key={refreshKey} />
          </div>
        </div>
      </div>

  );
}

export default App;
