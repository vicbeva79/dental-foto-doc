import React, { useState, useRef } from "react";

export default function PhotoUploader({ onUpload }) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      setError(null);
      
      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Tu navegador no soporta el acceso a la cámara");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      let errorMessage = "No se pudo acceder a la cámara. ";
      
      if (err.name === "NotAllowedError") {
        errorMessage += "Por favor, asegúrese de dar los permisos necesarios en la configuración de su navegador.";
      } else if (err.name === "NotFoundError") {
        errorMessage += "No se encontró ninguna cámara en el dispositivo.";
      } else if (err.name === "NotReadableError") {
        errorMessage += "La cámara está siendo usada por otra aplicación.";
      } else {
        errorMessage += "Error desconocido. Por favor, intente en otro navegador.";
      }
      
      setError(errorMessage);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setPreviewUrl(null);
    setError(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob(blob => {
        const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
        onUpload(file);
        setPreviewUrl(URL.createObjectURL(blob));
      }, "image/jpeg", 0.95);
    } catch (err) {
      console.error("Error al capturar la foto:", err);
      setError("Error al capturar la foto. Por favor, intente de nuevo.");
    }
  };

  return (
    <div className="photo-uploader">
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="close-error-button">
            ×
          </button>
        </div>
      )}

      {!isCameraOpen ? (
        <button 
          onClick={startCamera}
          className="camera-button"
        >
          <span className="camera-icon">📸</span>
          Abrir Cámara
        </button>
      ) : (
        <div className="camera-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="camera-preview"
          />
          
          <div className="camera-controls">
            <button 
              onClick={capturePhoto}
              className="capture-button"
            >
              Capturar
            </button>
            <button 
              onClick={stopCamera}
              className="cancel-button"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {previewUrl && (
        <div className="preview-container">
          <img 
            src={previewUrl} 
            alt="Vista previa" 
            className="preview-image"
          />
          <button 
            onClick={() => setPreviewUrl(null)}
            className="close-preview-button"
          >
            Cerrar vista previa
          </button>
        </div>
      )}
    </div>
  );
} 