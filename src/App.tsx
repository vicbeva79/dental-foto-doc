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

const A4_WIDTH_PX = 1123; // 297mm at 96dpi
const A4_HEIGHT_PX = 794; // 210mm at 96dpi (apaisado)

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

  // Detectar cámaras disponibles al cargar
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const videoInputs = devices.filter(d => d.kind === 'videoinput');
      setCamaras(videoInputs);
      if (videoInputs.length === 1) setCamaraSeleccionada(videoInputs[0].deviceId);
    });
  }, []);

  // Activar cámara para una celda específica
  const activarCamara = (index: number) => {
    setFotoActual(index);
    if (camaras.length > 1 && !camaraSeleccionada) {
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
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId }, aspectRatio } : { aspectRatio, facingMode: 'environment' }
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

  // Capturar foto
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

      const width = 320;
      const height = Math.round(width / aspectRatio);
      canvas.width = width;
      canvas.height = height;
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
      const originalWidth = node.style.width;
      const originalHeight = node.style.height;
      const originalPosition = node.style.position;
      const originalLeft = node.style.left;
      const originalTop = node.style.top;
      const originalMargin = node.style.margin;
      const originalTransform = node.style.transform;
      const originalPadding = node.style.padding;
      const originalBorderRadius = node.style.borderRadius;
      // Aplicar estilos para la captura (solo tamaño y fondo)
      node.style.width = `${A4_WIDTH_PX}px`;
      node.style.height = `${A4_HEIGHT_PX}px`;
      node.style.backgroundColor = '#ffffff';
      node.style.position = 'fixed';
      node.style.left = '0';
      node.style.top = '0';
      node.style.margin = '0';
      node.style.transform = 'none';
      node.style.padding = '0';
      node.style.borderRadius = '0';
      // Esperar a que los estilos se apliquen (100ms)
      await new Promise(resolve => setTimeout(resolve, 100));
      const dataUrl = await domtoimage.toJpeg(node, { 
        quality: 0.98, 
        width: A4_WIDTH_PX, 
        height: A4_HEIGHT_PX,
        bgcolor: '#ffffff',
        style: {
          'transform': 'none',
          'background-color': '#ffffff',
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
      node.style.width = originalWidth;
      node.style.height = originalHeight;
      node.style.backgroundColor = '';
      node.style.position = originalPosition;
      node.style.left = originalLeft;
      node.style.top = originalTop;
      node.style.margin = originalMargin;
      node.style.transform = originalTransform;
      node.style.padding = originalPadding;
      node.style.borderRadius = originalBorderRadius;
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
              style={{ fontSize: '1.1rem', marginBottom: 16 }}
            >
              <option value={undefined}>Selecciona...</option>
              {camaras.map(cam => (
                <option key={cam.deviceId} value={cam.deviceId}>{cam.label || `Cámara ${cam.deviceId}`}</option>
              ))}
            </select>
            <button
              className="btn-foto"
              onClick={() => {
                if (fotoActual !== null && camaraSeleccionada) {
                  iniciarCamara(fotoActual, camaraSeleccionada);
                }
              }}
              disabled={!camaraSeleccionada}
            >
              Activar cámara
            </button>
            <button className="btn-cerrar" onClick={() => setShowSelector(false)}>Cancelar</button>
          </div>
        </div>
      )}
      {camaraActiva && (
        <div className="modal-camara">
          <div className="camara-contenedor">
            <video ref={videoRef} autoPlay playsInline className="video-captura" />
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
