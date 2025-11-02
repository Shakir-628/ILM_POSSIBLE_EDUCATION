import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AttendanceChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Trends (Last 30 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="present" stroke="#10B981" strokeWidth={2} name="Present" />
          <Line type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={2} name="Absent" />
          <Line type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={2} name="Total" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;

