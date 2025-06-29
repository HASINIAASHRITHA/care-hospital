import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  Calendar, 
  Check, 
  Clock, 
  AlertTriangle,
  Stethoscope, 
  Thermometer, 
  Building2,
  Info,
  ShieldAlert,
  FileBarChart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SymptomAnalysisResult } from '@/services/openai';

interface ResultCardProps {
  result: SymptomAnalysisResult;
  symptoms: string;
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, symptoms, onReset }) => {
  // Get urgency level styling
  const getUrgencyStyling = (level: string) => {
    switch(level.toLowerCase()) {
      case 'emergency':
        return {
          icon: AlertCircle,
          badge: 'bg-red-100 text-red-800 border-red-200',
          iconClass: 'text-red-600',
          card: 'border-red-200 shadow-red-100'
        };
      case 'moderate':
        return {
          icon: AlertTriangle,
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          iconClass: 'text-amber-600',
          card: 'border-amber-200 shadow-amber-100'
        };
      case 'mild':
        return {
          icon: Info,
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          iconClass: 'text-blue-600',
          card: 'border-blue-200 shadow-blue-100'
        };
      default:
        return {
          icon: Info,
          badge: 'bg-gray-100 text-gray-800 border-gray-200',
          iconClass: 'text-gray-600',
          card: 'border-gray-200 shadow-gray-100'
        };
    }
  };

  const urgency = getUrgencyStyling(result.urgencyLevel);
  const UrgencyIcon = urgency.icon;

  return (
    <Card className={`shadow-lg ${urgency.card} bg-white overflow-hidden`}>
      <CardHeader className={`bg-gradient-to-r ${result.urgencyLevel === 'emergency' ? 'from-red-50 to-red-100' : result.urgencyLevel === 'moderate' ? 'from-amber-50 to-amber-100' : 'from-blue-50 to-blue-100'}`}>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold text-gray-900">AI Symptom Analysis</CardTitle>
          <Badge className={`${urgency.badge} font-medium flex items-center gap-1 px-2 py-1`}>
            <UrgencyIcon className={`h-4 w-4 ${urgency.iconClass}`} />
            <span className="capitalize">{result.urgencyLevel} Urgency</span>
          </Badge>
        </div>
        <div className="text-sm text-gray-600 mt-1 italic">
          Based on: "{symptoms}"
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-5">
        <div className="space-y-4">
          {/* Department Recommendation */}
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Recommended Department</h3>
              <p className="text-blue-600 font-medium">{result.recommendedDepartment}</p>
            </div>
          </div>
          
          {/* Possible Conditions */}
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <Stethoscope className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Possible Conditions</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {result.possibleConditions.map((condition, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="bg-purple-50 border-purple-200 text-purple-800"
                  >
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="flex items-start gap-3">
            <div className="bg-gray-100 p-2 rounded-full">
              <FileBarChart className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Analysis</h3>
              <p className="text-gray-700 text-sm">{result.description}</p>
            </div>
          </div>

          {/* Precautions */}
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <ShieldAlert className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Recommended Precautions</h3>
              <ul className="text-sm text-gray-700 space-y-1 mt-1">
                {result.precautions.map((precaution, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{precaution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Follow-up Recommendation */}
          <div className="flex items-start gap-3">
            <div className="bg-orange-100 p-2 rounded-full">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Follow-up Recommendation</h3>
              <p className="text-gray-700 text-sm">{result.followUpRecommendation}</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="text-xs text-gray-500 italic">
            <AlertTriangle className="inline-block h-3 w-3 mr-1" />
            Disclaimer: This is an AI-generated preliminary assessment and not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider.
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 p-4 flex flex-col sm:flex-row gap-3 justify-between">
        <Button 
          variant="outline" 
          onClick={onReset}
          className="sm:w-auto w-full"
        >
          Check Different Symptoms
        </Button>
        
        <Button 
          asChild
          className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white sm:w-auto w-full"
        >
          <Link to={`/appointments?department=${encodeURIComponent(result.recommendedDepartment)}`}>
            <Calendar className="h-4 w-4 mr-2" />
            Book Appointment
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResultCard;
