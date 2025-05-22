'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface WifiNetwork {
  ssid: string;
  signal: number;
  type: string;
  authentication: string;
  encryption: string;
  connected: boolean;
}

interface WifiListProps {
  networks: WifiNetwork[];
  onRefresh: () => void;
  isLoading: boolean;
}

export default function WifiList({ networks, onRefresh, isLoading }: WifiListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'signal' | 'name'>('signal');

  const getSignalStrengthColor = (signal: number) => {
    if (signal >= 80) return 'text-emerald-600';
    if (signal >= 60) return 'text-teal-500';
    if (signal >= 40) return 'text-amber-500';
    if (signal >= 20) return 'text-orange-500';
    return 'text-rose-500';
  };

  const getSignalStrengthIcon = (signal: number) => {
    if (signal >= 80) return '▂▄▆█';
    if (signal >= 60) return '▂▄▆▁';
    if (signal >= 40) return '▂▄▁▁';
    if (signal >= 20) return '▂▁▁▁';
    return '▁▁▁▁';
  };

  const getSignalStrengthLabel = (signal: number) => {
    if (signal >= 80) return 'Excellent';
    if (signal >= 60) return 'Good';
    if (signal >= 40) return 'Fair';
    if (signal >= 20) return 'Poor';
    return 'Very Poor';
  };

  const sortedNetworks = [...networks].sort((a, b) => {
    if (sortBy === 'signal') {
      return b.signal - a.signal;
    }
    return a.ssid.localeCompare(b.ssid);
  });

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          WiFi Networks List
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="viewMode" className="text-sm text-indigo-600">View:</label>
            <select
              id="viewMode"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'grid' | 'list')}
              className="border border-indigo-200 rounded-lg px-3 py-1.5 text-sm bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            >
              <option value="list">List View</option>
              <option value="grid">Grid View</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sortBy" className="text-sm text-indigo-600">Sort by:</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'signal' | 'name')}
              className="border border-indigo-200 rounded-lg px-3 py-1.5 text-sm bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            >
              <option value="signal">Signal Strength</option>
              <option value="name">Network Name</option>
            </select>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-white font-semibold transition-all ${
              isLoading
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-indigo-50/50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-900">Network Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-900">Signal Strength</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-900">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-900">Security</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-100">
              {sortedNetworks.map((network, index) => (
                <motion.tr
                  key={network.ssid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`hover:bg-indigo-50/30 transition-colors ${
                    network.connected ? 'bg-indigo-50/50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-indigo-900">{network.ssid}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-mono ${getSignalStrengthColor(network.signal)}`}>
                        {getSignalStrengthIcon(network.signal)}
                      </span>
                      <span className={`text-sm ${getSignalStrengthColor(network.signal)}`}>
                        {network.signal}% ({getSignalStrengthLabel(network.signal)})
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-indigo-700">{network.type}</td>
                  <td className="px-4 py-3 text-indigo-700">{network.authentication}</td>
                  <td className="px-4 py-3">
                    {network.connected ? (
                      <span className="px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">
                        Connected
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
                        Available
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedNetworks.map((network, index) => (
            <motion.div
              key={network.ssid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm hover:shadow-md transition-all border ${
                network.connected 
                  ? 'border-indigo-500 bg-indigo-50/50' 
                  : 'border-indigo-100'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-indigo-900 truncate">
                  {network.ssid}
                </h3>
                {network.connected && (
                  <span className="px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full whitespace-nowrap">
                    Connected
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-mono ${getSignalStrengthColor(network.signal)}`}>
                      {getSignalStrengthIcon(network.signal)}
                    </span>
                    <span className={`text-sm ${getSignalStrengthColor(network.signal)}`}>
                      {getSignalStrengthLabel(network.signal)}
                    </span>
                  </div>
                  <span className={`font-bold ${getSignalStrengthColor(network.signal)}`}>
                    {network.signal}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-indigo-600">Type:</span>
                    <span className="ml-2 font-medium text-indigo-900">{network.type}</span>
                  </div>
                  <div>
                    <span className="text-indigo-600">Security:</span>
                    <span className="ml-2 font-medium text-indigo-900">{network.authentication}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {networks.length === 0 && !isLoading && (
        <div className="text-center py-8 text-indigo-600 bg-indigo-50 rounded-lg">
          No WiFi networks found
        </div>
      )}
    </div>
  );
} 