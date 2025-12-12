
import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface AppContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  overrideBg?: boolean; // To disable default glass background for components with their own (like ChatApp)
}

const AppContainer: React.FC<AppContainerProps> = ({ children, className, style, overrideBg = false }) => {
  const { isDark, glassBlur, glassTransparency } = useTheme();

  // Define base colors for light and dark themes. These come from the original CSS.
  // dark-card: #2d3748 -> rgba(45, 55, 72)
  // light-card: #ffffff -> rgba(255, 255, 255)
  const baseBgColor = isDark 
    ? `rgba(45, 55, 72, ${glassTransparency})`
    : `rgba(255, 255, 255, ${glassTransparency})`;

  const glassStyle: React.CSSProperties = {
    backdropFilter: `blur(${glassBlur}px) saturate(180%)`,
    ...(!overrideBg && { backgroundColor: baseBgColor }),
    ...style,
  };

  // Border color needs to be subtle
  const borderColor = isDark ? 'border-white/20' : 'border-black/10';

  return (
    <div 
      className={`border ${borderColor} rounded-2xl shadow-2xl overflow-hidden ${className}`}
      style={glassStyle}
    >
      {children}
    </div>
  );
};

export default AppContainer;
