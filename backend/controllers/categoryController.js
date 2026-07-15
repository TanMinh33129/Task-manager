const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  { name: 'Công việc', icon: '💼', color: '#6366f1' },
  { name: 'Học tập',   icon: '📚', color: '#3b82f6' },
  { name: 'Cá nhân',   icon: '👤', color: '#10b981' },
  { name: 'Sức khỏe',  icon: '❤️', color: '#ef4444' },
];

exports.getCategories = async (req, res, next) => {
  try {
    let categories = await Category.find({ user: req.user._id }).sort('createdAt');
    if (categories.length === 0) {
      categories = await Category.insertMany(
        DEFAULT_CATEGORIES.map(c => ({ ...c, user: req.user._id }))
      );
    }
    res.json(categories);
  } catch (err) { next(err); }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;
    const category = await Category.create({
      name, icon, color, user: req.user._id,
    });
    res.status(201).json(category);
  } catch (err) { next(err); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json(category);
  } catch (err) { next(err); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id, user: req.user._id,
    });
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json({ message: 'Đã xóa danh mục' });
  } catch (err) { next(err); }
};