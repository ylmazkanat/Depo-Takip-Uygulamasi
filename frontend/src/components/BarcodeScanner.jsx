import React from 'react';
import { X } from 'lucide-react';

const BarcodeScanner = ({ onClose }) => {
    return (
        <div className="barcode-scanner-overlay">
            <div className="barcode-scanner-container">
                <div className="scanner-header">
                    <h3>Barkod/QR Tarayıcı</h3>
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                </div>

                <div className="scanner-content">
                    <p className="scanner-message">
                        Barkod tarama özelliği yakında eklenecektir. 
                        Şu anda geliştirme aşamasındadır.
                    </p>
                </div>

                <div className="scanner-footer">
                    <button onClick={onClose} className="cancel-btn">
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BarcodeScanner; 