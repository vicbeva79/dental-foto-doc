import React from 'react';
import { DOCTORS, Doctor } from '../../constants/doctors';

interface DoctorSelectProps {
  value: string;
  onChange: (doctor: string) => void;
  className?: string;
}

export const DoctorSelect: React.FC<DoctorSelectProps> = ({
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`doctor-select ${className}`}>
      <label htmlFor="doctor-select">Doctor Responsable:</label>
      <select
        id="doctor-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="doctor-select__input"
      >
        <option value="">Seleccione un doctor</option>
        {DOCTORS.map((doctor) => (
          <option key={doctor} value={doctor}>
            {doctor}
          </option>
        ))}
      </select>
    </div>
  );
}; 