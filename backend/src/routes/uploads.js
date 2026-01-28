const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const storageService = require('../services/storageService');

// Configure multer
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('application/pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens e PDFs são permitidos'));
    }
  }
});

// Upload profile photo
router.post('/photo/profile', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const result = await storageService.uploadPhoto(req.file, 'profiles');

    res.json({
      success: true,
      url: result.url,
      key: result.key
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ error: 'Erro ao fazer upload' });
  }
});

// Upload document
router.post('/document', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const result = await storageService.uploadDocument(req.file, req.user.id);

    res.json({
      success: true,
      url: result.url,
      key: result.key
    });
  } catch (error) {
    console.error('Erro ao fazer upload de documento:', error);
    res.status(500).json({ error: 'Erro ao fazer upload' });
  }
});

module.exports = router;
