import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { getImageUrl } from '../config/api';

const ImageDisplay = ({ 
    src, 
    alt = 'Ürün Resmi', 
    style = {}, 
    fallbackText = 'Görsel Yok',
    className = '' 
}) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Base64 formatını kontrol et
    const isValidImageSrc = (source) => {
        if (!source) return false;
        
        // Base64 image data kontrolü
        if (source.startsWith('data:image/')) {
            return source.includes('base64,') && source.split('base64,')[1];
        }
        
        // Normal URL kontrolü (http/https)
        if (source.startsWith('http://') || source.startsWith('https://')) {
            return true;
        }
        
        // Relative path kontrolü (/uploads/ ile başlayan)
        if (source.startsWith('/uploads/')) {
            return true;
        }
        
        // Diğer relative path'ler
        if (source.startsWith('/') || source.startsWith('./') || source.startsWith('../')) {
            return true;
        }
        
        return false;
    };

    const handleImageError = () => {
        setHasError(true);
        setIsLoading(false);
    };

    const handleImageLoad = () => {
        setIsLoading(false);
        setHasError(false);
    };

    // Geçersiz veya yoksa fallback göster
    if (!isValidImageSrc(src) || hasError) {
        return (
            <div 
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8f9fa',
                    border: '2px dashed #dee2e6',
                    borderRadius: '8px',
                    padding: '20px',
                    minHeight: '120px',
                    color: '#6c757d',
                    ...style
                }}
                className={className}
            >
                <Package size={32} color="#adb5bd" />
                <span style={{ marginTop: '8px', fontSize: '14px', textAlign: 'center' }}>
                    {fallbackText}
                </span>
            </div>
        );
    }

    // api.js'deki getImageUrl fonksiyonunu kullanarak URL'i al
    const imageUrl = getImageUrl(src);

    return (
        <div style={{ position: 'relative', ...style }} className={className}>
            {isLoading && (
                <div 
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        zIndex: 1
                    }}
                >
                    <div className="spinner" style={{ width: '24px', height: '24px' }}></div>
                </div>
            )}
            <img
                src={imageUrl}
                alt={alt}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    display: hasError ? 'none' : 'block'
                }}
                onError={handleImageError}
                onLoad={handleImageLoad}
            />
        </div>
    );
};

export default ImageDisplay; 