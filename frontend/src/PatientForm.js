import React, { useState } from "react";

const DOCTORS = [
  "Dr. David Carralero",
  "Dra. Eva Tormo",
  "Dra. Lucía Sanchis",
  "Dra. Marta Piquer",
  "Dra. Ángela Martín",
  "Dra. Marina Marco",
  "Dra. Sara Macias",
  "Dr. Nicolás Pastrana",
  "Dra. Alicia Rocher",
  "Dra. Ofelia Sánchez",
  "Dra. Lidón Pedrós",
  "Dr. Luis Martorell",
  "Dr. Didier Delmas",
  "Dra. Mª Josep Albert",
  "Dr. Eugenio Sahuquillo",
  "Dr. Carlos Trull"
];

export default function PatientForm({ onCreate }) {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    fileNumber: "",
    doctor: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
    setFormData({
      name: "",
      lastName: "",
      fileNumber: "",
      doctor: ""
    });
  };

  return (
    <form onSubmit={handleSubmit} className="patient-form">
      <div className="form-group">
        <label htmlFor="name">Nombre</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Nombre del paciente"
        />
      </div>

      <div className="form-group">
        <label htmlFor="lastName">Apellidos</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
          placeholder="Apellidos del paciente"
        />
      </div>

      <div className="form-group">
        <label htmlFor="fileNumber">Número de Ficha</label>
        <input
          type="text"
          id="fileNumber"
          name="fileNumber"
          value={formData.fileNumber}
          onChange={handleChange}
          required
          placeholder="Número de ficha del paciente"
        />
      </div>

      <div className="form-group">
        <label htmlFor="doctor">Doctor Asignado</label>
        <select
          id="doctor"
          name="doctor"
          value={formData.doctor}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione un doctor</option>
          {DOCTORS.map(doctor => (
            <option key={doctor} value={doctor}>
              {doctor}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="submit-button">
        Crear Ficha
      </button>
    </form>
  );
} 