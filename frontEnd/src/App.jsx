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
import LoadingOverlay from "./components/LoadingOverlay";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {

  faSyncAlt
} from "@fortawesome/free-solid-svg-icons";
function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // 控制 Loading 狀態

  const handleReset = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="container mx-auto p-5 relative">
      {/* Loading 遮罩 */}
      {isLoading && <LoadingOverlay />}

      <div className="flex items-center justify-between">
        {/* Navbar */}
        <Navbar />

        {/* Reset Button */}
        <div>
          <button
            onClick={handleReset}
            className="bg-red-500 text-white rounded-lg hover:bg-red-800 px-4 py-2 whitespace-nowrap h-full mr-4"
          >
             <FontAwesomeIcon icon={faSyncAlt} className="mr-2" />
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

      {/* Chart Section */}
      <div className="grid lg:grid-cols-6 sm:grid-cols-1">
        <div className="lg:col-span-3 sm:col-span-1">
          <BarChartComponent key={refreshKey} />
        </div>
        <div className="lg:col-span-3 sm:grid-cols-1">
          <DonutChartComponent key={refreshKey} />
        </div>
      </div>

      {/* TableShoes Section */}
      <div className="p-5">
        <TableShoes key={refreshKey} setIsLoading={setIsLoading} />
      </div>
    </div>
  );
}

export default App;
