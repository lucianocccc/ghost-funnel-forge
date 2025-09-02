import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// AI Routes
app.use('/api/ai', require('./routes/ai'));
app.use('/api/funnels', require('./routes/funnels'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/chatbot', require('./routes/chatbot'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});