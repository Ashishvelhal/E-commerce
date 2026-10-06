import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';

// Helper to check if Cloudinary is fully configured in .env
const isCloudinaryConfigured = (): boolean => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// @desc    Upload single or multiple files (images / 3D models)
// @route   POST /api/upload
// @access  Private/Admin
export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validate that we received files
    if (!req.file && (!req.files || (req.files as Express.Multer.File[]).length === 0)) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const useCloudinary = isCloudinaryConfigured();

    if (!useCloudinary) {
      console.warn('⚠️  Cloudinary environment credentials missing. Falling back to local disk storage.');
    } else {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key:    process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
    }

    // Helper to process a single file buffer (handles Cloudinary stream or local disk write)
    const processSingleFile = (file: Express.Multer.File): Promise<any> => {
      const is3D = /\.(glb|gltf|bin)$/i.test(file.originalname);
      const subfolder = is3D ? 'models' : 'images';

      if (useCloudinary) {
        return new Promise((resolve, reject) => {
          // Cloudinary requires raw format for 3D binary file formats like glb/gltf
          const resourceType = is3D ? 'raw' : 'image';
          
          // Generate unique name for public_id to prevent collision
          const cleanName = path.basename(file.originalname, path.extname(file.originalname))
            .replace(/[^a-zA-Z0-9]/g, '_');
          const uniquePublicId = `${cleanName}-${Date.now()}`;

          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `rasin_arts/${subfolder}`,
              resource_type: resourceType,
              public_id: uniquePublicId,
            },
            (error, result) => {
              if (error || !result) {
                return reject(error || new Error('Cloudinary upload stream failed'));
              }
              resolve({
                filename: result.public_id,
                originalName: file.originalname,
                size: result.bytes,
                is3D,
                url: result.secure_url,
              });
            }
          );

          uploadStream.end(file.buffer);
        });
      } else {
        // Fallback: Write the file buffer directly to the local uploads directory
        return new Promise((resolve, reject) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = path.extname(file.originalname);
          const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
          const finalFilename = `${baseName}-${uniqueSuffix}${ext}`;
          
          const targetDir = path.join(process.cwd(), 'uploads', subfolder);
          const targetPath = path.join(targetDir, finalFilename);

          fs.writeFile(targetPath, file.buffer, (err) => {
            if (err) {
              return reject(err);
            }
            resolve({
              filename: finalFilename,
              originalName: file.originalname,
              size: file.size,
              is3D,
              url: `/uploads/${subfolder}/${finalFilename}`,
            });
          });
        });
      }
    };

    // 2. Handle Single File Upload
    if (req.file) {
      const data = await processSingleFile(req.file);
      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data,
      });
      return;
    }

    // 3. Handle Multiple Files Upload
    if (req.files) {
      const uploadPromises = (req.files as Express.Multer.File[]).map(file => processSingleFile(file));
      const results = await Promise.all(uploadPromises);
      res.status(201).json({
        success: true,
        message: 'Files uploaded successfully',
        data: results,
      });
      return;
    }

  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
