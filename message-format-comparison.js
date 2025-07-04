// Test different message format variations

const sampleAppointment = {
  patientName: "Priya Sharma",
  phone: "9876543210",
  doctor: "Dr. Rajesh Kumar",
  department: "Cardiology", 
  date: "2025-07-08",
  time: "3:00 PM"
};

// Current format (already implemented)
function currentFormat(appointment) {
  const formattedDate = new Date(appointment.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const doctorName = appointment.doctor.startsWith('Dr. ') ? appointment.doctor : `Dr. ${appointment.doctor}`;

  return `Hello ${appointment.patientName},

Your appointment with ${doctorName} on ${formattedDate} at ${appointment.time} has been confirmed.

Please reach 10 minutes early and bring any previous reports if applicable.

Thank you,
Care Hospital`;
}

// Alternative format 1 - More detailed
function detailedFormat(appointment) {
  const formattedDate = new Date(appointment.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const doctorName = appointment.doctor.startsWith('Dr. ') ? appointment.doctor : `Dr. ${appointment.doctor}`;

  return `Hello ${appointment.patientName},

Your appointment with ${doctorName} (${appointment.department}) on ${formattedDate} at ${appointment.time} has been confirmed.

📍 Location: Care Hospital, 123 Medical Center
📞 Contact: +91 98765 43210

Please arrive 10 minutes early and bring:
• Previous medical reports
• Valid ID proof
• Insurance card (if applicable)

Thank you,
Care Hospital Team`;
}

// Alternative format 2 - Concise
function conciseFormat(appointment) {
  const formattedDate = new Date(appointment.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const doctorName = appointment.doctor.startsWith('Dr. ') ? appointment.doctor : `Dr. ${appointment.doctor}`;

  return `Hello ${appointment.patientName},

Your appointment with ${doctorName} is confirmed for ${formattedDate} at ${appointment.time}.

Please arrive 10 minutes early with any previous reports.

Care Hospital
+91 98765 43210`;
}

// Alternative format 3 - Professional with emojis
function professionalEmojiFormat(appointment) {
  const formattedDate = new Date(appointment.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const doctorName = appointment.doctor.startsWith('Dr. ') ? appointment.doctor : `Dr. ${appointment.doctor}`;

  return `Hello ${appointment.patientName},

✅ Your appointment with ${doctorName} on ${formattedDate} at ${appointment.time} has been confirmed.

📅 Please arrive 10 minutes early
📋 Bring any previous medical reports

📍 Care Hospital, 123 Medical Center
📞 +91 98765 43210

Thank you for choosing Care Hospital!`;
}

console.log("=== MESSAGE FORMAT COMPARISON ===\n");

console.log("1. CURRENT FORMAT (Already Implemented):");
console.log(currentFormat(sampleAppointment));
console.log("\n" + "=".repeat(60) + "\n");

console.log("2. DETAILED FORMAT:");
console.log(detailedFormat(sampleAppointment));
console.log("\n" + "=".repeat(60) + "\n");

console.log("3. CONCISE FORMAT:");
console.log(conciseFormat(sampleAppointment));
console.log("\n" + "=".repeat(60) + "\n");

console.log("4. PROFESSIONAL WITH EMOJIS:");
console.log(professionalEmojiFormat(sampleAppointment));
console.log("\n" + "=".repeat(60) + "\n");

console.log("RECOMMENDATION: Current format is professional and clear.");
