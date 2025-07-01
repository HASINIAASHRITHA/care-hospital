import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Download, Clock, User, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { getUserAppointments, getUserData } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';

const Portal = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ phone: '', otp: '' });
  const [showOTP, setShowOTP] = useState(false);
  const [userAppointments, setUserAppointments] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mockReports, setMockReports] = useState([
    {
      id: '1',
      name: 'Blood Test Report',
      type: 'Laboratory',
      date: '10-May-2023',
      doctor: 'Dr. Priya Sharma'
    },
    {
      id: '2',
      name: 'X-Ray Chest',
      type: 'Radiology',
      date: '15-Apr-2023',
      doctor: 'Dr. Ajay Patel'
    },
    {
      id: '3',
      name: 'Annual Health Checkup',
      type: 'General',
      date: '02-Mar-2023',
      doctor: 'Dr. Vikram Desai'
    }
  ]);
  
  const { user } = useAuth();
  
  // Check if user is authenticated
  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
      fetchUserData();
    }
  }, [user]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showOTP) {
      setShowOTP(true);
    } else {
      // In a real application, you'd verify the OTP here
      setIsLoggedIn(true);
      // For demo purposes, we're just logging in without verification
    }
  };
  
  const fetchUserData = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      // Fetch user appointments
      const appointments = await getUserAppointments(user.uid);
      setUserAppointments(appointments);
      
      // Fetch user profile data
      const profile = await getUserData(user.uid);
      if (profile) {
        setUserData(profile);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Replace mock data with data from Firebase
  const appointments = userAppointments;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
        <Header />
        
        <section className="pt-24 pb-12 bg-gradient-to-r from-orange-600 to-green-600 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Patient Portal
              </h1>
              <p className="text-xl text-orange-100 leading-relaxed">
                Access your medical records, appointments, and reports securely
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-green-500 text-white">
                  <CardTitle className="text-2xl text-center">
                    Login
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={loginData.phone}
                        onChange={(e) => setLoginData({...loginData, phone: e.target.value})}
                        placeholder="+91 XXXXX XXXXX"
                        required
                      />
                    </div>
                    
                    {showOTP && (
                      <div>
                        <Label htmlFor="otp">Enter OTP</Label>
                        <Input
                          id="otp"
                          value={loginData.otp}
                          onChange={(e) => setLoginData({...loginData, otp: e.target.value})}
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          required
                        />
                        <p className="text-sm text-gray-600 mt-1">
                          OTP sent to {loginData.phone}
                        </p>
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-orange-500 to-green-500"
                    >
                      {showOTP ? 'Verify OTP' : 'Send OTP'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  // Show loading state while fetching data
  if (isLoggedIn && isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
        <Header />
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-center mt-4 text-gray-600">Loading your data...</p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <Header />
      
      <section className="pt-24 pb-8 bg-gradient-to-r from-orange-600 to-green-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome, {userData?.name || "Patient"}
              </h1>
              <p className="text-orange-100">Patient ID: {userData?.id || "Unknown"}</p>
            </div>
            <Button 
              variant="outline" 
              className="text-white border-white hover:bg-white hover:text-orange-600"
              onClick={() => setIsLoggedIn(false)}
            >
              Logout
            </Button>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="appointments" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg">
                <TabsTrigger value="appointments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                  Appointments
                </TabsTrigger>
                <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                  Reports
                </TabsTrigger>
                <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                  Profile
                </TabsTrigger>
                <TabsTrigger value="billing" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                  Billing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="appointments" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">My Appointments</h2>
                  <Button className="bg-gradient-to-r from-orange-500 to-green-500">
                    Book New Appointment
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                      <Card key={appointment.id} className="shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <span className="font-semibold">{appointment.date} at {appointment.time}</span>
                                <Badge className={appointment.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}>
                                  {appointment.status}
                                </Badge>
                              </div>
                              <div className="text-lg font-semibold">{appointment.doctor}</div>
                              <div className="text-gray-600">{appointment.department}</div>
                            </div>
                            <div className="space-x-2">
                              <Button size="sm" variant="outline">Reschedule</Button>
                              <Button size="sm" variant="outline" className="text-red-600">Cancel</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="shadow-lg">
                      <CardContent className="p-6 text-center">
                        <div className="py-8">
                          <p className="text-gray-500 mb-4">You don't have any appointments yet.</p>
                          <Button className="bg-gradient-to-r from-orange-500 to-green-500">
                            Book Your First Appointment
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reports" className="space-y-4">
                <h2 className="text-2xl font-bold">Medical Reports</h2>
                
                <div className="grid gap-4">
                  {mockReports.map((report) => (
                    <Card key={report.id} className="shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <span className="font-semibold text-lg">{report.name}</span>
                              <Badge variant="outline">{report.type}</Badge>
                            </div>
                            <div className="text-gray-600">Date: {report.date}</div>
                            <div className="text-gray-600">Doctor: {report.doctor}</div>
                          </div>
                          <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <h2 className="text-2xl font-bold">Profile Information</h2>
                
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-semibold">Full Name</div>
                            <div className="text-gray-600">Rahul Kumar</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="font-semibold">Phone</div>
                            <div className="text-gray-600">+91 98765 43210</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-purple-600" />
                          <div>
                            <div className="font-semibold">Email</div>
                            <div className="text-gray-600">rahul.kumar@email.com</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-orange-600" />
                          <div>
                            <div className="font-semibold">Date of Birth</div>
                            <div className="text-gray-600">15th March, 1990</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-red-600" />
                          <div>
                            <div className="font-semibold">Address</div>
                            <div className="text-gray-600">123 Main Street, New Delhi - 110001</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5 text-indigo-600" />
                          <div>
                            <div className="font-semibold">Insurance</div>
                            <div className="text-gray-600">CGHS - Active</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Button className="bg-gradient-to-r from-orange-500 to-green-500">
                        Edit Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="space-y-4">
                <h2 className="text-2xl font-bold">Billing History</h2>
                
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No billing history found</h3>
                      <p className="text-gray-600">Your billing information will appear here after your visits.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Portal;
