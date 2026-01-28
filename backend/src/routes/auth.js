const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register/user', authController.registerUser);
router.post('/register/cleaner', authController.registerCleaner);
router.post('/login', authController.login);
router.get('/validate', authenticateToken, authController.validateToken);

module.exports = router;
