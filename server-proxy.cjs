const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const http = require('http');

const app = express();
const PORT = 5000;
const VITE_PORT = 8080;

// Wait for Vite to be ready before starting proxy
const waitForVite = async () => {
  return new Promise((resolve) => {
    const checkVite = () => {
      const req = http.get(`http://localhost:${VITE_PORT}`, (res) => {
        console.log(`✅ Vite server is ready on port ${VITE_PORT}`);
        resolve();
      });
      
      req.on('error', () => {
        console.log(`⏳ Waiting for Vite server on port ${VITE_PORT}...`);
        setTimeout(checkVite, 1000);
      });
      
      req.setTimeout(1000, () => {
        req.destroy();
        setTimeout(checkVite, 1000);
      });
    };
    
    checkVite();
  });
};

const startProxy = async () => {
  await waitForVite();
  
  // Proxy configuration
  const proxy = createProxyMiddleware({
    target: `http://localhost:${VITE_PORT}`,
    changeOrigin: true,
    ws: true, // proxy websockets for HMR
    logLevel: 'silent',
    onError: (err, req, res) => {
      console.error('Proxy error:', err.message);
      if (!res.headersSent) {
        res.status(500).send('Proxy error');
      }
    }
  });

  app.use('/', proxy);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Proxy server running on port ${PORT}`);
    console.log(`📡 Forwarding requests to Vite server on port ${VITE_PORT}`);
    console.log(`🌐 Application available at http://localhost:${PORT}`);
  });
};

startProxy().catch(console.error);