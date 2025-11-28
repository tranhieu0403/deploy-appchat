// backend/routes/messageRoutes.js
import express from 'express';
import { upload, isCloudinaryConfigured } from '../config/multer.js';
import { Message } from '../models/messageModel.js';

const router = express.Router();

/**
 * POST /api/messages/upload
 * Upload file và tạo message với file đính kèm
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { username, room, text } = req.body;

    console.log('📤 Upload request:', { username, room, hasFile: !!req.file, text: text?.substring(0, 50) });

    if (!username || !room) {
      return res.status(400).json({ error: 'Username và room là bắt buộc' });
    }

    if (!req.file && !text) {
      return res.status(400).json({ error: 'Phải có ít nhất text hoặc file' });
    }

    // Tạo message object
    const messageData = {
      username,
      room,
      text: text || '',
      timestamp: new Date()
    };

    // Nếu có file, thêm thông tin file
    if (req.file) {
      let fileUrl;

      if (isCloudinaryConfigured && req.file.path) {
        // Cloudinary returns the URL in req.file.path
        fileUrl = req.file.path;
        console.log('☁️ Cloudinary URL:', fileUrl);
      } else {
        // Local storage
        fileUrl = `/uploads/${req.file.filename}`;
        console.log('💾 Local file URL:', fileUrl);
      }

      messageData.file = {
        filename: req.file.filename || req.file.public_id || 'file',
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      };
    }

    // Nếu có reply, thêm thông tin reply
    if (req.body.replyTo) {
      try {
        messageData.replyTo = JSON.parse(req.body.replyTo);
      } catch (e) {
        console.error('Error parsing replyTo:', e);
      }
    }

    // Nếu có mentions, thêm danh sách mentions
    if (req.body.mentions) {
      try {
        messageData.mentions = JSON.parse(req.body.mentions);
      } catch (e) {
        console.error('Error parsing mentions:', e);
      }
    }

    // Lưu vào database
    const newMessage = new Message(messageData);
    const savedMessage = await newMessage.save();

    console.log('✅ Message saved with file:', savedMessage.file?.url);

    res.status(201).json({
      success: true,
      message: savedMessage
    });

  } catch (error) {
    console.error('❌ Lỗi khi upload file:', error);
    res.status(500).json({ error: 'Không thể upload file', details: error.message });
  }
});

export default router;
