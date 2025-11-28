// backend/config/multer.js
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Check if Cloudinary is configured
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
                               process.env.CLOUDINARY_API_KEY &&
                               process.env.CLOUDINARY_API_SECRET;

let storage;

if (isCloudinaryConfigured) {
  // Use Cloudinary storage for production
  console.log('📁 Using Cloudinary storage');
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      let resourceType = 'auto';
      let folder = 'chat-uploads';
      let format = undefined;

      // Get file extension
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;

      // Determine resource type based on mimetype
      if (file.mimetype.startsWith('image/')) {
        resourceType = 'image';
        folder = 'chat-uploads/images';
        format = ext || 'jpg';
      } else if (file.mimetype.startsWith('audio/')) {
        resourceType = 'video'; // Cloudinary uses 'video' for audio
        folder = 'chat-uploads/audio';
        format = ext || 'webm';
      } else {
        // For raw files (PDF, docx, etc.), include extension in public_id
        resourceType = 'raw';
        folder = 'chat-uploads/files';
        // For raw files, we need to include extension in the public_id
        return {
          folder: folder,
          resource_type: resourceType,
          public_id: `${uniqueId}.${ext}`,
          format: ext,
        };
      }

      return {
        folder: folder,
        resource_type: resourceType,
        public_id: uniqueId,
        format: format,
      };
    },
  });
} else {
  // Fallback to local storage for development
  console.log('📁 Using local disk storage (Cloudinary not configured)');
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const nameWithoutExt = path.basename(file.originalname, ext);
      cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
    }
  });
}

// File filter - chỉ cho phép hình ảnh, audio và một số file phổ biến
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    // Audio files
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    'audio/mp4'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Loại file không được hỗ trợ. Chỉ chấp nhận hình ảnh, audio, PDF, Word, và text files.'), false);
  }
};

// Cấu hình multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Giới hạn 10MB
  }
});

export { isCloudinaryConfigured };
