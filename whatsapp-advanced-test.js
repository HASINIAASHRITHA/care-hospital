// Advanced testing for WhatsApp message feature
// Testing different appointment scenarios

// Test cases
const testCases = [
  {
    id: "TEST001",
    patientName: "Raj Kumar",
    phone: "9876543210",
    doctor: "Dr. Sarah Wilson",
    department: "Neurology",
    date: "2025-07-08",
    time: "2:30 PM",
    status: "confirmed",
    whatsappSent: false
  },
  {
    id: "TEST002",
    patientName: "Maria Garcia",
    phone: "+919123456789",
    doctor: "Smith", // Without Dr. prefix
    department: "Pediatrics",
    date: "2025-07-10",
    time: "9:00 AM",
    status: "confirmed",
    whatsappSent: false
  },
  {
    id: "TEST003",
    patientName: "Ahmed Hassan",
    phone: "91-987-654-3210", // With dashes
    doctor: "Dr. Priya Sharma",
    department: "Dermatology",
    date: "2025-07-15",
    time: "11:30 AM",
    status: "confirmed",
    whatsappSent: false
  }
];

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

// Test function
function runAdvancedTests() {
  console.log("=== Advanced WhatsApp Message Tests ===\n");
  
  testCases.forEach((appointment, index) => {
    console.log(`--- Test Case ${index + 1}: ${appointment.patientName} ---`);
    console.log(`Phone Input: ${appointment.phone}`);
    console.log(`Formatted Phone: ${formatPhoneForWhatsApp(appointment.phone)}`);
    console.log(`Doctor Input: ${appointment.doctor}`);
    console.log(`\nGenerated Message:`);
    console.log(createProfessionalMessage(appointment));
    
    const cleanedPhone = formatPhoneForWhatsApp(appointment.phone);
    const encodedMessage = encodeURIComponent(createProfessionalMessage(appointment));
    const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
    
    console.log(`\nWhatsApp URL Length: ${whatsappUrl.length} characters`);
    console.log(`URL Valid: ${whatsappUrl.startsWith('https://wa.me/91') && cleanedPhone.length >= 12}`);
    console.log("\n" + "=".repeat(50) + "\n");
  });
  
  console.log("=== All Tests Completed ===");
}

// Run tests
runAdvancedTests();
