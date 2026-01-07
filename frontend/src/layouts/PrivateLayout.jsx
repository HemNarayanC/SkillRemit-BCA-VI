import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const PrivateLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-8 mt-20">
        <Outlet />
      </main>
    </div>
  );
};

export default PrivateLayout;
