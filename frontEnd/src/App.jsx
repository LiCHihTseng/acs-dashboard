import React, { useEffect } from "react";

import "./App.css";
import { Navbar } from "./components/Navbar/Navbar";
import BestPlatform from "./components/DataGrid/BestPlatform";
import BestSellerID from "./components/DataGrid/BestSellerID";
import TotalOrder from "./components/DataGrid/TotalOrder";
import LastDeal from "./components/DataGrid/LastDeal";
import LineChartData from "./components/Chart/LineChartData";
import TableShoes from "./components/Table/TableShoes";


function App() {
  return (
    <div>
      <Navbar />
      <div className="grid grid-cols-2  ml-5">
        <div className="col-span-1 flex flex-wrap">
          <BestSellerID />
          <BestPlatform />

          <TotalOrder />
          <LastDeal />
        </div>
        <div className="col-span-1 mr-5">
         {/* <LineChartData/> */}
         <TableShoes/>
        </div>
      </div>
      
    </div>
  );
}

export default App;
