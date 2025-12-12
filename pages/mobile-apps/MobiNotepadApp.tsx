
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { DriveFile } from '../../types';
import { database } from '../../services/database';

const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m7 7H3" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;

const MobiNotepadApp: React.FC = () => {
    const { user } = useAuth();
    const [notes, setNotes] = useState<DriveFile[]>([]);
    const [selectedNote, setSelectedNote] = useState<DriveFile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTitle, setCurrentTitle] = useState('');
    const [currentContent, setCurrentContent] = useState('');
    
    // Mimic Google Keep colors
    const noteColors = ['bg-[#202124]', 'bg-[#5C2B29]', 'bg-[#614A19]', 'bg-[#635D19]', 'bg-[#345920]', 'bg-[#16504B]', 'bg-[#2D555E]', 'bg-[#1E3A5F]', 'bg-[#42275E]', 'bg-[#5B2245]'];

    const fetchNotes = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        const { files } = await database.getDriveFiles("mimeType='text/plain' and trashed=false");
        if (files) setNotes(files.sort((a,b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()));
        setIsLoading(false);
    }, [user]);

    useEffect(() => { fetchNotes(); }, [fetchNotes]);

    const handleSelectNote = async (note: DriveFile) => {
        setSelectedNote(note);
        setCurrentTitle(note.name.replace('.txt', ''));
        setCurrentContent('Loading...');
        const { file } = await database.getDriveFileDetails(note.id);
        setCurrentContent(file ? file.content : '');
    };

    const handleNewNote = async () => {
        const title = prompt("Note Title:", "Untitled");
        if (title) {
            const { file } = await database.createDriveFile(title + ".txt");
            if (file) {
                await fetchNotes();
                handleSelectNote(file);
            }
        }
    };

    const handleSaveNote = async () => {
        if (!selectedNote || !user) return;
        await database.updateDriveFile(selectedNote.id, { name: currentTitle + ".txt", content: currentContent });
        fetchNotes();
        setSelectedNote(null);
    };

    if (selectedNote) {
        return (
            <div className="w-full h-full flex flex-col bg-[#121212] text-white font-sans">
                <header className="p-4 flex items-center justify-between">
                    <button onClick={() => setSelectedNote(null)} className="p-2 rounded-full hover:bg-white/10"><BackIcon /></button>
                    <button onClick={handleSaveNote} className="p-2 rounded-full hover:bg-white/10"><SaveIcon /></button>
                </header>
                <div className="flex-grow p-4 flex flex-col">
                    <input type="text" value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} placeholder="Title" className="bg-transparent text-2xl font-medium mb-4 focus:outline-none" />
                    <textarea value={currentContent} onChange={(e) => setCurrentContent(e.target.value)} placeholder="Note" className="bg-transparent flex-grow resize-none focus:outline-none text-base leading-relaxed" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-[#121212] text-white font-sans relative">
            <div className="p-4">
                <div className="bg-[#2c2c2c] rounded-full p-3 flex items-center shadow-sm">
                    <button className="p-1 mr-2"><MenuIcon /></button>
                    <span className="flex-grow text-gray-300 text-sm font-medium">Search your notes</span>
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">{user?.username.charAt(0).toUpperCase()}</div>
                </div>
            </div>

            <main className="flex-grow overflow-y-auto p-2">
                {isLoading ? <div className="text-center p-8 text-gray-500">Loading...</div> : (
                    <div className="columns-2 gap-2 space-y-2">
                        {notes.map((note, index) => (
                            <div key={note.id} onClick={() => handleSelectNote(note)} className={`break-inside-avoid p-4 rounded-xl border border-[#5f6368] ${noteColors[index % noteColors.length]} min-h-[100px] flex flex-col`}>
                                <h3 className="font-bold text-sm mb-2 truncate">{note.name.replace('.txt', '')}</h3>
                                <p className="text-xs text-gray-300 line-clamp-4">Tap to edit this note...</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#1e1e1e] flex items-center px-4 text-xs font-bold border-t border-[#333] text-gray-400">
                <span>{notes.length} notes</span>
            </div>

            <button onClick={handleNewNote} className="absolute bottom-8 right-4 w-14 h-14 bg-[#2c2c2c] border border-[#5f6368] rounded-2xl shadow-xl flex items-center justify-center text-[#a8c7fa] hover:bg-[#3c3c3c]">
                <PlusIcon />
            </button>
        </div>
    );
};

export default MobiNotepadApp;
