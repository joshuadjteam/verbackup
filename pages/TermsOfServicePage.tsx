
import React from 'react';
import AppContainer from '../components/AppContainer';
import { Page } from '../types';

interface TermsOfServicePageProps {
    navigate: (page: Page) => void;
}

const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ navigate }) => {
    return (
        <AppContainer className="w-full max-w-4xl p-8 text-light-text dark:text-white my-8 overflow-y-auto max-h-[80vh]">
            <h1 className="text-4xl font-bold mb-6 border-b pb-4 border-gray-300 dark:border-gray-700">Terms of Service</h1>
            <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                <p className="font-semibold">Last Updated: {new Date().toLocaleDateString()}</p>

                <section>
                    <h2 className="text-2xl font-bold mb-3 text-black dark:text-white">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using Lynix (the "Service"), provided by DJTeam, you accept and agree to be bound by the terms and provision of this agreement. 
                        In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-3 text-black dark:text-white">2. User Conduct</h2>
                    <p>
                        Users are strictly prohibited from sharing their identity credentials. You agree that you will not use the Service to:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Violate any local, state, national, or international law.</li>
                        <li>Upload or transmit any material that infringes any patent, trademark, trade secret, copyright, or other proprietary rights of any party.</li>
                        <li>Engage in disruptive activities or attacks against the platform infrastructure.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-3 text-black dark:text-white">3. Account Termination</h2>
                    <p>
                        We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, 
                        including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease. 
                        Users found sharing their identity credentials will be subject to immediate suspension.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-3 text-black dark:text-white">4. Google Integration</h2>
                    <p>
                        Lynix uses Google APIs to provide features such as Google Drive integration. By using these features, you agree to be bound by Google's Terms of Service.
                        Data accessed via Google APIs is stored locally within your session and transmitted securely to our servers solely for the purpose of providing the requested functionality.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-3 text-black dark:text-white">5. Disclaimer</h2>
                    <p>
                        The Service is provided on an "AS IS" and "AS AVAILABLE" basis. DJTeam makes no representations or warranties of any kind, whether express or implied, 
                        regarding the operation of the Service or the information, content, materials, or products included on the Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-3 text-black dark:text-white">6. Changes to Terms</h2>
                    <p>
                        DJTeam reserves the right, at its sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-3 text-black dark:text-white">7. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at <a href="mailto:admin@lynixity.x10.bz" className="text-blue-500 hover:underline">admin@lynixity.x10.bz</a>.
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

export default TermsOfServicePage;
