const router = require('express').Router();
const { adminAuth, validateId } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiters');
const admin = require('../controllers/adminController');

router.post('/login', loginLimiter, admin.login);

// everything below requires a valid admin token
router.use(adminAuth);

router.get('/dashboard', admin.dashboard);
router.put('/password', admin.changePassword);

router.get('/students', admin.listStudents);
router.post('/students', admin.createStudent);
router.put('/students/:id', validateId, admin.updateStudent);
router.delete('/students/:id', validateId, admin.deleteStudent);

router.use('/systems', require('./systemRoutes'));
router.use('/sessions', require('./sessionRoutes'));
router.use('/suggestions', require('./suggestionRoutes'));

module.exports = router;
