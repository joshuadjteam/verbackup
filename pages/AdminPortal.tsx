
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, WeblyApp } from '../types';
import { database } from '../services/database';
import AddUserModal from '../components/AddUserModal';
import AppContainer from '../components/AppContainer';

// Icons
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>;
const RolesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4z" /></svg>;
const ResetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.49 15M20 20l-1.5-1.5A9 9 0 003.51 9" /></svg>;
const WeblyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;


type AdminView = 'users' | 'roles' | 'reset' | 'webly';

// Modal for adding/editing Webly apps, kept in the same file for simplicity
const WeblyAppModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (data: any) => void, appToEdit: WeblyApp | null }> = ({ isOpen, onClose, onSave, appToEdit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [icon_svg, setIconSvg] = useState('<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3" /></svg>');
    
    useEffect(() => {
        if (appToEdit) {
            setName(appToEdit.name); setDescription(appToEdit.description); setUrl(appToEdit.url); setIconSvg(appToEdit.icon_svg);
        } else {
            setName(''); setDescription(''); setUrl('');
        }
    }, [appToEdit, isOpen]);

    const handleSave = () => {
        // FORCE load_in_console to true for all manual entries to ensure they open in the viewer and not a new tab
        onSave({ id: appToEdit?.id, name, description, url, icon_svg, load_in_console: true });
    };

    if (!isOpen) return null;
    return <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-light-card dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg text-light-text dark:text-white">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-xl font-bold">{appToEdit ? 'Edit App' : 'Add App'}</h2>
                <button onClick={onClose}><CloseIcon/></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <input type="text" placeholder="App Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-100 dark:bg-slate-700 rounded-md p-2"/>
                <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-100 dark:bg-slate-700 rounded-md p-2"/>
                <input type="text" placeholder="URL (https://...)" value={url} onChange={e => setUrl(e.target.value)} className="w-full bg-gray-100 dark:bg-slate-700 rounded-md p-2"/>
                <textarea placeholder="Icon SVG" value={icon_svg} onChange={e => setIconSvg(e.target.value)} className="w-full h-32 bg-gray-100 dark:bg-slate-700 rounded-md p-2 font-mono text-xs"/>
            </div>
            <div className="flex justify-end p-4 bg-gray-50 dark:bg-slate-900/50">
                <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white mr-2">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 rounded-md bg-blue-600 text-white">Save</button>
            </div>
        </div>
    </div>
};

// --- View Components ---

const UserManagementView: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [stats, setStats] = useState({ messages: 0, mails: 0, contacts: 0 });

    const fetchUsers = useCallback(async () => {
        const userList = await database.getUsers();
        setUsers(userList);
    }, []);

    const fetchStats = useCallback(async () => {
        const adminStats = await database.getAdminStats();
        setStats(adminStats);
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, [fetchUsers, fetchStats]);

    const handleAddUser = () => { setUserToEdit(null); setIsUserModalOpen(true); };
    const handleEditUser = (user: User) => { setUserToEdit(user); setIsUserModalOpen(true); };
    const handleDeleteUser = async (user: User) => {
        if(window.confirm(`Are you sure you want to delete this user: ${user.username}? This action is irreversible.`)) {
            const { error } = await database.deleteUser(user);
            if (error) alert(`Failed to delete user: ${error}`);
            else fetchUsers();
        }
    };

    const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
        <div className="bg-gray-100 dark:bg-teal-700/50 p-4 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300 text-sm">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    );
    
    const FeatureIndicator: React.FC<{ enabled: boolean }> = ({ enabled }) => (
       <span className={`px-2 py-1 text-xs font-semibold rounded-full ${enabled ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'}`}>
           {enabled ? 'On' : 'Off'}
       </span>
   );

    return <div className="flex flex-col h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Users" value={users.length} />
            <StatCard title="Chat Messages" value={stats.messages} />
            <StatCard title="Local Mails" value={stats.mails} />
            <StatCard title="Saved Contacts" value={stats.contacts} />
        </div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">User Accounts</h2>
            <button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                <UserPlusIcon />
                <span>Add User</span>
            </button>
        </div>
        <div className="overflow-y-auto flex-grow">
            <table className="w-full text-left">
                <thead className="border-b border-gray-300 dark:border-slate-600">
                    <tr>
                        <th className="p-2">Username</th><th className="p-2">Email</th><th className="p-2">Role</th>
                        <th className="p-2 text-center">Chat</th><th className="p-2 text-center">Mail</th><th className="p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-100/50 dark:hover:bg-slate-800/50">
                            <td className="p-2 font-medium">{user.username}</td>
                            <td className="p-2">{user.email}</td><td className="p-2">{user.role}</td>
                            <td className="p-2 text-center"><FeatureIndicator enabled={user.features.chat} /></td>
                            <td className="p-2 text-center"><FeatureIndicator enabled={user.features.mail} /></td>
                            <td className="p-2"><div className="flex space-x-2">
                                <button onClick={() => handleEditUser(user)} className="p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white" title="Edit User"><PencilIcon /></button>
                                <button onClick={() => handleDeleteUser(user)} className="p-2 rounded-md bg-red-600 hover:bg-red-700 text-white" title="Delete User"><TrashIcon /></button>
                            </div></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {isUserModalOpen && <AddUserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSaveSuccess={() => { setIsUserModalOpen(false); fetchUsers(); }} userToEdit={userToEdit} />}
    </div>;
};

const RolesManagementView: React.FC = () => (
    <div className="h-full overflow-y-auto p-4">
        <h2 className="text-2xl font-semibold mb-4">Role Definitions</h2>
        <div className="space-y-4">
            <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-lg">
                <h3 className="font-bold text-lg">Admin</h3>
                <p className="text-gray-600 dark:text-gray-400">Default admin account with full access to everything, including this portal.</p>
            </div>
            <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-lg">
                <h3 className="font-bold text-lg">Standard</h3>
                <p className="text-gray-600 dark:text-gray-400">Default user account with standard access to apps.</p>
            </div>
            <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-lg">
                <h3 className="font-bold text-lg">no-chat</h3>
                <p className="text-gray-600 dark:text-gray-400">User cannot access the Chat application.</p>
            </div>
            <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-lg">
                <h3 className="font-bold text-lg">no-store</h3>
                <p className="text-gray-600 dark:text-gray-400">User has preinstalled internal apps but no access to the Webly Store.</p>
            </div>
            <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-lg">
                <h3 className="font-bold text-lg">no-mail</h3>
                <p className="text-gray-600 dark:text-gray-400">User cannot access the LocalMail application.</p>
            </div>
            <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-lg">
                <h3 className="font-bold text-lg">no-telephony</h3>
                <p className="text-gray-600 dark:text-gray-400">User cannot access the Phone application.</p>
            </div>
            <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-lg">
                <h3 className="font-bold text-lg">no-ai</h3>
                <p className="text-gray-600 dark:text-gray-400">User has no access to AI features.</p>
            </div>
            <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-lg">
                <h3 className="font-bold text-lg text-red-400">overdue</h3>
                <p className="text-gray-600 dark:text-gray-400">Restricted account for users who haven't paid. Access limited to Profile.</p>
            </div>
             <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-lg">
                <h3 className="font-bold text-lg">trial</h3>
                <p className="text-gray-600 dark:text-gray-400">An account that expires (deletes) in a month.</p>
            </div>
             <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-lg">
                <h3 className="font-bold text-lg">Guest</h3>
                <p className="text-gray-600 dark:text-gray-400">A sandbox account that resets every time it loads.</p>
            </div>
        </div>
    </div>
);

const DatabaseResetView: React.FC = () => {
    const [status, setStatus] = useState('');
    const handleReset = async (target: 'chat' | 'mail' | 'contacts') => {
        if (window.confirm(`ARE YOU SURE you want to delete all ${target} data? This is irreversible.`)) {
            setStatus(`Resetting ${target}...`);
            const { success, message } = await database.resetDatabaseTable(target);
            setStatus(message);
        }
    }
    return <div className="p-6">
        <h2 className="text-2xl font-semibold">Database Reset</h2>
        <p className="text-gray-400 mt-2 mb-6">Permanently delete all data from specific tables. This action cannot be undone.</p>
        <div className="space-y-4">
            <div className="bg-red-900/50 border border-red-700 p-4 rounded-lg flex justify-between items-center">
                <div>
                    <h3 className="font-bold">Reset All Chat Messages</h3>
                    <p className="text-sm text-red-200">Deletes all messages from the `chat_messages` table.</p>
                </div>
                <button onClick={() => handleReset('chat')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">Reset Chat</button>
            </div>
             <div className="bg-red-900/50 border border-red-700 p-4 rounded-lg flex justify-between items-center">
                <div>
                    <h3 className="font-bold">Reset All LocalMail</h3>
                    <p className="text-sm text-red-200">Deletes all messages from the `mails` table.</p>
                </div>
                <button onClick={() => handleReset('mail')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">Reset Mail</button>
            </div>
             <div className="bg-red-900/50 border border-red-700 p-4 rounded-lg flex justify-between items-center">
                <div>
                    <h3 className="font-bold">Reset All Contacts</h3>
                    <p className="text-sm text-red-200">Deletes all contacts from the `contacts` table.</p>
                </div>
                <button onClick={() => handleReset('contacts')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">Reset Contacts</button>
            </div>
        </div>
        {status && <p className="mt-4 text-center text-yellow-300">{status}</p>}
    </div>;
};

const WeblyManagementView: React.FC = () => {
    const [apps, setApps] = useState<WeblyApp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [appToEdit, setAppToEdit] = useState<WeblyApp | null>(null);

    const fetchApps = useCallback(async () => { setIsLoading(true); const data = await database.getWeblyApps(); setApps(data); setIsLoading(false); }, []);
    useEffect(() => { fetchApps() }, [fetchApps]);

    const handleSave = async (appData: Omit<WeblyApp, 'id' | 'created_at'> & { id?: string }) => {
        if (appData.id) {
            await database.updateWeblyApp(appData as WeblyApp);
        } else {
            await database.addWeblyApp(appData as any);
        }
        fetchApps(); setIsModalOpen(false);
    };
    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this app from the store?')) {
            await database.deleteWeblyApp(id);
            fetchApps();
        }
    };

    return <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Webly Store Management</h2>
            <button onClick={() => { setAppToEdit(null); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Add App</button>
        </div>
        <div className="overflow-y-auto flex-grow">
            {isLoading ? <p>Loading apps...</p> : (
                <table className="w-full text-left">
                     <thead className="border-b border-gray-300 dark:border-slate-600">
                         <tr><th className="p-2">Icon</th><th className="p-2">Name</th><th className="p-2">URL</th><th className="p-2">Actions</th></tr>
                     </thead>
                     <tbody>
                        {apps.map(app => (
                            <tr key={app.id} className="border-b border-gray-200 dark:border-slate-700">
                                <td className="p-2"><div className="w-8 h-8" dangerouslySetInnerHTML={{ __html: app.icon_svg }} /></td>
                                <td className="p-2">{app.name}</td>
                                <td className="p-2 text-sm text-gray-400 truncate max-w-xs">{app.url}</td>
                                <td className="p-2"><div className="flex space-x-2">
                                    <button onClick={() => { setAppToEdit(app); setIsModalOpen(true); }} className="p-2 rounded-md bg-blue-600 text-white"><PencilIcon/></button>
                                    <button onClick={() => handleDelete(app.id)} className="p-2 rounded-md bg-red-600 text-white"><TrashIcon/></button>
                                </div></td>
                            </tr>
                        ))}
                     </tbody>
                </table>
            )}
        </div>
        {isModalOpen && <WeblyAppModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} appToEdit={appToEdit} />}
    </div>;
};

const AdminPortal: React.FC = () => {
    const [activeView, setActiveView] = useState<AdminView>('users');

    const NavItem: React.FC<{ viewId: AdminView; label: string; icon: React.ReactNode; }> = ({ viewId, label, icon }) => (
        <button
            onClick={() => setActiveView(viewId)}
            className={`w-full flex items-center px-3 py-2 rounded-md text-left font-semibold transition-colors ${
                activeView === viewId ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <AppContainer className="w-full max-w-7xl h-[85vh] p-0 text-light-text dark:text-white flex flex-col overflow-hidden">
            <div className="flex h-full">
                <nav className="w-1/4 lg:w-1/5 p-4 border-r border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex flex-col">
                    <h1 className="text-2xl font-bold mb-6">Admin Portal</h1>
                    <div className="space-y-2">
                        <NavItem viewId="users" label="User Accounts" icon={<UsersIcon />} />
                        <NavItem viewId="roles" label="Roles" icon={<RolesIcon />} />
                        <NavItem viewId="reset" label="Database Reset" icon={<ResetIcon />} />
                        <NavItem viewId="webly" label="Webly" icon={<WeblyIcon />} />
                    </div>
                </nav>
                <main className="w-3/4 lg:w-4/5 p-6 flex flex-col overflow-hidden">
                    <div className={activeView === 'users' ? 'h-full' : 'hidden'}><UserManagementView /></div>
                    <div className={activeView === 'roles' ? 'h-full' : 'hidden'}><RolesManagementView /></div>
                    <div className={activeView === 'reset' ? 'h-full' : 'hidden'}><DatabaseResetView /></div>
                    <div className={activeView === 'webly' ? 'h-full' : 'hidden'}><WeblyManagementView /></div>
                </main>
            </div>
        </AppContainer>
    );
};

export default AdminPortal;
