import React, { useState } from 'react';
import '../styles/privacyPolicy/index.css';

const PrivacyPolicy: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const openPopup = () => setIsOpen(true);
    const closePopup = () => setIsOpen(false);

    return (
        <>
            <a id="privacy-policy-link" onClick={openPopup}>Privacy Policy</a>
            {isOpen && (
                <>
                    <div id="privacy-policy-overlay" onClick={closePopup}></div>
                    <div id="privacy-policy-popup">
                        <button className="close-button" onClick={closePopup}><strong>x</strong></button>
                        <div id="privacy-policy-popup-content">
                            <h2>Privacy Policy</h2>
                            <p><strong>Effective Date: 15.01.2025</strong></p>
                            <p>Thank you for using our poker planning application (the "Service"). Your privacy is important to us, and this Privacy Policy explains how we collect, use, and protect your personal information.</p>
                            <h3>1. Information We Collect</h3>
                            <h4>1.1 Local Storage</h4>
                            <p>We store certain information locally in your browser using localStorage. This includes:</p>
                            <ul>
                                <li><strong>Your username:</strong> Stored to identify you when using the Service.</li>
                                <li><strong>Room and application settings:</strong> For example, dark mode preferences, and whether guests can manage points. These settings are saved locally for your convenience and are not transmitted to our servers.</li>
                            </ul>
                            <h4>1.2 Optional Donations</h4>
                            <p>If you choose to make a donation via Stripe, we do not collect or store any payment details. Stripe, as a third-party payment processor, handles all payment-related information in accordance with their Privacy Policy.</p>
                            <h4>1.3 Room Information</h4>
                            <p>When you create or join a room, the data related to the room (e.g., room name, voting results) is handled temporarily to facilitate the Service. This information is not permanently stored or linked to individual users.</p>
                            <h3>2. How We Use Your Information</h3>
                            <p>To provide and maintain the Service.</p>
                            <p>To allow you to participate in poker planning sessions.</p>
                            <p>To process optional donations securely through Stripe.</p>
                            <p>To remember your preferences and settings for a more personalized experience.</p>
                            <h3>3. Sharing of Information</h3>
                            <p>We do not share your personal information with third parties, except as required to process donations through Stripe or when required by law.</p>
                            <h3>4. Data Security</h3>
                            <p>We prioritize the security of your information. However, since we do not store personal data on our servers, risks are minimized. We recommend safeguarding your device to prevent unauthorized access to your local storage.</p>
                            <h3>5. Third-Party Services</h3>
                            <p>Our Service uses the Stripe payment platform for donations. By using this feature, you agree to Stripe's Terms of Service and Privacy Policy.</p>
                            <h3>6. Children's Privacy</h3>
                            <p>Our Service is not directed at individuals under the age of 13. We do not knowingly collect personal information from children. If we become aware that we have inadvertently collected such information, we will take steps to delete it promptly.</p>
                            <h3>7. Your Rights</h3>
                            <p>Since we do not store personal data on our servers, there is no stored information to modify, delete, or access. Any information stored in your local storage can be managed directly through your browser settings.</p>
                            <h3>8. Changes to This Privacy Policy</h3>
                            <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. Your continued use of the Service after changes are made constitutes acceptance of the updated Privacy Policy.</p>
                            <h3>9. Contact Us</h3>
                            <p>If you have any questions or concerns about this Privacy Policy or the Service, please contact us at:</p>
                            <p>pokerplancontact@gmail.com</p>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default PrivacyPolicy;
