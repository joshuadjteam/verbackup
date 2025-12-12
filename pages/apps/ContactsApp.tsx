import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { database } from '../../services/database';
import { Contact } from '../../types';
import AddContactModal from '../../components/AddContactModal';

// Icons
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;

const ContactsApp: React.FC = () => {
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

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const handleAddClick = () => {
        setContactToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (contact: Contact) => {
        setContactToEdit(contact);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (contactId: number) => {
        if (window.confirm("Are you sure you want to delete this contact?")) {
            await database.deleteContact(contactId);
            fetchContacts();
        }
    };

    const handleSave = async (contactData: Omit<Contact, 'id' | 'owner'> & { id?: number }) => {
        if (contactData.id) {
            await database.updateContact({ ...contactData, owner: user!.username } as Contact);
        } else {
            await database.addContact(contactData);
        }
        fetchContacts();
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="h-full flex items-center justify-center"><p>Loading contacts...</p></div>;
        }
        return contacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contacts.map(contact => (
                    <div key={contact.id} className="group bg-black/5 dark:bg-black/20 p-4 rounded-lg flex flex-col justify-between">
                        <div>
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-white text-xl font-bold">{contact.name.charAt(0).toUpperCase()}</div>
                                <div>
                                    <h3 className="text-xl font-semibold truncate">{contact.name}</h3>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2 text-sm">
                                {contact.email && <a href={`mailto:${contact.email}`} className="text-blue-400 hover:underline flex items-center space-x-1.5 truncate"><MailIcon /> <span>{contact.email}</span></a>}
                                {contact.phone && <a href={`tel:${contact.phone}`} className="text-blue-400 hover:underline flex items-center space-x-1.5"><PhoneIcon /> <span>{contact.phone}</span></a>}
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditClick(contact)} className="p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"><PencilIcon /></button>
                            <button onClick={() => handleDeleteClick(contact.id)} className="p-2 rounded-md bg-red-600 hover:bg-red-700 text-white"><TrashIcon /></button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
             <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                <p className="text-lg">No contacts yet.</p>
                <p>Click "Add Contact" to get started.</p>
            </div>
        );
    };

    return (
        <div className="w-full h-full p-8 bg-dark-bg text-light-text dark:text-white flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <h1 className="text-4xl font-bold">My Contacts</h1>
                <button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2">
                    <PlusIcon />
                    <span>Add Contact</span>
                </button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
                {renderContent()}
            </div>
            <AddContactModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                contactToEdit={contactToEdit}
            />
        </div>
    );
};

export default ContactsApp;