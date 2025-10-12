import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvailabilityRecord {
  id: number;
  date: string;
  status: 'available' | 'full' | 'unavailable';
  notes: string;
}

interface CustomCalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  disabled?: (date: Date) => boolean;
  availabilities?: AvailabilityRecord[];
}

const CustomCalendar = ({ selected, onSelect, disabled, availabilities = [] }: CustomCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getDateAvailability = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const availability = availabilities.find(a => a.date === dateStr);
    return availability?.status || 'available';
  };

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateSelected = (date: Date) => {
    return selected && selected.toDateString() === date.toDateString();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    if (disabled && disabled(date)) return;
    const availability = getDateAvailability(date);
    if (availability === 'unavailable' || availability === 'full') return;
    onSelect?.(date);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="w-full max-w-sm mx-auto p-3 bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-full touch-manipulation"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        
        <h2 className="text-base sm:text-lg font-semibold text-center">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-full touch-manipulation"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map(day => (
          <div key={day} className="p-1 text-center text-xs sm:text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="aspect-square"></div>;
          }

          const availability = getDateAvailability(day);
          const isFull = availability === 'full';
          const isUnavailable = availability === 'unavailable';
          const isSelected = isDateSelected(day);
          const isPast = day < new Date();
          const isDisabled = disabled ? disabled(day) : isPast;

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              disabled={isDisabled || isFull || isUnavailable}
              className={cn(
                "relative aspect-square text-xs sm:text-sm rounded-lg transition-all duration-200 hover:bg-gray-100 touch-manipulation flex items-center justify-center min-h-[40px] sm:min-h-[44px] p-0",
                {
                  // Selected date
                  "bg-primary text-white hover:bg-primary/90": isSelected && !isFull && !isUnavailable,
                  
                  // Full dates - red background
                  "bg-red-100 text-red-800 cursor-not-allowed": isFull,
                  
                  // Unavailable dates - gray background
                  "bg-gray-200 text-gray-500 cursor-not-allowed": isUnavailable,
                  
                  // Past dates
                  "text-gray-400 cursor-not-allowed": isPast,
                  
                  // Default available - make it green
                  "bg-green-50 text-green-800 border border-green-200 hover:bg-green-100": !isSelected && !isFull && !isUnavailable && !isPast && availability === 'available',
                  
                  // Future dates without specific availability data - default light style
                  "hover:bg-primary/10": !isSelected && !isFull && !isUnavailable && !isPast && !availability
                }
              )}
            >
              {/* Date number - perfectly centered */}
              <span className="absolute inset-0 flex items-center justify-center font-medium text-center">
                {day.getDate()}
              </span>
              
              {/* Available date indicator - green dot for confirmed availability */}
              {availability === 'available' && !isFull && !isUnavailable && !isPast && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
              )}
              
              {/* Full date indicator */}
              {isFull && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
              
              {/* Unavailable date indicator */}
              {isUnavailable && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-gray-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-3 text-xs flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
          <span>Complet</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-500 rounded-full flex-shrink-0"></div>
          <span>Indisponible</span>
        </div>
      </div>
    </div>
  );
};

export default CustomCalendar;