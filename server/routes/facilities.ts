import { Router } from 'express';
import { verifyToken } from '../middleware/auth';
import prisma from '../db';

const router = Router();

// Get all facilities
router.get('/', async (req, res) => {
  try {
    const facilities = await prisma.facility.findMany({
      where: { status: 'active' },
      include: {
        images: true,
        amenities: true,
        tags: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Calculate average rating
    const facilitiesWithRating = facilities.map(facility => ({
      ...facility,
      rating: facility.reviews.length > 0
        ? facility.reviews.reduce((acc, rev) => acc + rev.rating, 0) / facility.reviews.length
        : 0,
      reviewCount: facility.reviews.length,
    }));

    res.json(facilitiesWithRating);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch facilities' });
  }
});

// Search facilities
router.get('/search', async (req, res) => {
  const { query, treatmentTypes, amenities, insurance, rating, priceRange } = req.query;

  try {
    const facilities = await prisma.facility.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query as string, mode: 'insensitive' } },
              { location: { contains: query as string, mode: 'insensitive' } },
              { tags: { some: { name: { contains: query as string, mode: 'insensitive' } } } },
            ],
          },
          treatmentTypes ? {
            tags: { some: { name: { in: treatmentTypes as string[] } } },
          } : {},
          amenities ? {
            amenities: { some: { name: { in: amenities as string[] } } },
          } : {},
          rating ? {
            rating: { gte: parseFloat(rating as string) },
          } : {},
        ],
        status: 'active',
      },
      include: {
        images: true,
        amenities: true,
        tags: true,
        reviews: true,
      },
    });

    res.json(facilities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search facilities' });
  }
});

// Get facility by ID
router.get('/:id', async (req, res) => {
  try {
    const facility = await prisma.facility.findUnique({
      where: { id: req.params.id },
      include: {
        images: true,
        amenities: true,
        tags: true,
        reviews: true,
      },
    });

    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    res.json(facility);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch facility' });
  }
});

// Create facility (protected)
router.post('/', verifyToken, async (req, res) => {
  const { name, description, location, phone, images, amenities, tags } = req.body;

  try {
    const facility = await prisma.facility.create({
      data: {
        name,
        description,
        location,
        phone,
        images: {
          create: images.map((url: string, index: number) => ({
            url,
            orderIndex: index,
          })),
        },
        amenities: {
          connectOrCreate: amenities.map((name: string) => ({
            where: { name },
            create: { name },
          })),
        },
        tags: {
          connectOrCreate: tags.map((name: string) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    });

    res.status(201).json(facility);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create facility' });
  }
});

export default router;