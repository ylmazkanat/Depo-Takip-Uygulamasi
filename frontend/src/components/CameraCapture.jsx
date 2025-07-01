import React from 'react';
import { X } from 'lucide-react';

const CameraCapture = ({ onClose }) => {
    return (
        <div className="camera-capture-overlay">
            <div className="camera-capture-container">
                <div className="camera-header">
                    <h3>Kamera ile Fotoğraf Çekme</h3>
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                </div>

                <div className="camera-content">
                    <p className="camera-message">
                        Kamera ile fotoğraf çekme özelliği yakında eklenecektir. 
                        Şu anda geliştirme aşamasındadır.
                    </p>
                </div>

                <div className="camera-footer">
                    <button onClick={onClose} className="cancel-btn">
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CameraCapture; 