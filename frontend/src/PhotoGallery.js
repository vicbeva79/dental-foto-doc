import React from "react";

export default function PhotoGallery({ photos, onDelete }) {
  if (!photos.length) {
    return (
      <div className="empty-gallery">
        <p>No hay fotos en esta sesión</p>
      </div>
    );
  }

  return (
    <div className="photo-gallery">
      {photos.map((photo) => (
        <div key={photo.id} className="photo-item">
          <img 
            src={`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/${photo.url}`} 
            alt={`Foto ${photo.type}`} 
            className="gallery-image"
          />
          <div className="photo-overlay">
            <button 
              onClick={() => onDelete(photo.id)}
              className="delete-button"
              title="Eliminar foto"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 