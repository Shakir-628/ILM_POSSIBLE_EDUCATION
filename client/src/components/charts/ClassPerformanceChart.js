import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ClassPerformanceChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Class Performance Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="className" type="category" width={150} />
          <Tooltip />
          <Legend />
          <Bar dataKey="averagePercentage" fill="#10B981" name="Average Score %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClassPerformanceChart;

