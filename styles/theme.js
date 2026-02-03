export const lightColors = {
  // Brand colors from logo
  primary: '#1B2B4A', // Navy blue from logo
  secondary: '#9AC84A', // Green from logo leaves
  accent: '#4A8FB9', // Light blue from arrow
  gold: '#D4AF37', // Gold from arrow

  // UI colors
  danger: '#E74C3C',
  warning: '#F39C12',
  background: '#F5F7FA',
  cardBackground: '#FFFFFF',
  text: '#1B2B4A', // Matching primary navy
  textLight: '#7F8C8D',
  border: '#E1E8ED',
  success: '#9AC84A', // Matching brand green
  income: '#9AC84A', // Matching brand green
  expense: '#E74C3C',
  inputBackground: '#FFFFFF',
  placeholder: '#A0A0A0'
};

export const darkColors = {
  // Brand colors (adjusted for dark mode)
  primary: '#4A8FB9', // Lighter blue for dark mode
  secondary: '#9AC84A', // Green from logo leaves
  accent: '#4A8FB9', // Light blue from arrow
  gold: '#D4AF37', // Gold from arrow

  // UI colors
  danger: '#E74C3C',
  warning: '#F39C12',
  background: '#121212',
  cardBackground: '#1E1E1E',
  text: '#FFFFFF',
  textLight: '#B0B0B0',
  border: '#333333',
  success: '#9AC84A',
  income: '#9AC84A',
  expense: '#E74C3C',
  inputBackground: '#2A2A2A',
  placeholder: '#666666'
};

// Default export for backward compatibility
export const colors = lightColors;

// Function to get colors based on theme
export const getColors = (isDarkMode) => isDarkMode ? darkColors : lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6
  }
};

export const getTypography = (isDarkMode) => {
  const themeColors = getColors(isDarkMode);
  return {
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: themeColors.text
    },
    heading: {
      fontSize: 20,
      fontWeight: '600',
      color: themeColors.text
    },
    subheading: {
      fontSize: 16,
      fontWeight: '600',
      color: themeColors.text
    },
    body: {
      fontSize: 14,
      fontWeight: 'normal',
      color: themeColors.text
    },
    caption: {
      fontSize: 12,
      fontWeight: 'normal',
      color: themeColors.textLight
    }
  };
};

// Default typography for backward compatibility
export const typography = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: lightColors.text
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: lightColors.text
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
    color: lightColors.text
  },
  body: {
    fontSize: 14,
    fontWeight: 'normal',
    color: lightColors.text
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal',
    color: lightColors.textLight
  }
};
