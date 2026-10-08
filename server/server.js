require('dotenv').config();
const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const connectDB = require('./config/db');
const socket = require('./utils/socket');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('Set a JWT_SECRET of at least 16 characters in .env');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim());

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '10kb' }));

socket.init(server, origins);

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Optional: serve the built React app from the same server (npm run build in /client)
const dist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api|socket\.io).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => server.listen(PORT, () => console.log(`Lab Scanner API running on port ${PORT}`)))
  .catch((err) => {
    console.error('Startup failed:', err.message);
    process.exit(1);
  });
