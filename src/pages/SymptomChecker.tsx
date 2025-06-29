import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Clipboard, ShieldCheck, AlertTriangle, Stethoscope, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeSymptoms, SymptomAnalysisResult, saveSymptomCheck } from '@/services/openai';
import SymptomInput from '@/components/symptom-checker/SymptomInput';
import ResultCard from '@/components/symptom-checker/ResultCard';

const SymptomChecker = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<SymptomAnalysisResult | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSymptomSubmit = async (data: {
    symptoms: string;
    age?: number;
    gender?: string;
    additionalInfo?: string;
  }) => {
    setSymptoms(data.symptoms);
    setIsLoading(true);

    try {
      const analysisResult = await analyzeSymptoms(data);
      setResult(analysisResult);
      
      // Save to Firebase if user is logged in
      if (user) {
        await saveSymptomCheck(user.uid, data.symptoms, analysisResult);
      }
      
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      toast({
        title: "Analysis Failed",
        description: "We couldn't analyze your symptoms. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setSymptoms('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              AI Symptom Checker
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Get a preliminary assessment of your symptoms using our AI-powered tool.
              Quick, confidential, and available 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Symptom Checker Form / Results */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                  <CardTitle className="text-2xl flex items-center">
                    <Brain className="w-6 h-6 mr-2" />
                    AI Symptom Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {result ? (
                    <ResultCard result={result} symptoms={symptoms} onReset={resetAnalysis} />
                  ) : (
                    <SymptomInput onSubmit={handleSymptomSubmit} isLoading={isLoading} />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* About Symptom Checker */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="text-xl">About This Tool</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Clipboard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">How It Works</h3>
                      <p className="text-sm text-gray-600">Our AI analyzes your symptoms and provides preliminary guidance based on medical information.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Privacy First</h3>
                      <p className="text-sm text-gray-600">Your health information is kept private and secure with our HIPAA-compliant system.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-amber-100 rounded-full">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Not a Diagnosis</h3>
                      <p className="text-sm text-gray-600">This tool provides guidance only and doesn't replace professional medical advice.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Info */}
              <Card className="shadow-lg border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="text-lg text-red-800">Emergency?</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700 mb-4">If you're experiencing any of these symptoms, please seek immediate medical attention:</p>
                  <ul className="text-sm space-y-2 mb-4">
                    <li className="flex items-start">
                      <Heart className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Chest pain or pressure</span>
                    </li>
                    <li className="flex items-start">
                      <Heart className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Difficulty breathing</span>
                    </li>
                    <li className="flex items-start">
                      <Heart className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Severe bleeding</span>
                    </li>
                    <li className="flex items-start">
                      <Heart className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Sudden severe headache</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Call Emergency: 102
                  </Button>
                </CardContent>
              </Card>

              {/* Talk to Doctor */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardTitle className="text-lg">Prefer to Talk to a Doctor?</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Stethoscope className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-700">Connect directly with our healthcare professionals</p>
                  </div>
                  <Button 
                    asChild
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    <a href="/doctors">Find a Doctor</a>
                  </Button>
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

export default SymptomChecker;
