import express from 'express';
import { nanoid } from 'nanoid';
import { verifyToken } from '../middleware/auth.js';
import db from '../db.js';

const router = express.Router();

// Get reviews for a facility
router.get('/facility/:facilityId', (req, res) => {
  try {
    const reviews = db.prepare(`
      SELECT * FROM reviews
      WHERE facility_id = ?
      ORDER BY created_at DESC
    `).all(req.params.facilityId);
    
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add review
router.post('/', verifyToken, (req, res) => {
  const { facilityId, rating, content } = req.body;
  const reviewId = nanoid();
  
  try {
    db.prepare(`
      INSERT INTO reviews (id, facility_id, author_name, rating, content)
      VALUES (?, ?, ?, ?, ?)
    `).run(reviewId, facilityId, 'Anonymous', rating, content);
    
    const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId);
    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark review as helpful
router.post('/:id/helpful', (req, res) => {
  try {
    db.prepare(`
      UPDATE reviews
      SET helpful = helpful + 1
      WHERE id = ?
    `).run(req.params.id);
    
    res.json({ message: 'Review marked as helpful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;