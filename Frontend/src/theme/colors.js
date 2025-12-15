/**
 * Centralized Theme Colors Configuration
 * Separate themes for User and Vendor modules
 * Update colors here to change theme across entire app
 * 
 * Usage:
 * - User module: import { userTheme } from '../../../../theme'
 * - Vendor module: import { vendorTheme } from '../../../../theme'
 * - Backward compatibility: import themeColors from '../../../../theme' (uses userTheme)
 */

// User Theme Colors
const userTheme = {
  // Background Gradient (for full page)
  backgroundGradient: 'linear-gradient(to bottom, rgba(0, 166, 166, 0.03) 0%, rgba(41, 173, 129, 0.02) 10%, #ffffff 20%)',

  // Top Section Gradient (yellow gradient)
  gradient: 'linear-gradient(135deg, #FCD34D 0%, #FDE68A 50%, #FEF3C7 100%)',

  // Header Gradient (solid yellow - same as user dashboard)
  headerGradient: '#FCD34D',

  // Button Color
  button: '#00a6a6',

  // Icon Color
  icon: '#29ad81',
};

// Vendor Theme Colors (currently same as user, can be changed independently)
const vendorTheme = {
  // Background Gradient (for full page)
  backgroundGradient: 'linear-gradient(to bottom, rgba(0, 166, 166, 0.03) 0%, rgba(41, 173, 129, 0.02) 10%, #ffffff 20%)',

  // Top Section Gradient (yellow gradient - darker)
  gradient: 'linear-gradient(135deg, #FCD34D 0%, #FDE68A 50%, #FDE68A 100%)',

  // Header Gradient (solid yellow - same as user dashboard)
  headerGradient: '#FCD34D',

  // Button Color
  button: '#00a6a6',

  // Icon Color
  icon: '#29ad81',
};

// Worker Theme Colors (same as vendor)
const workerTheme = {
  // Background Gradient (for full page)
  backgroundGradient: 'linear-gradient(to bottom, rgba(0, 166, 166, 0.03) 0%, rgba(41, 173, 129, 0.02) 10%, #ffffff 20%)',

  // Top Section Gradient (yellow gradient - same as vendor)
  gradient: 'linear-gradient(135deg, #FCD34D 0%, #FDE68A 50%, #FDE68A 100%)',

  // Header Gradient (solid yellow - same as vendor)
  headerGradient: '#FCD34D',

  // Button Color (same as vendor)
  button: '#00a6a6',

  // Icon Color (same as vendor)
  icon: '#29ad81',
};

// Default theme (for backward compatibility - uses user theme)
const themeColors = userTheme;

// Export all themes
export { userTheme, vendorTheme, workerTheme };
export default themeColors;

