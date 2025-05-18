"use client";

import { useState, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { motion } from '@/components/motion';
import "react-datepicker/dist/react-datepicker.css";

interface CalendarPickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export default function CalendarPicker({
  selectedDate,
  onChange,
  minDate,
  maxDate,
  placeholder = "Select end date",
  error,
  disabled = false
}: CalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Format date for display
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Custom input component that matches the theme
  const CustomInput = forwardRef<HTMLDivElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => (
      <div
        ref={ref}
        onClick={!disabled ? onClick : undefined}
        className={`flex items-center justify-between w-full px-4 py-3 bg-[#0E0E10] border rounded-lg cursor-pointer transition-colors ${
          error ? 'border-red-400' : isOpen ? 'border-[#5F6FFF]' : 'border-white/20'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-[#5F6FFF]'}`}
      >
        <div className="flex items-center">
          <CalendarIcon className="w-5 h-5 mr-3 text-[#5F6FFF]" />
          <span className={`${!value ? 'text-[#B0B0B0]' : 'text-white'}`}>
            {value || placeholder}
          </span>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-[#B0B0B0] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
    )
  );
  
  CustomInput.displayName = 'CustomInput';

  return (
    <div className="relative">
      <DatePicker
        selected={selectedDate}
        onChange={(date: Date | null) => {
          onChange(date);
          setIsOpen(false);
        }}
        onCalendarOpen={() => setIsOpen(true)}
        onCalendarClose={() => setIsOpen(false)}
        minDate={minDate || new Date()}
        maxDate={maxDate}
        dateFormat="MMM d, yyyy"
        showPopperArrow={false}
        customInput={<CustomInput value={formatDate(selectedDate)} />}
        disabled={disabled}
        calendarClassName="bg-[#151518] border border-white/10 text-white shadow-xl rounded-lg p-2"
        dayClassName={date => 
          "hover:bg-[#5F6FFF]/20 rounded-full text-center py-1.5 w-8 mx-auto"
        }
        wrapperClassName="w-full"
        popperClassName="z-50"
        popperModifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
            fn: (state) => state, // Identity function to satisfy type requirements
          },
        ]}
        popperPlacement="bottom-start"
        monthClassName={() => "font-medium"}
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled
        }) => (
          <div className="flex items-center justify-between px-2 py-2">
            <button
              type="button"
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0E0E10] text-white/70 hover:bg-[#0E0E10]/80 disabled:opacity-40"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            
            <span className="text-white font-medium">
              {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            
            <button
              type="button"
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0E0E10] text-white/70 hover:bg-[#0E0E10]/80 disabled:opacity-40"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      />
      
      {error && (
        <motion.p 
          className="mt-2 text-sm text-red-400" 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// Calendar icon component
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}

// Chevron down icon component
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}

// Chevron left icon component
function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  );
}

// Chevron right icon component
function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
}
