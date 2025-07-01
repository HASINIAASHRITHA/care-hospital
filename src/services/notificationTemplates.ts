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
  limit,
  onSnapshot
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

// Default templates (used only as fallback if no templates exist in database)
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

// Template CRUD operations
export const getAllTemplates = async (): Promise<NotificationTemplate[]> => {
  try {
    const q = query(collection(db, COLLECTIONS.NOTIFICATION_TEMPLATES), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const templates = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NotificationTemplate));
    
    // If no templates exist, initialize with defaults
    if (templates.length === 0) {
      console.log('No templates found, initializing with defaults...');
      await initializeDefaultTemplates();
      // Fetch again after initialization
      return getAllTemplates();
    }
    
    return templates;
  } catch (error) {
    console.error('Error getting templates:', error);
    throw error;
  }
};

// Initialize default templates if none exist
export const initializeDefaultTemplates = async () => {
  try {
    const batch = [];
    
    for (const template of DEFAULT_TEMPLATES) {
      batch.push(
        addDoc(collection(db, COLLECTIONS.NOTIFICATION_TEMPLATES), {
          ...template,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: 'system'
        })
      );
    }
    
    await Promise.all(batch);
    console.log('Default templates initialized successfully');
  } catch (error) {
    console.error('Error initializing default templates:', error);
    throw error;
  }
};

export const getTemplateById = async (id: string): Promise<NotificationTemplate | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.NOTIFICATION_TEMPLATES, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as NotificationTemplate;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting template by ID:', error);
    throw error;
  }
};

export const getTemplateByType = async (type: string): Promise<NotificationTemplate | null> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATION_TEMPLATES),
      where('type', '==', type),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as NotificationTemplate;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting template by type:', error);
    throw error;
  }
};

export const createTemplate = async (template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATION_TEMPLATES), {
      ...template,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
};

export const updateTemplate = async (id: string, template: Partial<NotificationTemplate>) => {
  try {
    const docRef = doc(db, COLLECTIONS.NOTIFICATION_TEMPLATES, id);
    
    await updateDoc(docRef, {
      ...template,
      updatedAt: serverTimestamp()
    });
    
    return id;
  } catch (error) {
    console.error('Error updating template:', error);
    throw error;
  }
};

export const deleteTemplate = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.NOTIFICATION_TEMPLATES, id));
    return true;
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
};

// Notification logs
export const createNotificationLog = async (log: Omit<NotificationLog, 'id' | 'sentAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATION_LOGS), {
      ...log,
      sentAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification log:', error);
    throw error;
  }
};

export const getNotificationLogs = async () => {
  try {
    const q = query(collection(db, COLLECTIONS.NOTIFICATION_LOGS), orderBy('sentAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }) as NotificationLog);
  } catch (error) {
    console.error('Error getting notification logs:', error);
    throw error;
  }
};

export const listenToNotificationLogs = (callback: (logs: NotificationLog[]) => void, onError?: (error: Error) => void) => {
  const q = query(collection(db, COLLECTIONS.NOTIFICATION_LOGS), orderBy('sentAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NotificationLog));
    
    callback(logs);
  }, onError);
};

// Helper function to replace placeholders in templates
export const generateMessageFromTemplate = (template: string, data: Record<string, string>) => {
  let message = template;
  
  for (const [key, value] of Object.entries(data)) {
    message = message.replace(new RegExp(`{${key}}`, 'g'), value || `{${key}}`);
  }
  
  return message;
};
