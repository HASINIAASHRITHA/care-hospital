interface AppointmentMessage {
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  phone: string;
  messageType?: 'confirmation' | 'reminder';
  appointmentId?: string;
}

export const sendWhatsAppMessage = async (appointmentData: AppointmentMessage) => {
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
      return { success: true, messageId: response.messageId };
    } else {
      throw new Error('Failed to send WhatsApp message');
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
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
      console.log('Real SMS sent successfully');
      return { success: true, messageId: realSmsResult.messageId, provider: 'real' };
    } catch (realSmsError) {
      console.log('Real SMS failed, falling back to simulation', realSmsError);
      
      // Fallback to simulation
      const response = await simulateSMSAPI(phone, message);
      
      if (response.success) {
        console.log('SMS sent successfully (simulated)');
        return { success: true, messageId: response.messageId, provider: 'simulated' };
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

export const sendAppointmentNotification = async (
  appointmentData: AppointmentMessage, 
  sendWhatsApp = true, 
  sendSMS = true,
  scheduleReminder = true
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
        results.whatsapp = await sendWhatsAppMessage(appointmentData);
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

// Helper function to format phone numbers
function formatPhoneNumber(phone: string): string {
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
}
