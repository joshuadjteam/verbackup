
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type Language = 'en' | 'fr' | 'es';

const translations = {
    en: {
        settings: 'Settings',
        search: 'Search',
        apps: 'Apps',
        music: 'Music',
        maps: 'Maps',
        gallery: 'Gallery',
        camera: 'Camera',
        phone: 'Phone',
        chat: 'Chat',
        browser: 'Browser',
        store: 'Store',
        files: 'Files',
        calendar: 'Calendar',
        notes: 'Notes',
        calculator: 'Calculator',
        converter: 'Converter',
        paint: 'Paint',
        editor: 'Editor',
        help: 'Help',
        systemUpdate: 'System Update',
        aboutPhone: 'About Phone',
        wallpaper: 'Wallpaper & Style',
        security: 'Security',
        language: 'Language',
        reset: 'Reset Options',
        signOut: 'Sign Out',
        searchApps: 'Search apps...',
        searchWeb: 'Search web...',
        quickActions: 'Quick Actions',
        commonQuestions: 'Common Questions',
        emailUs: 'Email Us',
        chatWithAi: 'Chat with AI',
        howCanWeHelp: 'How can we help?',
        network: 'Network',
        profile: 'Profile',
        support: 'Support',
        brightness: 'Brightness',
        closePanel: 'Close Panel',
        manageSession: 'Manage Session'
    },
    fr: {
        settings: 'Paramètres',
        search: 'Rechercher',
        apps: 'Applications',
        music: 'Musique',
        maps: 'Cartes',
        gallery: 'Galerie',
        camera: 'Caméra',
        phone: 'Téléphone',
        chat: 'Messages',
        browser: 'Navigateur',
        store: 'Boutique',
        files: 'Fichiers',
        calendar: 'Calendrier',
        notes: 'Notes',
        calculator: 'Calculatrice',
        converter: 'Convertisseur',
        paint: 'Dessin',
        editor: 'Éditeur',
        help: 'Aide',
        systemUpdate: 'Mise à jour système',
        aboutPhone: 'À propos du téléphone',
        wallpaper: 'Fond d\'écran et style',
        security: 'Sécurité',
        language: 'Langue',
        reset: 'Options de réinitialisation',
        signOut: 'Se déconnecter',
        searchApps: 'Rechercher des applis...',
        searchWeb: 'Recherche Web...',
        quickActions: 'Actions rapides',
        commonQuestions: 'Questions fréquentes',
        emailUs: 'Envoyez-nous un email',
        chatWithAi: 'Discuter avec l\'IA',
        howCanWeHelp: 'Comment pouvons-nous aider ?',
        network: 'Réseau',
        profile: 'Profil',
        support: 'Support',
        brightness: 'Luminosité',
        closePanel: 'Fermer le panneau',
        manageSession: 'Gérer la session'
    },
    es: {
        settings: 'Configuración',
        search: 'Buscar',
        apps: 'Aplicaciones',
        music: 'Música',
        maps: 'Mapas',
        gallery: 'Galería',
        camera: 'Cámara',
        phone: 'Teléfono',
        chat: 'Mensajes',
        browser: 'Navegador',
        store: 'Tienda',
        files: 'Archivos',
        calendar: 'Calendario',
        notes: 'Notas',
        calculator: 'Calculadora',
        converter: 'Convertidor',
        paint: 'Pintura',
        editor: 'Editor',
        help: 'Ayuda',
        systemUpdate: 'Actualización del sistema',
        aboutPhone: 'Sobre el teléfono',
        wallpaper: 'Fondo de pantalla y estilo',
        security: 'Seguridad',
        language: 'Idioma',
        reset: 'Opciones de restablecimiento',
        signOut: 'Cerrar sesión',
        searchApps: 'Buscar aplicaciones...',
        searchWeb: 'Buscar en la web...',
        quickActions: 'Acciones rápidas',
        commonQuestions: 'Preguntas frecuentes',
        emailUs: 'Envíanos un correo',
        chatWithAi: 'Chatear con IA',
        howCanWeHelp: '¿Cómo podemos ayudar?',
        network: 'Red',
        profile: 'Perfil',
        support: 'Soporte',
        brightness: 'Brillo',
        closePanel: 'Cerrar panel',
        manageSession: 'Gestionar sesión'
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('lynix_language');
        if (savedLang && ['en', 'fr', 'es'].includes(savedLang)) {
            setLanguage(savedLang as Language);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('lynix_language', lang);
    };

    const t = (key: keyof typeof translations['en']) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
