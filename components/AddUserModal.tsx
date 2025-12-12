
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { database } from '../services/database';

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>;

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    userToEdit?: User | null;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSaveSuccess, userToEdit }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.Standard);
    const [features, setFeatures] = useState({ chat: true, ai: true, mail: false });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setError('');
        if (userToEdit) {
            setUsername(userToEdit.username);
            setEmail(userToEdit.email);
            setRole(userToEdit.role);
            setFeatures({ ...userToEdit.features, ai: true });
            setPassword(''); 
        } else {
            setUsername('');
            setPassword('');
            setEmail('');
            setRole(UserRole.Standard);
            setFeatures({ chat: true, ai: true, mail: false });
        }
    }, [userToEdit, isOpen]);

    const handleSave = async () => {
        setError('');
        if (!userToEdit && !password) {
            setError('Password is required for new users.');
            return;
        }
        setIsLoading(true);

        try {
            const userData: Partial<User> & { password?: string } = {
                username,
                email,
                role,
                features,
            };
            
            if (userToEdit) {
                userData.id = userToEdit.id;
                userData.auth_id = userToEdit.auth_id;
                if (password) userData.password = password;
                const updatedUser = await database.updateUser(userData);
                if (updatedUser) {
                    onSaveSuccess();
                } else {
                    setError('Failed to update user.');
                }
            } else {
                userData.password = password;
                const { error: addUserError } = await database.addUser(userData);
                if (addUserError) {
                    setError(addUserError);
                } else {
                    onSaveSuccess();
                }
            }
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const Toggle: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void }> = ({ label, enabled, onChange }) => (
        <div className="flex flex-col items-center">
             <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{label}</label>
            <button
                type="button"
                onClick={() => onChange(!enabled)}
                className={`${enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800`}
            >
                <span className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}/>
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-light-card dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg text-light-text dark:text-white">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold">{userToEdit ? 'Edit User' : 'Add User'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                     <input type="email" placeholder="Email (used for login)" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="password" placeholder={`Password ${userToEdit ? '(leave blank to keep unchanged)' : '(required)'}`} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    
                    <div className='flex flex-col'>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Role (Permissions)</label>
                        <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value={UserRole.Standard}>Standard</option>
                            <option value={UserRole.Admin}>Admin</option>
                            <option value={UserRole.NoChat}>No Chat</option>
                            <option value={UserRole.NoStore}>No Store</option>
                            <option value={UserRole.NoMail}>No Mail</option>
                            <option value={UserRole.NoTelephony}>No Telephony</option>
                            <option value={UserRole.NoAI}>No AI</option>
                            <option value={UserRole.Overdue}>Overdue</option>
                            <option value={UserRole.Trial}>Trial</option>
                            <option value={UserRole.Guest}>Guest</option>
                        </select>
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-slate-700 my-4 pt-4">
                        <h3 className="text-lg font-semibold mb-3 text-center">Features</h3>
                        <div className="flex justify-around items-center">
                            <Toggle label="Chat" enabled={features.chat} onChange={(val) => setFeatures(f => ({...f, chat: val}))} />
                            <Toggle label="Mail" enabled={features.mail} onChange={(val) => setFeatures(f => ({...f, mail: val}))} />
                        </div>
                    </div>
                </div>
                 {error && <p className="text-red-400 text-sm text-center px-6 pb-4">{error}</p>}
                <div className="flex justify-end p-4 bg-gray-50 dark:bg-slate-900/50 rounded-b-lg space-x-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 text-white transition-colors flex items-center space-x-2">
                        <CloseIcon />
                        <span>Cancel</span>
                    </button>
                    <button onClick={handleSave} disabled={isLoading} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:bg-blue-800 flex items-center space-x-2">
                        <SaveIcon />
                        <span>{isLoading ? 'Saving...' : 'Save'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddUserModal;
