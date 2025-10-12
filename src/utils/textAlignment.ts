/**
 * Utility functions for handling text alignment based on language detection
 */

// Arabic Unicode ranges
const ARABIC_RANGES = [
  [0x0600, 0x06FF], // Arabic
  [0x0750, 0x077F], // Arabic Supplement
  [0x08A0, 0x08FF], // Arabic Extended-A
  [0xFB50, 0xFDFF], // Arabic Presentation Forms-A
  [0xFE70, 0xFEFF], // Arabic Presentation Forms-B
];

/**
 * Detects if text contains Arabic characters
 */
export const isArabicText = (text: string): boolean => {
  if (!text) return false;
  
  for (const char of text) {
    const charCode = char.charCodeAt(0);
    for (const [start, end] of ARABIC_RANGES) {
      if (charCode >= start && charCode <= end) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Simple function to check if text has Arabic characters (alias for isArabicText)
 */
export const hasArabicCharacters = (text: string): boolean => {
  return isArabicText(text);
};

/**
 * Detects if text is primarily Arabic (more than 30% Arabic characters)
 * For short text (< 20 chars), any Arabic character triggers RTL
 */
export const isPrimarilyArabic = (text: string): boolean => {
  if (!text) return false;
  
  // Strip HTML tags for better detection
  const strippedText = text.replace(/<[^>]*>/g, '');
  
  let arabicCount = 0;
  let totalChars = 0;
  
  for (const char of strippedText) {
    if (/\s/.test(char)) continue; // Skip whitespace
    totalChars++;
    
    const charCode = char.charCodeAt(0);
    for (const [start, end] of ARABIC_RANGES) {
      if (charCode >= start && charCode <= end) {
        arabicCount++;
        break;
      }
    }
  }
  
  // For short text, any Arabic character means RTL
  if (totalChars < 20) {
    return arabicCount > 0;
  }
  
  // For longer text, use percentage threshold
  return totalChars > 0 && (arabicCount / totalChars) > 0.3;
};

/**
 * Returns appropriate text direction for names specifically
 */
export const getNameDirection = (name: string): 'ltr' | 'rtl' => {
  return hasArabicCharacters(name) ? 'rtl' : 'ltr';
};

/**
 * Returns appropriate CSS classes for text alignment based on language
 */
export const getTextAlignmentClasses = (text: string): string => {
  if (isPrimarilyArabic(text)) {
    return 'text-right';
  }
  return 'text-left';
};

/**
 * Returns appropriate direction attribute for text
 */
export const getTextDirection = (text: string): 'rtl' | 'ltr' | 'auto' => {
  if (isPrimarilyArabic(text)) {
    return 'rtl'; // Force RTL for Arabic text
  }
  return 'ltr';
};

/**
 * Returns appropriate CSS classes for container direction
 */
export const getContainerDirection = (text: string): string => {
  if (isPrimarilyArabic(text)) {
    return 'rtl-container';
  }
  return 'ltr-container';
};