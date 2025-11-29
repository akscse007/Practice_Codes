const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/fineController');

router.get('/', ctrl.listFines);
router.patch('/:id/confirm', ctrl.confirmPayment);

module.exports = router;
