import React, { useState, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { CalendarIcon, Clock, Trash2 } from 'lucide-react';

// Days of the week for schedule
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

interface TimeSlot {
  start: string;
  end: string;
}

interface DoctorSchedule {
  [key: string]: TimeSlot;
}

interface DoctorScheduleFormProps {
  value: DoctorSchedule;
  onChange: (schedule: DoctorSchedule) => void;
}

export function DoctorScheduleForm({ value = {}, onChange }: DoctorScheduleFormProps) {
  const [schedule, setSchedule] = useState<DoctorSchedule>(value);

  // Keep component state in sync with parent
  useEffect(() => {
    setSchedule(value);
  }, [value]);

  // Handle day selection/deselection
  const handleDayToggle = (day: string, checked: boolean) => {
    const newSchedule = { ...schedule };
    
    if (checked) {
      // Add default time slot
      newSchedule[day] = { start: "09:00", end: "17:00" };
    } else {
      // Remove day from schedule
      delete newSchedule[day];
    }
    
    setSchedule(newSchedule);
    onChange(newSchedule);
  };

  // Handle time change for a day
  const handleTimeChange = (day: string, field: 'start' | 'end', time: string) => {
    const newSchedule = {
      ...schedule,
      [day]: {
        ...schedule[day],
        [field]: time
      }
    };
    
    setSchedule(newSchedule);
    onChange(newSchedule);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAYS_OF_WEEK.map(day => {
          const isSelected = day in schedule;
          
          return (
            <Card key={day} className={`${isSelected ? 'border-blue-300 shadow-blue-100' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox 
                    id={`day-${day}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => handleDayToggle(day, !!checked)}
                  />
                  <Label 
                    htmlFor={`day-${day}`}
                    className="font-medium"
                  >
                    {day}
                  </Label>
                </div>
                
                {isSelected && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor={`start-${day}`} className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Start
                      </Label>
                      <Input
                        id={`start-${day}`}
                        type="time"
                        value={schedule[day].start}
                        onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`end-${day}`} className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" /> End
                      </Label>
                      <Input
                        id={`end-${day}`}
                        type="time"
                        value={schedule[day].end}
                        onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
