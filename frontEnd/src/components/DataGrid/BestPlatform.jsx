import React, { useEffect, useState } from "react";
import Amazon from "../../img/amazon-logo-squid-ink-smile-orange.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag } from "@fortawesome/free-solid-svg-icons";
import "../DataGrid/DataGrid.css";

import Up from "../../img/Up.svg";
import Down from "../../img/down.svg";
const BestPlatform = () => {
  const [data, setData] = useState([]);

  // Mapping platform names to their respective images
  const platformImages = {
    MomoShoppingMall: Amazon, // Replace with actual path
    amazon: Amazon, // Replace with actual path
    ebay: Amazon, // Replace with actual path
    kickscrew:Amazon,
    // Add more mappings as needed
  };

  useEffect(() => {
    fetch("http://localhost:8081/transactionDetailTable")
      .then((res) => res.json())
      .then((data) => {
        console.log(data); // Debugging: log the data to verify the structure
        setData(data);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <div className=" flex flex-wrap gap-2 p-4 justify-center min-w-80">
      {data.map((d, index) => (
        <div
          key={index}
          className="card-container bg-white p-4 rounded-md shadow-md grid gap-4 content-between flex-grow min-w-full"
        >
          <div className="flex justify-between items-start">
            <div>
              <p
                className="font-title text-lg sm:text-base md:text-lg font-semibold"
                style={{ color: "#494C4F" }}
              >
                Best Platform
              </p>
              <p className="font-title text-xl sm:text-lg md:text-xl font-bold mt-4">
                {d.platform}
              </p>
            </div>
            <div>
              <img
                src={platformImages[d.platform] || Amazon}
                alt={d.platform}
                className="w-18 h-12 sm:w-12 sm:h-8 md:w-16 md:h-11 lg:w-18 lg:h-12 object-contain"
              />
            </div>
          </div>
          <div className="flex items-center ">
            {/* <FontAwesomeIcon icon={faTag} className="text-yellow-500" /> */}
            <img
              src={d.growth_percentage < 0 ? Down : Up}
              alt={d.growth_percentage < 0 ? "Down" : "Up"}
              className="w-6 h-6"
            />
            <p
              className="font-title ml-2 text-base sm:text-sm md:text-base font-semibold"
              style={{ color: "#494C4F" }}
            >
              {d.growth_percentage} {d.growth_percentage < 0 ? "Down" : "Up"}{" "}
              Sold this month
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BestPlatform;
