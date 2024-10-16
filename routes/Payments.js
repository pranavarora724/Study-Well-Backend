
const express = require('express');
const router = express.Router();

const {capturePayment , verifySignature , getApiKey} = require('../controllers/Patments')

// We need middlewares too
const{isValid , isStudent} = require('../middlewares/auth');

router.post('/capturePayment' ,  isValid  , isStudent ,capturePayment);
router.post('/verifySignature' ,  isValid  , isStudent ,verifySignature);
router.get('/getApiKey' , isValid , isStudent , getApiKey);

module.exports = router;