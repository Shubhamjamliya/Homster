# Centralized Theme Configuration

This directory contains the centralized theme configuration for the entire app. Update colors here to change the theme across all pages and components.

## File Structure

- `colors.js` - Main theme color definitions
- `index.js` - Theme exports and helper functions

## Usage

### Import Theme

```javascript
import { themeColors } from '../../theme';
// or
import theme from '../../theme';
```

### Using Theme Colors

#### 1. Home Page Gradient
```javascript
// Background gradient
style={{ background: themeColors.backgroundGradient.home }}
```

#### 2. Button Colors
```javascript
// Primary button
style={{ backgroundColor: themeColors.button.primary }}

// Button with hover
onMouseEnter={(e) => {
  e.target.style.backgroundColor = themeColors.button.primaryHover;
}}
```

#### 3. Icon Colors
```javascript
// Primary icon color
style={{ color: themeColors.icon.primary }}

// Icon background
style={{ backgroundColor: themeColors.iconBackground.primary }}
```

#### 4. Shadows
```javascript
style={{ boxShadow: `0 4px 12px ${themeColors.shadow.primary}` }}
```

#### 5. Borders
```javascript
style={{ border: `1px solid ${themeColors.border.primary}` }}
```

## Changing Theme

To change the entire app theme, simply update values in `colors.js`:

```javascript
export const themeColors = {
  primary: '#29ad81',  // Change this to update all primary colors
  // ... other colors
};
```

All components using `themeColors` will automatically update!

## Available Theme Properties

- `primary` - Main theme color
- `primaryDark` - Darker shade
- `primaryLight` - Lighter shade
- `secondary` - Secondary color
- `backgroundGradient` - Background gradients (home, card, section)
- `button` - Button colors and gradients
- `icon` - Icon colors
- `shadow` - Shadow colors
- `border` - Border colors
- `iconBackground` - Icon container backgrounds

