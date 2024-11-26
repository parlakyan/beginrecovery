import express from 'express';
import { nanoid } from 'nanoid';
import { verifyToken } from '../middleware/auth.js';
import db from '../db.js';

const router = express.Router();

// Get all facilities
router.get('/', (req, res) => {
  try {
    const facilities = db.prepare(`
      SELECT f.*, 
        GROUP_CONCAT(DISTINCT i.url) as images,
        GROUP_CONCAT(DISTINCT a.name) as amenities,
        GROUP_CONCAT(DISTINCT t.name) as tags
      FROM facilities f
      LEFT JOIN images i ON f.id = i.facility_id
      LEFT JOIN facility_amenities fa ON f.id = fa.facility_id
      LEFT JOIN amenities a ON fa.amenity_id = a.id
      LEFT JOIN facility_tags ft ON f.id = ft.facility_id
      LEFT JOIN tags t ON ft.tag_id = t.id
      WHERE f.status = 'active'
      GROUP BY f.id
    `).all();

    const processedFacilities = facilities.map(f => ({
      ...f,
      images: f.images ? f.images.split(',') : [],
      amenities: f.amenities ? f.amenities.split(',') : [],
      tags: f.tags ? f.tags.split(',') : []
    }));

    res.json(processedFacilities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get facility by ID
router.get('/:id', (req, res) => {
  try {
    const facility = db.prepare(`
      SELECT f.*, 
        GROUP_CONCAT(DISTINCT i.url) as images,
        GROUP_CONCAT(DISTINCT a.name) as amenities,
        GROUP_CONCAT(DISTINCT t.name) as tags
      FROM facilities f
      LEFT JOIN images i ON f.id = i.facility_id
      LEFT JOIN facility_amenities fa ON f.id = fa.facility_id
      LEFT JOIN amenities a ON fa.amenity_id = a.id
      LEFT JOIN facility_tags ft ON f.id = ft.facility_id
      LEFT JOIN tags t ON ft.tag_id = t.id
      WHERE f.id = ?
      GROUP BY f.id
    `).get(req.params.id);

    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    const processedFacility = {
      ...facility,
      images: facility.images ? facility.images.split(',') : [],
      amenities: facility.amenities ? facility.amenities.split(',') : [],
      tags: facility.tags ? facility.tags.split(',') : []
    };

    res.json(processedFacility);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create facility (protected)
router.post('/', verifyToken, (req, res) => {
  const { name, description, location, phone, images, amenities, tags } = req.body;
  const facilityId = nanoid();

  try {
    const insertFacility = db.prepare(`
      INSERT INTO facilities (id, name, description, location, phone)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertImage = db.prepare(`
      INSERT INTO images (id, facility_id, url, order_index)
      VALUES (?, ?, ?, ?)
    `);

    const insertAmenity = db.prepare(`
      INSERT OR IGNORE INTO amenities (id, name)
      VALUES (?, ?)
    `);

    const insertFacilityAmenity = db.prepare(`
      INSERT INTO facility_amenities (facility_id, amenity_id)
      VALUES (?, ?)
    `);

    const insertTag = db.prepare(`
      INSERT OR IGNORE INTO tags (id, name)
      VALUES (?, ?)
    `);

    const insertFacilityTag = db.prepare(`
      INSERT INTO facility_tags (facility_id, tag_id)
      VALUES (?, ?)
    `);

    db.transaction(() => {
      insertFacility.run(facilityId, name, description, location, phone);

      images?.forEach((url, index) => {
        insertImage.run(nanoid(), facilityId, url, index);
      });

      amenities?.forEach(amenity => {
        const amenityId = nanoid();
        insertAmenity.run(amenityId, amenity);
        insertFacilityAmenity.run(facilityId, amenityId);
      });

      tags?.forEach(tag => {
        const tagId = nanoid();
        insertTag.run(tagId, tag);
        insertFacilityTag.run(facilityId, tagId);
      });
    })();

    res.status(201).json({ id: facilityId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;