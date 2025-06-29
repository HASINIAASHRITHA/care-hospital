import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Doctor, addDoctor, updateDoctor } from '@/services/firebase';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ImageUpload } from './ImageUpload';

interface DoctorFormProps {
  doctor: Doctor | null;
  onSaved: () => void;
  onCancel: () => void;
}

export const DoctorForm = ({ doctor, onSaved, onCancel }: DoctorFormProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const isEditMode = !!doctor;

  const form = useForm<Doctor>({
    defaultValues: isEditMode
      ? { ...doctor }
      : {
          name: '',
          specialty: '',
          experience: '',
          education: '',
          location: '',
          bio: '',
          rating: 4.5,
          availableToday: true,
          image: '',
        },
  });

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
  };

  const onSubmit = async (data: Doctor) => {
    try {
      setIsSubmitting(true);
      
      if (isEditMode && doctor.id) {
        await updateDoctor(doctor.id, data, imageFile || undefined);
        toast({
          title: "Doctor updated",
          description: "Doctor information has been successfully updated.",
        });
      } else {
        await addDoctor(data, imageFile || undefined);
        toast({
          title: "Doctor added",
          description: "New doctor has been successfully added.",
        });
      }
      
      onSaved();
    } catch (error) {
      console.error("Error saving doctor:", error);
      toast({
        title: "Error",
        description: "Failed to save doctor information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doctor Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Dr. John Smith" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specialty *</FormLabel>
                <FormControl>
                  <Input placeholder="Cardiologist" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience *</FormLabel>
                <FormControl>
                  <Input placeholder="15 years" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="education"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Education *</FormLabel>
                <FormControl>
                  <Input placeholder="Harvard Medical School" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location *</FormLabel>
                <FormControl>
                  <Input placeholder="Cardiology Wing" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating (0-5)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1"
                    min="0" 
                    max="5" 
                    placeholder="4.5" 
                    {...field} 
                    value={field.value || ''}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="availableToday"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 space-y-0">
                <div className="space-y-0.5">
                  <FormLabel>Available Today</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="md:col-span-2">
            <FormItem>
              <FormLabel>Profile Image</FormLabel>
              <ImageUpload
                initialImage={doctor?.image || ''}
                onImageChange={handleImageChange}
              />
            </FormItem>
          </div>
          
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biography *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter doctor's biography and specialization details..." 
                      className="min-h-[120px]" 
                      {...field} 
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-blue-600 to-emerald-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                Saving...
              </span>
            ) : (
              isEditMode ? "Update Doctor" : "Add Doctor"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
