import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { DriveFile } from '../../types';
import { database } from '../../services/database';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

const NotepadApp: React.FC = () => {
    const { user } = useAuth();
    const [notes, setNotes] = useState<DriveFile[]>([]);
    const [selectedNote, setSelectedNote] = useState<DriveFile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTitle, setCurrentTitle] = useState('');
    const [currentContent, setCurrentContent] = useState('');
    const [saveStatus, setSaveStatus] = useState('');

    const fetchNotes = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        const { files, error } = await database.getDriveFiles("mimeType='text/plain' and trashed=false");
        if (files) {
            setNotes(files.sort((a,b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()));
        } else {
            console.error("Failed to fetch notes from Drive:", error);
            setSaveStatus("Error: Could not load notes from Drive.");
        }
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleSelectNote = useCallback(async (note: DriveFile) => {
        setSelectedNote(note);
        setCurrentTitle(note.name);
        setCurrentContent('Loading content...');
        const { file, error } = await database.getDriveFileDetails(note.id);
        if (file) {
            setCurrentContent(file.content);
        } else {
            setCurrentContent(`Failed to load content: ${error}`);
        }
    }, []);

    const handleNewNote = async () => {
        if (!user) return;
        const title = window.prompt("Enter a title for your new note:", "New Note.txt");
        if (title) {
            setSaveStatus("Creating new note...");
            const { file, error } = await database.createDriveFile(title);
            if (file) {
                await fetchNotes();
                handleSelectNote(file); // Automatically select the new note
                setSaveStatus("Note created successfully!");
            } else {
                setSaveStatus(`Error creating note: ${error}`);
            }
        }
    };

    const handleDeleteNote = async () => {
        if (!selectedNote) return;
        if (window.confirm(`Are you sure you want to delete "${selectedNote.name}" from your Google Drive?`)) {
            await database.deleteDriveFile(selectedNote.id);
            setSelectedNote(null);
            fetchNotes();
        }
    };
    
    const handleSaveNote = async () => {
        if (!selectedNote || !user) return;
        setSaveStatus('Saving...');
        const updates: { name?: string; content?: string } = { content: currentContent };
        if (selectedNote.name !== currentTitle) {
            updates.name = currentTitle;
        }
        
        const { success, error } = await database.updateDriveFile(selectedNote.id, updates);
        if (success) {
            setSaveStatus('Note saved!');
            await fetchNotes();
        } else {
            setSaveStatus(`Error saving: ${error}`);
        }
        setTimeout(() => setSaveStatus(''), 2000);
    };

    return (
        <div className="w-full h-full text-light-text dark:text-white flex bg-dark-card">
            {/* Notes List Sidebar */}
            <div className="w-1/3 border-r border-current border-opacity-20 bg-black/10 flex flex-col">
                <div className="p-4 border-b border-current border-opacity-20 flex justify-between items-center">
                    <h2 className="text-xl font-bold">My Notes (Drive)</h2>
                    <button onClick={handleNewNote} className="px-3 py-1 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
                        <PlusIcon />
                        <span>New</span>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {isLoading ? <p className="p-4">Loading notes from Drive...</p> : notes.map(note => (
                        <button key={note.id} onClick={() => handleSelectNote(note)} className={`w-full text-left p-3 border-b border-current border-opacity-10 ${selectedNote?.id === note.id ? 'bg-black/20' : 'hover:bg-black/10'}`}>
                            <h3 className="font-semibold truncate">{note.name}</h3>
                            <p className="text-xs opacity-70">{new Date(note.modifiedTime).toLocaleDateString()}</p>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Editor View */}
            <div className="w-2/3 flex flex-col">
                {selectedNote ? (
                    <>
                        <div className="p-3 border-b border-current border-opacity-20 flex justify-end items-center space-x-2 bg-black/10">
                            {saveStatus && <span className="text-sm text-green-600 dark:text-green-400">{saveStatus}</span>}
                            <button onClick={handleSaveNote} className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center space-x-2">
                                <SaveIcon />
                                <span>Save</span>
                            </button>
                            <button onClick={handleDeleteNote} className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm flex items-center space-x-2">
                                <TrashIcon />
                                <span>Delete</span>
                            </button>
                        </div>
                        <div className="flex-grow flex flex-col p-4">
                            <input
                                type="text"
                                value={currentTitle}
                                onChange={(e) => setCurrentTitle(e.target.value)}
                                placeholder="Note Title"
                                className="text-2xl font-bold bg-transparent focus:outline-none mb-4 pb-2 border-b-2 border-current border-opacity-20"
                            />
                            <textarea
                                value={currentContent}
                                onChange={(e) => setCurrentContent(e.target.value)}
                                placeholder="Start writing..."
                                className="flex-grow bg-transparent focus:outline-none resize-none text-lg leading-relaxed"
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-center opacity-70">
                        <div>
                            <h2 className="text-2xl font-semibold">Select a note or create a new one</h2>
                            <p>Your notes saved in Google Drive will appear here.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotepadApp;