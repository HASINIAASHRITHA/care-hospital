import { db, COLLECTIONS } from '@/config/firebase';
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
  getDoc,
  serverTimestamp,
  limit
} from 'firebase/firestore';

export interface NotificationTemplate {
  id?: string;
  name: string;
  type: 'confirmation' | 'reminder' | 'cancellation' | 'reschedule';
  channel: 'whatsapp' | 'sms' | 'both';
  content: string;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

export interface NotificationLog {
  id?: string;
  templateId: string;
  templateName: string;
  type: 'confirmation' | 'reminder' | 'cancellation' | 'reschedule';
  channel: 'whatsapp' | 'sms' | 'both';
  recipientName: string;
  recipientPhone: string;
  appointmentId?: string;
  doctorName?: string;
  message: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt: any;
  sentBy: string;
}

export interface Doctor {
  // existing fields...
  specializations?: string[];
  schedule?: {
    [day: string]: {
      enabled?: boolean;
      start?: string;
      end?: string;
    }
  };
  blockedDates?: string[];
}

// Default templates
export const DEFAULT_TEMPLATES: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>[] = [
  {
    name: 'Appointment Confirmation',
    type: 'confirmation',
    channel: 'whatsapp',
    content: `Hi {patient_name},

Your appointment with Dr. {doctor_name} at {department} is confirmed for {appointment_date} at {time}.

Location: Care Hospital, 123 Medical Center
Reference ID: {appointment_id}

Please arrive 15 minutes early. For any changes, call +91 98765 43210.

Thank you for choosing Care Hospital!`
  },
  {
    name: 'Appointment Reminder',
    type: 'reminder',
    channel: 'both',
    content: `Reminder: Hi {patient_name}, 

You have an appointment tomorrow with Dr. {doctor_name} at Care Hospital on {appointment_date} at {time}.

Please arrive 15 minutes early and bring any relevant medical reports.

Need to reschedule? Please call +91 98765 43210.`
  },
  {
    name: 'Appointment Cancellation',
    type: 'cancellation',
    channel: 'both',
    content: `Dear {patient_name},

Your appointment with Dr. {doctor_name} scheduled for {appointment_date} at {time} has been cancelled.

To reschedule, please call our appointment desk at +91 98765 43210 or book online.

We apologize for any inconvenience caused.

Care Hospital Team`
  },
  {
    name: 'Doctor Unavailable Notice',
    type: 'reschedule',
    channel: 'both',
    content: `Important Notice: Hi {patient_name},

We regret to inform you that Dr. {doctor_name} is unavailable on {appointment_date}.

Your appointment has been rescheduled to {new_date} at {new_time}.

If this new time doesn't work for you, please call +91 98765 43210 to arrange an alternative.

We apologize for any inconvenience caused.

Care Hospital Team`
  }
];

// Get all templates
export const getAllTemplates = async () => {
  try {
    const q = query(collection(db, COLLECTIONS.NOTIFICATION_TEMPLATES), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as NotificationTemplate[];
  } catch (error) {
    console.error('Error getting notification templates:', error);
    throw error;
  }
};

// Get template by ID
export const getTemplateById = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTIONS.NOTIFICATION_TEMPLATES, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as NotificationTemplate;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting template by ID:', error);
    throw error;
  }
};

// Create a new template
export const createTemplate = async (template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATION_TEMPLATES), {
      ...template,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...template };
  } catch (error) {
    console.error('Error creating notification template:', error);
    throw error;
  }
};

// Update a template
export const updateTemplate = async (id: string, template: Partial<NotificationTemplate>) => {
  try {
    const docRef = doc(db, COLLECTIONS.NOTIFICATION_TEMPLATES, id);
    await updateDoc(docRef, {
      ...template,
      updatedAt: serverTimestamp()
    });
    return { id, ...template };
  } catch (error) {
    console.error('Error updating notification template:', error);
    throw error;
  }
};

// Delete a template
export const deleteTemplate = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.NOTIFICATION_TEMPLATES, id));
    return id;
  } catch (error) {
    console.error('Error deleting notification template:', error);
    throw error;
  }
};

// Initialize default templates if none exist
export const initializeDefaultTemplates = async (userId: string) => {
  try {
    const templates = await getAllTemplates();
    
    if (templates.length === 0) {
      const promises = DEFAULT_TEMPLATES.map(template => 
        createTemplate({
          ...template,
          createdBy: userId
        })
      );
      
      await Promise.all(promises);
      console.log('Default notification templates initialized');
    }
  } catch (error) {
    console.error('Error initializing default templates:', error);
  }
};

// Log notification
export const logNotification = async (notificationLog: Omit<NotificationLog, 'id' | 'sentAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATION_LOGS), {
      ...notificationLog,
      sentAt: serverTimestamp()
    });
    return { id: docRef.id, ...notificationLog };
  } catch (error) {
    console.error('Error logging notification:', error);
    throw error;
  }
};
// Get all notification logs
export const getNotificationLogs = async (limitCount = 50) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATION_LOGS), 
      orderBy('sentAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as NotificationLog[];
  } catch (error) {
    console.error('Error getting notification logs:', error);
    throw error;
  }
};

// Generate message from template
export const generateMessageFromTemplate = (
  template: string, 
  data: {
    patient_name: string;
    doctor_name: string;
    department?: string;
    appointment_date: string;
    time: string;
    appointment_id?: string;
    new_date?: string;
    new_time?: string;
  }
) => {
  return template
    .replace(/{patient_name}/g, data.patient_name)
    .replace(/{doctor_name}/g, data.doctor_name)
    .replace(/{department}/g, data.department || '')
    .replace(/{appointment_date}/g, data.appointment_date)
    .replace(/{time}/g, data.time)
    .replace(/{appointment_id}/g, data.appointment_id || '')
    .replace(/{new_date}/g, data.new_date || '')
    .replace(/{new_time}/g, data.new_time || '');
};
