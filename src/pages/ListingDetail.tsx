import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Edit2, ShieldCheck, ShieldAlert, CheckCircle, XCircle, Clock, MapPin, Star } from 'lucide-react';
import { facilitiesService } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import { Facility } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageCarousel from '../components/ImageCarousel';
import ContactBox from '../components/ContactBox';
import ReviewsSection from '../components/ReviewsSection';
import MapSection from '../components/MapSection';
import StaffSection from '../components/StaffSection';
import CertificationsSection from '../components/CertificationsSection';
import Button from '../components/ui/Button';
import EditListingModal from '../components/EditListingModal';

// ... rest of the file stays the same ...
