import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  FileText, 
  Download, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  DollarSign, 
  Upload, 
  Send,
  Loader2
} from 'lucide-react';
import { 
  getUserAppointments, 
  getUserData, 
  updateAppointmentBillingStatus,
  uploadPaymentProof 
} from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from 'date-fns';

// Firebase auth imports
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, ConfirmationResult } from "firebase/auth";
import app from "@/config/firebase";

// Import the OTP input component
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

// Define billing status types
type BillingStatus = 'pending' | 'paid' | 'waived' | 'not_applicable';

// Define appointment interface with billing
interface AppointmentWithBilling {
  id?: string;
  patientName: string;
  doctor: string;
  department: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  billing?: {
    amount: number;
    status: BillingStatus;
    paidAt?: string;
    paymentMethod?: string;
    receiptUrl?: string;
  };
  // other fields...
}

// Add RecaptchaVerifier to Window interface
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

const Profile = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ phone: '', otp: '' });
  const [showOTP, setShowOTP] = useState(false);
  const [userAppointments, setUserAppointments] = useState<AppointmentWithBilling[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  
  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithBilling | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cash' | 'upload'>('upi');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  
  // New state for OTP verification
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Initialize recaptcha when component loads
  useEffect(() => {
    const auth = getAuth(app);
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'normal',
      'callback': () => {
        setRecaptchaVerified(true);
        setOtpError(null);
      },
      'expired-callback': () => {
        setRecaptchaVerified(false);
        setOtpError("reCAPTCHA has expired. Please refresh and try again.");
      }
    });
    
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);
  
  // Check if user is authenticated
  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
      fetchUserData();
    }
  }, [user]);

  // Handle sending OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.phone) {
      setOtpError("Please enter a valid phone number");
      return;
    }
    
    setSendingOTP(true);
    setOtpError(null);
    
    try {
      // Format phone number to E.164 format for Firebase
      let phoneNumber = loginData.phone;
      if (!phoneNumber.startsWith('+')) {
        // Assuming Indian number if no country code
        phoneNumber = phoneNumber.startsWith('0') 
          ? '+91' + phoneNumber.substring(1) 
          : '+91' + phoneNumber;
      }
      
      const auth = getAuth(app);
      const confirmation = await signInWithPhoneNumber(
        auth, 
        phoneNumber, 
        window.recaptchaVerifier
      );
      
      setConfirmationResult(confirmation);
      setShowOTP(true);
      
      toast({
        title: "OTP Sent",
        description: `We've sent a verification code to ${phoneNumber}`,
      });
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      setOtpError(error.message || "Failed to send OTP. Please try again.");
      
      // Reset reCAPTCHA
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = new RecaptchaVerifier(getAuth(app), 'recaptcha-container', {
        'size': 'normal',
        'callback': () => {
          setRecaptchaVerified(true);
        },
        'expired-callback': () => {
          setRecaptchaVerified(false);
        }
      });
    } finally {
      setSendingOTP(false);
    }
  };

  // Handle verifying OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.otp || !confirmationResult) {
      setOtpError("Please enter the OTP sent to your phone");
      return;
    }
    
    setVerifyingOTP(true);
    setOtpError(null);
    
    try {
      // Confirm the OTP code
      await confirmationResult.confirm(loginData.otp);
      
      setIsLoggedIn(true);
      toast({
        title: "Successfully Verified",
        description: "You've been successfully logged in",
      });
      
      // Fetch user data after successful login
      fetchUserData();
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      setOtpError("Invalid OTP. Please check and try again.");
    } finally {
      setVerifyingOTP(false);
    }
  };
  
  const fetchUserData = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      // Fetch user appointments
      const appointments = await getUserAppointments(user.uid);
      
      // Make sure appointments is always an array, even if the API returns null/undefined
      const typedAppointments = Array.isArray(appointments) 
        ? appointments as unknown as AppointmentWithBilling[]
        : [] as AppointmentWithBilling[];
        
      setUserAppointments(typedAppointments);
      
      // Fetch user profile data
      const profile = await getUserData(user.uid);
      if (profile) {
        setUserData(profile);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Ensure userAppointments is set to an empty array on error
      setUserAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPendingBillsCount = () => {
    // Check if userAppointments exists and is an array before trying to use filter or length
    if (!userAppointments || !Array.isArray(userAppointments)) return 0;
    
    return userAppointments.filter(apt => 
      apt && // Add null check for appointment object
      apt.status === 'completed' && 
      apt.billing && apt.billing.status === 'pending'
    ).length;
  };

  const getTotalPendingAmount = () => {
    // Check if userAppointments exists and is an array before trying to use filter or reduce
    if (!userAppointments || !Array.isArray(userAppointments)) return 0;
    
    return userAppointments
      .filter(apt => 
        apt && // Add null check for appointment object
        apt.status === 'completed' && 
        apt.billing && apt.billing.status === 'pending'
      )
      .reduce((total, apt) => total + (apt.billing?.amount || 0), 0);
  };

  // Open payment dialog for an appointment
  const handleOpenPayment = (appointment: AppointmentWithBilling) => {
    setSelectedAppointment(appointment);
    setPaymentDialogOpen(true);
  };

  // Handle file upload for payment proof
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPaymentProof(e.target.files[0]);
    }
  };

  // Submit payment
  const handlePaymentSubmit = async () => {
    if (!selectedAppointment?.id || !user?.uid) return;
    
    setIsSubmittingPayment(true);
    
    try {
      let receiptUrl = '';
      
      // If user uploaded payment proof, upload it first
      if (paymentMethod === 'upload' && paymentProof) {
        receiptUrl = await uploadPaymentProof(paymentProof, user.uid, selectedAppointment.id);
      }
      
      // Update payment status
      await updateAppointmentBillingStatus(
        selectedAppointment.id, 
        'paid',
        paymentMethod,
        receiptUrl
      );
      
      toast({
        title: "Payment Successful",
        description: "Your payment has been recorded. You can view receipt in billing history.",
        variant: "default",
      });
      
      // Refresh appointment data
      fetchUserData();
      setPaymentDialogOpen(false);
      
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Helper function to render status badges with appropriate colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };
  
  // Helper function to render billing status badges
  const getBillingBadge = (status: BillingStatus) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Payment Due</Badge>;
      case 'waived':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Waived</Badge>;
      case 'not_applicable':
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">N/A</Badge>;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
        <Header />
        
        <section className="pt-24 pb-12 bg-gradient-to-r from-orange-600 to-green-600 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Patient Profile
              </h1>
              <p className="text-xl text-orange-100 leading-relaxed">
                Access your appointments, medical records, and billing securely
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
                    Login with Phone
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {!showOTP ? (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={loginData.phone}
                          onChange={(e) => {
                            setLoginData({...loginData, phone: e.target.value});
                            setOtpError(null);
                          }}
                          placeholder="+91 XXXXX XXXXX"
                          required
                          disabled={sendingOTP}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter your phone number with country code (e.g., +91 for India)
                        </p>
                      </div>
                      
                      <div id="recaptcha-container" className="flex justify-center"></div>
                      
                      {otpError && (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded-md border border-red-200">
                          {otpError}
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-orange-500 to-green-500"
                        disabled={sendingOTP}
                      >
                        {sendingOTP ? (
                          <span className="flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                            Sending OTP...
                          </span>
                        ) : (
                          "Send OTP"
                        )}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                      <div>
                        <Label htmlFor="otp">Enter OTP</Label>
                        <div className="mt-2 flex justify-center">
                          <InputOTP 
                            maxLength={6}
                            value={loginData.otp}
                            onChange={(value) => {
                              setLoginData({...loginData, otp: value});
                              setOtpError(null);
                            }}
                            disabled={verifyingOTP}
                          >
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        <p className="text-sm text-center text-gray-600 mt-2">
                          OTP sent to {loginData.phone}
                        </p>
                      </div>
                      
                      {otpError && (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded-md border border-red-200">
                          {otpError}
                        </div>
                      )}
                      
                      <div className="flex space-x-3">
                        <Button 
                          type="button" 
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setShowOTP(false);
                            setLoginData({...loginData, otp: ''});
                            setOtpError(null);
                          }}
                          disabled={verifyingOTP}
                        >
                          Back
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1 bg-gradient-to-r from-orange-500 to-green-500"
                          disabled={verifyingOTP || loginData.otp.length < 6}
                        >
                          {verifyingOTP ? (
                            <span className="flex items-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Verifying...
                            </span>
                          ) : (
                            "Verify OTP"
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-6xl mx-auto">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome, {userData?.name || "Patient"}
              </h1>
              <p className="text-orange-100">Patient ID: {userData?.id || "Unknown"}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {getPendingBillsCount() > 0 && (
                <Button 
                  className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                  onClick={() => document.getElementById('billing-tab')?.click()}
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Pending Bills ({getPendingBillsCount()})</span>
                </Button>
              )}
              <Button 
                variant="outline" 
                className="text-white border-white hover:bg-white hover:text-orange-600"
                onClick={() => setIsLoggedIn(false)}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </section>
    
    {/* Profile Content Section */}
    <section className="py-8">
      <div className="container mx-auto px-4">
        <Tabs defaultValue="appointments" className="max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="appointments" id="appointments-tab">
            <Calendar className="h-4 w-4 mr-2" /> Appointments
          </TabsTrigger>
          <TabsTrigger value="billing" id="billing-tab">
            <FileText className="h-4 w-4 mr-2" /> Billing
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" /> Personal Info
          </TabsTrigger>
        </TabsList>
        
        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Your Appointments</h2>
          
          {userAppointments && userAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
            {userAppointments.map((appointment, idx) => (
              <Card key={idx} className="overflow-hidden border-l-4 border-l-orange-500">
                <CardContent className="p-0">
                <div className="bg-orange-50 p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <span>{appointment.date} at {appointment.time}</span>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold">Dr. {appointment.doctor}</h3>
                    <p className="text-gray-600">{appointment.department}</p>
                  </div>
                  
                  {appointment.status === 'completed' && appointment.billing && (
                    <div className="flex justify-between items-center bg-blue-50 p-3 rounded-md">
                    <div>
                      <span className="block text-sm">Bill Amount</span>
                      <span className="font-semibold">₹{appointment.billing.amount}</span>
                    </div>
                    <div>
                      {appointment.billing.status === 'pending' ? (
                        <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleOpenPayment(appointment)}
                        >
                        Pay Now
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1">
                        {getBillingBadge(appointment.billing.status)}
                        {appointment.billing.status === 'paid' && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        </div>
                      )}
                    </div>
                    </div>
                  )}
                </div>
                </CardContent>
              </Card>
            ))}
            </div>
          ) : (
            <Card className="bg-gray-50">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="rounded-full bg-gray-200 p-3 mb-4">
                <Calendar className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-medium mb-2">No Appointments Found</h3>
              <p className="text-gray-600 text-center max-w-md">
                You don't have any appointments scheduled. Book a consultation with one of our specialists.
              </p>
              <Button className="mt-4" asChild>
                <Link to="/appointments">Book Appointment</Link>
              </Button>
            </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Billing Information</h2>
          
          {userAppointments && userAppointments.length > 0 ? (
            <div className="space-y-6">
            {/* Pending Bills Section */}
            <div>
              <h3 className="text-lg font-medium mb-3">Pending Bills</h3>
              {userAppointments.filter(apt => 
                apt.status === 'completed' && 
                apt.billing?.status === 'pending'
              ).length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                {userAppointments
                  .filter(apt => 
                    apt.status === 'completed' && 
                    apt.billing?.status === 'pending'
                  )
                  .map((appointment, idx) => (
                    <Card key={idx} className="overflow-hidden border border-red-200">
                    <CardHeader className="bg-red-50 py-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-medium">
                        Bill #{idx + 1001}
                        </CardTitle>
                        <Badge variant="destructive">Payment Due</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Doctor</span>
                        <span className="font-medium">Dr. {appointment.doctor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date</span>
                        <span>{appointment.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount</span>
                        <span className="font-bold text-lg">₹{appointment.billing?.amount}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 py-3">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700" 
                        onClick={() => handleOpenPayment(appointment)}
                      >
                        Pay Now
                      </Button>
                    </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-gray-50">
                <CardContent className="py-8 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600">You have no pending bills</p>
                </CardContent>
                </Card>
              )}
            </div>
            
            {/* Payment History Section */}
            <div>
              <h3 className="text-lg font-medium mb-3">Payment History</h3>
              {userAppointments.filter(apt => 
                apt.billing?.status === 'paid'
              ).length > 0 ? (
                <Card>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-gray-600 text-xs">
                    <tr>
                      <th className="p-3 text-left">Bill #</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Doctor</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-center">Receipt</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    {userAppointments
                      .filter(apt => apt.billing?.status === 'paid')
                      .map((appointment, idx) => (
                        <tr key={idx}>
                        <td className="p-3">{idx + 1001}</td>
                        <td className="p-3">{appointment.date}</td>
                        <td className="p-3">Dr. {appointment.doctor}</td>
                        <td className="p-3 text-right">₹{appointment.billing?.amount}</td>
                        <td className="p-3 text-center">
                          <Button variant="ghost" size="sm" className="text-blue-600">
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-50">
                <CardContent className="py-8 text-center">
                  <p className="text-gray-600">No payment history available</p>
                </CardContent>
                </Card>
              )}
            </div>
            </div>
          ) : (
            <Card className="bg-gray-50">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="rounded-full bg-gray-200 p-3 mb-4">
                <FileText className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-medium mb-2">No Billing Information</h3>
              <p className="text-gray-600 text-center max-w-md">
                You don't have any billing information yet.
              </p>
            </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
          <Card>
            <CardContent className="py-6">
            {userData ? (
              <dl className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <User className="h-4 w-4" /> Full Name
                  </dt>
                  <dd className="mt-1 text-lg">{userData.name || "Not provided"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Mail className="h-4 w-4" /> Email Address
                  </dt>
                  <dd className="mt-1 text-lg">{userData.email || "Not provided"}</dd>
                </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Phone className="h-4 w-4" /> Phone Number
                  </dt>
                  <dd className="mt-1 text-lg">{userData.phone || "Not provided"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> Address
                  </dt>
                  <dd className="mt-1 text-lg">{userData.address || "Not provided"}</dd>
                </div>
                </div>
                
                <Separator />
                
                <Button variant="outline" className="w-full md:w-auto">
                Update Profile
                </Button>
              </dl>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600">Complete your profile to manage appointments and billing more efficiently.</p>
                <Button className="mt-4">Complete Profile</Button>
              </div>
            )}
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </section>

    {/* Payment Dialog */}
    <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
          <DialogDescription>
            Pay for your appointment with {selectedAppointment?.doctor} on {selectedAppointment?.date}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">Total Amount</div>
            <div className="text-3xl font-bold">₹{selectedAppointment?.billing?.amount}</div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label>Select Payment Method</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                type="button" 
                variant={paymentMethod === 'upi' ? 'default' : 'outline'}
                className={paymentMethod === 'upi' ? 'bg-blue-600' : ''}
                onClick={() => setPaymentMethod('upi')}
              >
                UPI
              </Button>
              <Button 
                type="button" 
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                className={paymentMethod === 'card' ? 'bg-blue-600' : ''}
                onClick={() => setPaymentMethod('card')}
              >
                Card
              </Button>
              <Button 
                type="button" 
                variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                className={paymentMethod === 'cash' ? 'bg-blue-600' : ''}
                onClick={() => setPaymentMethod('cash')}
              >
                Cash
              </Button>
              <Button 
                type="button" 
                variant={paymentMethod === 'upload' ? 'default' : 'outline'}
                className={paymentMethod === 'upload' ? 'bg-blue-600' : ''}
                onClick={() => setPaymentMethod('upload')}
              >
                Upload Proof
              </Button>
            </div>
          </div>
          
          {paymentMethod === 'upi' && (
            <div className="space-y-3">
              <div className="flex justify-center">
                <img 
                  src="/qr-placeholder.png" 
                  alt="UPI QR Code"
                  className="w-40 h-40 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='8' y1='3' x2='8' y2='21'%3E%3C/line%3E%3Cline x1='16' y1='3' x2='16' y2='21'%3E%3C/line%3E%3Cline x1='3' y1='8' x2='21' y2='8'%3E%3C/line%3E%3Cline x1='3' y1='16' x2='21' y2='16'%3E%3C/line%3E%3C/svg%3E"; 
                  }}
                />
              </div>
              <div className="text-center text-sm text-gray-600">
                Scan the QR code with any UPI app to make payment
              </div>
              <div className="text-center font-semibold">
                UPI ID: carehospital@ybl
              </div>
            </div>
          )}
          
          {paymentMethod === 'card' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input id="card-number" placeholder="XXXX XXXX XXXX XXXX" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="XXX" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name-on-card">Name on Card</Label>
                <Input id="name-on-card" placeholder="Enter name as on card" />
              </div>
            </div>
          )}
          
          {paymentMethod === 'cash' && (
            <div className="space-y-3 text-center p-4 bg-gray-50 rounded-md">
              <CreditCard className="h-12 w-12 mx-auto text-gray-500" />
              <p className="text-gray-700">You've selected to pay by cash.</p>
              <p className="text-sm text-gray-600">Please pay at the hospital reception desk and collect your receipt.</p>
            </div>
          )}
          
          {paymentMethod === 'upload' && (
            <div className="space-y-3">
              <Label>Upload Payment Proof</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <input
                  type="file"
                  id="payment-proof"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
                <label htmlFor="payment-proof" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-600">
                      {paymentProof ? paymentProof.name : "Click to upload payment proof"}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Supported formats: JPEG, PNG, PDF
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setPaymentDialogOpen(false)}
            disabled={isSubmittingPayment}
          >
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handlePaymentSubmit}
            disabled={isSubmittingPayment || (paymentMethod === 'upload' && !paymentProof)}
          >
            {isSubmittingPayment ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Confirm Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
      <Footer />
    </div>
  );
}

// Add this to your global.d.ts or add it in a script tag in your index.html
// Add this to your global.d.ts or add it in a script tag in your index.html
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export default Profile;
