// App.jsx
import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
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
import ForgotPassword from "./pages/ForgotPassword";
import OTPVerification from "./pages/OTPVerification/OTPVerification";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import { UserProvider } from "./context/UserContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ─── Private Route ───────────────────────────────────────────────────────────
// Reads from the single AuthContext — no extra API call, no extra state.
const PrivateRoute = ({ element }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-[#00334d] text-sm">Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? element : <Navigate to="/login" state={{ from: location }} replace />;
};

// ─── Public Route ─────────────────────────────────────────────────────────────
// Redirects already-logged-in users away from /login.
const PublicRoute = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-[#00334d] text-sm">Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/" replace /> : element;
};

// ─── Router (defined once, outside any component render) ─────────────────────
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<PublicRoute element={<Login />} />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/otp-verification" element={<OTPVerification />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/" element={<Layout />}>
        <Route index element={<PrivateRoute element={<Dashboard />} />} />
        <Route path="invoice/create" element={<PrivateRoute element={<CreateInvoice />} />} />
        <Route path="invoice/edit" element={<PrivateRoute element={<EditInvoice />} />} />
        <Route path="invoice/proforma" element={<PrivateRoute element={<ProformaInvoice />} />} />
        <Route path="invoice/printed-proforma-invoice/:id" element={<PrivateRoute element={<PrintedProformaInvoice />} />} />
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

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </AuthProvider>
  );
}

export default App;