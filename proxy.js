const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Proxy all requests to Vite dev server
app.use('/', createProxyMiddleware({
  target: 'http://localhost:8080',
  changeOrigin: true,
  ws: true, // proxy websockets
  logLevel: 'silent'
}));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}, forwarding to Vite on 8080`);
});