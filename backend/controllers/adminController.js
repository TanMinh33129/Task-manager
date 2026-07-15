const User = require('../models/User');
const Task = require('../models/Task');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const taskCount = await Task.countDocuments({ user: user._id });
        const doneCount = await Task.countDocuments({ user: user._id, status: 'done' });
        return { ...user.toObject(), taskCount, doneCount };
      })
    );
    res.json(usersWithStats);
  } catch (err) { next(err); }
};

exports.getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find()
      .populate('user', 'name email role')
      .populate('tags', 'name color')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) { next(err); }
};

exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const done       = await Task.countDocuments({ status: 'done' });
    const overdue    = await Task.countDocuments({
      deadline: { $lt: new Date() },
      status: { $ne: 'done' },
    });
    res.json({ totalUsers, totalTasks, done, overdue });
  } catch (err) { next(err); }
};

exports.setUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, { role }, { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
    res.json(user);
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Không thể xóa chính mình' });
    }
    await User.findByIdAndDelete(req.params.id);
    await Task.deleteMany({ user: req.params.id });
    res.json({ message: 'Đã xóa user và toàn bộ task' });
  } catch (err) { next(err); }
};