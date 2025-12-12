
import React, { useState, useEffect } from 'react';
import { Contact } from '../types';

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>;


interface AddContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (contact: Omit<Contact, 'id' | 'owner'> & { id?: number }) => void;
    contactToEdit?: Contact | null;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ isOpen, onClose, onSave, contactToEdit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (contactToEdit) {
            setName(contactToEdit.name);
            setEmail(contactToEdit.email || '');
            setPhone(contactToEdit.phone || '');
        } else {
            setName('');
            setEmail('');
            setPhone('');
        }
    }, [contactToEdit, isOpen]);

    const handleSave = () => {
        if (!name) return; // Name is required
        const contactData: Omit<Contact, 'id' | 'owner'> & { id?: number } = {
            name,
            email,
            phone,
        };
        if (contactToEdit) {
            contactData.id = contactToEdit.id;
        }
        onSave(contactData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-light-card dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md text-light-text dark:text-white">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold">{contactToEdit ? 'Edit Contact' : 'Add Contact'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                         <CloseIcon />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <input type="text" placeholder="Name (required)" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="text" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex justify-end p-4 bg-gray-50 dark:bg-slate-900/50 rounded-b-lg space-x-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 text-white transition-colors flex items-center space-x-2">
                        <CloseIcon />
                        <span>Cancel</span>
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center space-x-2">
                        <SaveIcon />
                        <span>Save</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddContactModal;