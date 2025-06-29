import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, MessageCircle } from 'lucide-react';

interface NotificationPreferencesProps {
  whatsappEnabled: boolean;
  smsEnabled: boolean;
  reminderEnabled: boolean;
  onWhatsAppChange: (enabled: boolean) => void;
  onSMSChange: (enabled: boolean) => void;
  onReminderChange: (enabled: boolean) => void;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = React.memo(({
  whatsappEnabled,
  smsEnabled,
  reminderEnabled,
  onWhatsAppChange,
  onSMSChange,
  onReminderChange
}) => {
  // Use useCallback to stabilize event handlers
  const handleWhatsAppToggle = useCallback((checked: boolean) => {
    onWhatsAppChange(checked);
  }, [onWhatsAppChange]);

  const handleSMSToggle = useCallback((checked: boolean) => {
    onSMSChange(checked);
  }, [onSMSChange]);

  const handleReminderToggle = useCallback((checked: boolean) => {
    onReminderChange(checked);
  }, [onReminderChange]);

  return (
    <Card className="shadow-lg transition-all duration-200">
      <CardHeader className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageCircle className="h-4 w-4 text-green-600 mr-2" />
            <Label htmlFor="whatsapp" className="text-sm font-medium">
              WhatsApp Notifications
            </Label>
          </div>
          <Switch
            id="whatsapp"
            checked={whatsappEnabled}
            onCheckedChange={handleWhatsAppToggle}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageCircle className="h-4 w-4 text-blue-600 mr-2" />
            <Label htmlFor="sms" className="text-sm font-medium">
              SMS Notifications
            </Label>
          </div>
          <Switch
            id="sms"
            checked={smsEnabled}
            onCheckedChange={handleSMSToggle}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-4 w-4 text-amber-600 mr-2" />
            <Label htmlFor="reminder" className="text-sm font-medium">
              Schedule Reminders
            </Label>
          </div>
          <Switch
            id="reminder"
            checked={reminderEnabled}
            onCheckedChange={handleReminderToggle}
          />
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          We'll send you appointment confirmations and reminders based on your preferences.
        </p>
      </CardContent>
    </Card>
  );
});

NotificationPreferences.displayName = 'NotificationPreferences';

export default NotificationPreferences;
