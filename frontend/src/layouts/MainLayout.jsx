// layouts/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

const MainLayout = () => {
    return (
        <>
            {/* Navbar */}
            <Navbar />
            <Outlet />
            {/* Background blobs */}
            <div className="fixed inset-0 -z-20 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary rounded-full blur-[150px] animate-pulse delay-700" />
            </div>
        </>
    );
};

export default MainLayout;
