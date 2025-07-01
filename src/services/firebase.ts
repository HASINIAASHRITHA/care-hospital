import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { db, COLLECTIONS, auth } from '@/config/firebase';
import { uploadToCloudinary } from '@/lib/cloudinary';
// Types
export interface PatientData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  age?: number;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  createdAt: any;
  updatedAt: any;
  status: 'active' | 'inactive';
  userId?: string;
}

export interface AppointmentData {
  id?: string;
  patientName: string;
  email: string;
  phone: string;
  department: string;
  doctor: string;
  date: string;
  time: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: any;
  updatedAt: any;
  userId?: string;
  whatsappSent?: boolean;
  lastCommunication?: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: any;
}

export interface AdminLog {
  id?: string;
  adminId: string;
  action: string;
  targetCollection: string;
  targetId: string;
  details: string;
  timestamp: any;
}

export interface Doctor {
  id?: string;
  name: string;
  specialty: string;
  experience: string;
  education: string;
  location: string;
  bio: string;
  rating?: number;
  availableToday: boolean;
  image?: string;
  specializations?: string[];
  schedule?: Record<string, {start: string; end: string}>;
  blockedDates?: string[];
  createdAt?: any;
  updatedAt?: any;
}

// Authentication functions
export const signInAdmin = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    // In a real app, you'd check custom claims for admin role here
    return result.user;
  } catch (error) {
    console.error('Admin sign in error:', error);
    throw error;
  }
};

export const signOutAdmin = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Patient/User functions (write-once, read-only)
export const submitAppointment = async (appointmentData: Omit<AppointmentData, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.APPOINTMENTS), {
      ...appointmentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'pending'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error submitting appointment:', error);
    throw error;
  }
};

export const submitContactMessage = async (messageData: Omit<ContactMessage, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.CONTACT_MESSAGES), {
      ...messageData,
      createdAt: serverTimestamp(),
      status: 'new'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error submitting contact message:', error);
    throw error;
  }
};

export const registerPatient = async (patientData: Omit<PatientData, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
      ...patientData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error registering patient:', error);
    throw error;
  }
};

// Admin functions (full CRUD access)
export const getAllAppointments = async () => {
  try {
    const q = query(collection(db, COLLECTIONS.APPOINTMENTS), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting appointments:', error);
    throw error;
  }
};

export const getAllPatients = async () => {
  try {
    const q = query(collection(db, COLLECTIONS.USERS), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting patients:', error);
    throw error;
  }
};

export const getAllContactMessages = async () => {
  try {
    const q = query(collection(db, COLLECTIONS.CONTACT_MESSAGES), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting contact messages:', error);
    throw error;
  }
};

export const updateAppointment = async (id: string, data: Partial<AppointmentData>, adminId: string) => {
  try {
    const docRef = doc(db, COLLECTIONS.APPOINTMENTS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    // Log admin action
    await logAdminAction(adminId, 'UPDATE', COLLECTIONS.APPOINTMENTS, id, `Updated appointment: ${JSON.stringify(data)}`);
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

export const updatePatient = async (id: string, data: Partial<PatientData>, adminId: string) => {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    // Log admin action
    await logAdminAction(adminId, 'UPDATE', COLLECTIONS.USERS, id, `Updated patient: ${JSON.stringify(data)}`);
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};

export const deleteAppointment = async (id: string, adminId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.APPOINTMENTS, id));
    
    // Log admin action
    await logAdminAction(adminId, 'DELETE', COLLECTIONS.APPOINTMENTS, id, 'Deleted appointment');
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};

export const updateContactMessageStatus = async (id: string, status: 'new' | 'read' | 'replied', adminId: string) => {
  try {
    const docRef = doc(db, COLLECTIONS.CONTACT_MESSAGES, id);
    await updateDoc(docRef, { status });
    
    // Log admin action
    await logAdminAction(adminId, 'UPDATE', COLLECTIONS.CONTACT_MESSAGES, id, `Changed status to: ${status}`);
  } catch (error) {
    console.error('Error updating message status:', error);
    throw error;
  }
};

// Enhanced Patient CRUD functions
export const createPatient = async (patientData: Omit<PatientData, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
      ...patientData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: patientData.status || 'active'
    });
    
    // Log admin action if adminId is provided
    if (patientData.userId) {
      await logAdminAction(
        patientData.userId, 
        'CREATE', 
        COLLECTIONS.USERS, 
        docRef.id, 
        `Created new patient: ${patientData.name}`
      );
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
};

export const deletePatient = async (id: string, adminId: string) => {
  try {
    // Get patient data before deletion for logging
    const patientDoc = await getDoc(doc(db, COLLECTIONS.USERS, id));
    const patientData = patientDoc.data();
    
    await deleteDoc(doc(db, COLLECTIONS.USERS, id));
    
    // Log admin action
    await logAdminAction(
      adminId, 
      'DELETE', 
      COLLECTIONS.USERS, 
      id, 
      `Deleted patient: ${patientData?.name || id}`
    );
    
    return true;
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
};

// Doctor Services
export const addDoctor = async (doctorData: Omit<Doctor, 'id'>, imageFile?: File) => {
  try {
    let imageUrl = doctorData.image || '';
    
    // Upload image to Cloudinary if provided
    if (imageFile) {
      try {
        imageUrl = await uploadToCloudinary(imageFile, 'doctors');
        console.log('Image uploaded successfully:', imageUrl);
      } catch (error: any) {
        console.error('Image upload error:', error);
        // Don't throw error - allow doctor to be saved without image
        console.warn('Doctor will be saved without image due to upload failure');
        imageUrl = ''; // Reset to empty string if upload fails
      }
    }
    
    // Create doctor document with or without image URL
    const docRef = await addDoc(collection(db, COLLECTIONS.DOCTORS), {
      ...doctorData,
      image: imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Doctor saved successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding doctor:', error);
    throw error;
  }
};

export const updateDoctor = async (id: string, doctorData: Partial<Doctor>, imageFile?: File) => {
  try {
    let imageUrl = doctorData.image;
    
    // Upload new image to Cloudinary if provided
    if (imageFile) {
      try {
        imageUrl = await uploadToCloudinary(imageFile, 'doctors');
        console.log('Image uploaded successfully:', imageUrl);
      } catch (error: any) {
        console.error('Image upload error:', error);
        // Don't throw error - allow doctor to be updated without new image
        console.warn('Doctor will be updated without new image due to upload failure');
        // Keep the existing image URL if new upload fails
      }
    }
    
    const docRef = doc(db, COLLECTIONS.DOCTORS, id);
    await updateDoc(docRef, {
      ...doctorData,
      image: imageUrl,
      updatedAt: serverTimestamp()
    });
    
    console.log('Doctor updated successfully');
    return id;
  } catch (error) {
    console.error('Error updating doctor:', error);
    throw error;
  }
};

export const getDoctors = async (): Promise<Doctor[]> => {
  try {
    const q = query(collection(db, COLLECTIONS.DOCTORS), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
  } catch (error) {
    console.error('Error getting doctors:', error);
    throw error;
  }
};

// New function: Real-time listener for doctors
export const listenToDoctors = (callback: (doctors: Doctor[]) => void) => {
  const q = query(collection(db, COLLECTIONS.DOCTORS), orderBy('name'));
  return onSnapshot(q, (snapshot) => {
    const doctors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
    callback(doctors);
  });
};

export const deleteDoctor = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.DOCTORS, id));
  } catch (error) {
    console.error('Error deleting doctor:', error);
    throw error;
  }
};

// Real-time listeners
export const listenToAppointments = (callback: (appointments: any[]) => void) => {
  const q = query(collection(db, COLLECTIONS.APPOINTMENTS), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(appointments);
  });
};

export const listenToPatients = (callback: (patients: any[]) => void) => {
  const q = query(collection(db, COLLECTIONS.USERS), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const patients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(patients);
  });
};

export const listenToContactMessages = (callback: (messages: any[]) => void) => {
  const q = query(collection(db, COLLECTIONS.CONTACT_MESSAGES), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};

// Admin logging
const logAdminAction = async (adminId: string, action: string, targetCollection: string, targetId: string, details: string) => {
  try {
    await addDoc(collection(db, COLLECTIONS.ADMIN_LOGS), {
      adminId,
      action,
      targetCollection,
      targetId,
      details,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};

// User portal functions (read-only for patients)
export const getUserAppointments = async (userId: string) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.APPOINTMENTS), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting user appointments:', error);
    throw error;
  }
};

export const getUserData = async (userId: string) => {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

// Real-time listeners for admin data
// Note: Component-specific code has been removed.
// The React hooks (useEffect) and state update functions should be implemented in your React components, not in this service file.
// Use the listener functions (listenToAppointments, listenToPatients, listenToContactMessages) in your components instead.
