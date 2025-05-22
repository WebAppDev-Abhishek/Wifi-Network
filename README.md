# Network Speed & WiFi Monitor

A modern web application for monitoring network performance and WiFi connectivity, built with Next.js, TypeScript, and Express.

## 🌟 Features

- **Real-time Speed Testing**
  - Multi-file download testing for accurate results
  - Detailed speed metrics (download speed, time, file size)
  - Progress tracking during tests
  - Visual speed test results

- **WiFi Network Monitoring**
  - List of all available WiFi networks
  - Real-time signal strength visualization
  - Connected network status and details
  - Auto-refresh every 30 seconds
  - Network security information

- **Network Information**
  - Detailed interface information
  - IP address and MAC address display
  - Network type and status
  - Connection quality indicators

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Express.js, TypeScript, Node.js
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Multiple CDN endpoints for accurate speed tests

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd frontend
   npm install
   ```
3. Configure environment variables:
   - Backend: Create `.env` file with port and host settings
   - Frontend: Set `NEXT_PUBLIC_API_URL` in `.env.local`

4. Start the development servers:
   ```bash
   # Backend
   cd backend
   npm run dev
   
   # Frontend
   cd frontend
   npm run dev
   ```

5. Access the application at `http://localhost:3000`

## 📝 Requirements

- Node.js 18+ 
- Windows OS (for WiFi functionality)
- Administrative privileges (for WiFi network scanning)

## 🔒 Security

- Rate limiting implemented
- CORS protection
- Security headers with Helmet
- Environment-based configuration
- Error handling and logging

## 📄 License

MIT License - feel free to use this project for your own purposes. 

![screencapture-localhost-3000-2025-05-22-13_21_23](https://github.com/user-attachments/assets/3158c0c9-ccf3-441c-9485-4f826ac6a32b)


