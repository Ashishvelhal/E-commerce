import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure local uploads directory exists (in case of local fallback)
const uploadDir = path.join(process.cwd(), 'uploads');
const modelsDir = path.join(uploadDir, 'models');
const imagesDir = path.join(uploadDir, 'images');

[uploadDir, modelsDir, imagesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// File filter to restrict file extensions
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = /\.(jpeg|jpg|png|webp|gif|svg|glb|gltf|bin)$/i;
  if (file.originalname.match(allowedExtensions)) {
    cb(null, true);
  } else {
    cb(new Error('Only images (jpg, png, webp, svg) and 3D models (.glb, .gltf) are allowed!'));
  }
};

// Use memoryStorage so we always have access to the file buffer in the controller
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max limit for high quality 3D models
  },
  fileFilter,
});
