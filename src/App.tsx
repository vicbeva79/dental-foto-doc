import React, { useRef, useState } from 'react';
import './App.css';
import domtoimage from 'dom-to-image';

// Importar imágenes
import perfilImg from './assets/images/capture-profile.png';
import frontalSonrisaImg from './assets/images/capture-smile.png';
import frontalReposoImg from './assets/images/capture-rest.png';
import intraoralAnteriorImg from './assets/images/capture-mouth-open.png';
import oclusalSuperiorImg from './assets/images/capture-upper-occlusal.png';
import lateralIzquierdaImg from './assets/images/capture-left-lateral.png';
import intrabucalAnteriorImg from './assets/images/capture-intraoral.png';
import oclusalInferiorImg from './assets/images/capture-lower-occlusal.png';
import lateralDerechaImg from './assets/images/capture-right-lateral.png';

// @ts-ignore: No type definitions for dom-to-image
const getTodayES = () => {
  const now = new Date();
  return now.toLocaleDateString('es-ES');
};

const MAX_PHOTOS = 9;
const aspectRatio = 16/9;
const A4_WIDTH_PX = 2480;
const A4_HEIGHT_PX = 1754;

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const PHOTO_LABELS = [
  'Perfil',                          // Posición 0
  'Frontal sonrisa',                 // Posición 1
  'Frontal reposo',                  // Posición 2
  'Intraoral anterior boca entreabierta', // Posición 3
  'Oclusal superior',                // Posición 4
  'Lateral izquierda',               // Posición 5
  'Intrabucal anterior',             // Posición 6
  'Oclusal inferior',                // Posición 7
  'Lateral derecha'                  // Posición 8
];

const PHOTO_IMAGES = [
  perfilImg,                          // Posición 0
  frontalSonrisaImg,                 // Posición 1
  frontalReposoImg,                  // Posición 2
  intraoralAnteriorImg,             // Posición 3
  oclusalSuperiorImg,               // Posición 4
  lateralIzquierdaImg,              // Posición 5
  intrabucalAnteriorImg,            // Posición 6
  oclusalInferiorImg,               // Posición 7
  lateralDerechaImg                 // Posición 8
];

const App: React.FC = () => {
  const [nombre, setNombre] = useState<string>('');
  const [ficha, setFicha] = useState<string>('');
  const [fotos, setFotos] = useState<(string | null)[]>(Array(MAX_PHOTOS).fill(null));
  const [camaraActiva, setCamaraActiva] = useState<boolean>(false);
  const [fotoActual, setFotoActual] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const [descargando, setDescargando] = useState(false);
  const [camaras, setCamaras] = useState<MediaDeviceInfo[]>([]);
  const [camaraSeleccionada, setCamaraSeleccionada] = useState<string>('');
  const [showSelector, setShowSelector] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportando, setExportando] = useState(false);

  // Detectar orientación del dispositivo
  React.useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // Activar cámara para una celda específica
  const activarCamara = (index: number) => {
    setFotoActual(index);
    if (isMobile()) {
      // Disparar input file en móvil
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }

    // En desktop, mostrar selector de cámara
    setShowSelector(true);
    setFotoActual(index);
  };

  // Iniciar cámara con el dispositivo seleccionado
  const iniciarCamara = async (index: number, deviceId: string) => {
    try {
      setError(null);
      setFotoActual(index);
      setCamaraActiva(true);
      setShowSelector(false);

      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      setError('Error al acceder a la cámara trasera. Por favor, asegúrate de dar los permisos necesarios.');
      setCamaraActiva(false);
      setFotoActual(null);
      setShowSelector(false);
      console.error('Error al acceder a la cámara:', err);
    }
  };

  // Capturar foto con mejor calidad
  const capturarFoto = () => {
    try {
      if (!videoRef.current || !canvasRef.current || fotoActual === null) {
        throw new Error('No se puede capturar la foto en este momento');
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Ajustar tamaño del canvas al video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('No se pudo obtener el contexto del canvas');
      }

      // Dibujar el frame actual del video
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Obtener la imagen en alta calidad
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setFotos(fotos => {
        const nuevas = [...fotos];
        nuevas[fotoActual] = dataUrl;
        return nuevas;
      });

      // Detener la cámara
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      
      setCamaraActiva(false);
      setFotoActual(null);
    } catch (err) {
      setError('Error al capturar la foto');
      console.error('Error al capturar:', err);
    }
  };

  // Manejar archivo seleccionado desde input file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || fotoActual === null) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFotos(fotos => {
        const nuevas = [...fotos];
        nuevas[fotoActual] = ev.target?.result as string;
        return nuevas;
      });
      setFotoActual(null);
    };
    reader.readAsDataURL(file);
  };

  // Descargar documento como imagen
  const descargarDocumento = async () => {
    if (!docRef.current) return;
    
    try {
      setDescargando(true);
      setExportando(true);
      
      // Esperar a que se apliquen los estilos de exportación
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await domtoimage.toJpeg(docRef.current, {
        quality: 0.95,
        bgcolor: '#fff',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      
      const link = document.createElement('a');
      const fecha = getTodayES().replaceAll('/', '-');
      link.download = `${nombre || 'paciente'}_${fecha}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error al generar la imagen:', err);
      setError('Error al generar la imagen. Por favor, intenta de nuevo.');
    } finally {
      setDescargando(false);
      setExportando(false);
    }
  };

  // Cargar lista de cámaras disponibles
  React.useEffect(() => {
    const cargarCamaras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCamaras(videoDevices);
        if (videoDevices.length > 0) {
          setCamaraSeleccionada(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Error al cargar las cámaras:', err);
      }
    };
    cargarCamaras();
  }, []);

  return (
    <div className={`App ${exportando ? 'exportando' : ''}`}>
      <div className="doc-a4" ref={docRef}>
        <header className="doc-header">
          <img src="https://i.postimg.cc/SNkk4x1J/Logotipo-horizontal-Dental-Carralero.png" alt="Logo" className="logo-empresa" />
          <div className="datos-paciente">
            <div>
              <label>Nombre del paciente:</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" />
            </div>
            <div>
              <label>Número de ficha:</label>
              <input type="text" value={ficha} onChange={e => setFicha(e.target.value)} placeholder="Ficha" />
            </div>
          </div>
        </header>

        <div className="fotos-grid">
          {Array.from({ length: 3 }).map((_, row) => (
            <div className="fila-fotos" key={row}>
              {Array.from({ length: 3 }).map((_, col) => {
                const idx = row * 3 + col;
                return (
                  <div className="foto-celda" key={col} style={{ aspectRatio: '16/9' }}>
                    {fotos[idx] ? (
                      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <img 
                          src={fotos[idx] as string} 
                          alt={`Foto ${idx + 1}`} 
                          className="foto-paciente"
                          style={{
                            transform: (idx === 4 || idx === 7) ? 'rotate(180deg)' : 'none'
                          }}
                        />
                        <button
                          className="btn-eliminar-foto"
                          title="Eliminar foto"
                          onClick={() => {
                            setFotos(fotos => {
                              const nuevas = [...fotos];
                              nuevas[idx] = null;
                              return nuevas;
                            });
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn-capturar"
                        onClick={() => activarCamara(idx)}
                        title={PHOTO_LABELS[idx]}
                      >
                        <img 
                          src={PHOTO_IMAGES[idx]} 
                          alt={PHOTO_LABELS[idx]} 
                          className="btn-image"
                        />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <footer className="doc-footer">
          <p className="fecha-doc">{getTodayES()}</p>
        </footer>
      </div>

      {fotos.every(f => f) && (
        <button className="btn-descargar" onClick={descargarDocumento} disabled={descargando}>
          {descargando ? 'Generando...' : 'Descargar documento JPG'}
        </button>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {showSelector && (
        <div className="modal-camara">
          <div className="camara-contenedor">
            <h3>Selecciona una cámara</h3>
            <select
              value={camaraSeleccionada}
              onChange={(e) => setCamaraSeleccionada(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '16px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            >
              {camaras.map(camara => (
                <option key={camara.deviceId} value={camara.deviceId}>
                  {camara.label || `Cámara ${camaras.indexOf(camara) + 1}`}
                </option>
              ))}
            </select>
            <button
              className="btn-foto"
              onClick={() => {
                if (fotoActual !== null && camaraSeleccionada) {
                  iniciarCamara(fotoActual, camaraSeleccionada);
                }
              }}
            >
              Usar esta cámara
            </button>
            <button
              className="btn-cerrar"
              onClick={() => {
                setShowSelector(false);
                setFotoActual(null);
              }}
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {camaraActiva && (
        <div className="modal-camara">
          <div className="camara-contenedor">
            {isPortrait && (
              <div style={{
                background: '#ffecb3',
                color: '#b26a00',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: 12,
                fontWeight: 600,
                textAlign: 'center',
                maxWidth: 400
              }}>
                Para mejores resultados, gira tu dispositivo y toma la foto en horizontal (apaisado).
              </div>
            )}
            <video ref={videoRef} autoPlay playsInline className="video-captura" style={{ aspectRatio: '16/9', width: '100%', maxWidth: 600, background: '#222', borderRadius: 8, objectFit: 'cover' }} />
            <button className="btn-foto" onClick={capturarFoto}>Tomar foto</button>
            <button className="btn-cerrar" onClick={() => {
              if (videoRef.current && videoRef.current.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
              }
              setCamaraActiva(false);
              setFotoActual(null);
            }}>Cancelar</button>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Cerrar</button>
        </div>
      )}
    </div>
  );
};

export default App;
