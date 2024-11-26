import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { config } from '../config.js';
import { query } from '../db.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    console.log('Attempting login for email:', email);
    
    const users = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = users[0];
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password validation result:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register
router.post('/register', async (req, res) => {
  const { email, password, role = 'user' } = req.body;
  
  try {
    const existingUsers = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = nanoid();
    
    await query(
      'INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4)',
      [userId, email, hashedPassword, role]
    );
    
    const token = jwt.sign(
      { id: userId, role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    res.status(201).json({ 
      token,
      user: {
        id: userId,
        email,
        role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }
  
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const users = await query('SELECT id, email, role FROM users WHERE id = $1', [decoded.id]);
    const user = users[0];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (err) {
    console.error('Auth verification error:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;