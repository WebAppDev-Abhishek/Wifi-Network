import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { networkInterfaces } from 'os';
import axios from 'axios';
import config from './config';
import helmet from 'helmet';
import { getWifiNetworks, getConnectedWifiInfo } from './utils/wifi';

const app = express();
const port = config.port;
const host = config.host;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));
app.use(express.json());

// Basic rate limiting
const requestCounts = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 60; // 60 requests per minute

const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  // Clean up old requests
  requestCounts.forEach((timestamp, key) => {
    if (timestamp < windowStart) {
      requestCounts.delete(key);
    }
  });

  // Count requests for this IP
  const requestCount = Array.from(requestCounts.entries())
    .filter(([key, timestamp]) => key.startsWith(ip) && timestamp > windowStart)
    .length;

  if (requestCount >= MAX_REQUESTS) {
    res.status(429).json({
      error: 'Too many requests',
      details: 'Please try again later'
    });
    return;
  }

  requestCounts.set(`${ip}-${now}`, now);
  next();
};

app.use(rateLimiter);

// Get network interfaces information
app.get('/api/network-info', (req, res) => {
  try {
    const interfaces = networkInterfaces();
    const networkInfo = Object.entries(interfaces).reduce((acc, [name, nets]) => {
      if (nets) {
        acc[name] = nets.map(net => ({
          address: net.address,
          netmask: net.netmask,
          family: net.family,
          mac: net.mac,
          internal: net.internal
        }));
      }
      return acc;
    }, {} as Record<string, any>);
    
    res.json(networkInfo);
  } catch (error) {
    console.error('Error fetching network info:', error);
    res.status(500).json({ error: 'Failed to fetch network information' });
  }
});

// Speed test endpoint
app.post('/api/speed-test', async (req, res) => {
  try {
    // Use multiple test files for more accurate results
    const testFiles = [
      'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
      'https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js',
      'https://cdn.jsdelivr.net/npm/axios@1.6.7/dist/axios.min.js'
    ];
    
    const results = await Promise.all(
      testFiles.map(async (url) => {
        const startTime = Date.now();
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          timeout: 10000,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        const endTime = Date.now();
        const downloadTime = endTime - startTime;
        const fileSize = response.data.length;
        const downloadSpeed = fileSize / (downloadTime / 1000);
        
        return {
          url,
          downloadSpeed,
          downloadTime,
          fileSize
        };
      })
    );

    // Calculate average speed
    const totalSpeed = results.reduce((sum, result) => sum + result.downloadSpeed, 0);
    const averageSpeed = totalSpeed / results.length;
    
    res.json({
      downloadSpeed: averageSpeed,
      downloadTime: Math.max(...results.map(r => r.downloadTime)),
      fileSize: results.reduce((sum, r) => sum + r.fileSize, 0),
      timestamp: new Date().toISOString(),
      details: results
    });
  } catch (error) {
    console.error('Speed test error:', error);
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        res.status(408).json({ error: 'Speed test timed out' });
      } else if (error.response) {
        res.status(error.response.status).json({ 
          error: 'Failed to perform speed test',
          details: error.response.statusText
        });
      } else if (error.request) {
        res.status(503).json({ 
          error: 'No response received from test server',
          details: 'Please check your internet connection'
        });
      } else {
        res.status(500).json({ 
          error: 'Failed to perform speed test',
          details: error.message
        });
      }
    } else {
      res.status(500).json({ 
        error: 'Failed to perform speed test',
        details: 'An unexpected error occurred'
      });
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get WiFi networks
app.get('/api/wifi/networks', async (req, res) => {
  try {
    const networks = await getWifiNetworks();
    res.json(networks);
  } catch (error) {
    console.error('Error fetching WiFi networks:', error);
    res.status(500).json({ 
      error: 'Failed to fetch WiFi networks',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get connected WiFi information
app.get('/api/wifi/connected', async (req, res) => {
  try {
    const connectedInfo = await getConnectedWifiInfo();
    if (!connectedInfo) {
      res.status(404).json({ error: 'Not connected to any WiFi network' });
      return;
    }
    res.json(connectedInfo);
  } catch (error) {
    console.error('Error fetching connected WiFi info:', error);
    res.status(500).json({ 
      error: 'Failed to fetch connected WiFi information',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`CORS Origin: ${config.corsOrigin}`);
}); 