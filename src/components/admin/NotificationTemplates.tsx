import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, Save, MessageSquare } from 'lucide-react';
import { 
  NotificationTemplate, 
  getAllTemplates, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate,
  generateMessageFromTemplate
} from '@/services/notificationTemplates';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

export const NotificationTemplates = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<NotificationTemplate | null>(null);
  const [previewMessage, setPreviewMessage] = useState('');
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch all templates
  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const data = await getAllTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification templates',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  const handleAddNewTemplate = () => {
    setCurrentTemplate({
      name: '',
      type: 'confirmation',
      channel: 'whatsapp',
      content: '',
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };
  
  const handleEditTemplate = (template: NotificationTemplate) => {
    setCurrentTemplate(template);
    setIsEditing(true);
    setIsDialogOpen(true);
  };
  
  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
      fetchTemplates();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };
  
  const handleSaveTemplate = async () => {
    if (!currentTemplate || !user) return;
    
    try {
      if (isEditing && currentTemplate.id) {
        await updateTemplate(currentTemplate.id, currentTemplate);
        toast({
          title: 'Success',
          description: 'Template updated successfully',
        });
      } else {
        await createTemplate({
          ...currentTemplate,
          createdBy: user.uid,
        });
        toast({
          title: 'Success',
          description: 'New template created successfully',
        });
      }
      setIsDialogOpen(false);
      fetchTemplates();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      });
    }
  };
  
  const handlePreviewTemplate = (template: NotificationTemplate) => {
    // Generate preview with sample data
    const previewMessage = generateMessageFromTemplate(template.content, {
      patient_name: 'John Smith',
      doctor_name: 'Dr. Sarah Johnson',
      department: 'Cardiology',
      appointment_date: '2023-10-15',
      time: '10:30 AM',
      appointment_id: 'A12345',
      new_date: '2023-10-20',
      new_time: '11:00 AM',
    });
    
    setPreviewMessage(previewMessage);
    setIsPreviewOpen(true);
  };
  
  const getTypeBadgeColor = (type: string) => {
    const colors = {
      confirmation: 'bg-green-100 text-green-800 border-green-200',
      reminder: 'bg-blue-100 text-blue-800 border-blue-200',
      cancellation: 'bg-red-100 text-red-800 border-red-200',
      reschedule: 'bg-amber-100 text-amber-800 border-amber-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  const getChannelBadgeColor = (channel: string) => {
    const colors = {
      whatsapp: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      sms: 'bg-blue-100 text-blue-800 border-blue-200',
      both: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[channel as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Notification Templates</CardTitle>
            <CardDescription>
              Manage templates for patient notifications
            </CardDescription>
          </div>
          <Button 
            onClick={handleAddNewTemplate}
            className="bg-gradient-to-r from-blue-600 to-emerald-600"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Template
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.length > 0 ? (
                    templates.map(template => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>
                          <Badge className={getTypeBadgeColor(template.type)}>
                            {template.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getChannelBadgeColor(template.channel)}>
                            {template.channel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handlePreviewTemplate(template)}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditTemplate(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500"
                              onClick={() => template.id && handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                        No templates found. Click "Add Template" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit/Add Template Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Template' : 'Add New Template'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modify the template details below'
                : 'Create a new notification template'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={currentTemplate?.name || ''}
                onChange={e => setCurrentTemplate(prev => prev ? {...prev, name: e.target.value} : null)}
                placeholder="e.g., Appointment Confirmation"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Message Type</Label>
                <Select
                  value={currentTemplate?.type}
                  onValueChange={value => setCurrentTemplate(prev => prev ? {...prev, type: value as any} : null)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmation">Confirmation</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="cancellation">Cancellation</SelectItem>
                    <SelectItem value="reschedule">Reschedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="channel">Channel</Label>
                <Select
                  value={currentTemplate?.channel}
                  onValueChange={value => setCurrentTemplate(prev => prev ? {...prev, channel: value as any} : null)}
                >
                  <SelectTrigger id="channel">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="content">Message Content</Label>
                <div className="text-xs text-gray-500">
                  Use placeholders like {'{patient_name}'}, {'{doctor_name}'}, etc.
                </div>
              </div>
              <Textarea
                id="content"
                value={currentTemplate?.content || ''}
                onChange={e => setCurrentTemplate(prev => prev ? {...prev, content: e.target.value} : null)}
                placeholder="Enter message content with placeholders..."
                className="min-h-[200px]"
              />
              <div className="text-xs text-gray-500 space-y-1">
                <div>Available placeholders:</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{'{'}{'{patient_name}'}{'}'}</Badge>
                  <Badge variant="outline">{'{'}{'{doctor_name}'}{'}'}</Badge>
                  <Badge variant="outline">{'{'}{'{department}'}{'}'}</Badge>
                  <Badge variant="outline">{'{'}{'{appointment_date}'}{'}'}</Badge>
                  <Badge variant="outline">{'{'}{'{time}'}{'}'}</Badge>
                  <Badge variant="outline">{'{'}{'{appointment_id}'}{'}'}</Badge>
                  <Badge variant="outline">{'{'}{'{new_date}'}{'}'}</Badge>
                  <Badge variant="outline">{'{'}{'{new_time}'}{'}'}</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveTemplate}
              disabled={!currentTemplate?.name || !currentTemplate?.content}
              className="bg-gradient-to-r from-blue-600 to-emerald-600"
            >
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? 'Update' : 'Create'} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Preview Template Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              Preview how this template will look with sample data
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
            {previewMessage}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationTemplates;
