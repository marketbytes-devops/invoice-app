// App.jsx
import React, { useState, useEffect } from "react";
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CreateInvoice from "./pages/Invoice/CreateInvoice";
import EditInvoice from "./pages/Invoice/EditInvoice";
import ProformaInvoice from "./pages/Invoice/ProformaInvoice";
import PrintedProformaInvoice from "./pages/Invoice/PrintedProformaInvoice";
import InvoiceList from "./pages/Invoice/InvoiceList";
import FinalInvoiceView from "./pages/Invoice/FinalInvoiceView";
import AddTax from "./pages/Tax/AddTax";
import ViewTax from "./pages/Tax/ViewTax";
import AddProduct from "./pages/ProductServices/AddProduct";
import ViewProduct from "./pages/ProductServices/ViewProduct";
import AddService from "./pages/ProductServices/AddService";
import ViewService from "./pages/ProductServices/ViewService";
import AddClient from "./pages/Client/AddClient";
import ViewClient from "./pages/Client/ViewClient";
import AddAddress from "./pages/Address/AddAddress";
import ViewAddress from "./pages/Address/ViewAddress";
import AddBankAccount from "./pages/BankAccount/AddBankAccount";
import ViewBankAccount from "./pages/BankAccount/ViewBankAccount";
import Profile from "./pages/Profile";
import AdditionalSettings from "./pages/AdditionalSettings";
import apiClient from './api/apiClient';
import ForgotPassword from "./pages/ForgotPassword";
import OTPVerification from "./pages/OTPVerification/OTPVerification";
import ResetPassword from "./pages/ResetPassword/ResetPassword";

const PrivateRoute = ({ element }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      try {
        await apiClient.get('/auth/profile/');
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-[#00334d] text-sm">Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? element : <Navigate to="/login" state={{ from: location }} replace />;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    const savedPath = localStorage.getItem("currentPath");

    setIsLoggedIn(!!accessToken);
    if (savedPath) {
      setCurrentPath(savedPath);
    }
  }, []);

  const handleLogin = (accessToken, refreshToken) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    apiClient.post('/auth/logout/', {
      refresh: localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token')
    })
      .then(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
        setIsLoggedIn(false);
        window.location.href = '/login';
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
        setIsLoggedIn(false);
        window.location.href = '/login';
      });
  };

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to={currentPath} replace /> : <Login onLogin={handleLogin} />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verification" element={<OTPVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Layout onLogout={handleLogout} />}>
          <Route index element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="invoice/create" element={<PrivateRoute element={<CreateInvoice />} />} />
          <Route path="invoice/edit" element={<PrivateRoute element={<EditInvoice />} />} />
          <Route path="invoice/proforma" element={<PrivateRoute element={<ProformaInvoice />} />} />
          <Route path="invoice/printed-proforma-invoice" element={<PrivateRoute element={<PrintedProformaInvoice />} />} />
          <Route path="invoice/invoice-list" element={<PrivateRoute element={<InvoiceList />} />} />
          <Route path="invoice/final-invoice-view" element={<PrivateRoute element={<FinalInvoiceView />} />} />
          <Route path="tax/add" element={<PrivateRoute element={<AddTax />} />} />
          <Route path="tax/view" element={<PrivateRoute element={<ViewTax />} />} />
          <Route path="products/add" element={<PrivateRoute element={<AddProduct />} />} />
          <Route path="products/view" element={<PrivateRoute element={<ViewProduct />} />} />
          <Route path="services/add" element={<PrivateRoute element={<AddService />} />} />
          <Route path="services/view" element={<PrivateRoute element={<ViewService />} />} />
          <Route path="clients/add" element={<PrivateRoute element={<AddClient />} />} />
          <Route path="clients/view" element={<PrivateRoute element={<ViewClient />} />} />
          <Route path="address/add" element={<PrivateRoute element={<AddAddress />} />} />
          <Route path="address/view" element={<PrivateRoute element={<ViewAddress />} />} />
          <Route path="bank-account/add" element={<PrivateRoute element={<AddBankAccount />} />} />
          <Route path="bank-account/view" element={<PrivateRoute element={<ViewBankAccount />} />} />
          <Route path="profile" element={<PrivateRoute element={<Profile />} />} />
          <Route path="additional-settings" element={<PrivateRoute element={<AdditionalSettings />} />} />
        </Route>
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-[#00334d]">404</h1>
                <p className="text-[#00334d]">Page Not Found</p>
              </div>
            </div>
          }
        />
      </>
    )
  );

  return <RouterProvider router={router} />;
}

export default App;