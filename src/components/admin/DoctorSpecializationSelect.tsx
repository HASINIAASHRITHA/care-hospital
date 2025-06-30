import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Predefined list of specializations
const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Geriatrics",
  "Neurology",
  "Obstetrics",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Urology"
];

interface DoctorSpecializationSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function DoctorSpecializationSelect({ value = [], onChange }: DoctorSpecializationSelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>(value);

  // Keep component state in sync with parent
  useEffect(() => {
    setSelectedItems(value);
  }, [value]);

  const handleSelect = (item: string) => {
    let newSelectedItems;
    
    if (selectedItems.includes(item)) {
      newSelectedItems = selectedItems.filter(i => i !== item);
    } else {
      newSelectedItems = [...selectedItems, item];
    }
    
    setSelectedItems(newSelectedItems);
    onChange(newSelectedItems);
  };

  const removeItem = (item: string) => {
    const newSelectedItems = selectedItems.filter(i => i !== item);
    setSelectedItems(newSelectedItems);
    onChange(newSelectedItems);
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-full"
          >
            Select specializations
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search specialization..." />
            <CommandEmpty>No specialization found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-y-auto">
              {SPECIALIZATIONS.map((specialization) => (
                <CommandItem
                  key={specialization}
                  value={specialization}
                  onSelect={() => handleSelect(specialization)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedItems.includes(specialization) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {specialization}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedItems.map(item => (
            <Badge 
              key={item} 
              variant="outline"
              className="bg-blue-50 text-blue-800 hover:bg-blue-100 flex items-center"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-blue-300"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {item}</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
