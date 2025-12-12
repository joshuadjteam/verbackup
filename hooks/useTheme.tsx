import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export const wallpapers: Record<string, { name: string, class: string }> = {
    canyon: { name: 'Canyon', class: 'bg-gradient-to-br from-[#23304e] via-[#e97451] to-[#f4a261]' },
    sky: { name: 'Sky', class: 'bg-gradient-to-br from-sky-400 to-blue-600' },
    sunset: { name: 'Sunset', class: 'bg-gradient-to-br from-yellow-400 via-red-500 to-pink-600' },
    forest: { name: 'Forest', class: 'bg-gradient-to-br from-green-500 to-teal-700' },
    night: { name: 'Night', class: 'bg-gradient-to-br from-gray-800 to-slate-900' },
    cosmic: { name: 'Cosmic', class: 'bg-gradient-to-br from-purple-700 via-pink-700 to-indigo-700' },
    ocean: { name: 'Ocean', class: 'bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-300' },
};


// Sensible defaults and ranges
const DEFAULT_BLUR = 8;
const MIN_BLUR = 0;
const MAX_BLUR = 24;
const DEFAULT_TRANSPARENCY = 0.5;
const MIN_TRANSPARENCY = 0.1;
const MAX_TRANSPARENCY = 1.0;
const DEFAULT_WALLPAPER = 'forest';

interface ThemeContextType {
    isDark: boolean;
    setIsDark: (isDark: boolean) => void;
    glassBlur: number;
    setGlassBlur: (blur: number) => void;
    glassTransparency: number;
    setGlassTransparency: (transparency: number) => void;
    wallpaper: string;
    setWallpaper: (wallpaper: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isDark, setIsDarkState] = useState(true);
    const [glassBlur, setGlassBlurState] = useState(DEFAULT_BLUR);
    const [glassTransparency, setGlassTransparencyState] = useState(DEFAULT_TRANSPARENCY);
    const [wallpaper, setWallpaperState] = useState(DEFAULT_WALLPAPER);

    useEffect(() => {
        const savedIsDark = localStorage.getItem('theme-isDark');
        setIsDarkState(savedIsDark ? JSON.parse(savedIsDark) : true);

        const savedBlur = localStorage.getItem('theme-glassBlur');
        setGlassBlurState(savedBlur ? JSON.parse(savedBlur) : DEFAULT_BLUR);
        
        const savedTransparency = localStorage.getItem('theme-glassTransparency');
        setGlassTransparencyState(savedTransparency ? JSON.parse(savedTransparency) : DEFAULT_TRANSPARENCY);
        
        const savedWallpaper = localStorage.getItem('theme-wallpaper');
        if (savedWallpaper && Object.keys(wallpapers).includes(savedWallpaper)) {
            setWallpaperState(savedWallpaper);
        } else {
            setWallpaperState(DEFAULT_WALLPAPER);
        }
    }, []);

    const setIsDark = (newVal: boolean) => {
        setIsDarkState(newVal);
        localStorage.setItem('theme-isDark', JSON.stringify(newVal));
    };
    
    const setGlassBlur = (newVal: number) => {
        const clampedVal = Math.max(MIN_BLUR, Math.min(MAX_BLUR, newVal));
        setGlassBlurState(clampedVal);
        localStorage.setItem('theme-glassBlur', JSON.stringify(clampedVal));
    };

    const setGlassTransparency = (newVal: number) => {
        const clampedVal = Math.max(MIN_TRANSPARENCY, Math.min(MAX_TRANSPARENCY, newVal));
        setGlassTransparencyState(clampedVal);
        localStorage.setItem('theme-glassTransparency', JSON.stringify(clampedVal));
    };

     const setWallpaper = (newVal: string) => {
        if (Object.keys(wallpapers).includes(newVal)) {
            setWallpaperState(newVal);
            localStorage.setItem('theme-wallpaper', newVal);
        }
    };

    const value = {
        isDark,
        setIsDark,
        glassBlur,
        setGlassBlur,
        glassTransparency,
        setGlassTransparency,
        wallpaper,
        setWallpaper,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
