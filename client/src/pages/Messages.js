import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { PlusIcon, InboxIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { messageService } from '../services/messageService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' or 'sent'
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const [formData, setFormData] = useState({
    recipient: '',
    subject: '',
    body: '',
    priority: 'normal',
  });

  useEffect(() => {
    fetchMessages();
  }, [activeTab]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = activeTab === 'inbox' 
        ? await messageService.getInbox()
        : await messageService.getSentMessages();
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await messageService.sendMessage(formData);
      toast.success('Message sent successfully');
      fetchMessages();
      closeModal();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Error sending message');
    }
  };

  const handleDelete = async (message) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await messageService.deleteMessage(message._id);
        toast.success('Message deleted successfully');
        fetchMessages();
      } catch (error) {
        console.error('Error deleting message:', error);
        toast.error('Error deleting message');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ recipient: '', subject: '', body: '', priority: 'normal' });
  };

  const columns = [
    {
      header: activeTab === 'inbox' ? 'From' : 'To',
      accessor: 'user',
      render: (row) => {
        const user = activeTab === 'inbox' ? row.sender : row.recipient;
        return user ? `${user.name} (${user.role})` : 'N/A';
      },
    },
    { header: 'Subject', accessor: 'subject' },
    {
      header: 'Preview',
      accessor: 'body',
      render: (row) => (
        <div className="max-w-md truncate text-sm text-gray-600">{row.body}</div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.status === 'read' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleString(),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={async () => {
              const response = await messageService.getMessageById(row._id);
              setSelectedMessage(response.data);
              setIsDetailModalOpen(true);
            }}
            className="text-indigo-600 hover:text-indigo-900 text-sm"
          >
            View
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="text-red-600 hover:text-red-900 text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="mt-1 text-sm text-gray-500">Direct messaging system</p>
          </div>
          <Button icon={PlusIcon} onClick={() => setIsModalOpen(true)}>
            Compose Message
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`${
                activeTab === 'inbox'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <InboxIcon className="h-5 w-5 mr-2" />
              Inbox
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`${
                activeTab === 'sent'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <PaperAirplaneIcon className="h-5 w-5 mr-2" />
              Sent
            </button>
          </nav>
        </div>

        {/* Messages Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Table columns={columns} data={messages} loading={loading} />
        </div>

        {/* Compose Modal */}
        <Modal isOpen={isModalOpen} onClose={closeModal} title="Compose Message">
          <form onSubmit={handleSend} className="space-y-4">
            <Input
              label="Recipient Email"
              name="recipient"
              type="email"
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              placeholder="recipient@example.com"
              required
            />
            <Input
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                name="body"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                rows="6"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button type="submit">Send Message</Button>
            </div>
          </form>
        </Modal>

        {/* Detail Modal */}
        {isDetailModalOpen && selectedMessage && (
          <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Message Details" size="large">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>From:</strong> {selectedMessage.sender?.name}</div>
                  <div><strong>To:</strong> {selectedMessage.recipient?.name}</div>
                  <div><strong>Subject:</strong> {selectedMessage.subject}</div>
                  <div><strong>Date:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <div className="bg-white p-4 border rounded-md">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.body}</p>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setIsDetailModalOpen(false)}>Close</Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default Messages;

