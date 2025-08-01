import App from './app';

const app = new App();

// For Vercel serverless deployment
export default app.app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen();
}
