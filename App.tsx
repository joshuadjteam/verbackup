
import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useRef, useMemo } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider, useTheme, wallpapers } from './hooks/useTheme';
import { ConsoleViewProvider, useConsoleView } from './hooks/useConsoleView';
import { CallProvider } from './hooks/useCall';
import { LanguageProvider } from './hooks/useLanguage';
import useIsMobileDevice from './hooks/useIsMobileDevice';
import Header from './components/Header';
import Footer from './components/Footer';
import WindowComponent from './components/Window';
import FullScreenAppHeader from './components/FullScreenAppHeader';
import MobileTopBar from './components/MobileTopBar';
import MobileNavBar from './components/MobileNavBar';
import LockScreen from './components/LockScreen';
import NotificationToast, { NotificationProps, DatabaseIcon } from './components/NotificationToast';
import AccountInvalidScreen from './components/AccountInvalidScreen';
import MobileOnboarding from './components/MobileOnboarding';
import MobileUpdateInfo from './components/MobileUpdateInfo';
import MobileBootScreen from './components/MobileBootScreen';
import DeviceSelectionModal from './components/DeviceSelectionModal';
import MobileLoginSetup from './components/MobileLoginSetup';

import HomePage from './pages/HomePage';
import ConsolePage from './pages/ConsolePage';
import FaisConsole from './pages/FaisConsole';
import LegaLauncher from './pages/LegaLauncher';
import ConConsole from './pages/ConConsole';
import WinLauncher from './pages/WinLauncher';
import MacLaunch from './pages/MacLaunch';
import COSLaunch from './pages/COSLaunch';
import SignInPage from './pages/SignInPage';
import ProfilePage from './pages/ProfilePage';
import AdminPortal from './pages/AdminPortal';
import SupportPage from './pages/SupportPage';
import PhoneApp from './pages/apps/PhoneApp';
import ChatApp from './pages/apps/ChatApp';
import LocalMailApp from './pages/apps/LocalMailApp';
import ContactsApp from './pages/apps/ContactsApp';
import NotepadApp from './pages/apps/NotepadApp';
import CalculatorApp from './pages/apps/CalculatorApp';
import PaintApp from './pages/apps/PaintApp';
import FileExplorerApp from './pages/apps/FileExplorerApp';
import EditorApp from './pages/apps/EditorApp';
import UnitConverterApp from './pages/apps/UnitConverterApp';
import CalendarApp from './pages/apps/CalendarApp';
import ConsoleSwitchApp from './pages/apps/ConsoleSwitchApp';
import AuthCallbackPage from './pages/AuthCallbackPage';
import WeblyStoreApp from './pages/apps/WeblyStoreApp';
import WebAppViewer from './pages/apps/WebAppViewer';
import LynixBrowserApp from './pages/apps/LynixBrowserApp';
import SettingsApp from './pages/apps/SettingsApp';
import MobilatorApp from './pages/apps/MobilatorApp';
import AndroidApp from './pages/apps/AndroidApp';
import WhoAmIApp from './pages/apps/WhoAmIApp';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

// Mobile App Imports
import MobiProfilePage from './pages/mobile-apps/MobiProfilePage';
import MobiPhoneApp from './pages/mobile-apps/MobiPhoneApp';
import MobiChatApp from './pages/mobile-apps/MobiChatApp';
import MobiLocalMailApp from './pages/mobile-apps/MobiLocalMailApp';
import MobiContactsApp from './pages/mobile-apps/MobiContactsApp';
import MobiNotepadApp from './pages/mobile-apps/MobiNotepadApp';
import MobiCalculatorApp from './pages/mobile-apps/MobiCalculatorApp';
import MobiPaintApp from './pages/mobile-apps/MobiPaintApp';
import MobiFileExplorerApp from './pages/mobile-apps/MobiFileExplorerApp';
import MobiEditorApp from './pages/mobile-apps/MobiEditorApp';
import MobiUnitConverterApp from './pages/mobile-apps/MobiUnitConverterApp';
import MobiCalendarApp from './pages/mobile-apps/MobiCalendarApp';
import MobiLauncher from './pages/MobiLauncher';
import LegacyLauncher from './pages/mobile-apps/LegacyLauncher';
import OneUILauncher from './pages/mobile-apps/OneUILauncher';
import BB10Launcher from './pages/mobile-apps/BB10Launcher';
import MobiConsoleSwitchApp from './pages/mobile-apps/MobiConsoleSwitchApp';
import MobiWeblyStoreApp from './pages/mobile-apps/MobiWeblyStoreApp';
import MobiWebAppViewer from './pages/mobile-apps/MobiWebAppViewer';
import MobiLynixBrowserApp from './pages/mobile-apps/MobiLynixBrowserApp';
import MobiHelpApp from './pages/mobile-apps/MobiHelpApp';
import MobiCameraApp from './pages/mobile-apps/MobiCameraApp';
import MobiSettingsApp from './pages/mobile-apps/MobiSettingsApp';
import MobiMapsApp from './pages/mobile-apps/MobiMapsApp';
import MobiMusicApp from './pages/mobile-apps/MobiMusicApp';
import MobiGalleryApp from './pages/mobile-apps/MobiGalleryApp';
import MobiModderApp from './pages/mobile-apps/MobiModderApp';
import RecoveryMode from './pages/mobile-apps/RecoveryMode';
import MobiWhoAmIApp from './pages/mobile-apps/MobiWhoAmIApp';

import CallWidget from './components/CallWidget';
import CallNotificationWidget from './components/CallNotificationWidget';

import { Page, UserRole, AppLaunchable, WeblyApp, WindowInstance } from './types';
import { database } from './services/database';

const WeblyStoreIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1012 10.125A2.625 2.625 0 0012 4.875z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 10.125v10.125" /><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 10.125c.621 0 1.125.504 1.125 1.125v8.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M5.625 10.125c-.621 0-1.125.504-1.125 1.125v8.25" /></svg>;
const ProfileIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const HelpIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CameraIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>;
const SettingsAppIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const MapsIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;
const MusicIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>;
const GalleryIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ModderIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const PhoneAppIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const ChatAppIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const MailAppIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const ContactsAppIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const NotepadAppIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const CalculatorAppIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m-6 4h6m-6 4h6m2 4H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" /></svg>;
const PaintAppIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12.5a2 2 0 002-2v-6.5a2 2 0 00-2-2H7" /></svg>;
const FilesAppIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
const EditorAppIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
const ConverterAppIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
const CalendarAppIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const BrowserAppIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
const ConsoleSwitchIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const AndroidIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 0 0-.1521-.5676.416.416 0 0 0-.5676.1521l-2.0225 3.503c-1.4669-.6632-3.1135-1.0602-4.8866-1.0602-1.7419 0-3.3586.3865-4.8114 1.0276L5.446 5.4143a.416.416 0 0 0-.5676-.1521.4157.4157 0 0 0-.1521.5676l1.9703 3.4124C3.1354 10.975 1.0366 14.8773 1 19.343h22c-.0366-4.5065-2.1799-8.4435-5.1185-10.0216"/></svg>;
const WhoAmIIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4z" /></svg>;
const SpeedIcon = (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;

export const APPS_MAP: Record<string, { component: React.FC<any>, defaultSize?: { width: number, height: number } }> = {
    'app-phone': { component: PhoneApp, defaultSize: { width: 450, height: 700 } },
    'app-chat': { component: ChatApp },
    'app-localmail': { component: LocalMailApp },
    'app-contacts': { component: ContactsApp, defaultSize: { width: 800, height: 600 } },
    'app-notepad': { component: NotepadApp },
    'app-calculator': { component: CalculatorApp, defaultSize: { width: 400, height: 600 } },
    'app-paint': { component: PaintApp },
    'app-files': { component: FileExplorerApp },
    'app-editor': { component: EditorApp },
    'app-converter': { component: UnitConverterApp },
    'app-calendar': { component: CalendarApp },
    'app-console-switch': { component: ConsoleSwitchApp, defaultSize: { width: 900, height: 500 } },
    'app-webly-store': { component: WeblyStoreApp },
    'app-webview': { component: WebAppViewer, defaultSize: { width: 1024, height: 768 } },
    'app-browser': { component: LynixBrowserApp, defaultSize: { width: 1000, height: 700 } },
    'app-settings': { component: SettingsApp, defaultSize: { width: 800, height: 600 } },
    'app-mobilator': { component: MobilatorApp, defaultSize: { width: 450, height: 850 } }, 
    'app-android': { component: AndroidApp, defaultSize: { width: 360, height: 640 } },
    'app-whoami': { component: WhoAmIApp, defaultSize: { width: 600, height: 500 } },
    'app-speedtest': { component: WhoAmIApp, defaultSize: { width: 600, height: 500 } },
};

export const FULL_PAGE_MAP: Record<string, React.FC<any>> = {
    'home': HomePage,
    'contact': SupportPage, 
    'support': SupportPage,
    'signin': SignInPage,
    'profile': ProfilePage,
    'admin': AdminPortal,
    'auth-callback': AuthCallbackPage,
    'app-chat': ChatApp,
    'app-localmail': LocalMailApp,
    'app-notepad': NotepadApp,
    'app-paint': PaintApp,
    'app-files': FileExplorerApp,
    'app-editor': EditorApp,
    'app-converter': UnitConverterApp,
    'app-calendar': CalendarApp,
    'app-phone': PhoneApp,
    'app-contacts': ContactsApp,
    'app-calculator': CalculatorApp,
    'app-console-switch': ConsoleSwitchApp,
    'app-webly-store': WeblyStoreApp,
    'app-webview': WebAppViewer,
    'app-browser': LynixBrowserApp,
    'app-settings': SettingsApp,
    'app-mobilator': MobilatorApp,
    'app-android': AndroidApp,
    'app-whoami': WhoAmIApp,
    'app-speedtest': WhoAmIApp,
    'apptos': TermsOfServicePage,
    'apppripollnk': PrivacyPolicyPage,
};

export const MOBILE_PAGES_MAP: Record<string, React.FC<any>> = {
    'home': MobiLauncher,
    'profile': MobiProfilePage,
    'admin': AdminPortal,
    'contact': MobiHelpApp, 
    'support': MobiHelpApp,
    'app-phone': MobiPhoneApp,
    'app-chat': MobiChatApp,
    'app-localmail': MobiLocalMailApp,
    'app-contacts': MobiContactsApp,
    'app-notepad': MobiNotepadApp,
    'app-calculator': MobiCalculatorApp,
    'app-paint': MobiPaintApp,
    'app-files': MobiFileExplorerApp,
    'app-editor': MobiEditorApp,
    'app-converter': MobiUnitConverterApp,
    'app-calendar': MobiCalendarApp,
    'app-console-switch': MobiConsoleSwitchApp,
    'app-webly-store': MobiWeblyStoreApp,
    'mobi-app-webview': MobiWebAppViewer,
    'app-webview': MobiWebAppViewer, 
    'app-browser': MobiLynixBrowserApp, 
    'app-help': MobiHelpApp,
    'app-camera': MobiCameraApp,
    'app-settings': MobiSettingsApp,
    'app-maps': MobiMapsApp,
    'app-music': MobiMusicApp,
    'app-gallery': MobiGalleryApp,
    'app-modder': MobiModderApp,
    'recovery-mode': RecoveryMode,
    'app-android': AndroidApp,
    'app-whoami': MobiWhoAmIApp,
    'app-speedtest': MobiWhoAmIApp,
    'apptos': TermsOfServicePage,
    'apppripollnk': PrivacyPolicyPage,
};

export const APPS_LIST: AppLaunchable[] = [
  { id: 'app-phone', label: 'Phone', icon: <PhoneAppIcon />, page: 'app-phone' },
  { id: 'app-chat', label: 'Chat', icon: <ChatAppIcon />, page: 'app-chat' },
  { id: 'app-localmail', label: 'Mail', icon: <MailAppIcon />, page: 'app-localmail' },
  { id: 'app-contacts', label: 'Contacts', icon: <ContactsAppIcon />, page: 'app-contacts' },
  { id: 'app-browser', label: 'Browser', icon: <BrowserAppIcon />, page: 'app-browser' },
  { id: 'app-files', label: 'Files', icon: <FilesAppIcon />, page: 'app-files' },
  { id: 'app-notepad', label: 'Notepad', icon: <NotepadAppIcon />, page: 'app-notepad' },
  { id: 'app-calculator', label: 'Calculator', icon: <CalculatorAppIcon />, page: 'app-calculator' },
  { id: 'app-calendar', label: 'Calendar', icon: <CalendarAppIcon />, page: 'app-calendar' },
  { id: 'app-paint', label: 'Paint', icon: <PaintAppIcon />, page: 'app-paint' },
  { id: 'app-editor', label: 'Editor', icon: <EditorAppIcon />, page: 'app-editor' },
  { id: 'app-converter', label: 'Converter', icon: <ConverterAppIcon />, page: 'app-converter' },
  { id: 'app-console-switch', label: 'Consoles', icon: <ConsoleSwitchIcon />, page: 'app-console-switch' },
  { id: 'app-webly-store', label: 'Store', icon: <WeblyStoreIcon />, page: 'app-webly-store' },
  { id: 'profile', label: 'Profile', icon: <ProfileIcon />, page: 'profile', isHidden: true },
  { id: 'app-help', label: 'Help?', icon: <HelpIcon />, page: 'app-help' },
  { id: 'app-camera', label: 'Camera', icon: <CameraIcon />, page: 'app-camera' },
  { id: 'app-settings', label: 'Settings', icon: <SettingsAppIcon />, page: 'app-settings' },
  { id: 'app-maps', label: 'Maps', icon: <MapsIcon />, page: 'app-maps' },
  { id: 'app-music', label: 'Music', icon: <MusicIcon />, page: 'app-music' },
  { id: 'app-gallery', label: 'Gallery', icon: <GalleryIcon />, page: 'app-gallery' },
  { id: 'app-modder', label: 'Modder', icon: <ModderIcon />, page: 'app-modder', isHidden: true },
  { id: 'app-mobilator', label: 'Mobilator', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>, page: 'app-mobilator' },
  { id: 'app-android', label: 'Android', icon: <AndroidIcon />, page: 'app-android' },
  { id: 'app-whoami', label: 'WhoAmI', icon: <WhoAmIIcon />, page: 'app-whoami' },
  { id: 'app-speedtest', label: 'Speedtest', icon: <SpeedIcon />, page: 'app-speedtest', params: { autoStartTest: true } },
];

const App: React.FC = () => {
    const { user, isLoggedIn, isLoading, updateUserProfile } = useAuth();
    const { view: consoleView, isInitialChoice } = useConsoleView();
    const [page, setPage] = useState<Page>('home');
    const [pageParams, setPageParams] = useState<any>({});
    const { isDark, wallpaper } = useTheme();
    const isRealMobileDevice = useIsMobileDevice();
    const [windows, setWindows] = useState<WindowInstance[]>([]);
    const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
    const nextZIndex = useRef(10);
    const [allWeblyApps, setAllWeblyApps] = useState<WeblyApp[]>([]);
    const [showBootScreen, setShowBootScreen] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const inactivityTimerRef = useRef<any>(null);
    const [recentApps, setRecentApps] = useState<AppLaunchable[]>([]);
    const [showRecents, setShowRecents] = useState(false);
    const [notification, setNotification] = useState<NotificationProps | null>(null);
    
    // Port-based Mode State
    const [forcedView, setForcedView] = useState<'default' | 'mobile' | 'mobilator' | 'desktop' | 'app'>('default');
    
    // Device Selection Prompt
    const [showDeviceSelection, setShowDeviceSelection] = useState(false);
    
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showUpdateScreen, setShowUpdateScreen] = useState(false);
    const [updateVersion, setUpdateVersion] = useState('');

    // Port Detection & Device Prompt Logic
    useEffect(() => {
        const port = window.location.port;
        
        if (port === '1091') {
            setForcedView('mobile');
        } else if (port === '1092') {
            setForcedView('mobilator');
        } else if (port === '10211') {
            setForcedView('desktop');
        } else if (port === '1822') {
            setForcedView('app');
        } else {
            // Check for small screen on default port
            const savedPref = localStorage.getItem('lynix_device_preference');
            if (savedPref === 'mobile') {
                setForcedView('mobile');
            } else if (savedPref === 'desktop') {
                setForcedView('desktop');
            } else if (window.innerWidth <= 768) {
                setShowDeviceSelection(true);
            } else {
                setForcedView('default');
            }
        }
    }, []);

    const handleDeviceSelect = (type: 'mobile' | 'desktop') => {
        localStorage.setItem('lynix_device_preference', type);
        setForcedView(type);
        setShowDeviceSelection(false);
        // If mobile selected, trigger boot screen which requires interaction for audio
        if (type === 'mobile') {
            setShowBootScreen(true);
        }
    };

    // Determine if we should render as Mobile Device
    const isMobileDevice = useMemo(() => {
        if (forcedView === 'mobile') return true;
        if (forcedView === 'desktop' || forcedView === 'mobilator' || forcedView === 'app') return false;
        return isRealMobileDevice;
    }, [forcedView, isRealMobileDevice]);

    useEffect(() => {
        if (!isLoggedIn || !user?.auth_id) return;
        const handlePeriodicRefresh = async () => {
            try {
                const { profile } = await database.getUserProfile(user.auth_id!);
                if (profile) updateUserProfile(profile);
            } catch(e) { console.error("Silent refresh failed", e); }
        };
        const intervalId = setInterval(handlePeriodicRefresh, 90000); 
        return () => clearInterval(intervalId);
    }, [isLoggedIn, user?.auth_id, updateUserProfile]);

    // Lifecycle Check
    useEffect(() => {
        if (isLoggedIn && user && isMobileDevice) {
            const hasOnboarded = localStorage.getItem(`lynix_onboarding_complete_${user.id}`);
            if (!hasOnboarded) setShowOnboarding(true);

            const lastSeenVersion = localStorage.getItem(`lynix_last_version_${user.id}`);
            const currentSystemVersion = user.system_version || '12.0.2';
            
            if (lastSeenVersion !== currentSystemVersion) {
                setUpdateVersion(currentSystemVersion);
                setShowUpdateScreen(true);
            }
        }
    }, [isLoggedIn, user, isMobileDevice]);

    // Inactivity Timer for Mobile
    useEffect(() => {
        if (!isMobileDevice || !isLoggedIn) return;
        const resetTimer = () => {
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = setTimeout(() => setIsLocked(true), 30000);
        };
        resetTimer();
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);
        window.addEventListener('click', resetTimer);
        window.addEventListener('touchstart', resetTimer);
        return () => {
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', resetTimer);
            window.removeEventListener('click', resetTimer);
            window.removeEventListener('touchstart', resetTimer);
        };
    }, [isMobileDevice, isLoggedIn]);

    useEffect(() => {
        database.getWeblyApps().then(setAllWeblyApps);
    }, []);

    useEffect(() => {
        // Boot screen logic: Show on mobile/mobilator start.
        // If coming from Device Selection, it's handled in handleDeviceSelect.
        // This effect handles direct loads if preference exists.
        if ((isMobileDevice || forcedView === 'mobilator') && !showDeviceSelection) {
             // Check if we've already "booted" this session to avoid redundant boots on hot reload, 
             // but ensure full reload triggers it.
             // Simple approach: Just set true. MobileBootScreen handles "suspended" state now.
             setShowBootScreen(true);
             if ('Notification' in window) Notification.requestPermission();
        } else {
            setShowBootScreen(false);
        }
    }, [isMobileDevice, forcedView, showDeviceSelection]);

    const handleOnboardingComplete = () => {
        if (user) {
            localStorage.setItem(`lynix_onboarding_complete_${user.id}`, 'true');
            setShowOnboarding(false);
        }
    };

    const handleUpdateInfoComplete = () => {
        if (user) {
            localStorage.setItem(`lynix_last_version_${user.id}`, user.system_version || '12.0.2');
            setShowUpdateScreen(false);
        }
    };

    const dynamicAppsList = useMemo(() => {
        const coreApps = APPS_LIST;
        let availableApps: AppLaunchable[] = coreApps;

        const currentVersion = user?.system_version || '12.0.2';
        const isDevMode = localStorage.getItem('lynix_developer_mode') === 'true';

        if (currentVersion.startsWith('10')) {
            availableApps = availableApps.filter(app => ['app-phone', 'app-chat', 'app-contacts', 'app-localmail', 'app-settings', 'app-help', 'app-camera', 'app-browser', 'app-android', 'app-whoami', 'app-speedtest'].includes(app.id));
        } else if (currentVersion === '12.0.2') {
            availableApps = availableApps.filter(app => !['app-webly-store', 'app-maps', 'app-music', 'app-gallery', 'app-modder', 'app-mobilator'].includes(app.id));
        } else if (currentVersion === '12.5') {
            availableApps = availableApps.filter(app => !['app-maps', 'app-music', 'app-gallery', 'app-modder'].includes(app.id));
        } else if (currentVersion === '13.0') {
            availableApps = availableApps.filter(app => app.id !== 'app-modder');
        } else if (currentVersion === '14.0') {
            if (isDevMode) {
                availableApps = availableApps.map(app => app.id === 'app-modder' ? { ...app, isHidden: false } : app);
            }
        }

        if (user?.installed_webly_apps && allWeblyApps.length > 0) {
             const installedApps: AppLaunchable[] = user.installed_webly_apps
                .map((appId): AppLaunchable | null => {
                    const appData = allWeblyApps.find(app => app.id === appId);
                    if (!appData) return null;
                    const isNative = !!APPS_MAP[appData.id];
                    return {
                        id: appData.id,
                        label: appData.name,
                        icon: <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: appData.icon_svg }} />,
                        page: isNative ? (appData.id as Page) : (isMobileDevice ? 'mobi-app-webview' : 'app-webview'),
                        isWebApp: !isNative,
                        url: appData.url,
                        load_in_console: appData.load_in_console,
                        params: isNative ? {} : { url: appData.url, title: appData.name, isWebApp: true, iconSvg: appData.icon_svg } 
                    };
                })
                .filter((app): app is AppLaunchable => app !== null);
            availableApps = [...availableApps, ...installedApps];
        }

        if (user) {
            if (user.role === UserRole.Overdue) return availableApps.filter(app => ['profile', 'contact', 'support', 'app-console-switch', 'app-help', 'app-whoami', 'app-speedtest'].includes(app.id));
            if (user.role === UserRole.NoChat) availableApps = availableApps.filter(app => app.id !== 'app-chat');
            if (user.role === UserRole.NoStore) availableApps = availableApps.filter(app => { if (app.id === 'app-webly-store') return false; if (app.id === 'profile' || app.id === 'app-help' || app.id === 'app-camera' || app.id === 'app-settings' || app.id === 'app-whoami' || app.id === 'app-speedtest') return true; if (app.isWebApp) return false; return true; });
            if (user.role === UserRole.NoMail) availableApps = availableApps.filter(app => app.id !== 'app-localmail');
            if (user.role === UserRole.NoTelephony) availableApps = availableApps.filter(app => app.id !== 'app-phone');
        }
        return availableApps;
    }, [user, allWeblyApps, isMobileDevice]);
    
    useEffect(() => {
        const path = window.location.pathname;
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        
        if (forcedView === 'app') {
             const appPath = path.substring(1); 
             const appMapKey = `app-${appPath}`;
             if (APPS_MAP[appMapKey]) {
                 setPage(appMapKey as Page);
             } else {
                 setPage('home'); 
             }
             return;
        }

        if ((path === '/auth/callback' || path.startsWith('/auth/callback/')) && code && state) { setPage('auth-callback'); } else {
            const pageFromPath = path.substring(1) as Page;
            if (Object.keys(FULL_PAGE_MAP).includes(pageFromPath) || Object.keys(APPS_MAP).includes(pageFromPath)) {
                if (pageFromPath !== 'signin' && pageFromPath !== 'contact' && pageFromPath !== 'support') setPage(pageFromPath);
            } else { setPage('home'); }
        }
    }, [forcedView]);

    const navigate = useCallback((newPage: Page, params: any = {}) => {
        const appData = params?.appData as AppLaunchable | undefined;
        if (isMobileDevice && appData) {
            setRecentApps(prev => { const filtered = prev.filter(app => app.id !== appData.id); return [appData, ...filtered].slice(0, 10); });
        }
        if (appData?.isWebApp && appData.url && appData.load_in_console === false) { window.open(appData.url, '_blank'); return; }
        
        const isWindowedConsole = isLoggedIn && !isMobileDevice && ['syno', 'fais', 'win', 'mac', 'cos'].includes(consoleView);
        const isApp = !!APPS_MAP[newPage as keyof typeof APPS_MAP];
        const isWindowablePage = ['contact', 'support', 'profile', 'admin', 'apptos', 'apppripollnk'].includes(newPage); // Added legal pages here if needed windowed
        const isFullScreenOverride = newPage === 'app-console-switch';
        const shouldBeWindowed = isWindowedConsole && !isFullScreenOverride && (isApp || isWindowablePage || (appData?.isWebApp && appData?.load_in_console));

        if (shouldBeWindowed) {
            const existingWindow = windows.find(w => w.appId === newPage && w.props?.title === params?.title);
            if (existingWindow) {
                if (existingWindow.state === 'minimized') setWindows(wins => wins.map(w => w.id === existingWindow.id ? { ...w, state: 'open', zIndex: nextZIndex.current++ } : w));
                else setWindows(wins => wins.map(w => w.id === existingWindow.id ? { ...w, zIndex: nextZIndex.current++ } : w));
                setActiveWindowId(existingWindow.id); return;
            }
            const appConfig = APPS_MAP[newPage as keyof typeof APPS_MAP];
            const newWindow: WindowInstance = { id: `${newPage}-${Date.now()}`, appId: newPage, title: params?.title || APPS_LIST.find(app => app.page === newPage)?.label || newPage.charAt(0).toUpperCase() + newPage.slice(1), position: params?.position || { x: Math.random() * 200 + 50, y: Math.random() * 100 + 50 }, size: params?.size || appConfig?.defaultSize || { width: 700, height: 500 }, zIndex: nextZIndex.current++, state: 'open', props: params };
            setWindows([...windows, newWindow]); setActiveWindowId(newWindow.id);
        } else { setPage(newPage); setPageParams(params); }
    }, [isLoggedIn, isMobileDevice, consoleView, windows]);

    useEffect(() => { if (isLoggedIn && (page === 'home' || page === 'signin')) { if (!isMobileDevice && isInitialChoice) { navigate('app-console-switch'); } else { setPage('home'); } } }, [isLoggedIn, page, isMobileDevice, isInitialChoice, navigate]);

    const closeWindow = (id: string) => setWindows(windows.filter(win => win.id !== id));
    const focusWindow = (id: string) => { if (id === activeWindowId) return; setWindows(windows.map(win => win.id === id ? { ...win, zIndex: nextZIndex.current++ } : win)); setActiveWindowId(id); };
    const minimizeWindow = (id: string) => { setWindows(windows.map(win => win.id === id ? { ...win, state: 'minimized' } : win)); if (activeWindowId === id) { const nextActive = windows.filter(w => w.id !== id && w.state === 'open').sort((a, b) => b.zIndex - a.zIndex)[0]; setActiveWindowId(nextActive ? nextActive.id : null); } };
    const updateWindowPosition = (id: string, newPosition: { x: number, y: number }) => { setWindows(windows.map(win => win.id === id ? { ...win, position: newPosition } : win)); };
    const updateWindowSize = (id: string, newSize: { width: number, height: number }) => { setWindows(windows.map(win => win.id === id ? { ...win, size: newSize } : win)); };

    const renderLayout = () => {
        if (isLoading) {
            // We let the MobileBootScreen handle its own display logic if needed, but if we are genuinely loading data:
            if ((isMobileDevice || forcedView === 'mobilator') && showBootScreen) return <MobileBootScreen onComplete={() => setShowBootScreen(false)} />;
            return ( <div className="flex-grow flex items-center justify-center bg-black text-white"> <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div> </div> );
        }

        if (isLoggedIn) {
            if (user?.role === UserRole.Suspended || user?.role === UserRole.Invalid || user?.role === UserRole.Overdue) {
                return <AccountInvalidScreen />;
            }

            if (forcedView === 'mobilator') {
                return (
                    <div className="flex-grow flex flex-col h-screen bg-[#1a1a1a]">
                        {showBootScreen && <MobileBootScreen onComplete={() => setShowBootScreen(false)} />}
                        <MobilatorApp navigate={navigate} />
                    </div>
                );
            }

            if (forcedView === 'app') {
                const AppContent = APPS_MAP[page as keyof typeof APPS_MAP]?.component;
                if (AppContent) {
                    return <div className="flex-grow h-screen"><AppContent navigate={navigate} {...pageParams} /></div>
                }
                return <div className="flex-grow flex items-center justify-center text-white">App not found for port 1822 path.</div>
            }

            if (isMobileDevice) {
                let MobileComponent = MOBILE_PAGES_MAP[page];
                if (page === 'home') {
                    const version = user.system_version || '12.0.2';
                    if (version.startsWith('10')) MobileComponent = LegacyLauncher;
                    else if (version === '14.0') {
                        const mods = JSON.parse(localStorage.getItem('lynix_mods') || '{}');
                        const style = mods.launcherStyle || 'pixel';
                        if (style === 'oneui') MobileComponent = OneUILauncher;
                        else if (style === 'bb10') MobileComponent = BB10Launcher;
                        else MobileComponent = MobiLauncher;
                    } else { MobileComponent = MobiLauncher; }
                }
                
                const customFont = user.system_version === '14.0' ? JSON.parse(localStorage.getItem('lynix_mods') || '{}').customFont : undefined;

                return (
                    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ fontFamily: customFont }}>
                        {showBootScreen && <MobileBootScreen onComplete={() => setShowBootScreen(false)} />}
                        {showOnboarding && <MobileOnboarding onComplete={handleOnboardingComplete} />}
                        {showUpdateScreen && <MobileUpdateInfo version={updateVersion} onComplete={handleUpdateInfoComplete} />}
                        
                        <LockScreen isLocked={isLocked} onUnlock={() => setIsLocked(false)} />
                        <NotificationToast notification={notification} />
                        {!page.startsWith('app-android') && (
                            <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none"><div className="pointer-events-auto"><MobileTopBar navigate={navigate} onSleep={() => setIsLocked(true)} /></div></div>
                        )}
                        <main className="flex-grow relative w-full h-full overflow-hidden"><MobileComponent navigate={navigate} appsList={dynamicAppsList} {...pageParams} /></main>
                        {showRecents && (<div className="absolute inset-0 bg-black/90 backdrop-blur-md z-[60] flex flex-col p-6 animate-fade-in"><div className="flex justify-between items-center mb-6"><h2 className="text-white text-2xl font-bold">Recent Apps</h2><button onClick={() => setShowRecents(false)} className="text-white bg-white/10 px-4 py-2 rounded-full text-sm">Close</button></div>{recentApps.length === 0 ? ( <div className="flex-grow flex items-center justify-center text-gray-500">No recent apps</div> ) : ( <div className="flex-grow overflow-y-auto space-y-4 pb-20"> {recentApps.map(app => ( <div key={app.id} onClick={(e) => { e.stopPropagation(); navigate(app.page, { ...app.params, appData: app }); setShowRecents(false); }} className="bg-[#303030] p-4 rounded-2xl flex items-center space-x-4 shadow-lg active:scale-95 transition-transform"> <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"> {React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-8 h-8" })} </div> <span className="text-white font-bold text-lg">{app.label}</span> </div> ))} </div> )}<button onClick={() => { setRecentApps([]); setShowRecents(false); }} className="w-full py-3 bg-red-600/80 text-white rounded-xl font-semibold mt-4">Clear All</button></div>)}
                        {!page.startsWith('app-modder') && !page.startsWith('recovery-mode') && !page.startsWith('app-android') && <div className="relative z-50"><MobileNavBar navigate={navigate} onRecents={() => setShowRecents(true)} /></div>}
                    </div>
                );
            }

            let ConsoleComponent;
            switch (consoleView) { case 'fais': ConsoleComponent = FaisConsole; break; case 'lega': ConsoleComponent = LegaLauncher; break; case 'con': ConsoleComponent = ConConsole; break; case 'win': ConsoleComponent = WinLauncher; break; case 'mac': ConsoleComponent = MacLaunch; break; case 'cos': ConsoleComponent = COSLaunch; break; default: ConsoleComponent = ConsolePage; }
            const windowedConsoles = ['syno', 'fais', 'win', 'mac', 'cos']; const isWindowedEnvironment = windowedConsoles.includes(consoleView); const isFullScreenOverride = page === 'app-console-switch'; const PageToRender = FULL_PAGE_MAP[page]; const isShowingAppPage = page !== 'home' && PageToRender && (!isWindowedEnvironment || isFullScreenOverride);
            if (isShowingAppPage) { return ( <div className="flex-grow flex flex-col overflow-hidden"> <FullScreenAppHeader navigate={navigate} pageParams={pageParams} /> <main className="flex-grow flex flex-col min-h-0"> <PageToRender navigate={navigate} {...pageParams} /> </main> </div> ); }
            return ( <div className="relative flex-grow overflow-hidden"> <ConsoleComponent navigate={navigate} appsList={dynamicAppsList} /> {isWindowedEnvironment && ( <div className="absolute inset-0 top-0 left-0 right-0 bottom-0 pointer-events-none overflow-hidden"> {windows.map(win => { const WindowContent = APPS_MAP[win.appId]?.component || FULL_PAGE_MAP[win.appId]; if (!WindowContent) return null; return ( <WindowComponent key={win.id} win={win} onClose={closeWindow} onFocus={focusWindow} onMinimize={minimizeWindow} onPositionChange={updateWindowPosition} onSizeChange={updateWindowSize} isActive={activeWindowId === win.id}> <WindowContent {...win.props} navigate={navigate} closeWindow={() => closeWindow(win.id)} /> </WindowComponent> ); })} </div> )} </div> );
        }

        if (page === 'auth-callback') { const PageToRender = FULL_PAGE_MAP[page]; return <div className="flex-grow flex items-center justify-center p-4"><PageToRender navigate={navigate} /></div>; }
        if (page === 'apptos') { return <div className="flex-grow flex items-center justify-center p-4 w-full h-screen bg-gray-100 dark:bg-gray-900"><TermsOfServicePage navigate={navigate} /></div>; }
        if (page === 'apppripollnk') { return <div className="flex-grow flex items-center justify-center p-4 w-full h-screen bg-gray-100 dark:bg-gray-900"><PrivacyPolicyPage navigate={navigate} /></div>; }
        
        if (isMobileDevice || forcedView === 'mobilator') { 
            return ( 
                <div className="flex-grow flex flex-col bg-black text-white"> 
                    {showBootScreen && <MobileBootScreen onComplete={() => setShowBootScreen(false)} />} 
                    <main className="flex-grow overflow-y-auto"> 
                        <MobileLoginSetup />
                    </main> 
                </div> 
            ) 
        }
        
        const PageToRender = page === 'signin' ? SignInPage : FULL_PAGE_MAP[page] || HomePage;
        return ( <div className="flex flex-col min-h-screen w-full"> <Header navigate={navigate} /> <main className="flex-grow flex items-center justify-center p-4 w-full"> <PageToRender navigate={navigate} /> </main> <Footer /> </div> );
    };
    
    const wallpaperClass = (isLoggedIn || !isMobileDevice) ? (wallpapers[wallpaper] || wallpapers.forest).class : 'bg-light-bg dark:bg-dark-bg';

    return (
        <LanguageProvider>
            {showDeviceSelection && <DeviceSelectionModal onSelect={handleDeviceSelect} />}
            <div className={`flex flex-col min-h-screen ${isDark ? 'dark' : ''} ${wallpaperClass} font-sans transition-all duration-500`}>
                {renderLayout()}
                <CallWidget />
                <CallNotificationWidget />
            </div>
        </LanguageProvider>
    );
};

const Root = () => ( <ThemeProvider> <AuthProvider> <ConsoleViewProvider> <CallProvider> <App /> </CallProvider> </ConsoleViewProvider> </AuthProvider> </ThemeProvider> );
export default Root;
