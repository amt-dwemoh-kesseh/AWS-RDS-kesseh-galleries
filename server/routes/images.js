// server/routes/images.js
import express from 'express';
import multer from 'multer';
import prisma from '../lib/prisma.js';
import { uploadToS3, deleteFromS3 } from '../utils/s3.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload an image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    console.log('reached here');
    const { description = '' } = req.body;
    const s3Data = await uploadToS3(req.file);

    const image = await prisma.image.create({
      data: {
        url: s3Data.url,
        description
      }
    });

    res.status(201).json(image);
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// Get paginated images
router.get('/images', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;

  try {
    const totalCount = await prisma.image.count();
    const images = await prisma.image.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      images,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      hasMore: page * limit < totalCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve images' });
  }
});

// Delete image
router.delete('/images/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const image = await prisma.image.findUnique({ where: { id: parseInt(id) } });
    if (!image) return res.status(404).json({ error: 'Image not found' });

    await deleteFromS3(image.url);
    await prisma.image.delete({ where: { id: image.id } });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Update description
router.put('/images/:id/description', async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;

  try {
    const updated = await prisma.image.update({
      where: { id: parseInt(id) },
      data: { description }
    });

    res.json({ success: true, image: updated });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

export default router;
