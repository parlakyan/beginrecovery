import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FacilityClaim, ClaimStatus, ClaimFormData, ClaimStats } from '../types';
import { domainsMatch, isValidEmail, isValidWebsite } from '../utils/validation';

const CLAIMS_COLLECTION = 'claims';

/**
 * Claims service for managing facility ownership claims
 */
export const claimsService = {
  /**
   * Create a new claim for a facility
   */
  async createClaim(facilityId: string, userId: string, data: ClaimFormData): Promise<FacilityClaim> {
    // Validate input data
    if (!isValidEmail(data.email)) {
      throw new Error('Invalid email address');
    }
    if (!isValidWebsite(data.website)) {
      throw new Error('Invalid website URL');
    }

    // Check if user already has a pending claim for this facility
    const existingClaims = await getDocs(
      query(
        collection(db, CLAIMS_COLLECTION),
        where('facilityId', '==', facilityId),
        where('userId', '==', userId),
        where('status', '==', 'pending')
      )
    );

    if (!existingClaims.empty) {
      throw new Error('You already have a pending claim for this facility');
    }

    // Check if facility is already claimed
    const facilityDoc = await getDoc(doc(db, 'facilities', facilityId));
    if (!facilityDoc.exists()) {
      throw new Error('Facility not found');
    }

    const facility = facilityDoc.data();
    if (facility.claimStatus === 'claimed') {
      throw new Error('This facility has already been claimed');
    }

    // Check if email domain matches website domain
    const emailMatchesDomain = domainsMatch(data.email, data.website);

    // Create the claim
    const claim: Omit<FacilityClaim, 'id'> = {
      facilityId,
      userId,
      status: emailMatchesDomain ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: data.name,
      position: data.position,
      website: data.website,
      email: data.email,
      phone: data.phone,
      emailVerified: false,
      emailMatchesDomain
    };

    // Add to database
    const claimRef = await addDoc(collection(db, CLAIMS_COLLECTION), claim);

    // If email matches domain, auto-approve and update facility
    if (emailMatchesDomain) {
      await updateDoc(doc(db, 'facilities', facilityId), {
        claimStatus: 'claimed',
        ownerId: userId,
        activeClaimId: claimRef.id
      });
    }

    return {
      id: claimRef.id,
      ...claim
    };
  },

  /**
   * Get all claims for admin review
   */
  async getClaims(status?: ClaimStatus): Promise<FacilityClaim[]> {
    let q = query(collection(db, CLAIMS_COLLECTION), orderBy('createdAt', 'desc'));
    
    if (status) {
      q = query(q, where('status', '==', status));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FacilityClaim));
  },

  /**
   * Get claims for a specific facility
   */
  async getFacilityClaims(facilityId: string): Promise<FacilityClaim[]> {
    const snapshot = await getDocs(
      query(
        collection(db, CLAIMS_COLLECTION),
        where('facilityId', '==', facilityId),
        orderBy('createdAt', 'desc')
      )
    );

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FacilityClaim));
  },

  /**
   * Get claims stats for admin dashboard
   */
  async getClaimStats(): Promise<ClaimStats> {
    const snapshot = await getDocs(collection(db, CLAIMS_COLLECTION));
    const claims = snapshot.docs.map(doc => doc.data());

    return {
      totalClaims: claims.length,
      pendingClaims: claims.filter(c => c.status === 'pending').length,
      approvedClaims: claims.filter(c => c.status === 'approved').length,
      rejectedClaims: claims.filter(c => c.status === 'rejected').length,
      disputedClaims: claims.filter(c => c.status === 'disputed').length,
      autoApproved: claims.filter(c => c.status === 'approved' && c.emailMatchesDomain).length,
      manuallyApproved: claims.filter(c => c.status === 'approved' && !c.emailMatchesDomain).length
    };
  },

  /**
   * Update claim status (admin only)
   */
  async updateClaimStatus(
    claimId: string,
    status: ClaimStatus,
    adminId: string,
    notes?: string
  ): Promise<void> {
    const claimRef = doc(db, CLAIMS_COLLECTION, claimId);
    const claim = await getDoc(claimRef);

    if (!claim.exists()) {
      throw new Error('Claim not found');
    }

    const data = claim.data();
    
    // Update claim
    await updateDoc(claimRef, {
      status,
      adminNotes: notes,
      reviewedBy: adminId,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // If approving claim, update facility ownership
    if (status === 'approved') {
      await updateDoc(doc(db, 'facilities', data.facilityId), {
        claimStatus: 'claimed',
        ownerId: data.userId,
        activeClaimId: claimId
      });
    }
  },

  /**
   * Dispute a claim
   */
  async disputeClaim(
    claimId: string,
    disputedBy: string,
    reason: string
  ): Promise<void> {
    const claimRef = doc(db, CLAIMS_COLLECTION, claimId);
    const claim = await getDoc(claimRef);

    if (!claim.exists()) {
      throw new Error('Claim not found');
    }

    await updateDoc(claimRef, {
      status: 'disputed',
      disputedBy,
      disputeReason: reason,
      updatedAt: new Date().toISOString()
    });

    // Update facility status
    await updateDoc(doc(db, 'facilities', claim.data().facilityId), {
      claimStatus: 'disputed'
    });
  },

  /**
   * Resolve a dispute (admin only)
   */
  async resolveDispute(
    claimId: string,
    adminId: string,
    resolution: 'approved' | 'rejected',
    notes?: string
  ): Promise<void> {
    const claimRef = doc(db, CLAIMS_COLLECTION, claimId);
    const claim = await getDoc(claimRef);

    if (!claim.exists()) {
      throw new Error('Claim not found');
    }

    const data = claim.data();

    await updateDoc(claimRef, {
      status: resolution,
      adminNotes: notes,
      disputeResolvedBy: adminId,
      disputeResolvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Update facility status based on resolution
    await updateDoc(doc(db, 'facilities', data.facilityId), {
      claimStatus: resolution === 'approved' ? 'claimed' : 'unclaimed',
      ownerId: resolution === 'approved' ? data.userId : null,
      activeClaimId: resolution === 'approved' ? claimId : null
    });
  }
};
