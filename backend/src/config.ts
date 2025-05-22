interface Config {
  port: number;
  host: string;
  nodeEnv: string;
  frontendUrl: string;
  corsOrigin: string;
}

const config: Config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
};

export default config; 