import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Ticket, CheckCircle, XCircle, Users, Camera, Hash, Search } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import apiService, { type TicketValidationHistoryDTO, type TicketValidationReservationDTO } from '../../services/api';

interface ValidationResult {
  valid: boolean;
  reservation?: TicketValidationReservationDTO;
  message: string;
}

type ScanMode = 'qr' | 'manual';

const TicketValidationPage: React.FC = () => {
  const [ticketCode, setTicketCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validationHistory, setValidationHistory] = useState<ValidationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>('qr');
  const [cameraReady, setCameraReady] = useState(false);

  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadValidationHistory();
  }, []);

  // ---------- QR camera lifecycle ----------
  const stopScanner = useCallback(async () => {
    if (qrScannerRef.current) {
      try {
        const state = qrScannerRef.current.getState();
        if (state === 2) {
          await qrScannerRef.current.stop();
        }
      } catch { /* ignore */ }
      try { qrScannerRef.current.clear(); } catch { /* ignore */ }
      qrScannerRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const startScanner = useCallback(async () => {
    await stopScanner();
    const containerId = 'qr-reader';
    const el = document.getElementById(containerId);
    if (!el) return;

    const scanner = new Html5Qrcode(containerId);
    qrScannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
        (decodedText) => {
          if (isProcessingRef.current) return;
          isProcessingRef.current = true;
          validateTicketCode(decodedText);
        },
        () => { /* ignore scan failures */ }
      );
      setCameraReady(true);
    } catch (err) {
      console.error('Erreur caméra:', err);
      toast.error("Impossible d'accéder à la caméra. Utilisez la saisie manuelle.");
      setScanMode('manual');
    }
  }, []);

  useEffect(() => {
    if (scanMode === 'qr') {
      const timer = setTimeout(() => startScanner(), 300);
      return () => { clearTimeout(timer); stopScanner(); };
    } else {
      stopScanner();
    }
  }, [scanMode, startScanner, stopScanner]);

  useEffect(() => () => { stopScanner(); }, [stopScanner]);

  // ---------- Validation ----------
  const loadValidationHistory = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiService.getValidationHistory({ limit: 5 });
      if (data && Array.isArray(data)) {
        setValidationHistory(data.slice(0, 5).map((item: TicketValidationHistoryDTO) => ({
          valid: Boolean(item.valid),
          reservation: item.reservation,
          message: item.message ?? (item.valid ? 'Ticket validé' : 'Ticket invalide'),
        })));
      }
    } catch { /* silent */ } finally { setIsLoading(false); }
  };

  const validateTicketCode = async (code: string) => {
    const cleaned = code.trim().toUpperCase();
    if (!cleaned) { toast.error('Code vide'); isProcessingRef.current = false; return; }

    setIsValidating(true);
    try {
      const { data, meta } = await apiService.validateTicketCode(cleaned);
      if (data?.reservation) {
        const result: ValidationResult = { valid: true, reservation: data.reservation, message: data.message ?? 'Ticket validé avec succès !' };
        setValidationResult(result);
        setValidationHistory(prev => [result, ...prev.slice(0, 4)]);
        toast.success('Ticket validé !');
        setTicketCode('');
      } else {
        const result: ValidationResult = { valid: false, message: data?.message ?? meta.message ?? 'Code invalide' };
        setValidationResult(result);
        toast.error(result.message);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur de validation';
      setValidationResult({ valid: false, message: msg });
      toast.error(msg);
    } finally {
      setIsValidating(false);
      isProcessingRef.current = false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); validateTicketCode(ticketCode); };

  const clearResult = () => {
    setValidationResult(null);
    setTicketCode('');
    isProcessingRef.current = false;
    if (scanMode === 'qr') startScanner();
    else document.getElementById('ticket-input')?.focus();
  };

  // ---------- Render ----------
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-xl" />
        <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="mx-auto mb-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg inline-block">
            <Ticket className={`text-white ${isMobile ? 'w-12 h-12' : 'w-16 h-16'}`} />
          </div>
          <h1 className={`font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent ${isMobile ? 'text-2xl' : 'text-4xl'} mb-3`}>
            Vérification des Tickets
          </h1>
          <p className={`text-gray-600 max-w-2xl mx-auto ${isMobile ? 'text-base' : 'text-lg'}`}>
            Scannez le QR code ou saisissez le code manuellement
          </p>
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-xl bg-gray-100 p-1 shadow-inner">
          <button
            onClick={() => setScanMode('qr')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              scanMode === 'qr'
                ? 'bg-white text-indigo-600 shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Camera className="w-5 h-5" />
            Scanner QR
          </button>
          <button
            onClick={() => setScanMode('manual')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              scanMode === 'manual'
                ? 'bg-white text-indigo-600 shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Hash className="w-5 h-5" />
            Saisie code
          </button>
        </div>
      </div>

      {/* Scanner / Manual input */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-blue-400/20 to-purple-400/20 rounded-3xl blur-xl" />
        <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 px-6 py-4">
            <h2 className="text-white font-bold text-xl flex items-center">
              {scanMode === 'qr' ? <Camera className="w-6 h-6 mr-3" /> : <Search className="w-6 h-6 mr-3" />}
              {scanMode === 'qr' ? 'Scanner le QR Code' : 'Saisir le Code Ticket'}
            </h2>
          </div>

          {scanMode === 'qr' && !validationResult && (
            <div className="p-6">
              <div ref={scannerContainerRef} className="relative rounded-2xl overflow-hidden bg-black mx-auto" style={{ maxWidth: 400 }}>
                <div id="qr-reader" style={{ width: '100%' }} />
                {!cameraReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-4" />
                    <p className="text-sm">Initialisation de la caméra...</p>
                  </div>
                )}
              </div>
              <p className="text-center text-gray-500 mt-4 text-sm">
                Placez le QR code du client dans le cadre
              </p>
            </div>
          )}

          {scanMode === 'manual' && !validationResult && (
            <form onSubmit={handleSubmit} className={`${isMobile ? 'p-6' : 'p-8'}`}>
              <div className="flex flex-col items-center space-y-6">
                <div className={`w-full ${isMobile ? '' : 'max-w-md'}`}>
                  <label htmlFor="ticket-input" className="block font-bold text-gray-800 mb-4 text-center text-xl">
                    🎫 Code du Ticket
                  </label>
                  <input
                    id="ticket-input"
                    type="text"
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value)}
                    placeholder="Ex: 123456"
                    className={`w-full border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 text-center font-mono tracking-widest uppercase bg-gradient-to-r from-gray-50 to-white shadow-inner ${
                      isMobile ? 'text-3xl py-6 px-6' : 'px-6 py-5 text-2xl'
                    }`}
                    disabled={isValidating}
                    autoComplete="off"
                    autoFocus
                  />
                  <p className="text-gray-500 mt-3 text-center text-sm">
                    Saisissez les <span className="text-indigo-600 font-bold">6 derniers chiffres</span> du code ticket
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isValidating || !ticketCode.trim()}
                  className={`font-bold shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-4 bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white rounded-2xl transition-all hover:scale-105 active:scale-95 ${
                    isMobile ? 'text-xl py-5 px-12 w-full' : 'px-12 py-5 text-xl'
                  }`}
                >
                  {isValidating ? (
                    <>
                      <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white" />
                      <span>Validation...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-6 h-6" />
                      <span>Valider le Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Résultat */}
          {validationResult && (
            <div className="p-6">
              <div className={`rounded-2xl p-6 mb-6 ${
                validationResult.valid
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {validationResult.valid ? (
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  ) : (
                    <XCircle className="w-10 h-10 text-red-600" />
                  )}
                  <div>
                    <h3 className={`font-bold text-2xl ${validationResult.valid ? 'text-green-800' : 'text-red-800'}`}>
                      {validationResult.valid ? 'Ticket Valide !' : 'Ticket Invalide'}
                    </h3>
                    <p className={`${validationResult.valid ? 'text-green-700' : 'text-red-700'}`}>
                      {validationResult.message}
                    </p>
                  </div>
                </div>

                {validationResult.reservation && (
                  <div className={`gap-4 mt-4 ${isMobile ? 'space-y-3' : 'grid grid-cols-3'}`}>
                    <div className="bg-white rounded-xl shadow p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🏟️</span>
                        <span className="text-gray-500 text-sm font-semibold">Terrain</span>
                      </div>
                      <p className="font-bold text-gray-900">{validationResult.reservation.terrain_nom}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">👤</span>
                        <span className="text-gray-500 text-sm font-semibold">Client</span>
                      </div>
                      <p className="font-bold text-gray-900">{validationResult.reservation.client_nom}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🕐</span>
                        <span className="text-gray-500 text-sm font-semibold">Horaires</span>
                      </div>
                      <p className="font-bold text-gray-900">
                        {new Date(validationResult.reservation.date_debut).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-gray-600 text-sm">
                        à {new Date(validationResult.reservation.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={clearResult}
                className={`font-bold shadow-xl flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl transition-all hover:scale-105 active:scale-95 ${
                  isMobile ? 'w-full text-lg py-4' : 'mx-auto px-10 py-4 text-lg'
                }`}
              >
                <Ticket className="w-6 h-6" />
                <span>Valider un Autre Ticket</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Historique */}
      {validationHistory.length > 0 && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-400/20 via-gray-400/20 to-zinc-400/20 rounded-3xl blur-xl" />
          <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-600 to-gray-700 px-6 py-4">
              <h2 className="text-white font-bold text-xl flex items-center">
                <Users className="w-6 h-6 mr-3" />
                Historique des Validations
              </h2>
            </div>
            <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-indigo-600" />
                </div>
              ) : (
                <div className="space-y-3">
                  {validationHistory.map((v, i) => (
                    <div key={i} className={`flex items-center gap-4 rounded-xl p-4 border ${
                      v.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      {v.valid ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {v.reservation?.client_nom || 'Validation échouée'}
                        </p>
                        {v.reservation && (
                          <p className="text-gray-500 text-xs truncate">
                            🏟️ {v.reservation.terrain_nom} · 📅 {new Date(v.reservation.date_debut).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                      {v.reservation && (
                        <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded hidden sm:inline">
                          {v.reservation.code_ticket}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketValidationPage;