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
  getDoc,
  setDoc
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User, signInWithPhoneNumber, RecaptchaVerifier, PhoneAuthProvider } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import { db, COLLECTIONS, auth } from '@/config/firebase';
import app from '@/config/firebase';

// Initialize Firebase Storage
const storage = getStorage(app);
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
    // Ensure required fields are present
    if (!appointmentData.patientName || !appointmentData.phone || !appointmentData.date || !appointmentData.time) {
      throw new Error('Missing required appointment fields');
    }

    // Add appointment to Firestore with status: 'pending'
    const appointmentRef = await addDoc(collection(db, COLLECTIONS.APPOINTMENTS), {
      ...appointmentData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      source: 'website', // Track appointment source
      whatsappSent: false,
      lastCommunication: null
    });
    
    console.log('New appointment created with ID:', appointmentRef.id);
    return appointmentRef.id;
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
    // Check if document exists first
    const docRef = doc(db, COLLECTIONS.USERS, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log(`Document ${id} doesn't exist, creating instead of updating`);
      // Document doesn't exist, create it instead
      const newData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        userId: id // Store the user ID in the document
      };
      
      await setDoc(docRef, newData);
      
      // Log admin action
      if (adminId) {
        await logAdminAction(
          adminId, 
          'CREATE', 
          COLLECTIONS.USERS, 
          id, 
          `Created new patient profile: ${data.name || 'Unknown'}`
        );
      }
      
      return id;
    }
    
    // Document exists, proceed with update
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    // Log admin action if adminId is provided
    if (adminId) {
      await logAdminAction(
        adminId, 
        'UPDATE', 
        COLLECTIONS.USERS, 
        id, 
        `Updated patient: ${JSON.stringify(data)}`
      );
    }
    
    return id;
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
    const appointments = snapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure all appointments have a source field
      if (!data.source) {
        data.source = 'unknown';
      }
      return { id: doc.id, ...data };
    });
    console.log('Appointments from Firestore:', appointments.length);
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
  const q = query(
    collection(db, COLLECTIONS.APPOINTMENTS), 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  // ...returns all appointments for the user
}

export const getUserData = async (userId: string) => {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // Return the document data with all fields needed for appointments
      const userData = docSnap.data();
      return { 
        id: docSnap.id, 
        ...userData,
        // Ensure we have all the fields we need with proper types
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        age: userData.age || '',
        gender: userData.gender || ''
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

// Update appointment billing status
export const updateAppointmentBillingStatus = async (
  appointmentId: string, 
  status: 'pending' | 'paid' | 'waived' | 'not_applicable',
  paymentMethod?: string,
  receiptUrl?: string
) => {
  try {
    const appointmentRef = doc(db, COLLECTIONS.APPOINTMENTS, appointmentId);
    
    const updateData: any = {
      'billing.status': status,
    };
    
    if (status === 'paid') {
      updateData['billing.paidAt'] = new Date().toISOString();
      
      if (paymentMethod) {
        updateData['billing.paymentMethod'] = paymentMethod;
      }
      
      if (receiptUrl) {
        updateData['billing.receiptUrl'] = receiptUrl;
      }
    }
    
    await updateDoc(appointmentRef, updateData);
    
    return true;
  } catch (error) {
    console.error('Error updating appointment billing status:', error);
    throw error;
  }
};

// Upload payment proof to storage and return the download URL
export const uploadPaymentProof = async (file: File, userId: string, appointmentId: string): Promise<string> => {
  try {
    const storageRef = ref(storage, `payment_proofs/${userId}/${appointmentId}/${file.name}`);
    const uploadTask = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(uploadTask.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    throw error;
  }
};

// Phone Authentication Methods
export const createRecaptchaVerifier = (containerId: string, invisibleMode = false) => {
  try {
    // Make sure we clear any existing verifier first
    clearRecaptchaVerifier();

    const auth = getAuth();
    const recaptchaParams = {
      size: invisibleMode ? 'invisible' : 'normal',
      callback: () => {
        console.log('reCAPTCHA resolved successfully');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      }
    };

    // Create and render a new recaptcha verifier
    const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, recaptchaParams);
    
    // Store reference to recaptcha verifier for later cleanup
    window.recaptchaVerifier = recaptchaVerifier;
    
    return recaptchaVerifier;
  } catch (error) {
    console.error('Error creating reCAPTCHA verifier:', error);
    throw error;
  }
};

// Clear reCAPTCHA verifier to prevent DOM element issues
export const clearRecaptchaVerifier = () => {
  try {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = undefined;
    }
  } catch (error) {
    console.error('Error clearing reCAPTCHA verifier:', error);
  }
};

export const sendOTP = async (phoneNumber: string, containerId: string) => {
  try {
    const auth = getAuth();
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    console.log('Sending OTP to formatted number:', formattedPhoneNumber);
    
    // Create a fresh reCAPTCHA instance - simplified approach without preliminary check
    let recaptchaVerifier;
    try {
      recaptchaVerifier = createRecaptchaVerifier(containerId);
      await recaptchaVerifier.render();
    } catch (recaptchaError) {
      console.error("Error with reCAPTCHA:", recaptchaError);
      throw new Error("Failed to initialize verification. Please refresh the page.");
    }
    
    // Send the verification code directly
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, recaptchaVerifier);
      console.log('OTP sent successfully');
      return confirmationResult;
    } catch (otpError: any) {
      // Clean up reCAPTCHA if OTP sending fails
      clearRecaptchaVerifier();
      
      console.error('OTP sending failed with code:', otpError.code);
      
      // Enhanced error messages
      if (otpError.code === 'auth/invalid-phone-number') {
        throw new Error("The phone number format is incorrect. Please use international format (e.g. +91XXXXXXXXXX).");
      } else if (otpError.code === 'auth/quota-exceeded') {
        throw new Error("SMS quota has been exceeded. Please try again later or contact support.");
      } else if (otpError.code === 'auth/too-many-requests') {
        throw new Error("Too many requests. Please try again later.");
      } else if (otpError.code === 'auth/operation-not-allowed') {
        throw new Error("Phone authentication is not enabled. Please contact support.");
      } else {
        throw otpError; // Re-throw other errors
      }
    }
  } catch (error) {
    console.error("Error in sendOTP:", error);
    throw error;
  }
};

// Helper function to format phone numbers
export const formatPhoneNumber = (phone: string): string => {
  // Remove any non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Make sure it has the country code (add +91 for India if needed)
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  
  // Add + if it doesn't have one
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
};

// Format for WhatsApp API (no + sign)
export const formatPhoneForWhatsApp = (phone: string): string => {
  // Remove any non-numeric characters including +
  let cleaned = phone.replace(/\D/g, '');
  
  // Make sure it has the country code
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  
  return cleaned;
};

// Direct WhatsApp message sender using web API
export const openWhatsAppMessage = (phone: string, message: string): boolean => {
  try {
    const formattedPhone = formatPhoneForWhatsApp(phone);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    console.log('Opening WhatsApp with URL:', whatsappUrl);
    
    // Open WhatsApp in new tab
    const newWindow = window.open(whatsappUrl, '_blank');
    
    // Check if window was blocked by popup blocker
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      console.warn('WhatsApp window was blocked by popup blocker');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error opening WhatsApp:', error);
    return false;
  }
};

// Function to send appointment notification via WhatsApp
export const sendAppointmentWhatsApp = (appointmentData: {
  patientName: string;
  doctor: string;
  department: string;
  date: string;
  time: string;
  phone: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
}): boolean => {
  try {
    const { patientName, doctor, department, date, time, phone, status } = appointmentData;
    
    let message = '';
    
    // Customize message based on appointment status
    switch(status) {
      case 'confirmed':
        message = `🏥 *CARE HOSPITAL - Appointment Confirmation*\n\nDear ${patientName},\n\nYour appointment has been *CONFIRMED* ✅\n\n📋 *Appointment Details:*\n👨‍⚕️ Doctor: ${doctor}\n🏥 Department: ${department}\n📅 Date: ${date}\n🕐 Time: ${time}\n\n📍 *Address:*\nCare Hospital\n123 Medical Center, New Delhi - 110001\n\n📞 *Hospital Contact:* +91 98765 43210\n\n⏰ *Please arrive 15 minutes before your scheduled time*\n\nThank you for choosing Care Hospital!`;
        break;
      case 'cancelled':
        message = `🏥 *CARE HOSPITAL - Appointment Cancelled*\n\nDear ${patientName},\n\nYour appointment with Dr. ${doctor} scheduled for ${date} at ${time} has been cancelled.\n\nTo reschedule, please call our appointment desk at +91 98765 43210 or book online.\n\nWe apologize for any inconvenience caused.\n\nCare Hospital Team`;
        break;
      case 'rescheduled':
        message = `🏥 *CARE HOSPITAL - Appointment Rescheduled*\n\nDear ${patientName},\n\nYour appointment with Dr. ${doctor} has been rescheduled to ${date} at ${time}.\n\nIf this time doesn't work for you, please call our appointment desk at +91 98765 43210.\n\nThank you for your understanding.\n\nCare Hospital Team`;
        break;
      case 'completed':
        message = `🏥 *CARE HOSPITAL - Appointment Completed*\n\nDear ${patientName},\n\nThank you for visiting Dr. ${doctor} at Care Hospital. We hope your experience was satisfactory.\n\nIf you have any follow-up questions, please contact us at +91 98765 43210.\n\nWishing you good health!\n\nCare Hospital Team`;
        break;
      default:
        message = `🏥 *CARE HOSPITAL - Appointment Update*\n\nDear ${patientName},\n\nRegarding your appointment with Dr. ${doctor} (${department}) on ${date} at ${time}.\n\nPlease contact our appointment desk at +91 98765 43210 for any queries.\n\nThank you for choosing Care Hospital!`;
    }
    
    return openWhatsAppMessage(phone, message);
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return false;
  }
};

// Add this to the global Window interface
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

// Firebase services are already imported from '@/config/firebase' at the top of the file
// and used throughout the service functions, so we don't need to redefine them here.

// Test WhatsApp message sending
// const msg = encodeURIComponent("Your appointment with Dr. X is confirmed for July 2 at 10:00 AM.");
// const phone = "91XXXXXXXXXX"; // user number, no +
// window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
