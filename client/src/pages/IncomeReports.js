import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Select from '../components/Select';
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';

const IncomeReports = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
    period: 'month', // today, week, month, quarter, year, custom
  });
  const [hoveredCard, setHoveredCard] = useState(null);

  // Sample data for reports
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 485000,
    totalExpenses: 325000,
    netProfit: 160000,
    profitMargin: 33,
    revenueGrowth: 15.5,
    expenseGrowth: 8.2,
  });

  const [incomeByCategory, setIncomeByCategory] = useState([
    { category: 'Tuition Fees', amount: 350000, percentage: 72, trend: '+12%' },
    { category: 'Transport Fees', amount: 45000, percentage: 9, trend: '+5%' },
    { category: 'Admission Fees', amount: 50000, percentage: 10, trend: '+18%' },
    { category: 'Exam Fees', amount: 25000, percentage: 5, trend: '+7%' },
    { category: 'Other Income', amount: 15000, percentage: 3, trend: '-2%' },
  ]);

  const [expenseByCategory, setExpenseByCategory] = useState([
    { category: 'Salaries', amount: 180000, percentage: 55, trend: '+5%' },
    { category: 'Utilities', amount: 45000, percentage: 14, trend: '+8%' },
    { category: 'Maintenance', amount: 35000, percentage: 11, trend: '+3%' },
    { category: 'Supplies', amount: 30000, percentage: 9, trend: '+12%' },
    { category: 'Other Expenses', amount: 35000, percentage: 11, trend: '+6%' },
  ]);

  const [monthlyTrends, setMonthlyTrends] = useState([
    { month: 'June', income: 420000, expense: 300000, profit: 120000 },
    { month: 'July', income: 450000, expense: 310000, profit: 140000 },
    { month: 'August', income: 480000, expense: 320000, profit: 160000 },
    { month: 'September', income: 470000, expense: 315000, profit: 155000 },
    { month: 'October', income: 485000, expense: 325000, profit: 160000 },
  ]);

  const [comparisonData, setComparisonData] = useState({
    lastMonth: { income: 470000, expense: 315000, profit: 155000 },
    thisMonth: { income: 485000, expense: 325000, profit: 160000 },
    growth: {
      income: 3.2,
      expense: 3.2,
      profit: 3.2,
    },
  });

  useEffect(() => {
    // Set default date range to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setDateRange({
      ...dateRange,
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0],
    });
  }, []);

  const handleGenerateReport = () => {
    setLoading(true);
    toast.info('Generating report...');
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Report generated successfully!');
    }, 1500);
  };

  const handleExportReport = (format) => {
    toast.info(`Exporting ${format.toUpperCase()} report...`);
    
    // Simulate export
    setTimeout(() => {
      toast.success(`${format.toUpperCase()} report downloaded successfully!`);
    }, 1000);
  };

  const setPeriod = (period) => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = endDate = now.toISOString().split('T')[0];
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0).toISOString().split('T')[0];
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
        break;
      default:
        return;
    }

    setDateRange({ startDate, endDate, period });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="h-8 w-8 mr-2 text-primary-600" />
              Financial Reports & Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Comprehensive financial insights and performance metrics
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => handleExportReport('excel')}
              icon={ArrowDownTrayIcon}
            >
              Export Excel
            </Button>
            <Button
              variant="primary"
              onClick={() => handleExportReport('pdf')}
              icon={ArrowDownTrayIcon}
            >
              Export PDF
            </Button>
          </div>
        </div>

        {/* Report Controls */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={[
                { value: 'summary', label: 'Financial Summary' },
                { value: 'income', label: 'Income Analysis' },
                { value: 'expense', label: 'Expense Analysis' },
                { value: 'comparison', label: 'Period Comparison' },
                { value: 'trends', label: 'Trend Analysis' },
              ]}
            />
            <Select
              label="Time Period"
              value={dateRange.period}
              onChange={(e) => setPeriod(e.target.value)}
              options={[
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'quarter', label: 'This Quarter' },
                { value: 'year', label: 'This Year' },
                { value: 'custom', label: 'Custom Range' },
              ]}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value, period: 'custom' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value, period: 'custom' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleGenerateReport}
              disabled={loading}
              icon={DocumentChartBarIcon}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Revenue */}
          <div 
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer"
            onMouseEnter={() => setHoveredCard('revenue')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-100 p-3 rounded-full">
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                +{summaryData.revenueGrowth}%
              </span>
            </div>
            <h3 className="text-sm text-green-600 font-medium">Total Revenue</h3>
            <p className={`text-3xl font-bold text-green-900 mt-2 transition-all duration-300 ${hoveredCard === 'revenue' ? 'scale-110' : ''}`}>
              Rs. {summaryData.totalRevenue.toLocaleString()}
            </p>
            {hoveredCard === 'revenue' && (
              <p className="text-xs text-green-600 mt-2 animate-fade-in">
                Growth from last period
              </p>
            )}
          </div>

          {/* Total Expenses */}
          <div 
            className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer"
            onMouseEnter={() => setHoveredCard('expenses')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="bg-red-100 p-3 rounded-full">
                <ArrowTrendingDownIcon className="h-8 w-8 text-red-600" />
              </div>
              <span className="text-sm font-medium text-red-600 bg-red-100 px-3 py-1 rounded-full">
                +{summaryData.expenseGrowth}%
              </span>
            </div>
            <h3 className="text-sm text-red-600 font-medium">Total Expenses</h3>
            <p className={`text-3xl font-bold text-red-900 mt-2 transition-all duration-300 ${hoveredCard === 'expenses' ? 'scale-110' : ''}`}>
              Rs. {summaryData.totalExpenses.toLocaleString()}
            </p>
            {hoveredCard === 'expenses' && (
              <p className="text-xs text-red-600 mt-2 animate-fade-in">
                {summaryData.expenseGrowth}% increase from last period
              </p>
            )}
          </div>

          {/* Net Profit */}
          <div 
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer"
            onMouseEnter={() => setHoveredCard('profit')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <BanknotesIcon className="h-8 w-8 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                {summaryData.profitMargin}% Margin
              </span>
            </div>
            <h3 className="text-sm text-blue-600 font-medium">Net Profit</h3>
            <p className={`text-3xl font-bold text-blue-900 mt-2 transition-all duration-300 ${hoveredCard === 'profit' ? 'scale-110' : ''}`}>
              Rs. {summaryData.netProfit.toLocaleString()}
            </p>
            {hoveredCard === 'profit' && (
              <p className="text-xs text-blue-600 mt-2 animate-fade-in">
                Revenue - Expenses
              </p>
            )}
          </div>
        </div>

        {/* Income by Category */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <ArrowTrendingUpIcon className="h-6 w-6 mr-2 text-green-600" />
            Income by Category
          </h2>
          <div className="space-y-4">
            {incomeByCategory.map((item, index) => (
              <div 
                key={index} 
                className="group hover:bg-green-50 p-4 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">{item.category}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      item.trend.startsWith('+') 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.trend}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      Rs. {item.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{item.percentage}% of total</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2.5 rounded-full transition-all duration-500 group-hover:scale-105"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense by Category */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <ArrowTrendingDownIcon className="h-6 w-6 mr-2 text-red-600" />
            Expense by Category
          </h2>
          <div className="space-y-4">
            {expenseByCategory.map((item, index) => (
              <div 
                key={index} 
                className="group hover:bg-red-50 p-4 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">{item.category}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      item.trend.startsWith('+') 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.trend}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      Rs. {item.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{item.percentage}% of total</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-red-500 to-rose-600 h-2.5 rounded-full transition-all duration-500 group-hover:scale-105"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <CalendarIcon className="h-6 w-6 mr-2 text-primary-600" />
            Monthly Trends
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Income</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expense</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margin</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyTrends.map((trend, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {trend.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      Rs. {trend.income.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                      Rs. {trend.expense.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                      Rs. {trend.profit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {((trend.profit / trend.income) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Period Comparison */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Period Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Income Growth</p>
              <p className={`text-3xl font-bold ${comparisonData.growth.income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {comparisonData.growth.income >= 0 ? '+' : ''}{comparisonData.growth.income}%
              </p>
              <p className="text-xs text-gray-400 mt-2">
                From Rs. {comparisonData.lastMonth.income.toLocaleString()} to Rs. {comparisonData.thisMonth.income.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Expense Growth</p>
              <p className={`text-3xl font-bold ${comparisonData.growth.expense >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {comparisonData.growth.expense >= 0 ? '+' : ''}{comparisonData.growth.expense}%
              </p>
              <p className="text-xs text-gray-400 mt-2">
                From Rs. {comparisonData.lastMonth.expense.toLocaleString()} to Rs. {comparisonData.thisMonth.expense.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Profit Growth</p>
              <p className={`text-3xl font-bold ${comparisonData.growth.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {comparisonData.growth.profit >= 0 ? '+' : ''}{comparisonData.growth.profit}%
              </p>
              <p className="text-xs text-gray-400 mt-2">
                From Rs. {comparisonData.lastMonth.profit.toLocaleString()} to Rs. {comparisonData.thisMonth.profit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">💡 Key Insights</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Strong Revenue Growth:</span> Total revenue increased by {summaryData.revenueGrowth}% compared to the previous period, driven primarily by tuition fees.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Healthy Profit Margin:</span> Maintaining a {summaryData.profitMargin}% profit margin demonstrates strong financial health and operational efficiency.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Monitor Expenses:</span> Salary expenses constitute the largest cost at 55% of total expenses. Consider optimizing operational costs.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Diversification Opportunity:</span> 72% of income comes from tuition fees. Explore additional revenue streams to reduce dependency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IncomeReports;

