const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const {
  getAllUsers, getAllTasks, getStats, setUserRole, deleteUser
} = require('../controllers/adminController');

router.use(protect, isAdmin);

router.get('/stats',         getStats);
router.get('/users',         getAllUsers);
router.get('/tasks',         getAllTasks);
router.put('/users/:id/role', setUserRole);
router.delete('/users/:id',   deleteUser);

module.exports = router;