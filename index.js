require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./services/user/routes');
const movieRoutes = require('./services/movie/routes');
const { connectRabbitMQ } = require('./config/rabbitmq');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'favorite-movies-api',
    time: new Date().toISOString()
  });
});

app.get('/api-info', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-info.html'));
});

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404
app.use((req, res) => {
  res.status(404).json({
    message: 'Not found',
    method: req.method,
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// MongoDB + listen
const ENABLE_MONGODB = process.env.ENABLE_MONGODB !== 'false';
const ENABLE_RABBITMQ = process.env.ENABLE_RABBITMQ === 'true';
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  if (ENABLE_MONGODB) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('MongoDB connection error:', err.message);
      console.error('Vérifiez que le service MongoDB tourne (port 27017).');
      process.exit(1);
    }
  } else {
    console.log('MongoDB disabled (ENABLE_MONGODB=false)');
  }

  if (ENABLE_RABBITMQ) {
    try {
      await connectRabbitMQ();
      console.log('Connected to RabbitMQ');
    } catch (err) {
      console.error('RabbitMQ connection error:', err.message);
    }
  } else {
    console.log('RabbitMQ disabled (ENABLE_RABBITMQ=false)');
  }

  app.listen(PORT, HOST, () => {
    const browseHost = HOST === '0.0.0.0' ? '127.0.0.1' : HOST;
    console.log(`Server is running on http://${HOST}:${PORT}`);
    console.log(`App: http://${browseHost}:${PORT}/  |  health: http://${browseHost}:${PORT}/health  |  api-info: http://${browseHost}:${PORT}/api-info`);
  });
}

start();