import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SearchableSelect from "../../components/SearchableSelect";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  FileText,
  CreditCard,
  ArrowUpRight,
  Clock,
  DollarSign,
  Briefcase,
  ChevronRight,
  Calendar,
  Filter
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { motion } from "framer-motion";
import apiClient from "../../api/apiClient";

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${color}`} />

    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color.replace('bg-', 'bg-opacity-10 ')}`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {trend && (
        <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>

    <div>
      <h3 className="text-gray-500 text-sm font-semibold mb-1">{title}</h3>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {subtitle && <span className="text-xs text-gray-400 font-medium">{subtitle}</span>}
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    invoices: [],
    products: 0,
    services: 0,
    clients: 0,
    accounts: 0,
    loading: true,
    error: null
  });

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          invoicesRes,
          productsRes,
          servicesRes,
          clientsRes,
          accountsRes
        ] = await Promise.all([
          apiClient.get("invoices/invoices/"),
          apiClient.get("products/products/"),
          apiClient.get("services/services/"),
          apiClient.get("clients/clients/"),
          apiClient.get("bank/bank-accounts/")
        ]);

        setData({
          invoices: invoicesRes.data,
          products: productsRes.data.length,
          services: servicesRes.data.length,
          clients: clientsRes.data.length,
          accounts: accountsRes.data.length,
          loading: false,
          error: null
        });
      } catch (err) {
        setData(prev => ({ ...prev, loading: false, error: "Failed to load dashboard metrics" }));
      }
    };

    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const finalInvoices = data.invoices.filter(inv => inv.is_final);
    
    // Revenue logic
    const totalRevenue = finalInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_due || 0), 0);
    const currentMonthRev = finalInvoices
      .filter(inv => {
        const d = new Date(inv.invoice_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, inv) => sum + parseFloat(inv.total_due || 0), 0);
    
    const lastMonthRev = finalInvoices
      .filter(inv => {
        const d = new Date(inv.invoice_date);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      })
      .reduce((sum, inv) => sum + parseFloat(inv.total_due || 0), 0);

    const revenueTrend = lastMonthRev === 0 ? (currentMonthRev > 0 ? 100 : 0) : Math.round(((currentMonthRev - lastMonthRev) / lastMonthRev) * 100);

    // Pending logic
    const pendingAmount = finalInvoices.reduce((sum, inv) => sum + (parseFloat(inv.total_due || 0) - parseFloat(inv.amount_paid || 0)), 0);
    const currentMonthPending = finalInvoices
      .filter(inv => {
        const d = new Date(inv.invoice_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, inv) => sum + (parseFloat(inv.total_due || 0) - parseFloat(inv.amount_paid || 0)), 0);
    
    const lastMonthPending = finalInvoices
      .filter(inv => {
        const d = new Date(inv.invoice_date);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      })
      .reduce((sum, inv) => sum + (parseFloat(inv.total_due || 0) - parseFloat(inv.amount_paid || 0)), 0);
    
    const pendingTrend = lastMonthPending === 0 ? (currentMonthPending > 0 ? 100 : 0) : Math.round(((currentMonthPending - lastMonthPending) / lastMonthPending) * 100);

    // Clients logic
    const clientsTrend = 0; // Simple placeholder for now as we don't have client creation dates in this list

    // Drafts
    const draftCount = data.invoices.filter(inv => !inv.is_final).length;

    return {
      totalRevenue,
      revenueTrend,
      pendingAmount,
      pendingTrend,
      draftCount,
      clientsTrend,
      totalCount: data.invoices.length
    };
  }, [data.invoices]);

  const chartData = useMemo(() => {
    const finalInvoices = data.invoices.filter(inv => inv.is_final);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Filter by selected year and month
    const filteredInvoices = finalInvoices.filter(inv => {
      const invDate = new Date(inv.invoice_date);
      const invYear = invDate.getFullYear();
      const invMonth = invDate.getMonth();

      const yearMatch = invYear === selectedYear;
      const monthMatch = selectedMonth === "" || invMonth === parseInt(selectedMonth);

      return yearMatch && monthMatch;
    });

    // Group by month
    const monthlyData = months.map((monthName, monthIndex) => {
      const monthRevenue = filteredInvoices
        .filter(inv => {
          const invDate = new Date(inv.invoice_date);
          return invDate.getMonth() === monthIndex;
        })
        .reduce((sum, inv) => sum + parseFloat(inv.total_due || 0), 0);

      return {
        name: monthName,
        revenue: monthRevenue,
      };
    });

    return monthlyData;
  }, [data.invoices, selectedYear, selectedMonth]);

  // Get available years from invoices
  const availableYears = useMemo(() => {
    const years = data.invoices.map(inv => new Date(inv.invoice_date).getFullYear());
    const uniqueYears = [...new Set(years)].sort((a, b) => b - a);
    return uniqueYears.length > 0 ? uniqueYears : [currentYear];
  }, [data.invoices, currentYear]);

  if (data.loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm">Welcome back! Here's what's happening with your business today.</p>
        </div>
        <button
          onClick={() => navigate('/invoice/create')}
          className="bg-black text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-black/10 hover:shadow-black/20 transition-all flex items-center justify-center"
        >
          <FileText className="w-4 h-4 mr-2" />
          Create New Invoice
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          subtitle="All finalized invoices"
          icon={DollarSign}
          trend={stats.revenueTrend}
          color="bg-black"
        />
        <MetricCard
          title="Pending Payments"
          value={`₹${stats.pendingAmount.toLocaleString()}`}
          subtitle="Waiting for settlement"
          icon={Clock}
          trend={stats.pendingTrend}
          color="bg-amber-500"
        />
        <MetricCard
          title="Total Clients"
          value={data.clients}
          subtitle="Active registered clients"
          icon={Users}
          trend={stats.clientsTrend}
          color="bg-blue-600"
        />
        <MetricCard
          title="Draft Invoices"
          value={stats.draftCount}
          subtitle="In-progress documents"
          icon={FileText}
          color="bg-gray-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Revenue Analytics</h2>
              <p className="text-xs text-gray-400 font-medium">Monthly revenue performance for {selectedYear}</p>
            </div>
            <div className="flex items-center gap-3">
              <SearchableSelect
                options={availableYears.map(year => ({
                  value: year,
                  label: year.toString()
                }))}
                value={selectedYear}
                onChange={(val) => setSelectedYear(val)}
                placeholder="Select Year"
                icon={Calendar}
              />

              <SearchableSelect
                options={[
                  { value: "", label: "All Months" },
                  ...["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, idx) => ({
                    value: idx.toString(),
                    label: month
                  }))
                ]}
                value={selectedMonth}
                onChange={(val) => setSelectedMonth(val)}
                placeholder="Select Month"
                icon={Filter}
              />
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis
                  hide
                />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#000"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats / Summary Side Column */}
        <div className="bg-black text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -mr-32 -mt-32 rounded-full" />

          <div>
            <h2 className="text-lg font-bold mb-6">Inventory Summary</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center">
                  <Package className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-sm font-medium">Products</span>
                </div>
                <span className="text-lg font-bold">{data.products}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-sm font-medium">Services</span>
                </div>
                <span className="text-lg font-bold">{data.services}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-sm font-medium">Bank Accounts</span>
                </div>
                <span className="text-lg font-bold">{data.accounts}</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div
              onClick={() => navigate('/invoice/proforma')}
              className="p-4 bg-white text-black rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Proformas</p>
                <p className="text-xl font-black">{stats.totalCount}</p>
              </div>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Invoices</h2>
            <p className="text-xs text-gray-400 font-medium">Your latest financial activity</p>
          </div>
          <button
            onClick={() => navigate('/invoice/invoice-list')}
            className="text-sm font-bold text-black flex items-center hover:translate-x-1 transition-transform"
          >
            View All <ArrowUpRight className="ml-1 w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                <th className="px-8 py-4">Invoice #</th>
                <th className="px-8 py-4">Client</th>
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4 text-right">Amount</th>
                <th className="px-8 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.invoices.slice(0, 5).map((inv, idx) => (
                <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-gray-900">#{inv.final_invoice_number || inv.invoice_number}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-medium text-gray-600">{inv.client_name || 'N/A'}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-medium text-gray-400">{inv.invoice_date}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-sm font-black text-gray-900">₹{parseFloat(inv.total_due).toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${inv.is_final ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {inv.is_final ? 'Final' : 'Proforma'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.invoices.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm italic">No invoices found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
