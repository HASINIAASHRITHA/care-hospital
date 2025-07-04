// Demo script showing WhatsApp message functionality
// This demonstrates the key functions used in the admin panel

// Sample appointment data
const sampleAppointment = {
  id: "APP123",
  patientName: "John Doe",
  phone: "9876543210",
  doctor: "Dr. Smith",
  department: "Cardiology",
  date: "2025-07-05",
  time: "10:00 AM",
  status: "confirmed",
  whatsappSent: false
};

// Phone number formatting function
function formatPhoneForWhatsApp(phone) {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
}

// Professional message creation
function createProfessionalMessage(appointment) {
  const formattedDate = new Date(appointment.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Remove "Dr." prefix if it already exists in the doctor name
  const doctorName = appointment.doctor.startsWith('Dr. ') ? appointment.doctor : `Dr. ${appointment.doctor}`;

  return `Hello ${appointment.patientName},

Your appointment with ${doctorName} on ${formattedDate} at ${appointment.time} has been confirmed.

Please reach 10 minutes early and bring any previous reports if applicable.

Thank you,
Care Hospital`;
}

// Demo function
function demoWhatsAppMessage() {
  console.log("=== WhatsApp Message Demo ===");
  console.log("Sample Appointment:", sampleAppointment);
  console.log("\nFormatted Phone:", formatPhoneForWhatsApp(sampleAppointment.phone));
  console.log("\nProfessional Message:");
  console.log(createProfessionalMessage(sampleAppointment));
  
  const cleanedPhone = formatPhoneForWhatsApp(sampleAppointment.phone);
  const encodedMessage = encodeURIComponent(createProfessionalMessage(sampleAppointment));
  const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
  
  console.log("\nWhatsApp URL:");
  console.log(whatsappUrl);
  console.log("\n=== End Demo ===");
}

// Run demo
demoWhatsAppMessage();
