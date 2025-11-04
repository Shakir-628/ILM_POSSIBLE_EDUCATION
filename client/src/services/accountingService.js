import api from '../utils/api';

export const accountingService = {
  // Transactions
  async getAllTransactions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.category) params.append('category', filters.category);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/accounting/transactions?${params.toString()}`);
    return response.data;
  },

  async getTransactionById(id) {
    const response = await api.get(`/accounting/transactions/${id}`);
    return response.data;
  },

  async createTransaction(transactionData) {
    const response = await api.post('/accounting/transactions', transactionData);
    return response.data;
  },

  async updateTransaction(id, transactionData) {
    const response = await api.put(`/accounting/transactions/${id}`, transactionData);
    return response.data;
  },

  async deleteTransaction(id) {
    const response = await api.delete(`/accounting/transactions/${id}`);
    return response.data;
  },

  // Statistics
  async getStatistics(filters = {}) {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.period) params.append('period', filters.period);

    const response = await api.get(`/accounting/statistics?${params.toString()}`);
    return response.data;
  },

  async getCategoryBreakdown(type, filters = {}) {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/accounting/category-breakdown/${type}?${params.toString()}`);
    return response.data;
  },

  async getMonthlyTrends(filters = {}) {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.months) params.append('months', filters.months);

    const response = await api.get(`/accounting/monthly-trends?${params.toString()}`);
    return response.data;
  },

  async getComparisonData(currentPeriod, previousPeriod) {
    const response = await api.get('/accounting/comparison', {
      params: {
        currentStart: currentPeriod.startDate,
        currentEnd: currentPeriod.endDate,
        previousStart: previousPeriod.startDate,
        previousEnd: previousPeriod.endDate,
      }
    });
    return response.data;
  },

  // Reports
  async generateFinancialReport(reportType, filters = {}) {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.period) params.append('period', filters.period);

    const response = await api.get(`/accounting/reports/${reportType}?${params.toString()}`);
    return response.data;
  },

  async exportToExcel(filters = {}) {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/accounting/export/excel?${params.toString()}`, {
      responseType: 'blob',
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `accounting_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return response.data;
  },

  async exportToPDF(filters = {}) {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/accounting/export/pdf?${params.toString()}`, {
      responseType: 'blob',
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `accounting_report_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return response.data;
  },

  // Budget Management
  async getBudgets(filters = {}) {
    const params = new URLSearchParams();
    if (filters.year) params.append('year', filters.year);
    if (filters.category) params.append('category', filters.category);

    const response = await api.get(`/accounting/budgets?${params.toString()}`);
    return response.data;
  },

  async createBudget(budgetData) {
    const response = await api.post('/accounting/budgets', budgetData);
    return response.data;
  },

  async updateBudget(id, budgetData) {
    const response = await api.put(`/accounting/budgets/${id}`, budgetData);
    return response.data;
  },

  async deleteBudget(id) {
    const response = await api.delete(`/accounting/budgets/${id}`);
    return response.data;
  },

  // Dashboard Data
  async getDashboardData(filters = {}) {
    const params = new URLSearchParams();
    if (filters.period) params.append('period', filters.period);

    const response = await api.get(`/accounting/dashboard?${params.toString()}`);
    return response.data;
  },

  // Cash Flow
  async getCashFlow(filters = {}) {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/accounting/cash-flow?${params.toString()}`);
    return response.data;
  },

  // Reconciliation
  async getBankReconciliation(filters = {}) {
    const params = new URLSearchParams();
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);

    const response = await api.get(`/accounting/reconciliation?${params.toString()}`);
    return response.data;
  },

  async reconcileTransaction(id, reconciliationData) {
    const response = await api.post(`/accounting/reconciliation/${id}`, reconciliationData);
    return response.data;
  },
};

