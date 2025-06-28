
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  Calendar, 
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
  BarChart3
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
  AppointmentData,
  PatientData,
  ContactMessage
} from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userAppointments, setUserAppointments] = useState<AppointmentData[]>([]);
  const [userContacts, setUserContacts] = useState<ContactMessage[]>([]);
  const [userPatients, setUserPatients] = useState<PatientData[]>([]);
  const [loginCredentials, setLoginCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  // Dashboard stats
  const dashboardStats = [
    {
      title: 'Total Appointments',
      value: userAppointments.length,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      change: `+${userAppointments.filter(apt => 
        new Date(apt.createdAt?.seconds * 1000).toDateString() === new Date().toDateString()
      ).length} today`
    },
    {
      title: 'Patient Records',
      value: userPatients.length,
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      change: `+${userPatients.filter(patient => 
        patient.status === 'active'
      ).length} active`
    },
    {
      title: 'Pending Messages',
      value: userContacts.filter(msg => msg.status === 'new').length,
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
      change: `${userContacts.length} total`
    },
    {
      title: 'Today\'s Activity',
      value: userAppointments.filter(apt => 
        new Date(apt.date).toDateString() === new Date().toDateString()
      ).length,
      icon: Activity,
      color: 'from-orange-500 to-orange-600',
      change: `${userAppointments.filter(apt => apt.status === 'confirmed').length} confirmed`
    }
  ];

  const filteredAppointments = userAppointments.filter(appointment =>
    appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = userContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPatients = userPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Care Hospital Admin
                </h1>
                <p className="text-sm text-gray-600 flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span>Live Dashboard • {user.email}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search across all records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80 border-gray-200 focus:border-blue-500 rounded-xl bg-white/80 backdrop-blur-sm"
                />
              </div>
              <Button variant="outline" className="border-gray-200 hover:bg-white/80 rounded-xl backdrop-blur-sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-red-200 hover:bg-red-50 rounded-xl text-red-600 hover:text-red-700 backdrop-blur-sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 group-hover:scale-110 transition-transform duration-300">{stat.value}</p>
                    <p className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stat.change}</p>
                  </div>
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-2 border-0">
            <TabsTrigger 
              value="appointments" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300 font-medium"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Appointments ({userAppointments.length})
            </TabsTrigger>
            <TabsTrigger 
              value="patients" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300 font-medium"
            >
              <Users className="w-4 h-4 mr-2" />
              Patients ({userPatients.length})
            </TabsTrigger>
            <TabsTrigger 
              value="messages" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300 font-medium"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages ({userContacts.length})
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300 font-medium"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span>Appointment Management</span>
                  </CardTitle>
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg rounded-xl">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-20">
                    <Calendar className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Appointments</h3>
                    <p className="text-gray-500">Appointments will appear here when patients book through the website</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <TableHead className="font-semibold text-gray-900">Patient Details</TableHead>
                          <TableHead className="font-semibold text-gray-900">Department & Doctor</TableHead>
                          <TableHead className="font-semibold text-gray-900">Schedule</TableHead>
                          <TableHead className="font-semibold text-gray-900">Status</TableHead>
                          <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAppointments.map((appointment) => (
                          <TableRow key={appointment.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-semibold text-gray-900">{appointment.patientName}</p>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <Mail className="w-3 h-3" />
                                  <span>{appointment.email}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <Phone className="w-3 h-3" />
                                  <span>{appointment.phone}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-semibold text-gray-900">{appointment.department}</p>
                                <p className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block">{appointment.doctor}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-semibold text-gray-900">{appointment.date}</p>
                                <p className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full inline-block">{appointment.time}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusBadge(appointment.status)} border font-medium`}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                {appointment.status === 'pending' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleUpdateAppointmentStatus(appointment.id!, 'confirmed')}
                                    className="text-green-600 border-green-200 hover:bg-green-50 rounded-lg"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                )}
                                {appointment.status === 'confirmed' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleUpdateAppointmentStatus(appointment.id!, 'completed')}
                                    className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg"
                                  >
                                    <Clock className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUpdateAppointmentStatus(appointment.id!, 'cancelled')}
                                  className="text-red-600 border-red-200 hover:bg-red-50 rounded-lg"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50/80 to-indigo-50/80 backdrop-blur-sm">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  <span>Contact Messages</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {filteredContacts.length === 0 ? (
                  <div className="text-center py-20">
                    <MessageSquare className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Messages</h3>
                    <p className="text-gray-500">Contact form submissions will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredContacts.map((contact) => (
                      <Card key={contact.id} className="border border-gray-200 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {contact.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                                  <Badge className={`${getStatusBadge(contact.status)} border text-xs mt-1`}>
                                    {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">{contact.subject}</p>
                              <div className="flex items-center space-x-6 text-sm text-gray-500">
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4" />
                                  <span>{contact.email}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4" />
                                  <span>{contact.phone}</span>
                                </div>
                              </div>
                            </div>
                            {contact.status === 'new' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleMarkMessageAsRead(contact.id!)}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Mark Read
                              </Button>
                            )}
                          </div>
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {contact.message}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-emerald-50/80 to-green-50/80 backdrop-blur-sm">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <span>Patient Records</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {filteredPatients.length === 0 ? (
                  <div className="text-center py-20">
                    <Users className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Patient Records</h3>
                    <p className="text-gray-500">Patient registrations will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <TableHead className="font-semibold text-gray-900">Patient Information</TableHead>
                          <TableHead className="font-semibold text-gray-900">Contact Details</TableHead>
                          <TableHead className="font-semibold text-gray-900">Medical Info</TableHead>
                          <TableHead className="font-semibold text-gray-900">Status</TableHead>
                          <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPatients.map((patient) => (
                          <TableRow key={patient.id} className="hover:bg-emerald-50/50 transition-colors duration-200">
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {patient.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{patient.name}</p>
                                  <p className="text-sm text-gray-500">{patient.age} years, {patient.gender}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm">
                                  <Mail className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-600">{patient.email}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <Phone className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-600">{patient.phone}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-gray-600 max-w-32 truncate" title={patient.medicalHistory}>
                                {patient.medicalHistory || 'No history'}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusBadge(patient.status)} border font-medium`}>
                                {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" className="rounded-lg hover:bg-blue-50">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="rounded-lg hover:bg-emerald-50">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-50/80 to-red-50/80 backdrop-blur-sm">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    <span>Appointment Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {userAppointments.length}
                    </div>
                    <p className="text-gray-600">Total Appointments</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 backdrop-blur-sm">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    <span>Quick Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {userContacts.length}
                    </div>
                    <p className="text-gray-600">Total Messages</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
