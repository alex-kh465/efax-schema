import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, LayoutDashboard, FileText, AlertCircle, CheckCircle, Filter } from 'lucide-react';
import data from '../data/cleaned_data.json';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');

    const stats = useMemo(() => {
        const totalPages = data.length;
        const avgScore = data.reduce((acc, curr) => acc + (curr.schema_completeness_score || 0), 0) / totalPages;
        const withReviews = data.filter(d => d.has_reviews).length;
        const withFaq = data.filter(d => d.has_faq).length;

        return {
            totalPages,
            avgScore: avgScore.toFixed(1),
            withReviews,
            withFaq
        };
    }, []);

    const chartData = useMemo(() => {
        const typeCount = {};
        data.forEach(item => {
            // Unravel schema_types_found
            const types = (item.schema_types_found || '').split(',').map(t => t.trim());
            types.forEach(type => {
                if (type && type !== 'Unspecified' && type !== 'Unknown') {
                    typeCount[type] = (typeCount[type] || 0) + 1;
                }
            });
        });
        return Object.entries(typeCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, []);

    const pageTypeData = useMemo(() => {
        const typeCount = {};
        data.forEach(item => {
            const type = item.page_type || 'Uncategorized';
            if (type !== 'Uncategorized') {
                typeCount[type] = (typeCount[type] || 0) + 1;
            }
        });
        return Object.entries(typeCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, []);

    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesSearch = item.url.toLowerCase().includes(searchTerm.toLowerCase());
            const itemTypes = (item.schema_types_found || '').split(',').map(t => t.trim());
            const matchesFilter = filterType === 'All' || itemTypes.includes(filterType);
            return matchesSearch && matchesFilter;
        });
    }, [searchTerm, filterType]);

    const uniqueSchemaTypes = useMemo(() => {
        const types = new Set();
        data.forEach(item => {
            const itemTypes = (item.schema_types_found || '').split(',').map(t => t.trim());
            itemTypes.forEach(t => {
                if (t && t !== 'Unspecified' && t !== 'Unknown') {
                    types.add(t);
                }
            });
        });
        return ['All', ...Array.from(types).sort()];
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Schema Analysis Dashboard</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of eFax schema implementation status</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                            Last updated: Today
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Pages Analyzed" value={stats.totalPages} icon={FileText} color="bg-blue-500" />
                    <StatCard title="Avg. Completeness" value={`${stats.avgScore}%`} icon={CheckCircle} color="bg-green-500" />
                    <StatCard title="Pages with Reviews" value={stats.withReviews} icon={LayoutDashboard} color="bg-purple-500" />
                    <StatCard title="Pages with FAQ" value={stats.withFaq} icon={AlertCircle} color="bg-orange-500" />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Primary Schema Distribution */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Schema Types Distribution (All Found)</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F3F4F6' }}
                                        itemStyle={{ color: '#F3F4F6' }}
                                    />
                                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Page Type Distribution */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Page Type Distribution</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pageTypeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pageTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F3F4F6' }}
                                        itemStyle={{ color: '#F3F4F6' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Data Table Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Analysis</h3>

                        <div className="flex gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-initial">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search URLs..."
                                    className="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    className="pl-10 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none dark:text-white cursor-pointer"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    {uniqueSchemaTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-4">URL</th>
                                    <th className="px-6 py-4">Page Type</th>
                                    <th className="px-6 py-4">Schema Types</th>
                                    <th className="px-6 py-4">Recommended Schemas</th>
                                    <th className="px-6 py-4">Score</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredData.slice(0, 50).map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white truncate max-w-xs" title={row.url}>
                                            {row.url.replace('https://www.efax.com', '')}
                                        </td>
                                        <td className="px-6 py-4">{row.page_type}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {(row.schema_types_found || '').split(',').map((type, i) => {
                                                    const t = type.trim();
                                                    if (!t || t === 'Unspecified' || t === 'Unknown') return null;
                                                    return (
                                                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                                            {t}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {row.recommended_schemas ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {row.recommended_schemas.split(',').map((type, i) => (
                                                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-100 dark:border-purple-800">
                                                            {type.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${row.schema_completeness_score >= 80 ? 'bg-green-500' :
                                                            row.schema_completeness_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${row.schema_completeness_score}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs">{row.schema_completeness_score}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${row.validation_errors === 0 || row.validation_errors === '' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                }`}>
                                                {row.validation_errors === 0 || row.validation_errors === '' ? 'Valid' : 'Errors'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-center text-xs text-gray-500">
                        Showing first 50 results of {filteredData.length}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
