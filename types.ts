
import type { ReactNode } from 'react';

export enum UserRole {
    Admin = 'Admin',
    Standard = 'Standard',
    NoChat = 'no-chat',
    NoStore = 'no-store',
    NoMail = 'no-mail',
    NoTelephony = 'no-telephony',
    NoAI = 'no-ai',
    Overdue = 'overdue',
    Trial = 'trial',
    Guest = 'Guest',
    Suspended = 'suspended',
    Invalid = 'invalid',
}

export interface User {
    id: number;
    auth_id?: string; // Link to the auth.users table
    username: string;
    email: string;
    role: UserRole;
    plan_name?: string;
    phone_number?: string;
    system_version?: string; // Added system version
    features: {
        chat: boolean;
        ai: boolean;
        mail: boolean;
    };
    installed_webly_apps?: string[];
}

export interface ChatMessage {
    id: number;
    senderId: number;
    receiverId: number;
    text: string;
    timestamp: Date;
    // Prisma will include these when we query
    sender: User; 
    receiver: User;
}

export interface Mail {
    id: number;
    account_id?: number;
    sender: string;
    recipient: string;
    subject: string;
    body: string;
    timestamp: Date;
    read: boolean;
}

export interface MailAccount {
    id: number;
    user_id: string; // Foreign key to auth.users.id
    display_name: string;
    email_address: string;
    smtp_server: string;
    smtp_port: number;
    smtp_user: string;
    smtp_pass: string;
    smtp_encryption: string;
    imap_server: string;
    imap_port: number;
    imap_user: string;
    imap_pass: string;
    imap_encryption: string;
}


export interface Contact {
    id: number;
    owner: string; // username of the user who owns the contact
    name: string;
    email?: string;
    phone?: string;
}

export interface Note {
    id: number;
    owner: string; // username of the user who owns the note
    title: string;
    content: string;
    createdAt: Date;
}

// Add DriveFile interface for Google Drive files
export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime: string;
    webViewLink: string;
    iconLink: string;
}

export interface WeblyApp {
    id: string; 
    name: string;
    description: string;
    url: string;
    icon_svg: string;
    created_at: string;
    load_in_console: boolean;
}

export type Page = 
    | 'home' 
    | 'contact' 
    | 'support'
    | 'signin' 
    | 'profile' 
    | 'admin'
    | 'app-phone'
    | 'app-chat'
    | 'app-localmail'
    | 'app-contacts'
    | 'app-notepad'
    | 'app-calculator'
    | 'app-paint'
    | 'app-files'
    | 'app-editor'
    | 'app-converter'
    | 'app-calendar'
    | 'app-console-switch'
    | 'app-webly-store'
    | 'app-webview'
    | 'app-browser'
    | 'app-help'
    | 'app-camera'
    | 'app-settings'
    | 'app-maps'
    | 'app-music'
    | 'app-gallery'
    | 'app-modder'
    | 'app-mobilator'
    | 'app-android'
    | 'app-whoami'
    | 'app-speedtest'
    | 'mobi-app-webview'
    | 'auth-callback'
    | 'apptos'
    | 'apppripollnk';

// --- Centralized Console Types ---

export type AppLaunchable = {
  id: string;
  label: string;
  icon: ReactNode;
  page: Page;
  params?: any;
  isHidden?: boolean;
  isWebApp?: boolean;
  url?: string;
  load_in_console?: boolean;
};

export type NavAction = {
  page: Page;
  action: 'navigate' | 'logout';
  params?: any;
};

export interface WindowInstance {
    id: string;
    appId: string;
    title: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    zIndex: number;
    state: 'open' | 'minimized' | 'maximized';
    props?: any;
}
