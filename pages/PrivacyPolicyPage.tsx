
import React from 'react';
import AppContainer from '../components/AppContainer';
import { Page } from '../types';

interface PrivacyPolicyPageProps {
    navigate: (page: Page) => void;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ navigate }) => {
    return (
        <AppContainer className="w-full max-w-4xl p-8 text-light-text dark:text-white my-8 overflow-y-auto max-h-[80vh]">
            <h1 className="text-4xl font-bold mb-6 border-b pb-4 border-gray-300 dark:border-gray-700">Privacy Policy</h1>
            <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                <p className="font-semibold">Last Updated: {new Date().toLocaleDateString()}</p>

                <section>
                    <h2 className="text-2xl font-bold mb-3 text-black dark:text-white">1. Introduction</h2>
                    <p>
                        DJTeam ("us", "we", or "our") operates the Lynix web portal (the "Service"). This page informs you of our policies regarding the collection, 
                        use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-3 text-black dark:text-white">2. Information Collection</h2>
                    <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Personal Data:</strong> Email address, First name and Last name, Phone number, Cookies and Usage Data.</li>
                        <li><strong>Usage Data:</strong> IP address, browser type, browser version, pages of our Service that you visit, time and date of your visit.</li>
                        <li><strong>Third-Party Data:</strong> When linking Google Drive, we access files specifically created or opened by this app.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-3 text-black dark:text-white">3. Use of Data</h2>
                    <p>DJTeam uses the collected data for various purposes:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>To provide and maintain the Service</li>
                        <li>To notify you about changes to our Service</li>
                        <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                        <li>To provide customer care and support</li>
                        <li>To monitor the usage of the Service</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-3 text-black dark:text-white">4. Data Security</h2>
                    <p>
                        The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. 
                        While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-3 text-black dark:text-white">5. Google User Data</h2>
                    <p>
                        Our Service's use and transfer to any other app of information received from Google APIs will adhere to the 
                        <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mx-1">Google API Services User Data Policy</a>, 
                        including the Limited Use requirements. We do not sell your Google user data.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-3 text-black dark:text-white">6. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us by email: <a href="mailto:admin@lynixity.x10.bz" className="text-blue-500 hover:underline">admin@lynixity.x10.bz</a>
                    </p>
                </section>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700">
                <button 
                    onClick={() => navigate('home')} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors"
                >
                    Back to Home
                </button>
            </div>
        </AppContainer>
    );
};

export default PrivacyPolicyPage;
