'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import config from '@/config';
import WifiList from './WifiList';

interface WifiNetwork {
  ssid: string;
  signal: number;
  type: string;
  authentication: string;
  encryption: string;
  connected: boolean;
}

interface ConnectedWifiInfo {
  ssid: string;
  signal: number;
  channel: number;
  radioType: string;
  authentication: string;
  encryption: string;
}

export default function WifiInfo() {
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [connectedInfo, setConnectedInfo] = useState<ConnectedWifiInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWifiInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [networksRes, connectedRes] = await Promise.all([
        fetch(`${config.apiUrl}/api/wifi/networks`),
        fetch(`${config.apiUrl}/api/wifi/connected`)
      ]);

      if (!networksRes.ok) {
        throw new Error('Failed to fetch WiFi networks');
      }

      const networksData = await networksRes.json();
      setNetworks(networksData);

      if (connectedRes.ok) {
        const connectedData = await connectedRes.json();
        setConnectedInfo(connectedData);
      } else if (connectedRes.status !== 404) {
        throw new Error('Failed to fetch connected WiFi information');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch WiFi information');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWifiInfo();
    // Refresh WiFi information every 30 seconds
    const interval = setInterval(fetchWifiInfo, 30000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            WiFi Networks
          </h1>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg mb-4"
          >
            {error}
          </motion.div>
        )}

        {connectedInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-indigo-800 mb-4">Connected Network</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-indigo-100">
                <p className="text-sm text-indigo-600">Network Name (SSID)</p>
                <p className="text-xl font-bold text-indigo-700">{connectedInfo.ssid}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-indigo-100">
                <p className="text-sm text-indigo-600">Signal Strength</p>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <span className={`text-xl font-mono ${getSignalStrengthColor(connectedInfo.signal)}`}>
                      {getSignalStrengthIcon(connectedInfo.signal)}
                    </span>
                    <span className={`text-xs ${getSignalStrengthColor(connectedInfo.signal)}`}>
                      {getSignalStrengthLabel(connectedInfo.signal)}
                    </span>
                  </div>
                  <p className={`text-xl font-bold ${getSignalStrengthColor(connectedInfo.signal)}`}>
                    {connectedInfo.signal}%
                  </p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-indigo-100">
                <p className="text-sm text-indigo-600">Channel</p>
                <p className="text-xl font-bold text-purple-600">{connectedInfo.channel}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-indigo-100">
                <p className="text-sm text-indigo-600">Radio Type</p>
                <p className="text-lg font-semibold text-indigo-700">{connectedInfo.radioType}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-indigo-100">
                <p className="text-sm text-indigo-600">Authentication</p>
                <p className="text-lg font-semibold text-indigo-700">{connectedInfo.authentication}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-indigo-100">
                <p className="text-sm text-indigo-600">Encryption</p>
                <p className="text-lg font-semibold text-indigo-700">{connectedInfo.encryption}</p>
              </div>
            </div>
          </motion.div>
        )}

        <WifiList
          networks={networks}
          onRefresh={fetchWifiInfo}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
} 