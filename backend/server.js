require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const connectDB  = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const startReminderJob = require('./utils/reminderJob');

const app = express();

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/tasks',      require('./routes/taskRoutes'));
app.use('/api/tags',       require('./routes/tagRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/admin',      require('./routes/adminRoutes'));

app.get('/api/health', (_, res) => res.json({ status: 'OK' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
  startReminderJob();
});