
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { database } from '../services/database';
import { supabase } from '../supabaseClient';

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<{ error: string | null }>;
    loginAsGuest: () => Promise<User | null>;
    logout: () => void;
    updateUserProfile: (updates: Partial<User>) => void;
    updateInstalledWeblyApps: (appIds: string[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const updateUserState = (profile: User | null) => {
        setUser(profile);
        setIsLoggedIn(!!profile);
    };
    
    useEffect(() => {
        // onAuthStateChange is the single source of truth for the user's session state.
        // It fires on initial load and whenever the auth state changes.
        const { data: authListener } = (supabase.auth as any).onAuthStateChange(async (event: any, session: any) => {
            try {
                if (session?.user) {
                    // User is authenticated, now get their application profile.
                    const { profile, error } = await database.getUserProfile(session.user.id);

                    if (error || !profile) {
                        // This is a critical error state: user exists in Supabase auth but not in our public.users table
                        // or the profile fetch failed. To prevent a broken UI, sign them out.
                        console.error('User signed in but profile fetch failed. Signing out.', error);
                        await (supabase.auth as any).signOut();
                        updateUserState(null);
                    } else {
                        updateUserState(profile);
                    }
                } else {
                    // User is not authenticated.
                    updateUserState(null);
                }
            } catch (e) {
                console.error("Error in onAuthStateChange callback:", e);
                // In case of any unexpected error, sign out and reset state.
                await (supabase.auth as any).signOut();
                updateUserState(null);
            } finally {
                // This will ALWAYS run, regardless of success or error, preventing a stuck loading screen.
                setIsLoading(false);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);


    const login = async (email: string, pass: string): Promise<{ error: string | null }> => {
        setIsLoading(true);
        // We only initiate the sign-in. The onAuthStateChange listener will handle the result.
        const { error } = await (supabase.auth as any).signInWithPassword({
            email,
            password: pass,
        });

        if (error) {
            setIsLoading(false); // Crucial: stop loading on immediate failure.
            return { error: error.message };
        }

        // On success, onAuthStateChange will be triggered. It will handle fetching the
        // user profile and setting isLoading to false once everything is done.
        return { error: null };
    };

    const loginAsGuest = async (): Promise<User | null> => {
        setIsLoading(true);
        const guestUser = await database.getGuestUser();
        updateUserState(guestUser);
        setIsLoading(false);
        return guestUser;
    };

    const logout = async () => {
        // onAuthStateChange will handle clearing the user state when sign-out is complete.
        await (supabase.auth as any).signOut();
    };

    const updateUserProfile = (updates: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...updates });
        }
    };

    const updateInstalledWeblyApps = async (appIds: string[]) => {
        if (!user) return;

        const originalApps = user.installed_webly_apps || [];
        // Optimistically update UI
        setUser({ ...user, installed_webly_apps: appIds });

        try {
            // Persist change to DB
            const updatedIds = await database.updateUserInstalledApps(appIds);
            if (updatedIds === null) {
                // Revert on failure
                console.error("Edge function failed to update apps. Reverting UI.");
                setUser(prevUser => {
                    if (!prevUser) return null;
                    return { ...prevUser, installed_webly_apps: originalApps };
                });
            } else {
                // On success, sync with the definitive state from the server.
                setUser(prevUser => {
                    if (!prevUser) return null;
                    return { ...prevUser, installed_webly_apps: updatedIds };
                });
            }
        } catch (e) {
            console.error("Network or other error while updating apps. Reverting UI.", e);
            setUser(prevUser => {
                if (!prevUser) return null;
                return { ...prevUser, installed_webly_apps: originalApps };
            });
        }
    };


    return (
        <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, loginAsGuest, logout, updateUserProfile, updateInstalledWeblyApps }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
