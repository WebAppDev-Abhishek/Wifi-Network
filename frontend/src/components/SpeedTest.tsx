'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import config from '@/config';

interface SpeedTestResult {
  downloadSpeed: number;
  downloadTime: number;
  fileSize: number;
  timestamp: string;
  details: Array<{
    url: string;
    downloadSpeed: number;
    downloadTime: number;
    fileSize: number;
  }>;
}

interface NetworkInfo {
  [key: string]: Array<{
    address: string;
    netmask: string;
    family: string;
    mac: string;
    internal: boolean;
  }>;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export default function SpeedTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<SpeedTestResult | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [testProgress, setTestProgress] = useState(0);

  useEffect(() => {
    fetchNetworkInfo();
  }, []);

  const fetchNetworkInfo = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/network-info`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch network information');
      }
      const data = await response.json();
      setNetworkInfo(data);
    } catch (err) {
      setError({
        error: err instanceof Error ? err.message : 'Failed to fetch network information'
      });
    }
  };

  const runSpeedTest = async () => {
    setIsTesting(true);
    setError(null);
    setTestProgress(0);
    try {
      const response = await fetch(`${config.apiUrl}/api/speed-test`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to perform speed test');
      }
      
      setResult(data);
      setTestProgress(100);
    } catch (err) {
      setError({
        error: 'Speed Test Failed',
        details: err instanceof Error ? err.message : 'An unexpected error occurred'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const formatSpeed = (bytesPerSecond: number) => {
    const mbps = (bytesPerSecond * 8) / (1024 * 1024);
    return `${mbps.toFixed(2)} Mbps`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Internet Speed Test</h1>
        
        <div className="mb-8">
          <button
            onClick={runSpeedTest}
            disabled={isTesting}
            className={`px-6 py-3 rounded-lg text-white font-semibold ${
              isTesting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            {isTesting ? 'Testing...' : 'Start Speed Test'}
          </button>

          {isTesting && (
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
              <motion.div
                className="bg-blue-600 h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${testProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          >
            <p className="font-semibold">{error.error}</p>
            {error.details && (
              <p className="text-sm mt-1">{error.details}</p>
            )}
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-lg p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-600">Download Speed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatSpeed(result.downloadSpeed)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-600">Download Time</p>
                <p className="text-2xl font-bold text-green-600">
                  {result.downloadTime}ms
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-600">Total Data</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatFileSize(result.fileSize)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-600">Timestamp</p>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date(result.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Test Details</h3>
              <div className="space-y-4">
                {result.details.map((detail, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Test {index + 1}: {new URL(detail.url).hostname}
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Speed</p>
                        <p className="text-sm font-semibold text-blue-600">
                          {formatSpeed(detail.downloadSpeed)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="text-sm font-semibold text-green-600">
                          {detail.downloadTime}ms
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Size</p>
                        <p className="text-sm font-semibold text-purple-600">
                          {formatFileSize(detail.fileSize)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {networkInfo && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Network Information</h2>
            <div className="space-y-4">
              {Object.entries(networkInfo).map(([name, interfaces]) => (
                <div key={name} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold text-gray-800 mb-2">{name}</h3>
                  <div className="space-y-2">
                    {interfaces.map((net, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        <p>Address: {net.address}</p>
                        <p>Family: {net.family}</p>
                        <p>MAC: {net.mac}</p>
                        <p>Internal: {net.internal ? 'Yes' : 'No'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 