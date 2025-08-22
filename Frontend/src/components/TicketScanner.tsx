import React, { useState, useRef, useEffect } from 'react';
import { Camera, Search, CheckCircle, User, Clock, MapPin, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiService from '../services/api';

interface TicketValidation {
  reservation_id: number;
  code_ticket: string;
  client_nom: string;
  client_email: string;
  client_telephone: string;
  terrain_nom: string;
  date_debut: string;
  date_fin: string;
  montant_total: number;
  statut: string;
  derniere_validation: string;
  temps_restant: {
    status: string;
    message: string;
    minutes: number;
  };
}

interface TicketScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TicketScanner: React.FC<TicketScannerProps> = ({ isOpen, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [validationResult, setValidationResult] = useState<TicketValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [scanMode, setScanMode] = useState<'qr' | 'manual'>('qr');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && scanMode === 'qr') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen, scanMode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Utiliser la caméra arrière
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Erreur accès caméra:', error);
      toast.error('Impossible d\'accéder à la caméra');
      setScanMode('manual');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    return canvas.toDataURL('image/png');
  };

  const scanQrCode = async () => {
    // Note: Pour une vraie implémentation, vous pourriez utiliser une bibliothèque comme jsQR
    // Ici, je simule le scan en attendant que l'utilisateur saisisse manuellement les données
    toast.info('Fonctionnalité de scan QR en développement. Utilisez la saisie manuelle pour l\'instant.');
    setScanMode('manual');
  };

  const validateTicket = async (qrData: string) => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await apiService.scanTicket({ qr_data: qrData });
      
      if (response.success && response.data) {
        setValidationResult(response.data);
        toast.success(response.message || 'Ticket validé avec succès !');
      } else {
        toast.error(response.message || 'Ticket invalide');
      }
    } catch (error: any) {
      console.error('Erreur validation ticket:', error);
      toast.error(error.message || 'Erreur lors de la validation');
    } finally {
      setIsValidating(false);
    }
  };

  const validateByCode = async () => {
    if (!manualCode.trim()) {
      toast.error('Veuillez saisir un code de ticket');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await apiService.validateTicketByCode({ code_ticket: manualCode.trim() });
      
      if (response.success && response.data) {
        setValidationResult(response.data);
        toast.success(response.message || 'Ticket validé avec succès !');
        setManualCode('');
      } else {
        toast.error(response.message || 'Code de ticket invalide');
      }
    } catch (error: any) {
      console.error('Erreur validation code:', error);
      toast.error(error.message || 'Erreur lors de la validation');
    } finally {
      setIsValidating(false);
    }
  };

  const resetScan = () => {
    setValidationResult(null);
    setManualCode('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'before_start': return 'text-yellow-600 bg-yellow-50';
      case 'in_progress': return 'text-green-600 bg-green-50';
      case 'finished': return 'text-gray-600 bg-gray-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Scanner de Tickets</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Mode selector */}
        <div className="p-6 border-b">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setScanMode('qr')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                scanMode === 'qr'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              <Camera className="w-4 h-4" />
              Scanner QR
            </button>
            <button
              onClick={() => setScanMode('manual')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                scanMode === 'manual'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              <Search className="w-4 h-4" />
              Code Manuel
            </button>
          </div>
        </div>

        {/* Scanner QR */}
        {scanMode === 'qr' && (
          <div className="p-6 border-b">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Overlay de scan */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg"></div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={scanQrCode}
                disabled={!isScanning || isValidating}
                className="bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
              >
                {isValidating ? 'Validation...' : 'Scanner QR Code'}
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Pointez la caméra vers le QR code du client
              </p>
            </div>
          </div>
        )}

        {/* Saisie manuelle */}
        {scanMode === 'manual' && (
          <div className="p-6 border-b">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code de ticket
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="RES-001234 ou 001234"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onKeyPress={(e) => e.key === 'Enter' && validateByCode()}
              />
              <button
                onClick={validateByCode}
                disabled={!manualCode.trim() || isValidating}
                className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
              >
                {isValidating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Valider
              </button>
            </div>
          </div>
        )}

        {/* Résultat de validation */}
        {validationResult && (
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Ticket Valide</span>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium">{validationResult.client_nom}</div>
                    <div className="text-gray-600">{validationResult.client_email}</div>
                    {validationResult.client_telephone && (
                      <div className="text-gray-600">{validationResult.client_telephone}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium">{validationResult.terrain_nom}</div>
                    <div className="text-gray-600">Code: {validationResult.code_ticket}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium">
                      {new Date(validationResult.date_debut).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-gray-600">
                      {new Date(validationResult.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {' '}
                      {new Date(validationResult.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(validationResult.temps_restant.status)}`}>
                  {validationResult.temps_restant.message}
                </div>

                <div className="text-gray-600">
                  Montant : {validationResult.montant_total.toLocaleString()} FCFA
                </div>
              </div>
            </div>

            <button
              onClick={resetScan}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Scanner un autre ticket
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fermer le scanner
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketScanner; 