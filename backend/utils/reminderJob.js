const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Task = require('../models/Task');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendReminderEmails = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);
  const now = new Date();

  const tasks = await Task.find({
    deadline: { $gte: now, $lte: tomorrow },
    status: { $ne: 'done' },
    reminderSent: false,
  }).populate('user', 'name email');

  for (const task of tasks) {
    await transporter.sendMail({
      from: `"Task Manager" <${process.env.EMAIL_USER}>`,
      to: task.user.email,
      subject: `Nhắc nhở: "${task.title}" sắp đến hạn!`,
      html: `<p>Xin chào <b>${task.user.name}</b>,</p>
             <p>Task <b>"${task.title}"</b> sẽ hết hạn vào <b>${task.deadline.toLocaleDateString('vi-VN')}</b>.</p>`,
    });
    task.reminderSent = true;
    await task.save();
  }
  console.log(`Đã gửi ${tasks.length} reminder email`);
};

const startReminderJob = () => {
  cron.schedule('0 8 * * *', sendReminderEmails);
  console.log('Reminder job đã khởi động ');
};

module.exports = startReminderJob;