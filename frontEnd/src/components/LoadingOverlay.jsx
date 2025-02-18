import React from "react";
import "./LoadingOverlay.scss";

const LoadingOverlay = () => {
  return (
    <div className="loading-overlay">
      <div className="loader">
        <div className="loader__bar"></div>
        <div className="loader__bar"></div>
        <div className="loader__bar"></div>
        <div className="loader__bar"></div>
        <div className="loader__bar"></div>
        <div className="loader__ball"></div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
