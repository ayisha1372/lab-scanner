const router = require('express').Router();
const { validateId } = require('../middleware/authMiddleware');
const c = require('../controllers/suggestionController');

router.get('/', c.list);
router.put('/:id', validateId, c.update);
router.delete('/:id', validateId, c.remove);

module.exports = router;
