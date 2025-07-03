import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import NotificationPreferences from '@/components/NotificationPreferences';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar'; // Renamed to avoid conflict
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Phone, Mail, MapPin, CreditCard, CheckCircle, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitAppointment, AppointmentData, getDoctors, Doctor, getUserData } from '@/services/firebase';
import { sendAppointmentNotification } from '@/services/whatsapp';
// If you're using Firebase Auth
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// If you're using a different auth solution, you'll need to adjust this import
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { user, loading };
}

// Define available time slots for appointments
const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", 
  "5:00 PM", "6:00 PM", "7:00 PM"
];

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [scheduleReminder, setScheduleReminder] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: '',
    department: '',
    doctor: '',
    symptoms: '',
    preferredLanguage: 'english'
  });
  
  // Add a state to track if profile data has been loaded
  const [profileLoaded, setProfileLoaded] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Add this ref to track if toast has been shown
  const toastShownRef = React.useRef(false);

  // State for dynamically loaded data
  const [loadedDepartments, setLoadedDepartments] = useState<string[]>([]);
  const [loadedDoctors, setLoadedDoctors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load departments and doctors from Firebase
  useEffect(() => {
    const loadDoctorsData = async () => {
      try {
        setIsLoading(true);
        const doctorsData = await getDoctors();
        
        // Extract unique departments
        const departments = Array.from(new Set(doctorsData.map(doc => doc.specialty))).filter(Boolean);
        setLoadedDepartments(departments as string[]);
        
        // Group doctors by department
        const doctorsByDepartment: Record<string, string[]> = {};
        doctorsData.forEach(doctor => {
          if (doctor.specialty && doctor.name) {
            if (!doctorsByDepartment[doctor.specialty]) {
              doctorsByDepartment[doctor.specialty] = [];
            }
            doctorsByDepartment[doctor.specialty].push(doctor.name);
          }
        });
        setLoadedDoctors(doctorsByDepartment);
        
      } catch (error) {
        console.error("Error loading doctors data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDoctorsData();
  }, []);

  // Use the loaded departments or fallback to a default list
  const departments = loadedDepartments.length > 0 
    ? loadedDepartments 
    : ['General Medicine', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Ophthalmology'];

  // Use loaded doctors or empty array for the selected department
  const doctors = formData.department && loadedDoctors[formData.department]
    ? loadedDoctors[formData.department]
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !formData.name || !formData.phone || !formData.department) {
      toast({
        title: "Please fill all required fields",
        description: "All mandatory fields must be completed",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const appointmentData: Omit<AppointmentData, 'id' | 'createdAt' | 'updatedAt'> = {
        patientName: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        doctor: formData.doctor || `Any available doctor in ${formData.department}`,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        message: formData.symptoms,
        status: 'pending'
      };

      // Include user ID in the appointment data if available
      if (user?.uid) {
        appointmentData.userId = user.uid;
      }
      await submitAppointment(appointmentData);
      // Generate a reference ID since submitAppointment doesn't return a value
      const appointmentReference = `REF${Math.floor(100000 + Math.random() * 900000)}`;

      // Send notifications if enabled
      if (whatsappEnabled || smsEnabled) {
        try {
          const notificationData = {
            patientName: formData.name,
            doctorName: formData.doctor || `Available doctor in ${formData.department}`,
            department: formData.department,
            date: selectedDate.toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            time: selectedTime,
            phone: formData.phone,
            appointmentId: appointmentReference, // Add appointment ID to the notification
            messageType: 'confirmation' as const
          };

          const notificationResult = await sendAppointmentNotification(
            notificationData, 
            whatsappEnabled, 
            smsEnabled,
            scheduleReminder
          );

          if (notificationResult.success) {
            let confirmationMessage = `Your appointment has been confirmed (ID: ${appointmentReference}).`;
            
            // Build notification message
            if (whatsappEnabled && notificationResult.whatsapp?.success) {
              confirmationMessage += ' Confirmation sent via WhatsApp';
              if (smsEnabled && notificationResult.sms?.success) confirmationMessage += ' and SMS';
              confirmationMessage += '.';
            } else if (smsEnabled && notificationResult.sms?.success) {
              confirmationMessage += ' Confirmation sent via SMS.';
            }
            
            // Add reminder info if scheduled
            if (scheduleReminder && notificationResult.reminder?.success) {
              confirmationMessage += ` A reminder will be sent 24 hours before your appointment.`;
            }
            toast({
              title: "Appointment Booked Successfully! 🎉",
              description: confirmationMessage,
            });
          } else {
            toast({
              title: "Appointment Booked Successfully!",
              description: `Your appointment has been submitted (ID: ${appointmentReference}). However, there was an issue sending notifications. Our team will contact you shortly.`,
              variant: "default"
            });
          }
        } catch (notificationError) {
          toast({
            title: "Appointment Booked Successfully!",
            description: `Your appointment has been submitted (ID: ${appointmentReference}). Our team will contact you shortly for confirmation.`,
          });
        }
      } else {
        toast({
          title: "Appointment Booked Successfully!",
          description: `Your appointment has been submitted (ID: ${appointmentReference}). Our team will contact you shortly for confirmation.`,
        });
      }

      // Reset form
      setFormData({
        name: '', phone: '', email: '', age: '', gender: '', 
        department: '', doctor: '', symptoms: '', preferredLanguage: 'english'
      });
      setSelectedDate(undefined);
      setSelectedTime('');

    } catch (error) {
      console.error('Error submitting appointment:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error submitting your appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update: Get both department and doctor from URL query parameters with fixed dependency array
  React.useEffect(() => {
    // Only run this effect if the toast hasn't been shown yet
    if (toastShownRef.current) return;
    
    const params = new URLSearchParams(window.location.search);
    const departmentParam = params.get('department');
    const doctorParam = params.get('doctor');
    
    let updatedFormData = {...formData};
    let showToast = false;
    let dataChanged = false;
    
    if (departmentParam) {
      // Find the closest match in our department list
      const matchedDepartment = departments.find(dept => 
        dept.toLowerCase().includes(departmentParam.toLowerCase()) ||
        departmentParam.toLowerCase().includes(dept.toLowerCase())
      );
      
      if (matchedDepartment && formData.department !== matchedDepartment) {
        updatedFormData.department = matchedDepartment;
        showToast = true;
        dataChanged = true;
      }
    }
    
    if (doctorParam && updatedFormData.department) {
      // Only set doctor if we have a valid department
      // Cast to string array to ensure find() is available
      const availableDoctors = (doctors[updatedFormData.department] || []) as string[];
      const matchedDoctor = availableDoctors.find(doctor => 
        doctor.toLowerCase().includes(doctorParam.toLowerCase()) ||
        doctorParam.toLowerCase().includes(doctor.toLowerCase())
      );
      
      if (matchedDoctor && formData.doctor !== matchedDoctor) {
        updatedFormData.doctor = matchedDoctor;
        dataChanged = true;
      }
    }
    
    if (dataChanged) {
      setFormData(updatedFormData);
    }
    
    if (showToast) {
      toast({
        title: "Information Pre-filled",
        description: doctorParam && updatedFormData.doctor
          ? `We've selected ${updatedFormData.department} department with ${updatedFormData.doctor}.`
          : `Based on your selection, we've selected the ${updatedFormData.department} department.`,
        className: "bg-blue-50 border-blue-200"
      });
      
      // Mark toast as shown to prevent future toasts
      toastShownRef.current = true;
    }
  }, [departments, doctors, formData, toast]);

  // Fetch user profile data when component mounts if user is logged in
  useEffect(() => {
    const loadUserProfile = async () => {
      // Only proceed if user is logged in and profile hasn't been loaded yet
      if (user?.uid && !profileLoaded) {
        try {
          const userData = await getUserData(user.uid);
          
          if (userData) {
            // Only update form if we actually have user data
            setFormData(prevData => ({
              ...prevData,
              // Auto-fill personal information fields only
              name: userData.name || prevData.name,
              phone: userData.phone || prevData.phone,
              email: userData.email || prevData.email,
              age: userData.age ? String(userData.age) : prevData.age,
              gender: userData.gender || prevData.gender
              // We intentionally don't auto-fill department, doctor, symptoms
            }));
            
            // Show a toast notification to inform the user
            toast({
              title: "Profile Information Auto-filled",
              description: "We've filled in some information from your profile.",
              className: "bg-blue-50 border-blue-200"
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // Don't show an error toast - silent failure is better here
        } finally {
          // Mark profile as loaded to prevent repeated fetches
          setProfileLoaded(true);
        }
      }
    };
    
    loadUserProfile();
  }, [user, profileLoaded, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-r from-orange-600 to-green-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Book Your Appointment
            </h1>
            <p className="text-xl text-orange-100 leading-relaxed">
              Schedule your consultation with our expert doctors. 
              Easy booking process with instant confirmation.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-green-500 text-white">
                  <CardTitle className="text-2xl flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Appointment
                    {user && (
                      <Badge className="ml-auto bg-white/20 text-white">
                        <UserIcon className="w-3 h-3 mr-1" />
                        Profile Linked
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Personal Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Enter your full name"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="+91 XXXXX XXXXX"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="your.email@example.com"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData({...formData, age: e.target.value})}
                          placeholder="25"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label>Gender</Label>
                        <Select 
                          value={formData.gender} 
                          onValueChange={(value) => setFormData({...formData, gender: value})}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Department and Doctor */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Department *</Label>
                        <Select 
                          value={formData.department} 
                          onValueChange={(value) => setFormData({...formData, department: value, doctor: ''})}
                          disabled={isSubmitting || isLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoading ? (
                              <SelectItem value="loading" disabled>Loading departments...</SelectItem>
                            ) : (
                              departments.map((dept) => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Doctor (Optional)</Label>
                        <Select 
                          value={formData.doctor} 
                          onValueChange={(value) => setFormData({...formData, doctor: value})}
                          disabled={!formData.department || isSubmitting || isLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any available doctor" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoading ? (
                              <SelectItem value="loading" disabled>Loading doctors...</SelectItem>
                            ) : (
                              doctors.map((doctor) => (
                                <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Language Preference */}
                    <div>
                      <Label>Preferred Language</Label>
                      <Select 
                        value={formData.preferredLanguage} 
                        onValueChange={(value) => setFormData({...formData, preferredLanguage: value})}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hindi">Hindi</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="bengali">Bengali</SelectItem>
                          <SelectItem value="tamil">Tamil</SelectItem>
                          <SelectItem value="telugu">Telugu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Symptoms */}
                    <div>
                      <Label htmlFor="symptoms">Symptoms / Reason for Visit</Label>
                      <Textarea
                        id="symptoms"
                        value={formData.symptoms}
                        onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                        placeholder="Describe your symptoms or reason for visit..."
                        rows={3}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Date Selection */}
                    <div>
                      <Label>Select Date *</Label>
                      <div className="mt-2">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date() || date.getDay() === 0 || isSubmitting}
                          className="rounded-md border shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Time Selection */}
                    {selectedDate && (
                      <div>
                        <Label>Select Time *</Label>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
                          {timeSlots.map((time) => (
                            <Button
                              key={time}
                              type="button"
                              variant={selectedTime === time ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedTime(time)}
                              className={selectedTime === time ? "bg-gradient-to-r from-orange-500 to-green-500" : ""}
                              disabled={isSubmitting}
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white py-3 text-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Booking...' : 'Book Appointment'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Notification Preferences */}
              <NotificationPreferences
                whatsappEnabled={whatsappEnabled}
                smsEnabled={smsEnabled}
                reminderEnabled={scheduleReminder}
                onWhatsAppChange={setWhatsappEnabled}
                onSMSChange={setSmsEnabled}
                onReminderChange={setScheduleReminder}
              />
              
              {/* Contact Card */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-semibold">Emergency: 102</div>
                      <div className="text-sm text-gray-600">Appointments: +91 98765 43210</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div className="text-sm">appointments@carehospital.in</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <div className="text-sm">123 Medical Center, New Delhi - 110001</div>
                  </div>
                </CardContent>
              </Card>

              {/* Timings Card */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                  <CardTitle>Hospital Timings</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span>OPD Hours:</span>
                    <span className="font-semibold">9:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emergency:</span>
                    <Badge className="bg-red-500">24/7 Open</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Lab Services:</span>
                    <span className="font-semibold">7:00 AM - 10:00 PM</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <CardTitle>Payment Options</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm">Cash / Card / UPI</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Insurance: CGHS, ECHS, Cashless available
                  </div>
                  <Badge className="bg-green-100 text-green-800">Consultation: ₹200 onwards</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Appointments;
