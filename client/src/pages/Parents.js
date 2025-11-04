import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const Parents = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <UserCircleIcon className="h-8 w-8 mr-2 text-primary-600" />
            Parent Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage parent information and communication
          </p>
        </div>

        <Card className="p-6">
          <p className="text-gray-600">Parent management module coming soon...</p>
        </Card>
      </div>
    </Layout>
  );
};

export default Parents;

