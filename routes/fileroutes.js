const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname;
    const safeFilename = `${timestamp}-${originalName}`;
    cb(null, safeFilename);
  }
});


const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|pdf|txt/;
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image, PDF, or text files are allowed.'));
  }
};


const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: fileFilter
});


router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a file.' });
  }

  res.status(200).json({
    message: 'Upload successful!',
    file: req.file.filename
  });
});


router.get('/files/:filename', (req, res) => {
  const requestedFile = path.basename(req.params.filename);
  const fileLocation = path.join(__dirname, '../uploads', requestedFile);

  
  if (!fs.existsSync(fileLocation)) {
    return res.status(404).json({ error: 'File not found.' });
  }

  res.download(fileLocation, requestedFile);
});


router.get('/', (req, res) => {
  res.send(`
    <h2>Upload a File</h2>
    <form action="/upload" method="POST" enctype="multipart/form-data">
      <input type="file" name="file" required />
      <button type="submit">Upload</button>
    </form>
  `);
});

module.exports = router;
