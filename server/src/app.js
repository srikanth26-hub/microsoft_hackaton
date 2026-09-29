require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const { seedDatabase } = require('./seed');

const incidentRoutes = require('./routes/incidentRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const demoRoutes = require('./routes/demoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'RecallOps API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/incidents', incidentRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/demo', demoRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[RecallOps Server Error]:', err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Server Initialization
async function startServer() {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 RecallOps Backend API running on http://localhost:${PORT}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start RecallOps server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
