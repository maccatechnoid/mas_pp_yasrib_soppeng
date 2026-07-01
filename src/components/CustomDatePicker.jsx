import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import './CustomDatePicker.css';

const CustomDatePicker = ({ value, onChange, placeholder = 'Pilih Tanggal', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
        setCurrentDate(d);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    // Adjust for timezone offset to avoid previous day issue
    const tzOffset = newDate.getTimezoneOffset() * 60000;
    const localDate = new Date(newDate.getTime() - tzOffset);
    const dateStr = localDate.toISOString().split('T')[0];
    
    setSelectedDate(newDate);
    onChange({ target: { value: dateStr } });
    setIsOpen(false);
  };

  const clearDate = (e) => {
    e.stopPropagation();
    setSelectedDate(null);
    onChange({ target: { value: '' } });
  };

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const renderCalendar = () => {
    const days = [];
    const totalSlots = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;

    for (let i = 0; i < totalSlots; i++) {
      if (i < firstDayOfMonth || i >= daysInMonth + firstDayOfMonth) {
        days.push(<div key={`empty-${i}`} className="cdp-day empty"></div>);
      } else {
        const day = i - firstDayOfMonth + 1;
        const isSelected = selectedDate && 
          selectedDate.getDate() === day && 
          selectedDate.getMonth() === currentDate.getMonth() && 
          selectedDate.getFullYear() === currentDate.getFullYear();
        
        const isToday = new Date().getDate() === day && 
          new Date().getMonth() === currentDate.getMonth() && 
          new Date().getFullYear() === currentDate.getFullYear();

        days.push(
          <div 
            key={day} 
            className={`cdp-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
            onClick={() => handleDateClick(day)}
          >
            {day}
          </div>
        );
      }
    }
    return days;
  };

  const displayFormat = selectedDate ? 
    `${selectedDate.getDate().toString().padStart(2, '0')} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}` 
    : '';

  return (
    <div className={`custom-datepicker-container ${className}`} ref={containerRef}>
      <div 
        className={`cdp-trigger ${isOpen ? 'active' : ''} ${!selectedDate ? 'placeholder' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarDays size={18} className="cdp-icon" />
        <span className="cdp-value">{selectedDate ? displayFormat : placeholder}</span>
        {selectedDate && (
          <X size={16} className="cdp-clear" onClick={clearDate} />
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="cdp-dropdown"
          >
            <div className="cdp-header">
              <button className="cdp-nav-btn" onClick={prevMonth}><ChevronLeft size={18} /></button>
              <div className="cdp-current-month">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
              <button className="cdp-nav-btn" onClick={nextMonth}><ChevronRight size={18} /></button>
            </div>
            
            <div className="cdp-body">
              <div className="cdp-weekdays">
                {dayNames.map(day => (
                  <div key={day} className="cdp-weekday">{day}</div>
                ))}
              </div>
              <div className="cdp-days-grid">
                {renderCalendar()}
              </div>
            </div>
            
            <div className="cdp-footer">
              <button 
                className="cdp-today-btn"
                onClick={() => {
                  setCurrentDate(new Date());
                  handleDateClick(new Date().getDate());
                }}
              >
                Hari Ini
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDatePicker;
