import React from 'react';

const Card = ({ title, value, icon: Icon, color = 'blue', subtitle, className = '' }) => {
  const colorClasses = {
    blue: {
      gradient: 'from-primary-500 to-primary-600',
      shadow: 'shadow-primary-500/20',
      glow: 'hover:shadow-glow',
    },
    green: {
      gradient: 'from-success-500 to-success-600',
      shadow: 'shadow-success-500/20',
      glow: 'hover:shadow-lg hover:shadow-success-500/30',
    },
    yellow: {
      gradient: 'from-warning-500 to-warning-600',
      shadow: 'shadow-warning-500/20',
      glow: 'hover:shadow-lg hover:shadow-warning-500/30',
    },
    red: {
      gradient: 'from-danger-500 to-danger-600',
      shadow: 'shadow-danger-500/20',
      glow: 'hover:shadow-lg hover:shadow-danger-500/30',
    },
    purple: {
      gradient: 'from-secondary-500 to-secondary-600',
      shadow: 'shadow-secondary-500/20',
      glow: 'hover:shadow-glow-purple',
    },
    indigo: {
      gradient: 'from-primary-600 to-secondary-600',
      shadow: 'shadow-primary-600/20',
      glow: 'hover:shadow-glow-purple',
    },
  };

  const colorClass = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`bg-white overflow-hidden rounded-2xl border border-gray-100 transition-all duration-300 hover:shadow-large hover:-translate-y-1 hover:scale-[1.02] animate-fade-in-up group ${className}`}>
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`bg-gradient-to-br ${colorClass.gradient} rounded-xl p-3.5 ${colorClass.shadow} shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${colorClass.glow}`}>
              {Icon && <Icon className="h-7 w-7 text-white" />}
            </div>
          </div>
          <div className="ml-6 w-0 flex-1">
            <dl>
              <dt className="text-sm font-semibold text-gray-500 truncate uppercase tracking-wide">{title}</dt>
              <dd className="flex items-baseline mt-1">
                <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent transition-all duration-300">{value}</div>
              </dd>
              {subtitle && (
                <dd className="text-sm text-gray-600 mt-1.5 font-medium">{subtitle}</dd>
              )}
            </dl>
          </div>
        </div>
      </div>
      <div className={`h-1 bg-gradient-to-r ${colorClass.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
    </div>
  );
};

export default Card;
