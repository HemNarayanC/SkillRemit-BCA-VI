import React from "react";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import OTPVerification from "./pages/OTPVerification";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MainLayout from "./layouts/MainLayout";

const PrivateLayout = () => (
  <div className="min-h-screen">
    <Navbar />
    <div className="px-4 py-8">
      <Outlet />
    </div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <Hero /> },
      { path: "/auth/login", element: <Login /> },
      { path: "/auth/register", element: <Register /> },
      { path: "/auth/verify-otp", element: <OTPVerification /> },
    ],
  },
  {
    element: (
      <PrivateRoute>
        <PrivateLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "/dashboard",
        element: <h1>Dashboard - Protected Route</h1>,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
