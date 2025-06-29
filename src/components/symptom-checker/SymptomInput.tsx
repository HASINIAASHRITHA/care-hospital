import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MicOff, Send, PlusCircle, Activity, HeartPulse } from 'lucide-react';

declare global {
  const SpeechRecognition: {
    new (): SpeechRecognition;
    prototype: SpeechRecognition;
  };
  
  interface SpeechRecognition {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start(): void;
    stop(): void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
  }

  interface Window {
    webkitSpeechRecognition?: typeof SpeechRecognition;
    SpeechRecognition?: typeof SpeechRecognition;
  }
}

interface SymptomInputProps {
  onSubmit: (data: {
    symptoms: string;
    age?: number;
    gender?: string;
    additionalInfo?: string;
  }) => void;
  isLoading: boolean;
}

const SymptomInput: React.FC<SymptomInputProps> = ({ onSubmit, isLoading }) => {
  const [inputMethod, setInputMethod] = useState<'text' | 'checklist'>('text');
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState<number | undefined>();
  const [gender, setGender] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // Common symptom categories with symptoms
  const symptomCategories = [
    {
      category: 'Head & Neurological',
      symptoms: ['Headache', 'Dizziness', 'Confusion', 'Blurred vision', 'Memory issues']
    },
    {
      category: 'Respiratory',
      symptoms: ['Cough', 'Shortness of breath', 'Chest pain', 'Wheezing', 'Sore throat']
    },
    {
      category: 'Digestive',
      symptoms: ['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Abdominal pain']
    },
    {
      category: 'Musculoskeletal',
      symptoms: ['Joint pain', 'Muscle pain', 'Back pain', 'Stiffness', 'Swelling']
    },
    {
      category: 'General',
      symptoms: ['Fever', 'Fatigue', 'Loss of appetite', 'Weight loss', 'Night sweats']
    }
  ];

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Handle checkbox selection
  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom) 
        : [...prev, symptom]
    );
  };

  // Submit handler
  const handleSubmit = () => {
    const finalSymptoms = inputMethod === 'text' 
      ? symptoms 
      : selectedSymptoms.join(', ');
      
    if (!finalSymptoms.trim()) return;
    
    onSubmit({
      symptoms: finalSymptoms,
      age,
      gender: gender || undefined,
      additionalInfo: additionalInfo.trim() || undefined
    });
  };

  // Speech recognition for symptom input
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser does not support speech recognition",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      // Stop listening
      setIsListening(false);
      // In a real implementation, we would stop the speech recognition here
    } else {
      const SpeechRecognitionAPI = (window.webkitSpeechRecognition || window.SpeechRecognition) as typeof SpeechRecognition;
      setIsListening(true);
      
      // This is a simplified implementation
      // In a real app, you would use the Web Speech API
      const recognition = new SpeechRecognitionAPI();
      
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setSymptoms(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    }
  };

  return (
    <div className="space-y-6">
      <Tabs 
        value={inputMethod} 
        onValueChange={(value) => setInputMethod(value as 'text' | 'checklist')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text" className="rounded-l-lg">
            Text Input
          </TabsTrigger>
          <TabsTrigger value="checklist" className="rounded-r-lg">
            Symptom Checklist
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="text" className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Describe your symptoms here... (e.g. 'I've been experiencing headache and fever for 3 days')"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="min-h-32 resize-none p-4 text-base"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={toggleVoiceInput}
              className="absolute bottom-3 right-3 text-gray-400 hover:text-blue-600"
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="checklist" className="space-y-6">
          {symptomCategories.map((category, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="font-semibold flex items-center space-x-2">
                {idx === 0 && <Activity className="h-4 w-4" />}
                {idx === 1 && <HeartPulse className="h-4 w-4" />}
                <span>{category.category}</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {category.symptoms.map((symptom, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`symptom-${idx}-${i}`}
                      checked={selectedSymptoms.includes(symptom)}
                      onCheckedChange={() => handleSymptomToggle(symptom)}
                    />
                    <Label htmlFor={`symptom-${idx}-${i}`} className="text-sm">
                      {symptom}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-blue-600"
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Add custom symptom
          </Button>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="age">Age (optional)</Label>
          <Input 
            id="age"
            type="number" 
            placeholder="Enter your age"
            value={age || ''}
            onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender (optional)</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3">
          <Label htmlFor="additionalInfo">Additional Information (optional)</Label>
          <Input
            id="additionalInfo"
            placeholder="Any medical history, allergies, or other relevant information"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
          />
        </div>
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={isLoading || (inputMethod === 'text' ? !symptoms.trim() : selectedSymptoms.length === 0)}
        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Analyzing Symptoms...
          </>
        ) : (
          <>
            <Send className="h-5 w-5 mr-2" />
            Analyze Symptoms
          </>
        )}
      </Button>
    </div>
  );
};

export default SymptomInput;
