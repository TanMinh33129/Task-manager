const Tag = require('../models/Tag');

exports.getTags = async (req, res, next) => {
  try {
    const tags = await Tag.find({ user: req.user._id }).sort('name');
    res.json(tags);
  } catch (err) { next(err); }
};

exports.createTag = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const tag = await Tag.create({ name, color, user: req.user._id });
    res.status(201).json(tag);
  } catch (err) { next(err); }
};

exports.updateTag = async (req, res, next) => {
  try {
    const tag = await Tag.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body, { new: true }
    );
    if (!tag) return res.status(404).json({ message: 'Không tìm thấy tag' });
    res.json(tag);
  } catch (err) { next(err); }
};

exports.deleteTag = async (req, res, next) => {
  try {
    const tag = await Tag.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!tag) return res.status(404).json({ message: 'Không tìm thấy tag' });
    res.json({ message: 'Đã xóa tag' });
  } catch (err) { next(err); }
};