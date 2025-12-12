
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type ConsoleViewType = 'syno' | 'fais' | 'lega' | 'con' | 'win' | 'mac' | 'cos';

interface ConsoleViewContextType {
    view: ConsoleViewType;
    setConsoleView: (view: ConsoleViewType) => void;
    isInitialChoice: boolean;
}

const ConsoleViewContext = createContext<ConsoleViewContextType | undefined>(undefined);

export const ConsoleViewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [view, setView] = useState<ConsoleViewType>('syno');
    const [isInitialChoice, setIsInitialChoice] = useState(false);

    useEffect(() => {
        const savedView = localStorage.getItem('consoleView') as ConsoleViewType | null;
        if (savedView && ['syno', 'fais', 'lega', 'con', 'win', 'mac', 'cos'].includes(savedView)) {
            setView(savedView);
        } else {
            setIsInitialChoice(true);
        }
    }, []);

    const setConsoleView = (newView: ConsoleViewType) => {
        localStorage.setItem('consoleView', newView);
        setView(newView);
        if (isInitialChoice) {
            setIsInitialChoice(false);
        }
    };

    const value = { view, setConsoleView, isInitialChoice };

    return (
        <ConsoleViewContext.Provider value={value}>
            {children}
        </ConsoleViewContext.Provider>
    );
};

export const useConsoleView = (): ConsoleViewContextType => {
    const context = useContext(ConsoleViewContext);
    if (context === undefined) {
        throw new Error('useConsoleView must be used within a ConsoleViewProvider');
    }
    return context;
};
