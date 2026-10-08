const router = require('express').Router();
const { validateId } = require('../middleware/authMiddleware');
const c = require('../controllers/systemController');

router.get('/', c.list);
router.post('/', c.create);
router.put('/:id', validateId, c.update);
router.delete('/:id', validateId, c.remove);

module.exports = router;
