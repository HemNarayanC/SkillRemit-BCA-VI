import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const DashboardLayout = ({ sidebar }) => {
  return (
    <div className="min-h-screen flex">
      {sidebar && (
        <aside className="w-64 bg-card/90 backdrop-blur-md p-4 hidden lg:block">
          {sidebar}
        </aside>
      )}
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 mt-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
