
interface AppointmentMessage {
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  phone: string;
}

export const sendWhatsAppMessage = async (appointmentData: AppointmentMessage) => {
  const { patientName, doctorName, department, date, time, phone } = appointmentData;
  
  // Format the message
  const message = `
🏥 *CARE HOSPITAL - Appointment Confirmation*

Dear ${patientName},

Your appointment has been *CONFIRMED* ✅

📋 *Appointment Details:*
👨‍⚕️ Doctor: ${doctorName}
🏥 Department: ${department}
📅 Date: ${date}
🕐 Time: ${time}

📍 *Address:*
Care Hospital
123 Medical Center, New Delhi - 110001

📞 *Emergency Contact:* 102
📱 *Hospital Contact:* +91 98765 43210

⏰ *Please arrive 15 minutes before your scheduled time*

Thank you for choosing Care Hospital!
  `.trim();

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
  const { patientName, doctorName, department, date, time, phone } = appointmentData;
  
  // Format SMS message (shorter for SMS)
  const message = `Care Hospital: Dear ${patientName}, your appointment is confirmed with ${doctorName} (${department}) on ${date} at ${time}. Address: 123 Medical Center, New Delhi. Contact: +91 98765 43210`;

  try {
    console.log('Sending SMS to:', phone);
    console.log('Message:', message);
    
    // Simulate SMS API call
    const response = await simulateSMSAPI(phone, message);
    
    if (response.success) {
      console.log('SMS sent successfully');
      return { success: true, messageId: response.messageId };
    } else {
      throw new Error('Failed to send SMS');
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

// Simulate WhatsApp API (replace with actual Twilio WhatsApp API)
const simulateWhatsAppAPI = async (phone: string, message: string) => {
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
const simulateSMSAPI = async (phone: string, message: string) => {
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

export const sendAppointmentNotification = async (appointmentData: AppointmentMessage, sendWhatsApp = true, sendSMS = true) => {
  const results = {
    whatsapp: null as any,
    sms: null as any,
    success: false
  };

  try {
    // Send WhatsApp message if enabled
    if (sendWhatsApp) {
      try {
        results.whatsapp = await sendWhatsAppMessage(appointmentData);
      } catch (error) {
        console.error('WhatsApp sending failed:', error);
        results.whatsapp = { success: false, error };
      }
    }

    // Send SMS if enabled
    if (sendSMS) {
      try {
        results.sms = await sendSMSMessage(appointmentData);
      } catch (error) {
        console.error('SMS sending failed:', error);
        results.sms = { success: false, error };
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
