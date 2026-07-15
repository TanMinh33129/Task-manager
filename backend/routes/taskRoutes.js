const router = require('express').Router();
const { getTasks, createTask, updateTask, deleteTask, updateTaskOrder } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getTasks).post(createTask);
router.route('/:id').put(updateTask).delete(deleteTask);
router.put('/batch/order', updateTaskOrder);

module.exports = router;