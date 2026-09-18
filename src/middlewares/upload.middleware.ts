import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string = 'venraz'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If Cloudinary env vars are missing in development, fallback or error gracefully
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.warn('⚠️ Cloudinary keys not configured, returning mock avatar URL');
      return resolve('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde');
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (result && result.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Failed to get secure_url from Cloudinary'));
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};
