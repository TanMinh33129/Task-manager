require('dotenv').config();
const mongoose = require('mongoose');

console.log('URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 15000,
})
.then(() => { console.log('KẾT NỐI THÀNH CÔNG!'); process.exit(0); })
.catch(err => { console.error('LỖI:', err.message); process.exit(1); });