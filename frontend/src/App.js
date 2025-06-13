import React, { useState, useEffect, useCallback } from "react";
import PatientForm from "./PatientForm";
import PhotoUploader from "./PhotoUploader";
import PhotoGallery from "./PhotoGallery";
import "./App.css";

const API_URL = "https://192.168.1.208:3001";

export default function App() {
  const [patient, setPatient] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar fotos desde el backend
  const loadPhotos = useCallback(async () => {
    if (!patient) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/photos/session/${patient.id}`);
      if (!res.ok) throw new Error('Error al cargar las fotos');
      const data = await res.json();
      setPhotos(data.photos || data);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar las fotos');
    } finally {
      setLoading(false);
    }
  }, [patient]);

  useEffect(() => {
    if (patient) loadPhotos();
  }, [patient, loadPhotos]);

  // Crear ficha de paciente
  const handleCreatePatient = async (data) => {
    try {
      setLoading(true);
      console.log('Enviando datos:', data);
      const res = await fetch(`${API_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al crear la ficha');
      }
      
      const sessionData = await res.json();
      console.log('Respuesta del servidor:', sessionData);
      setPatient({ ...data, id: sessionData.id });
      setPhotos([]);
      setError(null);
    } catch (err) {
      console.error('Error detallado:', err);
      setError(err.message || 'Error al crear la ficha');
    } finally {
      setLoading(false);
    }
  };

  // Subida de foto
  const handleUpload = async (file) => {
    if (!patient) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("type", "frontal");

      const res = await fetch(`${API_URL}/api/photos/${patient.id}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error('Error al subir la foto');
      
      await loadPhotos();
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al subir la foto');
    } finally {
      setLoading(false);
    }
  };

  // Eliminación de foto
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/photos/${id}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) throw new Error('Error al eliminar la foto');
      
      await loadPhotos();
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al eliminar la foto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <img src="/logo.png" alt="Logo Clínica" className="logo" />
      </header>

      <main className="app-main">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}

        {!patient ? (
          <div className="form-container">
            <h2>Nueva Ficha de Paciente</h2>
            <PatientForm onCreate={handleCreatePatient} />
          </div>
        ) : (
          <div className="patient-session">
            <div className="patient-info">
              <h2>{patient.name} {patient.lastName}</h2>
              <div className="patient-details">
                <span>Ficha: {patient.fileNumber}</span>
                <span>Doctor: {patient.doctor}</span>
              </div>
            </div>

            <div className="photo-section">
              <h3>Fotos de la Sesión</h3>
              <PhotoUploader onUpload={handleUpload} />
              <PhotoGallery photos={photos} onDelete={handleDelete} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
