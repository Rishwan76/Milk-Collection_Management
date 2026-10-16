const express = require('express');
const c = require('../controllers/milkController');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.route('/').post(c.createEntry).get(c.getEntries);
router.route('/:id').get(validateObjectId, c.getEntry).put(validateObjectId, c.updateEntry).delete(validateObjectId, c.deleteEntry);

module.exports = router;
