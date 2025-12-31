import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Table from '../components/Table';
import {
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { feeService } from '../services/feeService';
import { useToast } from '../context/ToastContext';

const Fees = () => {
  const toast = useToast();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);

  // If admin, redirect to fee management
  useEffect(() => {
    if (isAdmin) {
      navigate('/fee-management');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) {
      fetchMyPayments();
    }
  }, [isAdmin]);

  const fetchMyPayments = async () => {
    try {
      // TODO: Get current student ID from user context
      // const data = await feeService.getFeePayments({ studentId: user.studentId });
      // setPayments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (payment) => {
    try {
      const blob = await feeService.downloadInvoice(payment._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${payment.invoiceNumber}.pdf`;
      a.click();
    } catch (error) {
      toast.error('Error downloading invoice');
    }
  };

  const handleDownloadReceipt = async (payment) => {
    try {
      const blob = await feeService.downloadReceipt(payment._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${payment.receiptNumber}.pdf`;
      a.click();
    } catch (error) {
      toast.error('Error downloading receipt');
    }
  };

  const paymentColumns = [
    { header: 'Invoice #', accessor: 'invoiceNumber' },
    {
      header: 'Fee',
      accessor: 'feeStructure',
      render: (row) => row.feeStructure?.feeName || 'N/A',
    },
    {
      header: 'Amount',
      accessor: 'totalAmount',
      render: (row) => `PKR ${row.totalAmount.toLocaleString()}`,
    },
    {
      header: 'Paid',
      accessor: 'amountPaid',
      render: (row) => `PKR ${row.amountPaid.toLocaleString()}`,
    },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      render: (row) => new Date(row.dueDate).toLocaleDateString(),
    },
    {
      header: 'Status',
      accessor: 'paymentStatus',
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
          row.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
          row.paymentStatus === 'overdue' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.paymentStatus}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          {row.paymentStatus !== 'paid' && (
            <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
              Pay Online
            </button>
          )}
          <button
            onClick={() => handleDownloadInvoice(row)}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            Invoice
          </button>
          {row.paymentStatus === 'paid' && (
            <button
              onClick={() => handleDownloadReceipt(row)}
              className="text-green-600 hover:text-green-900 text-sm font-medium"
            >
              Receipt
            </button>
          )}
        </div>
      ),
    },
  ];

  const totalFees = payments.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalPending = payments.reduce((sum, p) => sum + p.balance, 0);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading fee information...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Fees</h1>
          <p className="mt-1 text-sm text-gray-500">
            View your fee invoices and payment history
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Card
            title="Total Fees"
            value={`PKR ${totalFees.toLocaleString()}`}
            icon={BanknotesIcon}
            color="blue"
            subtitle="Current year"
          />
          <Card
            title="Paid"
            value={`PKR ${totalPaid.toLocaleString()}`}
            icon={CheckCircleIcon}
            color="green"
            subtitle="Completed payments"
          />
          <Card
            title="Pending"
            value={`PKR ${totalPending.toLocaleString()}`}
            icon={ClockIcon}
            color="yellow"
            subtitle="Outstanding balance"
          />
        </div>

        {/* Payment History */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Payment History
            </h3>
          </div>
          
          {payments.length === 0 ? (
            <div className="p-12 text-center">
              <BanknotesIcon className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-sm font-medium text-gray-900">No fee records</h3>
              <p className="mt-2 text-sm text-gray-500">
                You don't have any fee invoices yet.
              </p>
            </div>
          ) : (
            <Table
              columns={paymentColumns}
              data={payments}
              loading={loading}
            />
          )}
        </div>

        {/* Payment Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Payment Instructions
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Click "Pay Online" to pay using credit/debit card (Stripe)</li>
            <li>Download invoice to pay at school office</li>
            <li>Contact accounts@ilmpossible.com for payment queries</li>
            <li>Download receipt after successful payment</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Fees;

