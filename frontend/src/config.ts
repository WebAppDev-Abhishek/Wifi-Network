interface Config {
  apiUrl: string;
  environment: string;
}

const config: Config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  environment: process.env.NODE_ENV || 'development'
};

export default config; 