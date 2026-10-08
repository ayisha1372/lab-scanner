const router = require('express').Router();
const { validateId } = require('../middleware/authMiddleware');
const c = require('../controllers/sessionController');

router.get('/', c.listSessions);
router.post('/:id/force-logout', validateId, c.forceLogout);

module.exports = router;
