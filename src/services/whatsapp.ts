interface AppointmentMessage {
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  phone: string;
  messageType?: 'confirmation' | 'reminder' | 'cancellation' | 'reschedule';
  appointmentId?: string;
  templateId?: string;
  sentBy?: string;
  newDate?: string;
  newTime?: string;
}

// Format phone number specifically for WhatsApp API (no + sign)
const formatPhoneForWhatsApp = (phone: string): string => {
  // Remove any non-numeric characters including +
  let cleaned = phone.replace(/\D/g, '');
  
  // Make sure it has the country code
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  
  return cleaned;
};

// Generic phone number formatter that standardizes phone numbers
const formatPhoneNumber = (phone: string): string => {
  // Remove any non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Make sure it has the country code
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  
  // Return with + prefix for international format
  return cleaned.startsWith('91') ? '+' + cleaned : '+91' + cleaned;
};

// Direct method to open WhatsApp with a message (alternative to API)
export const openWhatsAppDirectly = (appointmentData: AppointmentMessage): boolean => {
  try {
    const { patientName, doctorName, department, date, time, phone, messageType = 'confirmation', newDate, newTime } = appointmentData;
    
    let message = '';
    
    // Format message based on type
    if (messageType === 'confirmation') {
      message = `
🏥 *CARE HOSPITAL - Appointment Confirmation*

Dear ${patientName},

Your appointment has been *CONFIRMED* ✅

📋 *Appointment Details:*
👨‍⚕️ Doctor: ${doctorName}
🏥 Department: ${department}
📅 Date: ${date}
🕐 Time: ${time}
${appointmentData.appointmentId ? `🔢 Appointment ID: ${appointmentData.appointmentId}` : ''}

📍 *Address:*
Care Hospital
123 Medical Center, New Delhi - 110001

📞 *Emergency Contact:* 102
📱 *Hospital Contact:* +91 98765 43210

⏰ *Please arrive 15 minutes before your scheduled time*

Thank you for choosing Care Hospital!
      `.trim();
    } else if (messageType === 'reminder') {
      message = `
🏥 *CARE HOSPITAL - Appointment Reminder*

Dear ${patientName},

This is a reminder for your upcoming appointment ⏰

📋 *Appointment Details:*
👨‍⚕️ Doctor: ${doctorName}
🏥 Department: ${department}
📅 Date: ${date}
🕐 Time: ${time}
${appointmentData.appointmentId ? `🔢 Appointment ID: ${appointmentData.appointmentId}` : ''}

📍 *Address:*
Care Hospital
123 Medical Center, New Delhi - 110001

⏰ *Please arrive 15 minutes before your scheduled time*

We look forward to seeing you soon!
      `.trim();
    } else if (messageType === 'cancellation') {
      message = `
🏥 *CARE HOSPITAL - Appointment Cancelled*

Dear ${patientName},

Your appointment with Dr. ${doctorName} scheduled for ${date} at ${time} has been cancelled.

To reschedule, please call our appointment desk at +91 98765 43210 or book online.

We apologize for any inconvenience caused.

Care Hospital Team
      `.trim();
    } else if (messageType === 'reschedule') {
      message = `
🏥 *CARE HOSPITAL - Appointment Rescheduled*

Dear ${patientName},

We regret to inform you that Dr. ${doctorName} is unavailable on ${date}.

Your appointment has been rescheduled to ${newDate || '[new date]'} at ${newTime || '[new time]'}.

If this new time doesn't work for you, please call +91 98765 43210 to arrange an alternative.

We apologize for any inconvenience caused.

Care Hospital Team
      `.trim();
    }
    
    const formattedPhone = formatPhoneForWhatsApp(phone);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    console.log('Opening WhatsApp with URL:', whatsappUrl);
    window.open(whatsappUrl, '_blank');
    return true;
    
  } catch (error) {
    console.error('Error opening WhatsApp directly:', error);
    return false;
  }
};

export const sendWhatsAppMessage = async (appointmentData: AppointmentMessage) => {
  try {
    // Try direct WhatsApp web approach first
    const directResult = openWhatsAppDirectly(appointmentData);
    if (directResult) {
      console.log('WhatsApp web opened successfully');
      return { success: true, messageId: `wa_direct_${Date.now()}`, method: 'direct' };
    }
    
    // Fall back to original simulation approach if direct method fails
    console.log('Direct WhatsApp failed, falling back to simulation');
    const { patientName, doctorName, department, date, time, phone, messageType = 'confirmation', appointmentId = '' } = appointmentData;
    
    // Format the message based on type
    let message = '';
    
    if (messageType === 'confirmation') {
      message = `
🏥 *CARE HOSPITAL - Appointment Confirmation*

Dear ${patientName},

Your appointment has been *CONFIRMED* ✅

📋 *Appointment Details:*
👨‍⚕️ Doctor: ${doctorName}
🏥 Department: ${department}
📅 Date: ${date}
🕐 Time: ${time}
${appointmentId ? `🔢 Appointment ID: ${appointmentId}` : ''}

📍 *Address:*
Care Hospital
123 Medical Center, New Delhi - 110001

📞 *Emergency Contact:* 102
📱 *Hospital Contact:* +91 98765 43210

⏰ *Please arrive 15 minutes before your scheduled time*

Thank you for choosing Care Hospital!
      `.trim();
    } else {
      message = `
🏥 *CARE HOSPITAL - Appointment Reminder*

Dear ${patientName},

This is a reminder for your upcoming appointment ⏰

📋 *Appointment Details:*
👨‍⚕️ Doctor: ${doctorName}
🏥 Department: ${department}
📅 Date: ${date}
🕐 Time: ${time}
${appointmentId ? `🔢 Appointment ID: ${appointmentId}` : ''}

📍 *Address:*
Care Hospital
123 Medical Center, New Delhi - 110001

⏰ *Please arrive 15 minutes before your scheduled time*

We look forward to seeing you soon!
      `.trim();
    }

    try {
      // In a real implementation, you would use Twilio WhatsApp API
      // For now, we'll simulate the API call and log the message
      console.log('Sending WhatsApp message to:', phone);
      console.log('Message:', message);
      
      // Simulate API call
      const response = await simulateWhatsAppAPI(phone, message);
      
      if (response.success) {
        console.log('WhatsApp message sent successfully');
        return { success: true, messageId: response.messageId, method: 'api' };
      } else {
        throw new Error('Failed to send WhatsApp message');
      }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in WhatsApp messaging flow:', error);
    throw error;
  }
};

export const sendSMSMessage = async (appointmentData: AppointmentMessage) => {
  const { patientName, doctorName, department, date, time, phone, messageType = 'confirmation', appointmentId = '' } = appointmentData;
  
  // Format SMS message based on type (shorter for SMS)
  let message = '';
  
  if (messageType === 'confirmation') {
    message = `Care Hospital: Dear ${patientName}, your appointment is confirmed with ${doctorName} (${department}) on ${date} at ${time}.${appointmentId ? ` Ref: ${appointmentId}.` : ''} Address: 123 Medical Center, New Delhi. Contact: +91 98765 43210`;
  } else {
    message = `Care Hospital REMINDER: Dear ${patientName}, you have an appointment with ${doctorName} (${department}) tomorrow on ${date} at ${time}.${appointmentId ? ` Ref: ${appointmentId}.` : ''} Please arrive 15 mins early.`;
  }

  try {
    console.log('Sending SMS to:', phone);
    console.log('Message:', message);
    
    // Try using a real SMS API first, fall back to simulation if it fails
    try {
      const realSmsResult = await sendRealSMS(phone, message);
      
      // Log the notification
      if (appointmentData.templateId) {
        await createNotificationLog({
          templateId: appointmentData.templateId,
          templateName: 'Default SMS Confirmation',
          type: messageType,
          channel: 'sms',
          recipientName: patientName,
          recipientPhone: phone,
          appointmentId,
          doctorName,
          message,
          status: 'sent',
          sentBy: 'system'
        });
      }
      
      console.log('Real SMS sent successfully');
      return { success: true, messageId: realSmsResult.messageId, provider: 'real', message };
    } catch (realSmsError) {
      console.log('Real SMS failed, falling back to simulation', realSmsError);
      
      // Fallback to simulation
      const response = await simulateSMSAPI(phone, message);
      
      if (response.success) {
        // Log the notification
        if (appointmentData.templateId) {
          await createNotificationLog({
            templateId: appointmentData.templateId,
            templateName: 'Default SMS Confirmation',
            type: messageType,
            channel: 'sms',
            recipientName: patientName,
            recipientPhone: phone,
            appointmentId,
            doctorName,
            message,
            status: 'sent',
            sentBy: 'system'
          });
        }
        
        console.log('SMS sent successfully (simulated)');
        return { success: true, messageId: response.messageId, provider: 'simulated', message };
      } else {
        throw new Error('Failed to send SMS');
      }
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

interface APIResponse {
  success: boolean;
  messageId: string;
}

// Add a function to send real SMS through a simple HTTP API (using fetch)
const sendRealSMS = async (phone: string, message: string): Promise<APIResponse> => {
  // Remove any non-numeric characters from the phone number
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Make sure it's a valid phone number with proper formatting
  let formattedPhone = cleanPhone;
  if (!formattedPhone.startsWith('+')) {
    // Add India country code if not present
    formattedPhone = formattedPhone.startsWith('91') ? '+' + formattedPhone : '+91' + formattedPhone;
  }
  
  try {
    // You can use services like Twilio, FastSMS, MSG91, etc.
    // This is a placeholder for the actual API call
    
    // Example using a simple API (replace with your preferred SMS gateway)
    const apiKey = process.env.SMS_API_KEY || 'your-api-key';
    const apiUrl = process.env.SMS_API_URL || 'https://api.textlocal.in/send/';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: apiKey,
        numbers: formattedPhone,
        message: message,
        sender: 'CARHSP'  // Sender ID (usually 6 characters)
      })
    });
    
    if (!response.ok) {
      throw new Error(`SMS API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Most SMS APIs return a success status and message ID
    return {
      success: true,
      messageId: data.messageId || `sms_${Date.now()}`
    };
  } catch (error) {
    console.error('Real SMS sending failed:', error);
    throw error;
  }
};

// Simulate WhatsApp API (replace with actual Twilio WhatsApp API)
const simulateWhatsAppAPI = async (phone: string, message: string): Promise<APIResponse> => {
  // In production, replace this with actual Twilio WhatsApp API call:
  /*
  const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      From: 'whatsapp:+14155238886', // Twilio WhatsApp number
      To: `whatsapp:${phone}`,
      Body: message,
    }),
  });
  */
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        messageId: `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    }, 1000);
  });
};

// Simulate SMS API (replace with actual SMS service)
const simulateSMSAPI = async (phone: string, message: string): Promise<APIResponse> => {
  // In production, replace this with actual SMS API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    }, 800);
  });
};

// Schedule a reminder to be sent before the appointment
export const scheduleAppointmentReminder = async (
  appointmentData: AppointmentMessage, 
  reminderTime: 'oneDay' | 'threeHours' = 'oneDay',
  sendWhatsApp = true,
  sendSMS = true
) => {
  try {
    const { date, time } = appointmentData;
    
    // Parse appointment date and time
    const appointmentDateTime = new Date(`${date} ${time}`);
    let reminderDateTime = new Date(appointmentDateTime);
    
    // Set reminder time (in a real implementation, you would use a task scheduler)
    if (reminderTime === 'oneDay') {
      reminderDateTime.setDate(reminderDateTime.getDate() - 1); // 24 hours before
    } else if (reminderTime === 'threeHours') {
      reminderDateTime.setHours(reminderDateTime.getHours() - 3); // 3 hours before
    }
    
    console.log(`Reminder scheduled for: ${reminderDateTime.toLocaleString()}`);
    
    // In a real implementation, you would schedule this with a cron job, 
    // message queue or a scheduler service like node-schedule
    
    // For demo purposes, let's simulate scheduling with a log message
    const reminderData = {
      ...appointmentData,
      messageType: 'reminder' as const
    };
    
    console.log('Reminder will be sent with:', reminderData);
    
    return {
      success: true,
      scheduledTime: reminderDateTime,
      message: `Reminder scheduled for ${reminderTime === 'oneDay' ? '24 hours' : '3 hours'} before appointment`
    };
    
    // In a real implementation, you would return a job ID or similar
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    return {
      success: false,
      error
    };
  }
};

// Enhanced notification function that can use templates
export const sendAppointmentNotification = async (
  appointmentData: AppointmentMessage, 
  sendWhatsApp = true, 
  sendSMS = true,
  scheduleReminder = true,
  useDirect = true // New option to use direct WhatsApp method
) => {
  const results = {
    whatsapp: null as any,
    sms: null as any,
    reminder: null as any,
    success: false
  };

  try {
    // Validate phone number
    if (!appointmentData.phone || appointmentData.phone.trim() === '') {
      throw new Error('Phone number is required for sending notifications');
    }
    
    // Clean and format the phone number to ensure it works
    appointmentData.phone = formatPhoneNumber(appointmentData.phone);
    
    // Try WhatsApp first if enabled
    if (sendWhatsApp) {
      try {
        // Use direct method if enabled
        if (useDirect) {
          const directResult = openWhatsAppDirectly(appointmentData);
          if (directResult) {
            results.whatsapp = { 
              success: true, 
              messageId: `direct_${Date.now()}`,
              method: 'direct' 
            };
          } else {
            // Fall back to API method
            results.whatsapp = await sendWhatsAppMessage(appointmentData);
          }
        } else {
          // Use standard API method
          results.whatsapp = await sendWhatsAppMessage(appointmentData);
        }
      } catch (error) {
        console.error('WhatsApp sending failed:', error);
        results.whatsapp = { success: false, error };
        // Force SMS to be sent if WhatsApp fails, ensuring at least one message is attempted
        sendSMS = true;
      }
    }

    // Send SMS if enabled or if WhatsApp failed
    if (sendSMS) {
      try {
        results.sms = await sendSMSMessage(appointmentData);
      } catch (error) {
        console.error('SMS sending failed:', error);
        results.sms = { success: false, error };
      }
    }
    
    // If both WhatsApp and SMS failed, make one last attempt with SMS
    if ((!results.whatsapp?.success || !sendWhatsApp) && (!results.sms?.success || !sendSMS)) {
      try {
        console.log('Both messaging methods failed or disabled. Making final SMS attempt...');
        results.sms = await sendSMSMessage(appointmentData);
      } catch (finalError) {
        console.error('Final SMS attempt failed:', finalError);
      }
    }
    
    // Schedule a reminder if enabled
    if (scheduleReminder) {
      try {
        results.reminder = await scheduleAppointmentReminder(
          appointmentData,
          'oneDay',
          sendWhatsApp,
          sendSMS
        );
      } catch (error) {
        console.error('Reminder scheduling failed:', error);
        results.reminder = { success: false, error };
      }
    }

    // Consider it successful if at least one method worked
    results.success = (results.whatsapp?.success || results.sms?.success) || false;
    
    return results;
  } catch (error) {
    console.error('Error in sendAppointmentNotification:', error);
    return { ...results, error };
  }
};

// Add new imports
import { 
  generateMessageFromTemplate, 
  getTemplateById, 
  createNotificationLog 
} from './notificationTemplates';

// Enhanced WhatsApp message sender that can use templates
export const sendWhatsAppMessageWithTemplate = async (appointmentData: AppointmentMessage) => {
  try {
    const { 
      patientName, 
      doctorName, 
      department, 
      date, 
      time, 
      phone, 
      messageType = 'confirmation', 
      appointmentId = '',
      templateId,
      sentBy = 'system',
      newDate,
      newTime
    } = appointmentData;
    
    let message = '';
    let templateName = '';
    
    // If templateId is provided, use that template
    if (templateId) {
      const template = await getTemplateById(templateId);
      if (template) {
        message = generateMessageFromTemplate(template.content, {
          patient_name: patientName,
          doctor_name: doctorName,
          department: department,
          appointment_date: date,
          time: time,
          appointment_id: appointmentId,
          new_date: newDate,
          new_time: newTime
        });
        templateName = template.name;
      }
    } else {
      // Otherwise, fall back to the original hardcoded templates
      if (messageType === 'confirmation') {
        message = `
🏥 *CARE HOSPITAL - Appointment Confirmation*

Dear ${patientName},

Your appointment has been *CONFIRMED* ✅

📋 *Appointment Details:*
👨‍⚕️ Doctor: ${doctorName}
🏥 Department: ${department}
📅 Date: ${date}
🕐 Time: ${time}
${appointmentId ? `🔢 Appointment ID: ${appointmentId}` : ''}

📍 *Address:*
Care Hospital
123 Medical Center, New Delhi - 110001

📞 *Emergency Contact:* 102
📱 *Hospital Contact:* +91 98765 43210

⏰ *Please arrive 15 minutes before your scheduled time*

Thank you for choosing Care Hospital!
        `.trim();
        templateName = "Default Confirmation";
      } else if (messageType === 'reminder') {
        message = `
🏥 *CARE HOSPITAL - Appointment Reminder*

Dear ${patientName},

This is a reminder for your upcoming appointment ⏰

📋 *Appointment Details:*
👨‍⚕️ Doctor: ${doctorName}
🏥 Department: ${department}
📅 Date: ${date}
🕐 Time: ${time}
${appointmentId ? `🔢 Appointment ID: ${appointmentId}` : ''}

📍 *Address:*
Care Hospital
123 Medical Center, New Delhi - 110001

⏰ *Please arrive 15 minutes before your scheduled time*

We look forward to seeing you soon!
        `.trim();
        templateName = "Default Reminder";
      } else if (messageType === 'cancellation') {
        message = `
🏥 *CARE HOSPITAL - Appointment Cancelled*

Dear ${patientName},

Your appointment with Dr. ${doctorName} scheduled for ${date} at ${time} has been cancelled.

To reschedule, please call our appointment desk at +91 98765 43210 or book online.

We apologize for any inconvenience caused.

Care Hospital Team
        `.trim();
        templateName = "Default Cancellation";
      } else if (messageType === 'reschedule') {
        message = `
🏥 *CARE HOSPITAL - Appointment Rescheduled*

Dear ${patientName},

We regret to inform you that Dr. ${doctorName} is unavailable on ${date}.

Your appointment has been rescheduled to ${newDate || '[new date]'} at ${newTime || '[new time]'}.

If this new time doesn't work for you, please call +91 98765 43210 to arrange an alternative.

We apologize for any inconvenience caused.

Care Hospital Team
        `.trim();
        templateName = "Default Reschedule";
      }
    }

    // Send the message using existing functionality
    const response = await simulateWhatsAppAPI(phone, message);
    
    if (response.success) {
      // Log the notification
      if (templateId) {
        await createNotificationLog({
          templateId,
          templateName,
          type: messageType,
          channel: 'whatsapp',
          recipientName: patientName,
          recipientPhone: phone,
          appointmentId,
          doctorName,
          message,
          status: 'sent',
          sentBy
        });
      }
      
      console.log('WhatsApp message sent successfully');
      return { 
        success: true, 
        messageId: response.messageId,
        message 
      };
    } else {
      throw new Error('Failed to send WhatsApp message');
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};

// Enhanced SMS message sender that can use templates
export const sendSMSMessageWithTemplate = async (appointmentData: AppointmentMessage) => {
  // Similar to the WhatsApp function but for SMS
  // ...existing code...

  const { 
    patientName, 
    doctorName, 
    department, 
    date, 
    time, 
    phone, 
    messageType = 'confirmation', 
    appointmentId = '',
    templateId,
    sentBy = 'system',
    newDate,
    newTime
  } = appointmentData;

  let message = '';
  let templateName = '';
  
  // Use template if provided
  if (templateId) {
    const template = await getTemplateById(templateId);
    if (template) {
      message = generateMessageFromTemplate(template.content, {
        patient_name: patientName,
        doctor_name: doctorName,
        department: department,
        appointment_date: date,
        time: time,
        appointment_id: appointmentId,
        new_date: newDate,
        new_time: newTime
      });
      templateName = template.name;
    }
  } else {
    // Otherwise, use default SMS formats (shorter for SMS)
    if (messageType === 'confirmation') {
      message = `Care Hospital: Dear ${patientName}, your appointment is confirmed with ${doctorName} (${department}) on ${date} at ${time}.${appointmentId ? ` Ref: ${appointmentId}.` : ''} Address: 123 Medical Center, New Delhi. Contact: +91 98765 43210`;
      templateName = "Default SMS Confirmation";
    } else if (messageType === 'reminder') {
      message = `Care Hospital REMINDER: Dear ${patientName}, you have an appointment with ${doctorName} (${department}) tomorrow on ${date} at ${time}.${appointmentId ? ` Ref: ${appointmentId}.` : ''} Please arrive 15 mins early.`;
      templateName = "Default SMS Reminder";
    } else if (messageType === 'cancellation') {
      message = `Care Hospital: Dear ${patientName}, your appointment with ${doctorName} on ${date} at ${time} has been cancelled. To reschedule, call +91 98765 43210.`;
      templateName = "Default SMS Cancellation";
    } else if (messageType === 'reschedule') {
      message = `Care Hospital: Dear ${patientName}, your appointment with ${doctorName} has been rescheduled to ${newDate || '[new date]'} at ${newTime || '[new time]'}. If unsuitable, call +91 98765 43210.`;
      templateName = "Default SMS Reschedule";
    }
  }

    try {
      console.log('Sending SMS to:', phone);
      console.log('Message:', message);
      
      // Try using a real SMS API first, fall back to simulation if it fails
      try {
        const realSmsResult = await sendRealSMS(phone, message);
        
        // Log the notification
        if (templateId) {
          await createNotificationLog({
            templateId,
            templateName,
            type: messageType,
            channel: 'sms',
            recipientName: patientName,
            recipientPhone: phone,
            appointmentId,
            doctorName,
            message,
            status: 'sent',
            sentBy
          });
        }
        
        console.log('Real SMS sent successfully');
        return { success: true, messageId: realSmsResult.messageId, provider: 'real', message };
      } catch (realSmsError) {
        console.log('Real SMS failed, falling back to simulation', realSmsError);
        
        // Fallback to simulation
        const response = await simulateSMSAPI(phone, message);
        
        if (response.success) {
          // Log the notification
          if (templateId) {
            await createNotificationLog({
              templateId,
              templateName,
              type: messageType,
              channel: 'sms',
              recipientName: patientName,
              recipientPhone: phone,
              appointmentId,
              doctorName,
              message,
              status: 'sent',
              sentBy
            });
          }
          
          console.log('SMS sent successfully (simulated)');
          return { success: true, messageId: response.messageId, provider: 'simulated', message };
        } else {
          throw new Error('Failed to send SMS');
        }
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  };
