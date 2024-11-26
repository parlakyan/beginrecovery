import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const sampleFacilities = [
  {
    name: "Serenity Recovery Center",
    description: "A peaceful sanctuary for healing and recovery, offering comprehensive treatment programs in a supportive environment.",
    location: "Los Angeles, CA",
    phone: "(555) 123-4567",
    images: [
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1564540574859-0dfb63985953?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1629196914168-3a2652305f4f?auto=format&fit=crop&q=80"
    ],
    amenities: ["Private Rooms", "Pool & Spa", "Fitness Center", "Meditation Garden"],
    tags: ["Alcohol Rehab", "Drug Treatment", "Dual Diagnosis"],
    status: "active",
    rating: 4.8,
    reviewCount: 124
  },
  {
    name: "New Horizons Wellness",
    description: "Leading-edge treatment facility combining evidence-based therapies with holistic healing approaches.",
    location: "Malibu, CA",
    phone: "(555) 987-6543",
    images: [
      "https://images.unsplash.com/photo-1564540574859-0dfb63985953?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1629196914168-3a2652305f4f?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80"
    ],
    amenities: ["Luxury Accommodations", "Gourmet Dining", "Ocean View", "Art Therapy Studio"],
    tags: ["Executive Rehab", "Mental Health", "Trauma Treatment"],
    status: "active",
    rating: 4.9,
    reviewCount: 89
  }
];

export async function seedDatabase() {
  try {
    // Check if facilities already exist
    const facilitiesRef = collection(db, 'facilities');
    const q = query(facilitiesRef, where('status', '==', 'active'));
    const snapshot = await getDocs(q);
    
    if (snapshot.size > 0) {
      console.log('Database already has facilities');
      return;
    }

    console.log('Seeding database with sample facilities...');

    // Add sample facilities
    for (const facility of sampleFacilities) {
      await addDoc(facilitiesRef, {
        ...facility,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}