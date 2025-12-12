
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { database } from '../../services/database';
import { Contact } from '../../types';
import AddContactModal from '../../components/AddContactModal';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

const MobiContactsApp: React.FC = () => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);

    const fetchContacts = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        const userContacts = await database.getContactsForUser(user.username);
        setContacts(userContacts);
        setIsLoading(false);
    }, [user]);

    useEffect(() => { fetchContacts(); }, [fetchContacts]);
    
    const handleAddClick = () => { setContactToEdit(null); setIsModalOpen(true); };
    const handleEditClick = (contact: Contact) => { setContactToEdit(contact); setIsModalOpen(true); };
    const handleSave = async (contactData: Omit<Contact, 'id' | 'owner'> & { id?: number }) => {
        if (contactData.id) { await database.updateContact({ ...contactData, owner: user!.username } as Contact); } 
        else { await database.addContact(contactData); }
        fetchContacts();
    };

    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-[#121212] text-black dark:text-white font-sans relative">
            <div className="p-4 pb-2">
                <div className="bg-[#f3f6fc] dark:bg-[#1e1e1e] rounded-full px-4 py-3 flex items-center shadow-sm space-x-3">
                    <SearchIcon />
                    <input 
                        type="text" 
                        placeholder="Search contacts" 
                        className="bg-transparent flex-grow focus:outline-none text-base" 
                    />
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{user?.username.charAt(0).toUpperCase()}</div>
                </div>
            </div>

            <main className="flex-grow overflow-y-auto pb-20">
                {isLoading ? <div className="p-8 text-center text-gray-500">Loading...</div> : contacts.length > 0 ? (
                    <div className="pt-2">
                        {contacts.map(contact => (
                            <button key={contact.id} onClick={() => handleEditClick(contact)} className="w-full flex items-center space-x-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5">
                                 <div className="w-10 h-10 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-lg font-medium">
                                    {contact.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <h3 className="text-base font-medium">{contact.name}</h3>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <p>No contacts yet</p>
                    </div>
                )}
            </main>
            
            <button 
                onClick={handleAddClick} 
                className="absolute bottom-6 right-6 w-14 h-14 bg-[#c2e7ff] dark:bg-[#004a77] text-[#001d35] dark:text-[#c2e7ff] rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
            >
                <PlusIcon />
            </button>

             <AddContactModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                contactToEdit={contactToEdit}
            />
        </div>
    );
};

export default MobiContactsApp;
