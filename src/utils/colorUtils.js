/**
 * Konvertiert eine Hex-Farbe in RGB-Werte
 * @param {string} hex - Hex-Farbcode (z.B. #3b82f6)
 * @returns {Object} - Objekt mit r, g, b Werten
 */
export function hexToRgb(hex) {
  // Entferne # wenn vorhanden
  hex = hex.replace(/^#/, '');
  
  // Konvertiere 3-stelligen Hex zu 6-stelligem Hex
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  // Extrahiere r, g, b Werte
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Konvertiert eine Hex-Farbe in einen RGB-String
 * @param {string} hex - Hex-Farbcode (z.B. #3b82f6)
 * @returns {string} - RGB-String (z.B. "59, 130, 246")
 */
export function hexToRgbString(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `${r}, ${g}, ${b}`;
}
