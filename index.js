require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const { connectRabbitMQ } = require('./config/rabbitmq');
const { getMongoUri } = require('./config/mongoUri');

const ENABLE_MONGODB = process.env.ENABLE_MONGODB !== 'false';
const ENABLE_RABBITMQ = process.env.ENABLE_RABBITMQ === 'true';
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  if (ENABLE_MONGODB) {
    const uri = getMongoUri();
    if (!uri) {
      console.error('MongoDB: définissez MONGODB_URI ou MONGO_URI dans .env');
      process.exit(1);
    }
    try {
      await mongoose.connect(uri);
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('MongoDB connection error:', err.message);
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
