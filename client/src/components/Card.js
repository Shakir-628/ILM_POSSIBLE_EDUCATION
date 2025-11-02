import React from 'react';

const Card = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
  };

  const hoverColorClasses = {
    blue: 'hover:border-blue-300',
    green: 'hover:border-green-300',
    yellow: 'hover:border-yellow-300',
    red: 'hover:border-red-300',
    purple: 'hover:border-purple-300',
    indigo: 'hover:border-indigo-300',
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg border-2 border-transparent transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-105 animate-fade-in-up">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`${colorClasses[color]} rounded-md p-3 transition-transform duration-300 hover:rotate-6 hover:scale-110`}>
              {Icon && <Icon className="h-6 w-6 text-white transition-transform duration-300" />}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900 transition-all duration-300">{value}</div>
              </dd>
              {subtitle && (
                <dd className="text-sm text-gray-600 mt-1">{subtitle}</dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;

