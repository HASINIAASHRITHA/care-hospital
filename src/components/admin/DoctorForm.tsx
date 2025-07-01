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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// List of available specializations
const SPECIALIZATIONS = [
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "Psychiatry",
  "Oncology",
  "Gynecology",
  "Urology",
  "Ophthalmology",
  "ENT",
  "Dentistry",
  "Internal Medicine",
  "Family Medicine",
  "Emergency Medicine",
];

// Days of the week for schedule
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface DoctorFormProps {
  doctor: Doctor | null;
  onSaved: () => void;
  onCancel: () => void;
}

// Extended Doctor interface (though we don't see the actual interface, we need to modify the form accordingly)
// The actual interface would need updating in your types file

export const DoctorForm = ({ doctor, onSaved, onCancel }: DoctorFormProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const isEditMode = !!doctor;

  // Initialize schedule with proper structure for all days
  const initializeSchedule = () => {
    const initialSchedule: Record<string, { enabled: boolean; start: string; end: string }> = {};
    
    DAYS_OF_WEEK.forEach(day => {
      if (isEditMode && doctor?.schedule && doctor.schedule[day]) {
        initialSchedule[day] = {
          enabled: true,
          start: doctor.schedule[day].start || "09:00",
          end: doctor.schedule[day].end || "17:00"
        };
      } else {
        initialSchedule[day] = {
          enabled: false,
          start: "09:00",
          end: "17:00"
        };
      }
    });
    
    return initialSchedule;
  };

  const form = useForm<Doctor>({
    defaultValues: isEditMode
      ? { 
          ...doctor,
          specializations: doctor.specializations || [],
          schedule: initializeSchedule(),
          blockedDates: doctor.blockedDates || [],
        }
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
          specializations: [],
          schedule: initializeSchedule(),
          blockedDates: [],
        },
  });

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
  };

  const handleAddBlockedDate = (date: Date) => {
    const currentBlockedDates = form.getValues('blockedDates') || [];
    const dateString = format(date, 'yyyy-MM-dd');
    
    if (!currentBlockedDates.includes(dateString)) {
      form.setValue('blockedDates', [...currentBlockedDates, dateString]);
    }
  };

  const handleRemoveBlockedDate = (dateToRemove: string) => {
    const currentBlockedDates = form.getValues('blockedDates') || [];
    form.setValue('blockedDates', currentBlockedDates.filter(date => date !== dateToRemove));
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
          {/* Existing fields */}
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
                <FormLabel>Primary Specialty *</FormLabel>
                <FormControl>
                  <Input placeholder="Cardiologist" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* New field for specializations */}
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="specializations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Specializations</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {field.value?.map((spec) => (
                        <Badge key={spec} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                          {spec}
                          <X 
                            className="ml-1 h-3 w-3 cursor-pointer" 
                            onClick={() => {
                              field.onChange(field.value.filter(s => s !== spec));
                            }}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Select
                      onValueChange={(value) => {
                        if (!field.value?.includes(value)) {
                          field.onChange([...(field.value || []), value]);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Add specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALIZATIONS.filter(spec => !field.value?.includes(spec)).map((spec) => (
                          <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
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

          {/* Weekly schedule section */}
          <div className="md:col-span-2">
            <FormLabel className="block mb-2 text-lg font-medium">Weekly Schedule</FormLabel>
            <div className="bg-gray-50 p-4 rounded-md space-y-4">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="flex items-center space-x-4">
                  <FormField
                    control={form.control}
                    name={`schedule.${day}.enabled`}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`${day}-enabled`}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label 
                          htmlFor={`${day}-enabled`}
                          className="font-medium w-24"
                        >
                          {day}
                        </label>
                      </div>
                    )}
                  />
                  
                  {form.watch(`schedule.${day}.enabled`) && (
                    <div className="flex items-center space-x-2 flex-1">
                      <FormField
                        control={form.control}
                        name={`schedule.${day}.start`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <span>to</span>
                      <FormField
                        control={form.control}
                        name={`schedule.${day}.end`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Blocked dates section */}
          <div className="md:col-span-2">
            <FormLabel className="block mb-2 text-lg font-medium">Blocked Dates</FormLabel>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="mb-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Add blocked date
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date()}
                      onSelect={(date) => date && handleAddBlockedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-wrap gap-2">
                {form.watch('blockedDates')?.map((date: string) => (
                  <Badge key={date} className="bg-red-100 text-red-800 hover:bg-red-200">
                    {date}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveBlockedDate(date)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
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

function generateMessage(template, data) {
  return template
    .replace('{patient_name}', data.patient_name)
    .replace('{doctor_name}', data.doctor_name)
    .replace('{appointment_date}', data.date)
    .replace('{time}', data.time);
}
