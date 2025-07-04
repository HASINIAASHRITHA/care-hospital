import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Search, 
  Filter,
  Download,
  Eye,
  Edit,
  Check,
  X,
  Clock,
  LogOut,
  Shield,
  Mail,
  Phone,
  Activity,
  BarChart3,
  Send,
  Trash2,
  UserPlus,
  AlertTriangle,
  UserCog,
  CalendarClock,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  signInAdmin, 
  signOutAdmin,
  listenToAppointments,
  listenToPatients,
  listenToContactMessages,
  updateAppointment,
  updateContactMessageStatus,
  PatientData,
  ContactMessage,
  updatePatient,
  deletePatient,
  createPatient
} from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { sendWhatsAppMessage } from '@/services/whatsapp';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DoctorManagement } from '@/components/admin/DoctorManagement';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// New imports for date picker
import { DayPicker } from 'react-day-picker';
import { parseISO, formatISO } from 'date-fns';

// Update the appointment interface to include source and whatsapp fields
export interface AppointmentData {
  id?: string;
  patientName: string;
  email: string;
  phone: string;
  doctor: string;
  department: string;
  date: string;
  time: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'pending';
  createdAt?: any;
  whatsappSent?: boolean;
  lastCommunication?: string;
  source?: 'website' | 'office' | 'phone' | 'unknown';
}

// Utility function to format phone number for WhatsApp
const formatPhoneForWhatsApp = (phone: string): string => {
  // Remove any non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Add country code if it's missing (assuming India +91)
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  
  return cleaned;
};

// Utility function to create professional appointment confirmation message
const createProfessionalMessage = (appointment: AppointmentData): string => {
  const formattedDate = new Date(appointment.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Remove "Dr." prefix if it already exists in the doctor name
  const doctorName = appointment.doctor.startsWith('Dr. ') ? appointment.doctor : `Dr. ${appointment.doctor}`;

  return `Hello ${appointment.patientName},

Your appointment with Dr. ${doctorName} on ${formattedDate} at ${appointment.time} has been confirmed.

Please reach 10 minutes early and bring any previous reports if applicable.

Thank you,
Care Hospital`;
};

// Make sure all optional fields are included in update operations
type AppointmentUpdateData = Partial<AppointmentData>;

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userAppointments, setUserAppointments] = useState<AppointmentData[]>([]);
  const [userContacts, setUserContacts] = useState<ContactMessage[]>([]);
  const [userPatients, setUserPatients] = useState<PatientData[]>([]);
  const [loginCredentials, setLoginCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState<{[key: string]: boolean}>({});
  
  // Patient management state
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [patientViewOpen, setPatientViewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<PatientData | null>(null);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [isSubmittingPatient, setIsSubmittingPatient] = useState(false);
  const [patientFormData, setPatientFormData] = useState<Partial<PatientData>>({
    name: '',
    email: '',
    phone: '',
    age: undefined,
    gender: '',
    address: '',
    emergencyContact: '',
    medicalHistory: '',
    status: 'active'
  });
  
  // Appointment management state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<AppointmentData | null>(null);
  const [newAppointmentDate, setNewAppointmentDate] = useState<Date | undefined>(undefined);
  const [newAppointmentTime, setNewAppointmentTime] = useState<string>('');
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);
  
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize filteredData early to ensure consistent hook ordering
  const filteredData = useMemo(() => ({
    appointments: userAppointments.filter(appointment =>
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.department.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    contacts: userContacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    patients: userPatients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }), [userAppointments, userContacts, userPatients, searchTerm]);

  // Get unique doctors for filtering - move before any conditional logic
  const uniqueDoctors = useMemo(() => {
    const doctorSet = new Set<string>();
    userAppointments.forEach(appointment => {
      if (appointment.doctor) {
        doctorSet.add(appointment.doctor);
      }
    });
    return Array.from(doctorSet);
  }, [userAppointments]);

  // Apply filters to appointments - move before any conditional logic
  const filteredAppointments = useMemo(() => {
    return filteredData.appointments.filter(appointment => {
      // Status filter
      if (statusFilter !== 'all' && appointment.status !== statusFilter) {
        return false;
      }
      
      // Doctor filter
      if (doctorFilter !== 'all' && appointment.doctor !== doctorFilter) {
        return false;
      }
      
      // Source filter
      if (sourceFilter !== 'all' && appointment.source !== sourceFilter) {
        return false;
      }
      
      // Date filter
      if (dateFilter && appointment.date) {
        try {
          const appointmentDate = new Date(appointment.date);
          const filterDate = new Date(dateFilter);
          if (
            appointmentDate.getDate() !== filterDate.getDate() ||
            appointmentDate.getMonth() !== filterDate.getMonth() ||
            appointmentDate.getFullYear() !== filterDate.getFullYear()
          ) {
            return false;
          }
        } catch (e) {
          console.error('Error comparing dates:', e);
        }
      }
      
      return true;
    });
  }, [filteredData.appointments, statusFilter, doctorFilter, dateFilter, sourceFilter]);

  console.log('Admin page state:', { user: !!user, isAdmin, loading });

  // Real-time listeners for admin data
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time listeners...');

    const unsubscribeAppointments = listenToAppointments((appointments) => {
      console.log('Received appointments:', appointments.length);
      setUserAppointments(appointments as AppointmentData[]);
    });

    const unsubscribePatients = listenToPatients((patients) => {
      console.log('Received patients:', patients.length);
      setUserPatients(patients as PatientData[]);
    });

    const unsubscribeMessages = listenToContactMessages((messages) => {
      console.log('Received messages:', messages.length);
      setUserContacts(messages as ContactMessage[]);
    });

    return () => {
      unsubscribeAppointments();
      unsubscribePatients();
      unsubscribeMessages();
    };
  }, [user]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting admin login...');
      await signInAdmin(loginCredentials.email, loginCredentials.password);
      
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard",
        className: "bg-green-50 border-green-200"
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutAdmin();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out"
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "There was an error logging out",
        variant: "destructive"
      });
    }
  };
  
  // Patient management functions
  const openNewPatientDialog = () => {
    setIsNewPatient(true);
    setPatientFormData({
      name: '',
      email: '',
      phone: '',
      age: undefined,
      gender: '',
      address: '',
      emergencyContact: '',
      medicalHistory: '',
      status: 'active'
    });
    setPatientDialogOpen(true);
  };
  
  const openViewPatientDialog = (patient: PatientData) => {
    setCurrentPatient(patient);
    setPatientViewOpen(true);
  };
  
  const openEditPatientDialog = (patient: PatientData) => {
    setIsNewPatient(false);
    setCurrentPatient(patient);
    setPatientFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender,
      address: patient.address,
      emergencyContact: patient.emergencyContact,
      medicalHistory: patient.medicalHistory,
      status: patient.status
    });
    setPatientDialogOpen(true);
  };
  
  const openDeleteConfirmation = (patient: PatientData) => {
    setCurrentPatient(patient);
    setDeleteDialogOpen(true);
  };
  
  const handlePatientFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmittingPatient(true);
    
    try {
      if (isNewPatient) {
        await createPatient(
          patientFormData as PatientData
        );
        toast({
          title: "Patient Created",
          description: "New patient record has been created successfully",
          className: "bg-green-50 border-green-200"
        });
      } else if (currentPatient?.id) {
        await updatePatient(currentPatient.id, patientFormData, user.uid);
        toast({
          title: "Patient Updated",
          description: "Patient information has been updated successfully",
          className: "bg-blue-50 border-blue-200"
        });
      }
      setPatientDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Operation Failed",
        description: error.message || "There was an error processing your request",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingPatient(false);
    }
  };
  
  const handleDeletePatient = async () => {
    if (!user || !currentPatient?.id) return;
    
    try {
      await deletePatient(currentPatient.id, user.uid);
      setDeleteDialogOpen(false);
      toast({
        title: "Patient Deleted",
        description: "Patient record has been deleted successfully",
        className: "bg-blue-50 border-blue-200"
      });
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "There was an error deleting the patient",
        variant: "destructive"
      });
    }
  };
  
  // Appointment management functions
  const openRescheduleModal = (appointment: AppointmentData) => {
    setCurrentAppointment(appointment);
    if (appointment.date) {
      try {
        const date = parseISO(appointment.date);
        setNewAppointmentDate(date);
      } catch (e) {
        setNewAppointmentDate(undefined);
      }
    }
    setNewAppointmentTime(appointment.time || '');
    setIsRescheduleModalOpen(true);
  };
  
  const handleRescheduleAppointment = async () => {
    if (!user || !currentAppointment?.id || !newAppointmentDate || !newAppointmentTime) return;
    
    setIsSubmittingReschedule(true);
    
    try {
      const formattedDate = format(newAppointmentDate, 'yyyy-MM-dd');
      await updateAppointment(currentAppointment.id, {
        date: formattedDate,
        time: newAppointmentTime
      }, user.uid);
      
      setIsRescheduleModalOpen(false);
      toast({
        title: "Appointment Rescheduled",
        description: `Appointment for ${currentAppointment.patientName} has been rescheduled`,
        className: "bg-green-50 border-green-200"
      });
    } catch (error: any) {
      toast({
        title: "Reschedule Failed",
        description: error.message || "There was an error rescheduling the appointment",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    if (!user) return;

    try {
      await updateAppointment(id, { status }, user.uid);
      toast({
        title: "Status Updated",
        description: `Appointment status changed to ${status}`,
        className: "bg-blue-50 border-blue-200"
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update appointment status",
        variant: "destructive"
      });
    }
  };

  const handleMarkMessageAsRead = async (id: string) => {
    if (!user) return;

    try {
      await updateContactMessageStatus(id, 'read', user.uid);
      toast({
        title: "Message Marked as Read",
        description: "Message status updated successfully",
        className: "bg-green-50 border-green-200"
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update message status",
        variant: "destructive"
      });
    }
  };

  const handleSendWhatsAppMessage = async (appointment: AppointmentData) => {
    if (!appointment.id || !appointment.phone) {
      toast({
        title: "Missing Information",
        description: "Phone number is required to send WhatsApp message.",
        variant: "destructive"
      });
      return;
    }
    
    // Set loading state for this specific appointment
    setSendingWhatsApp(prev => ({ ...prev, [appointment.id!]: true }));
    
    try {
      // Validate phone number format
      const phoneValidation = /^[\d\s\-\+\(\)]+$/.test(appointment.phone);
      if (!phoneValidation) {
        throw new Error('Invalid phone number format');
      }
      
      // Create a professional appointment confirmation message
      const professionalMessage = createProfessionalMessage(appointment);
      
      // Format phone number for WhatsApp
      const cleanedPhone = formatPhoneForWhatsApp(appointment.phone);
      
      // Validate cleaned phone number
      if (cleanedPhone.length < 10) {
        throw new Error('Phone number appears to be too short');
      }
      
      // Open WhatsApp Web with the professional message
      const encodedMessage = encodeURIComponent(professionalMessage);
      const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
      
      console.log('Opening WhatsApp with URL:', whatsappUrl);
      window.open(whatsappUrl, '_blank');
      
      // Mark the appointment as having WhatsApp sent
      await updateAppointment(appointment.id, { 
        whatsappSent: true, 
        lastCommunication: new Date().toISOString()
      } as Partial<AppointmentData>, user.uid);
      
      toast({
        title: "WhatsApp Opened",
        description: `Professional confirmation message prepared for ${appointment.patientName}. Please send the message from your WhatsApp.`,
        className: "bg-green-50 border-green-200"
      });
      
    } catch (error) {
      console.error('WhatsApp preparation error:', error);
      toast({
        title: "Message Preparation Failed",
        description: error instanceof Error ? error.message : "Could not prepare WhatsApp message. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Clear loading state
      setSendingWhatsApp(prev => ({ ...prev, [appointment.id!]: false }));
    }
  };
  
  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-amber-50 text-amber-800 border-amber-200',
      confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      completed: 'bg-blue-50 text-blue-800 border-blue-200',
      cancelled: 'bg-red-50 text-red-800 border-red-200',
      new: 'bg-blue-50 text-blue-800 border-blue-200',
      read: 'bg-gray-50 text-gray-800 border-gray-200',
      replied: 'bg-green-50 text-green-800 border-green-200',
      active: 'bg-green-50 text-green-800 border-green-200',
      inactive: 'bg-gray-50 text-gray-800 border-gray-200'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-50 text-gray-800 border-gray-200';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Loading Dashboard</h3>
            <p className="text-gray-600">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  // Login form for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
            <CardHeader className="space-y-4 pb-8">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Admin Portal
                </CardTitle>
                <p className="text-gray-600">Secure access to hospital management</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <form onSubmit={handleAdminLogin} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={loginCredentials.email}
                    onChange={(e) => setLoginCredentials({...loginCredentials, email: e.target.value})}
                    placeholder="Enter your admin email"
                    required
                    disabled={isLoading}
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={loginCredentials.password}
                    onChange={(e) => setLoginCredentials({...loginCredentials, password: e.target.value})}
                    placeholder="Enter your secure password"
                    required
                    disabled={isLoading}
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Secure Login</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main dashboard UI for authenticated admin users
  return (
    <div className="container mx-auto px-4 py-10 mt-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <Input
            type="search"
            placeholder="Search patients, appointments, messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 h-12 rounded-xl bg-white border border-gray-200"
          />
        </div>
      </div>
      
      <Tabs defaultValue="doctors" className="space-y-6">
        <TabsList className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-4">
          <TabsTrigger value="doctors" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span>Doctors</span>
          </TabsTrigger>
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Patients</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            <span>Appointments</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Messages</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Doctors Tab */}
        <TabsContent value="doctors" className="space-y-4">
          <DoctorManagement />
        </TabsContent>
        
        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Patient Management</CardTitle>
              <Button className="bg-gradient-to-r from-blue-600 to-emerald-600" onClick={openNewPatientDialog}>
                <UserPlus className="mr-2 h-4 w-4" /> Add Patient
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Age/Gender</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.patients.length > 0 ? (
                      filteredData.patients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">{patient.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <Mail className="h-3 w-3 mr-1 text-gray-500" />
                                <span className="text-sm">{patient.email}</span>
                              </div>
                              <div className="flex items-center mt-1">
                                <Phone className="h-3 w-3 mr-1 text-gray-500" />
                                <span className="text-sm">{patient.phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <span>{patient.age}</span>
                              <span className="text-gray-500">/</span>
                              <span>{patient.gender}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(patient.status)}>
                              {patient.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="ghost" onClick={() => openViewPatientDialog(patient)}>
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => openEditPatientDialog(patient)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => openDeleteConfirmation(patient)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          {searchTerm ? "No patients match your search criteria" : "No patients found in the system"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Management</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Filter by Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Filter by Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFilter ? format(dateFilter, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFilter}
                        onSelect={(date) => setDateFilter(date)}
                        initialFocus
                      />
                      {dateFilter && (
                        <div className="p-2 border-t flex justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDateFilter(undefined)}
                          >
                            Clear
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Filter by Doctor</label>
                  <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Doctors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Doctors</SelectItem>
                      {uniqueDoctors.map((doctor, index) => (
                        <SelectItem key={index} value={doctor}>
                          {doctor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Filter by Source</label>
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((appointment) => (
                        <TableRow key={appointment.id} className={appointment.status === 'pending' ? 'bg-amber-50/30' : ''}>
                          <TableCell>
                            <div className="font-medium">{appointment.patientName}</div>
                            <div className="text-xs text-gray-500">{appointment.email}</div>
                            <div className="text-xs text-gray-500">{appointment.phone}</div>
                          </TableCell>
                          <TableCell>{appointment.doctor}</TableCell>
                          <TableCell>{appointment.department}</TableCell>
                          <TableCell>
                            <div className="font-medium">{appointment.date}</div>
                            <div className="text-xs text-gray-500">{appointment.time}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${
                              appointment.source === 'website' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              appointment.source === 'office' ? 'bg-green-100 text-green-800 border-green-200' :
                              appointment.source === 'phone' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                              {appointment.source || 'unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-2">
                              {appointment.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="w-full text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                                  onClick={() => appointment.id && handleUpdateAppointmentStatus(appointment.id, 'confirmed')}
                                >
                                  <Check className="h-3 w-3 mr-1" /> Approve
                                </Button>
                              )}
                              
                              {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="w-full text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                  onClick={() => openRescheduleModal(appointment)}
                                >
                                  <CalendarClock className="h-3 w-3 mr-1" /> Reschedule
                                </Button>
                              )}
                              
                              {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="w-full text-xs bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                  onClick={() => appointment.id && handleUpdateAppointmentStatus(appointment.id, 'cancelled')}
                                >
                                  <X className="h-3 w-3 mr-1" /> Cancel
                                </Button>
                              )}
                              
                              {appointment.status === 'confirmed' && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="w-full text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                                  onClick={() => appointment.id && handleUpdateAppointmentStatus(appointment.id, 'completed')}
                                >
                                  <Clock className="h-3 w-3 mr-1" /> Mark Completed
                                </Button>
                              )}
                              
                              {/* Send Confirmation Message Button - Only for confirmed appointments */}
                              {appointment.status === 'confirmed' && appointment.phone && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className={`w-full text-xs font-medium ${
                                    appointment.whatsappSent 
                                      ? 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200 shadow-sm' 
                                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 shadow-sm hover:shadow-md'
                                  }`}
                                  onClick={() => handleSendWhatsAppMessage(appointment)}
                                  disabled={sendingWhatsApp[appointment.id || ''] || false}
                                  title={appointment.whatsappSent ? 'Message already sent - click to resend' : 'Send professional confirmation message via WhatsApp'}
                                >
                                  {sendingWhatsApp[appointment.id || ''] ? (
                                    <>
                                      <div className="h-3 w-3 border-t-2 border-blue-600 rounded-full animate-spin mr-2"></div>
                                      Preparing...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="h-3 w-3 mr-1" /> 
                                      {appointment.whatsappSent ? 'Resend Message' : 'Send Confirmation Message'}
                                    </>
                                  )}
                                </Button>
                              )}
                              
                              {/* Show message sent status */}
                              {appointment.whatsappSent && (
                                <div className="text-xs text-green-600 text-center py-1 bg-green-50 rounded-md border border-green-200">
                                  ✓ Message sent {appointment.lastCommunication && new Date(appointment.lastCommunication).toLocaleDateString('en-IN')}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                          {searchTerm || statusFilter !== 'all' || doctorFilter !== 'all' || dateFilter 
                            ? "No appointments match your filter criteria" 
                            : "No appointments found in the system"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sender</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.contacts.length > 0 ? (
                      filteredData.contacts.map((message) => (
                        <TableRow key={message.id} className={message.status === 'new' ? 'bg-blue-50' : ''}>
                          <TableCell>
                            <div className="font-medium">{message.name}</div>
                            <div className="text-xs text-gray-500">{message.email}</div>
                          </TableCell>
                          <TableCell>{message.subject}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate">{message.message}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-gray-500">
                              {message.createdAt?.toDate 
                                ? message.createdAt.toDate().toLocaleString() 
                                : "Unknown date"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(message.status)}>
                              {message.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost" onClick={() => message.id && handleMarkMessageAsRead(message.id)}>
                                <Check className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                          {searchTerm ? "No messages match your search criteria" : "No contact messages found in the system"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Patient View Dialog */}
      <Dialog open={patientViewOpen} onOpenChange={setPatientViewOpen}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
          </DialogHeader>
          {currentPatient && (
            <div className="grid gap-6">
              <div className="flex items-center">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-semibold">
                  {currentPatient.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold">{currentPatient.name}</h3>
                  <Badge className={getStatusBadge(currentPatient.status)}>{currentPatient.status}</Badge>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{currentPatient.email || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Phone</p>
                  <p>{currentPatient.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Age</p>
                  <p>{currentPatient.age || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Gender</p>
                  <p>{currentPatient.gender || 'Not provided'}</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p>{currentPatient.address || 'Not provided'}</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm text-gray-500">Emergency Contact</p>
                  <p>{currentPatient.emergencyContact || 'Not provided'}</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm text-gray-500">Medical History</p>
                  <p className="whitespace-pre-line">{currentPatient.medicalHistory || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Patient Edit/Add Dialog */}
      <Dialog open={patientDialogOpen} onOpenChange={setPatientDialogOpen}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{isNewPatient ? "Add New Patient" : "Edit Patient"}</DialogTitle>
            <DialogDescription>
              {isNewPatient ? "Enter the details of the new patient." : "Update patient information."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handlePatientFormSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input 
                  id="name" 
                  value={patientFormData.name || ''} 
                  onChange={(e) => setPatientFormData({...patientFormData, name: e.target.value})}
                  placeholder="Full Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={patientFormData.email || ''} 
                  onChange={(e) => setPatientFormData({...patientFormData, email: e.target.value})}
                  placeholder="Email Address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input 
                  id="phone" 
                  value={patientFormData.phone || ''} 
                  onChange={(e) => setPatientFormData({...patientFormData, phone: e.target.value})}
                  placeholder="Phone Number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  type="number"
                  value={patientFormData.age || ''} 
                  onChange={(e) => setPatientFormData({...patientFormData, age: parseInt(e.target.value) || undefined})}
                  placeholder="Age"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={patientFormData.gender || ''} 
                  onValueChange={(value) => setPatientFormData({...patientFormData, gender: value})}
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
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={patientFormData.status || 'active'} 
                  onValueChange={(value) => setPatientFormData({...patientFormData, status: value as 'active' | 'inactive'})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  value={patientFormData.address || ''} 
                  onChange={(e) => setPatientFormData({...patientFormData, address: e.target.value})}
                  placeholder="Address"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input 
                  id="emergencyContact" 
                  value={patientFormData.emergencyContact || ''} 
                  onChange={(e) => setPatientFormData({...patientFormData, emergencyContact: e.target.value})}
                  placeholder="Emergency Contact"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="medicalHistory">Medical History</Label>
                <Textarea 
                  id="medicalHistory" 
                  value={patientFormData.medicalHistory || ''} 
                  onChange={(e) => setPatientFormData({...patientFormData, medicalHistory: e.target.value})}
                  placeholder="Medical history, allergies, past treatments, etc."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setPatientDialogOpen(false)}
                disabled={isSubmittingPatient}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-emerald-600"
                disabled={isSubmittingPatient}
              >
                {isSubmittingPatient ? (
                  <span className="flex items-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                    Saving...
                  </span>
                ) : (
                  isNewPatient ? "Add Patient" : "Update Patient"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the patient record for {currentPatient?.name}. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeletePatient}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Reschedule Appointment Dialog */}
      <Dialog open={isRescheduleModalOpen} onOpenChange={setIsRescheduleModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              {currentAppointment && `Reschedule appointment for ${currentAppointment.patientName}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appointment-date">New Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="appointment-date"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newAppointmentDate ? format(newAppointmentDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newAppointmentDate}
                    onSelect={(date) => setNewAppointmentDate(date)}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appointment-time">New Time</Label>
              <Select value={newAppointmentTime} onValueChange={setNewAppointmentTime}>
                <SelectTrigger id="appointment-time" className="w-full">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', 
                    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
                    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
                  ].map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRescheduleModalOpen(false)}
              disabled={isSubmittingReschedule}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRescheduleAppointment}
              disabled={!newAppointmentDate || !newAppointmentTime || isSubmittingReschedule}
              className="bg-gradient-to-r from-blue-600 to-blue-700"
            >
              {isSubmittingReschedule ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                  Saving...
                </>
              ) : (
                'Reschedule Appointment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Debug Panel - Admin Only (optional) */}
      {userAppointments.length > 0 && isAdmin && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium mb-2">Appointment Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Total:</span> {userAppointments.length}
            </div>
            <div>
              <span className="text-gray-500">Website:</span> {userAppointments.filter(a => a.source === 'website').length}
            </div>
            <div>
              <span className="text-gray-500">Office:</span> {userAppointments.filter(a => a.source === 'office').length}
            </div>
            <div>
              <span className="text-gray-500">Unknown:</span> {userAppointments.filter(a => !a.source).length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;