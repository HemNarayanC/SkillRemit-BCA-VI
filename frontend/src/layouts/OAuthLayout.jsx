import React from "react";
import { Outlet } from "react-router-dom";

const OAuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg text-center">
        <Outlet />
      </div>
    </div>
  );
};

export default OAuthLayout;
