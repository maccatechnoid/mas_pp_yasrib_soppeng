import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './CustomSelect.css';

const CustomSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Pilih...', 
  icon: Icon,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div className={`premium-selector-container ${isOpen ? 'is-open' : ''} ${className}`} ref={selectRef}>
      <div 
        className={`premium-selector ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="selector-trigger">
          {Icon && <Icon size={18} className="text-primary" />}
          <span className="selected-value">
            {value || placeholder}
          </span>
          <ChevronDown size={16} className={`chevron ${isOpen ? 'rotate' : ''}`} />
        </div>
        
        {isOpen && (
          <div className="selector-options">
            {options.map((option, i) => (
              <div 
                key={i} 
                className={`option-item ${value === option ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </div>
            ))}
            {options.length === 0 && (
              <div className="option-item disabled">Tidak ada data</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;
