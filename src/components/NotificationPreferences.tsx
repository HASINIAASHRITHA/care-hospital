
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Phone } from 'lucide-react';

interface NotificationPreferencesProps {
  whatsappEnabled: boolean;
  smsEnabled: boolean;
  onWhatsAppChange: (enabled: boolean) => void;
  onSMSChange: (enabled: boolean) => void;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  whatsappEnabled,
  smsEnabled,
  onWhatsAppChange,
  onSMSChange
}) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="whatsapp"
            checked={whatsappEnabled}
            onCheckedChange={onWhatsAppChange}
          />
          <Label htmlFor="whatsapp" className="flex items-center gap-2 cursor-pointer">
            <MessageCircle className="w-4 h-4 text-green-600" />
            Send WhatsApp confirmation
          </Label>
        </div>
        
        <div className="flex items-center space-x-3">
          <Checkbox
            id="sms"
            checked={smsEnabled}
            onCheckedChange={onSMSChange}
          />
          <Label htmlFor="sms" className="flex items-center gap-2 cursor-pointer">
            <Phone className="w-4 h-4 text-blue-600" />
            Send SMS confirmation
          </Label>
        </div>
        
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <p>📱 You will receive appointment confirmation via your selected methods</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
