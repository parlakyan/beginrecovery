import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { app } from '../../scripts/firebase-admin.js';

const FACILITIES_COLLECTION = 'facilities';
const USERS_COLLECTION = 'users';

const ADMIN_EMAIL = 'admin@beginrecovery.com';
const ADMIN_PASSWORD = 'password123';

const testFacilities = [
  {
    name: 'Bliss Recovery',
    description: 'A peaceful recovery center focused on holistic healing.',
    location: 'California',
    amenities: ['Pool', 'Gym', 'Meditation Room'],
    images: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791'
    ],
    phone: '(555) 123-4567',
    tags: ['Holistic', 'Peaceful', 'Luxury'],
    rating: 4.8,
    reviewCount: 24,
    moderationStatus: 'approved',
    isVerified: true
  },
  {
    name: 'Simonds Recovery Center',
    description: 'Professional rehabilitation center with experienced staff.',
    location: 'California',
    amenities: ['Medical Staff', 'Private Rooms', 'Group Therapy'],
    images: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791'
    ],
    phone: '(555) 987-6543',
    tags: ['Professional', 'Medical', 'Experienced'],
    rating: 4.9,
    reviewCount: 32,
    moderationStatus: 'approved',
    isVerified: true
  },
  {
    name: 'Test Pending Facility',
    description: 'A facility waiting for approval.',
    location: 'California',
    amenities: ['Test Amenity'],
    images: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d'],
    phone: '(555) 111-2222',
    tags: ['Test'],
    rating: 0,
    reviewCount: 0,
    moderationStatus: 'pending',
    isVerified: false
  },
  {
    name: 'Test Archived Facility',
    description: 'An archived facility.',
    location: 'California',
    amenities: ['Test Amenity'],
    images: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d'],
    phone: '(555) 333-4444',
    tags: ['Test'],
    rating: 0,
    reviewCount: 0,
    moderationStatus: 'archived',
    isVerified: false
  }
];

export const seedDatabase = async () => {
  try {
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Create or update admin user in Firebase Auth
    console.log('Creating admin user in Firebase Auth...');
    let adminUser;
    try {
      adminUser = await auth.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        emailVerified: true
      });
      console.log('Created admin user in Firebase Auth');
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        console.log('Admin user already exists in Firebase Auth');
        adminUser = await auth.getUserByEmail(ADMIN_EMAIL);
      } else {
        throw error;
      }
    }

    // Set custom claims for admin role
    await auth.setCustomUserClaims(adminUser.uid, { role: 'admin' });
    console.log('Set admin role in custom claims');

    // Create admin user document in Firestore
    console.log('Creating admin user document in Firestore...');
    const userRef = db.collection(USERS_COLLECTION).doc(adminUser.uid);
    await userRef.set({
      email: ADMIN_EMAIL,
      role: 'admin',
      createdAt: Timestamp.now()
    }, { merge: true });
    console.log('Created admin user document in Firestore');

    // Add test facilities
    console.log('Starting database seeding...');
    const facilitiesRef = db.collection(FACILITIES_COLLECTION);

    for (const facility of testFacilities) {
      const docRef = await facilitiesRef.add({
        ...facility,
        ownerId: adminUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('Added facility with ID:', docRef.id);
    }

    console.log('Database seeding completed successfully');
    console.log('\nAdmin credentials:');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};
