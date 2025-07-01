// Simple test to check Cloudinary upload presets
async function testCloudinaryPresets() {
  const cloudName = 'dopo6gjfq';
  const presets = ['care_hospital', 'ml_default', 'unsigned_default', 'default'];
  
  console.log('Testing Cloudinary upload presets...\n');
  
  for (const preset of presets) {
    try {
      // Create a simple test FormData (this won't actually upload, just test the preset exists)
      const formData = new FormData();
      formData.append('upload_preset', preset);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      const result = await response.text();
      console.log(`✅ Preset '${preset}': ${response.status} - ${response.ok ? 'Available' : 'May have issues'}`);
      
      if (!response.ok) {
        try {
          const errorData = JSON.parse(result);
          console.log(`   Error: ${errorData.error?.message || 'Unknown error'}`);
        } catch {
          console.log(`   Raw response: ${result.substring(0, 100)}...`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Preset '${preset}': ${error.message}`);
    }
    console.log('');
  }
}

// Real-time listeners
export const listenToAppointments = (callback) => {
  const q = query(collection(db, COLLECTIONS.APPOINTMENTS), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(appointments);
  });
};

export const listenToPatients = (callback) => {
  const q = query(collection(db, COLLECTIONS.USERS), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const patients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(patients);
  });
};

export const listenToContactMessages = (callback) => {
  const q = query(collection(db, COLLECTIONS.CONTACT_MESSAGES), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};

// Run the test
testCloudinaryPresets();
