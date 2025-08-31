const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    console.log('Upload path:', uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Create the multer instance
const upload = multer({ storage });

// @route   POST /api/upload
// @desc    Upload a file
// @access  Private
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { filename, mimetype, size } = req.file;
    const url = `/uploads/${filename}`;

    res.json({
      name: filename,
      url,
      type: mimetype,
      size,
    });
  } catch (error) {
    console.error('Upload error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;