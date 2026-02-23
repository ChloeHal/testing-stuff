import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import DataToolbar from "./SortdialogJSX.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <div className="min-h-screen flex items-start justify-center pt-16 px-8">
      <DataToolbar />
    </div>
  </React.StrictMode>,
);
