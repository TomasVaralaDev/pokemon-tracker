import { useEffect } from 'react';

// --- RAJAPINTA (INTERFACE) ---
// Määrittelee, mitä tietoja ilmoitus tarvitsee toimiakseen
interface ToastProps {
  message: string;            // Näytettävä teksti
  type?: 'success' | 'info';  // Tyyli: Vihreä (onnistui) tai Sininen (info)
  onClose: () => void;        // Funktio, joka poistaa ilmoituksen näkyvistä
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  
  // --- LOGIIKKA: AJASTIN ---
  // Tämä Effect ajetaan heti, kun ilmoitus ilmestyy ruudulle.
  useEffect(() => {
    // Asetetaan ajastin: Kutsuu onClose-funktiota 3 sekunnin (3000ms) kuluttua
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    // Siivous (Cleanup): Jos komponentti poistuu ruudulta ennen kuin aika on täysi
    // (esim. sivu vaihtuu), tämä pysäyttää ajastimen, jotta ei tule virheitä.
    return () => clearTimeout(timer);
  }, [onClose]);

  // --- RENDERÖINTI (UI) ---
  return (
    <div className={`
      fixed top-4 left-1/2 transform -translate-x-1/2 z-50  // Sijainti: Kiinteästi ylhäällä keskellä, kaiken päällä (z-50)
      px-6 py-3 rounded-full shadow-lg border animate-fade-in-down // Ulkoasu: Pyöristetty, varjo, animaatio
      flex items-center gap-3 font-semibold text-sm // Asettelu: Flexbox, fontti
      
      ${/* Ehdollinen tyylittely tyypin (type) mukaan: */''}
      ${type === 'success' 
        // Vihreä teema (onnistui)
        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800' 
        // Sininen teema (info)
        : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800'}
    `}>
      
      {/* --- IKONIN VALINTA --- */}
      {type === 'success' ? (
        // Checkmark-ikoni (V) onnistumiselle
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        // Info-ikoni (i) tiedotukselle
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      
      {/* Näytetään itse viesti */}
      {message}
    </div>
  );
}