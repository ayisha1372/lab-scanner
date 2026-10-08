const router = require('express').Router();
const { studentAuth } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiters');
const student = require('../controllers/studentController');
const systems = require('../controllers/systemController');
const sessions = require('../controllers/sessionController');
const suggestions = require('../controllers/suggestionController');

router.post('/login', loginLimiter, student.login);
router.get('/available-systems', studentAuth, systems.listForStudents);
router.post('/assign-system', studentAuth, sessions.assignSystem);
router.get('/session', studentAuth, sessions.getMySession);
router.post('/logout', studentAuth, sessions.studentLogout);
router.post('/suggestions', loginLimiter, suggestions.create);

module.exports = router;
