const Task = require('../models/Task');

exports.getTasks = async (req, res, next) => {
  try {
    const {
      status, priority, tag, search,
      category, sortBy = 'createdAt', order = 'desc',
    } = req.query;

    const filter = { user: req.user._id };
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (tag)      filter.tags     = tag;
    if (category) filter.category = category;
    if (search)   filter.title    = { $regex: search, $options: 'i' };

    const tasks = await Task.find(filter)
      .populate('tags',     'name color')
      .populate('category', 'name icon color')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 });

    res.json(tasks);
  } catch (err) { next(err); }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, deadline, tags, category } = req.body;
    const task = await Task.create({
      title, description, status, priority, deadline,
      tags:     tags     || [],
      category: category || null,
      user:     req.user._id,
    });
    await task.populate('tags',     'name color');
    await task.populate('category', 'name icon color');
    res.status(201).json(task);
  } catch (err) { next(err); }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });

    Object.assign(task, req.body);
    await task.save();
    await task.populate('tags',     'name color');
    await task.populate('category', 'name icon color');
    res.json(task);
  } catch (err) { next(err); }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id, user: req.user._id,
    });
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });
    res.json({ message: 'Đã xóa task' });
  } catch (err) { next(err); }
};

exports.updateTaskOrder = async (req, res, next) => {
  try {
    const { tasks } = req.body;
    await Promise.all(
      tasks.map(({ id, status, order }) =>
        Task.findOneAndUpdate(
          { _id: id, user: req.user._id },
          { status, order }
        )
      )
    );
    res.json({ message: 'Cập nhật thứ tự thành công' });
  } catch (err) { next(err); }
};