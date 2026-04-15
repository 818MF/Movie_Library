const path = require('path');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./services/user/routes');
const movieRoutes = require('./services/movie/routes');

const app = express();

app.use(cors());
app.use(express.json());

// Racine : /styles.css, /app.js (OK en local et sur Vercel où `public/` est servi à /)
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
// Compat anciens liens /public/...
app.use('/public', express.static(publicDir));

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

app.use((req, res) => {
  res.status(404).json({
    message: 'Not found',
    method: req.method,
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

module.exports = app;
