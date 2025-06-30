import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';

interface DoctorBlockedDatesProps {
  value: string[];
  onChange: (dates: string[]) => void;
}

export function DoctorBlockedDatesCalendar({ value = [], onChange }: DoctorBlockedDatesProps) {
  const [blockedDates, setBlockedDates] = useState<Date[]>(
    value.map(dateStr => new Date(dateStr))
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Keep component state in sync with parent
  useEffect(() => {
    setBlockedDates(value.map(dateStr => new Date(dateStr)));
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Format to YYYY-MM-DD for comparison
    const dateString = format(date, 'yyyy-MM-dd');
    const existingDateIndex = value.findIndex(d => d === dateString);
    
    let newBlockedDates;
    
    if (existingDateIndex >= 0) {
      // Remove date if already selected
      newBlockedDates = value.filter((_, i) => i !== existingDateIndex);
    } else {
      // Add date if not already selected
      newBlockedDates = [...value, dateString];
    }
    
    onChange(newBlockedDates);
    // Keep calendar open for multiple selections
  };

  const removeDate = (dateToRemove: string) => {
    const newDates = value.filter(date => date !== dateToRemove);
    onChange(newDates);
  };

  return (
    <div className="space-y-2">
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {blockedDates.length === 0 ? (
              <span>Select blocked dates</span>
            ) : (
              <span>{blockedDates.length} date(s) blocked</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="multiple"
            selected={blockedDates}
            onSelect={(dates) => {
              const newDate = dates ? dates[dates.length - 1] : undefined;
              handleSelect(newDate);
            }}
            initialFocus
            className="rounded-md border"
          />
          <div className="border-t p-3 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {blockedDates.length} date(s) selected
            </span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsCalendarOpen(false)}
            >
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.sort().map(date => (
            <Badge 
              key={date} 
              variant="outline"
              className="bg-red-50 text-red-800 hover:bg-red-100 flex items-center"
            >
              {format(new Date(date), 'MMM dd, yyyy')}
              <button
                type="button"
                onClick={() => removeDate(date)}
                className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-red-300"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {date}</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
