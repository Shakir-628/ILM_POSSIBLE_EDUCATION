import React from 'react';

const Skeleton = ({ className, variant = 'text' }) => {
    const baseClass = "animate-shimmer bg-gray-200 rounded";

    const variants = {
        text: "h-4 w-full",
        title: "h-8 w-3/4",
        circle: "rounded-full",
        rect: "h-32 w-full",
        card: "h-48 w-full",
    };

    return (
        <div className={`${baseClass} ${variants[variant]} ${className}`} />
    );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
    return (
        <div className="w-full bg-white shadow-md rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            {[...Array(cols)].map((_, i) => (
                                <th key={i} className="px-6 py-4">
                                    <Skeleton variant="text" className="w-24" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {[...Array(rows)].map((_, i) => (
                            <tr key={i}>
                                {[...Array(cols)].map((_, j) => (
                                    <td key={j} className="px-6 py-4">
                                        <Skeleton variant="text" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const DashboardSkeleton = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <Skeleton variant="title" className="mb-2" />
                <Skeleton variant="text" className="w-1/2" />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} variant="card" className="h-32" />
                ))}
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                <Skeleton variant="title" className="mb-4" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} variant="text" className="h-12" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Skeleton;
