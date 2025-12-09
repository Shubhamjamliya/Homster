/**
 * Centralized Theme Colors Configuration
 * Update colors here to change theme across entire app
 */

const themeColors = {
  // Primary Colors
  primary: '#29ad81',        // Main theme color (green)
  primaryDark: '#00a6a6',   // Darker shade for accents
  primaryLight: '#41c9a3',  // Lighter shade

  // Secondary Colors
  secondary: '#F59E0B',      // Amber/Yellow
  secondaryLight: '#FBBF24', // Light amber

  // Background Gradients
  backgroundGradient: {
    home: 'linear-gradient(to bottom, rgba(0, 166, 166, 0.03) 0%, rgba(41, 173, 129, 0.02) 10%, #ffffff 20%)',
    card: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
    section: 'linear-gradient(135deg, rgba(41, 173, 129, 0.08) 0%, rgba(0, 166, 166, 0.05) 50%, transparent 100%)',
  },

  // Button Colors
  button: {
    primary: '#29ad81',
    primaryHover: '#22a075',
    primaryGradient: 'linear-gradient(135deg, #29ad81 0%, #00a6a6 100%)',
    secondary: '#F59E0B',
    secondaryGradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  },

  // Icon Colors
  icon: {
    primary: '#29ad81',
    secondary: '#F59E0B',
    default: '#6b7280',      // Gray for inactive
    active: '#29ad81',
  },

  // Shadow Colors
  shadow: {
    primary: 'rgba(41, 173, 129, 0.3)',
    primaryLight: 'rgba(41, 173, 129, 0.1)',
    primaryMedium: 'rgba(41, 173, 129, 0.15)',
    card: 'rgba(0, 0, 0, 0.08)',
  },

  // Border Colors
  border: {
    primary: 'rgba(41, 173, 129, 0.2)',
    primaryLight: 'rgba(41, 173, 129, 0.1)',
    default: '#e5e7eb',
  },

  // Background Colors for Icon Containers
  iconBackground: {
    primary: 'rgba(41, 173, 129, 0.1)',
    primaryLight: 'rgba(41, 173, 129, 0.15)',
  },
};

// Export default theme
export default themeColors;

