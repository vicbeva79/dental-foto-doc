import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import domtoimage from 'dom-to-image';

// @ts-ignore: No type definitions for dom-to-image

const LOGO_URL = 'https://i.postimg.cc/SNkk4x1J/Logotipo-horizontal-Dental-Carralero.png';

function getTodayES() {
  return new Date().toLocaleDateString('es-ES');
}

const MAX_PHOTOS = 9;

const aspectRatio = 16 / 9;

const A4_WIDTH_PX = 2480; // Aumentado para mejor resolución (297mm a 300dpi)
const A4_HEIGHT_PX = 1754; // Aumentado para mejor resolución (210mm a 300dpi)

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
  const [descargando, setDescargando] = useState<boolean>(false);
  const [camaras, setCamaras] = useState<MediaDeviceInfo[]>([]);
  const [camaraSeleccionada, setCamaraSeleccionada] = useState<string | undefined>(undefined);
  const [showSelector, setShowSelector] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  // Detectar cámaras disponibles al cargar y cuando cambia el estado de la cámara
  useEffect(() => {
    const detectarCamaras = async () => {
      try {
        // Primero solicitar permisos de cámara
        await navigator.mediaDevices.getUserMedia({ video: true });
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        
        // Ordenar cámaras: primero la trasera (si existe), luego las demás
        const sortedCameras = videoInputs.sort((a, b) => {
          const aIsBack = a.label.toLowerCase().includes('back') || 
                         a.label.toLowerCase().includes('trasera') ||
                         a.label.toLowerCase().includes('posterior');
          const bIsBack = b.label.toLowerCase().includes('back') || 
                         b.label.toLowerCase().includes('trasera') ||
                         b.label.toLowerCase().includes('posterior');
          if (aIsBack && !bIsBack) return -1;
          if (!aIsBack && bIsBack) return 1;
          return 0;
        });

        setCamaras(sortedCameras);
        
        // Seleccionar automáticamente la cámara trasera si existe
        const backCamera = sortedCameras.find(cam => 
          cam.label.toLowerCase().includes('back') || 
          cam.label.toLowerCase().includes('trasera') ||
          cam.label.toLowerCase().includes('posterior')
        );
        
        if (backCamera) {
          setCamaraSeleccionada(backCamera.deviceId);
        } else if (sortedCameras.length === 1) {
          setCamaraSeleccionada(sortedCameras[0].deviceId);
        }
      } catch (err) {
        console.error('Error al detectar cámaras:', err);
        setError('No se pudieron detectar las cámaras disponibles. Asegúrate de dar permisos de cámara.');
      }
    };

    detectarCamaras();
    navigator.mediaDevices.addEventListener('devicechange', detectarCamaras);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', detectarCamaras);
    };
  }, []);

  // Detectar orientación del dispositivo
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener('resize', checkOrientation);
    checkOrientation();
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // Activar cámara para una celda específica
  const activarCamara = (index: number) => {
    setFotoActual(index);
    if (camaras.length > 1) {
      setShowSelector(true);
    } else {
      iniciarCamara(index, camaraSeleccionada);
    }
  };

  // Iniciar cámara con deviceId
  const iniciarCamara = async (index: number, deviceId?: string) => {
    try {
      setError(null);
      setFotoActual(index);
      setCamaraActiva(true);
      setShowSelector(false);

      // Detener cualquier stream activo
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' }),
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          aspectRatio: { ideal: 16/9 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      setError('Error al acceder a la cámara. Por favor, asegúrate de dar los permisos necesarios.');
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

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No se pudo obtener el contexto del canvas');
      }

      // Usar dimensiones más altas para mejor calidad
      const width = 1920;
      const height = Math.round(width / aspectRatio);
      canvas.width = width;
      canvas.height = height;
      
      // Aplicar mejor calidad de renderizado
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(video, 0, 0, width, height);
      
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
      console.error('Error al capturar la foto:', err);
    }
  };

  // Descargar documento como JPG
  const descargarDocumento = async () => {
    if (!docRef.current) return;
    try {
      setError(null);
      setDescargando(true);
      document.body.classList.add('exportando');
      const node = docRef.current;
      
      // Guardar los estilos originales
      const originalStyles = {
        width: node.style.width,
        height: node.style.height,
        position: node.style.position,
        left: node.style.left,
        top: node.style.top,
        margin: node.style.margin,
        transform: node.style.transform,
        padding: node.style.padding,
        borderRadius: node.style.borderRadius,
        backgroundColor: node.style.backgroundColor
      };

      // Aplicar estilos para la captura
      Object.assign(node.style, {
        width: `${A4_WIDTH_PX}px`,
        height: `${A4_HEIGHT_PX}px`,
        backgroundColor: '#ffffff',
        position: 'fixed',
        left: '0',
        top: '0',
        margin: '0',
        transform: 'none',
        padding: '0',
        borderRadius: '0'
      });

      // Esperar a que los estilos se apliquen
      await new Promise(resolve => setTimeout(resolve, 100));

      // Configuración mejorada para dom-to-image
      const dataUrl = await domtoimage.toJpeg(node, { 
        quality: 1.0, // Máxima calidad
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        bgcolor: '#ffffff',
        style: {
          'transform': 'none',
          'background-color': '#ffffff',
        },
        imagePlaceholder: undefined,
        cacheBust: true,
        filter: (node) => {
          return (node.tagName !== 'BUTTON');
        }
      });

      try {
        const link = document.createElement('a');
        const fecha = getTodayES().replaceAll('/', '-');
        link.download = `${nombre || 'paciente'}_${fecha}.jpg`;
        link.href = dataUrl;
        link.click();
      } catch (e) {
        setError('No se pudo descargar el documento. Prueba en otro navegador o dispositivo.');
      }

      // Restaurar estilos originales
      Object.assign(node.style, originalStyles);
      document.body.classList.remove('exportando');
    } catch (err) {
      setError('Error al generar el documento');
      console.error('Error al generar el documento:', err);
      document.body.classList.remove('exportando');
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="App">
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Cerrar</button>
        </div>
      )}
      <div className="doc-a4" ref={docRef}>
        <header className="doc-header">
          <img src={LOGO_URL} alt="Logo" className="logo-empresa" />
          <div className="datos-paciente">
            <div>
              <label>Nombre del paciente:</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" />
            </div>
            <div>
              <label>Nº de ficha:</label>
              <input type="text" value={ficha} onChange={e => setFicha(e.target.value)} placeholder="Ficha" />
            </div>
          </div>
        </header>
        <main className="fotos-grid">
          {Array(3).fill(0).map((_, fila) => (
            <div className="fila-fotos" key={fila}>
              {Array(3).fill(0).map((_, col) => {
                const idx = fila * 3 + col;
                return (
                  <div className="foto-celda" key={col} style={{ aspectRatio: '16/9' }}>
                    {fotos[idx] ? (
                      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <img src={fotos[idx] as string} alt={`Foto ${idx + 1}`} className="foto-paciente" />
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
                      <button className="btn-capturar" onClick={() => activarCamara(idx)}>
                        Capturar foto
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </main>
        <footer className="doc-footer">
          <span className="fecha-doc">Documento generado: {getTodayES()}</span>
        </footer>
      </div>
      {fotos.every(f => f) && (
        <button className="btn-descargar" onClick={descargarDocumento} disabled={descargando}>
          {descargando ? 'Generando...' : 'Descargar documento JPG'}
        </button>
      )}
      {showSelector && (
        <div className="modal-camara">
          <div className="camara-contenedor">
            <h3>Selecciona una cámara</h3>
            <select
              value={camaraSeleccionada}
              onChange={e => setCamaraSeleccionada(e.target.value)}
              style={{ 
                fontSize: '1.1rem', 
                marginBottom: 16,
                padding: '12px',
                width: '100%',
                maxWidth: '400px',
                borderRadius: '8px',
                border: '1px solid #ccc'
              }}
            >
              <option value={undefined}>Selecciona una cámara...</option>
              {camaras.map(cam => (
                <option key={cam.deviceId} value={cam.deviceId}>
                  {cam.label || `Cámara ${cam.deviceId.slice(0, 8)}...`}
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button
                className="btn-foto"
                onClick={() => {
                  if (fotoActual !== null && camaraSeleccionada) {
                    iniciarCamara(fotoActual, camaraSeleccionada);
                  }
                }}
                disabled={!camaraSeleccionada}
                style={{ flex: 1 }}
              >
                Activar cámara
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
    </div>
  );
};

export default App;
