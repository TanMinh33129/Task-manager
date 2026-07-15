const router = require('express').Router();
const { getTags, createTag, updateTag, deleteTag } = require('../controllers/tagController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getTags).post(createTag);
router.route('/:id').put(updateTag).delete(deleteTag);

module.exports = router;