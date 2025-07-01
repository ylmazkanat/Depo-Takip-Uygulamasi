import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, 
    Edit3, 
    Trash2, 
    Package, 
    MapPin, 
    Users, 
    Calendar, 
    Info,
    Camera,
    FileImage,
    UserPlus,
    RotateCcw,
    AlertTriangle,
    QrCode
} from 'lucide-react';
import { productsAPI, authAPI, uploadAPI, locationsAPI } from '../config/api';
import ImageDisplay from '../components/ImageDisplay';
import CameraCapture from '../components/CameraCapture';
import BarcodeScanner from '../components/BarcodeScanner';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBorrowModal, setShowBorrowModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    
    const [borrowData, setBorrowData] = useState({
        borrowedBy: '',
        borrowedByUserId: ''
    });
    
    const [returnData, setReturnData] = useState({
        location: '',
        locationDescription: '',
        locationImage: ''
    });

    const [locations, setLocations] = useState([]);
    const [locationSearch, setLocationSearch] = useState('');
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [showCamera, setShowCamera] = useState(false);
    const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

    useEffect(() => {
        fetchProduct();
        fetchUsers();
        fetchLocations();
    }, [id]);

    useEffect(() => {
        if (locationSearch.trim()) {
            const filtered = locations.filter(location =>
                location.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
                location.description?.toLowerCase().includes(locationSearch.toLowerCase())
            );
            setFilteredLocations(filtered);
        } else {
            setFilteredLocations(locations);
        }
    }, [locationSearch, locations]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await productsAPI.getProductById(id);
            if (response.data.success) {
                setProduct(response.data.data);
            }
        } catch (error) {
            // Ürün getirilemedi
            setError('Ürün bilgileri yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await authAPI.getAllUsers();
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            // Kullanıcılar getirilemedi
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await locationsAPI.getAllLocations({ activeOnly: 'true' });
            if (response.data.success) {
                setLocations(response.data.data);
                setFilteredLocations(response.data.data);
            }
        } catch (error) {
            // Lokasyonlar getirilemedi
        }
    };

    const handleLocationSelect = (location) => {
        setReturnData(prev => ({
            ...prev,
            location: location.name
        }));
        setLocationSearch('');
    };

    const handleDelete = async () => {
        if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            await productsAPI.deleteProduct(id);
            alert('Ürün başarıyla silindi');
            navigate('/products');
        } catch (error) {
            // Ürün silinemedi
            alert('Ürün silinirken hata oluştu');
        }
    };

    const handleBorrow = async () => {
        if (!borrowData.borrowedBy.trim()) {
            alert('Ödünç alan kişinin adı girilmelidir');
            return;
        }

        try {
            await productsAPI.borrowProduct(id, borrowData);
            alert('Ürün başarıyla ödünç verildi');
            setShowBorrowModal(false);
            setBorrowData({ borrowedBy: '', borrowedByUserId: '' });
            fetchProduct();
        } catch (error) {
            // Ödünç verme işlemi başarısız
            alert(error.response?.data?.message || 'Ödünç verme işlemi başarısız');
        }
    };

    const handleReturn = async () => {
        try {
            await productsAPI.returnProduct(id, returnData);
            alert('Ürün başarıyla geri alındı');
            setShowReturnModal(false);
            setReturnData({ location: '', locationDescription: '', locationImage: '' });
            setLocationSearch('');
            fetchProduct();
        } catch (error) {
            // Geri alma işlemi başarısız
            alert(error.response?.data?.message || 'Geri alma işlemi başarısız');
        }
    };

    const handleUserSelect = (e) => {
        const userId = e.target.value;
        const selectedUser = users.find(u => u.id == userId);
        
        if (selectedUser) {
            setBorrowData({
                borrowedBy: selectedUser.name,
                borrowedByUserId: userId
            });
        } else {
            setBorrowData({
                borrowedBy: '',
                borrowedByUserId: ''
            });
        }
    };

    const handleImageCapture = async (type) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.multiple = false;
        
        fileInput.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    alert('Dosya boyutu 5MB\'den küçük olmalıdır');
                    return;
                }
                
                if (!file.type.startsWith('image/')) {
                    alert('Lütfen sadece resim dosyası seçin');
                    return;
                }

                try {
                    const response = await uploadAPI.uploadSingleImage(file);
                    if (response.data.success) {
                        setReturnData(prev => ({
                            ...prev,
                            locationImage: response.data.data.url
                        }));
                        alert('Resim başarıyla yüklendi');
                    }
                } catch (error) {
                    // Resim yükleme hatası
                    alert('Resim yüklenemedi. Lütfen tekrar deneyin.');
                }
            }
        };
        
        fileInput.click();
    };

    const handleCameraCapture = (type) => {
        setShowCamera(true);
    };

    const handleCameraPhoto = async (file) => {
        try {
            const response = await uploadAPI.uploadSingleImage(file);
            
            if (response.data.success) {
                setReturnData(prev => ({
                    ...prev,
                    locationImage: response.data.data.url
                }));
                alert('Fotoğraf başarıyla yüklendi ve form güncellendi!');
            }
        } catch (error) {
            alert('Fotoğraf yüklenemedi. Lütfen tekrar deneyin.');
        } finally {
            setShowCamera(false);
        }
    };

    const handleCloseCamera = () => {
        setShowCamera(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Belirtilmemiş';
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'in_stock':
                return 'badge-available';
            case 'borrowed':
                return 'badge-borrowed';
            default:
                return 'badge-maintenance';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'in_stock':
                return 'Depoda';
            case 'borrowed':
                return 'Ödünç Alınmış';
            default:
                return 'Bilinmiyor';
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner mx-auto mb-4"></div>
                        <p className="text-lg">Ürün bilgileri yükleniyor...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container">
                <div className="form-container text-center">
                    <AlertTriangle size={48} className="mx-auto mb-4" style={{ color: '#e53e3e' }} />
                    <h2>Hata Oluştu</h2>
                    <p className="mb-6">{error || 'Ürün bulunamadı'}</p>
                    <Link to="/products" className="button button-primary">
                        <ArrowLeft size={16} />
                        Ürün Listesi
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            {/* Page Header */}
            <div className="page-header">
                <div className="flex items-center justify-between mb-4">
                    <Link to="/products" className="button button-secondary">
                        <ArrowLeft size={16} />
                        Ürün Listesi
                    </Link>
                    <div className="flex gap-3">
                        <Link to={`/products/${product.id}/edit`} className="button button-primary">
                            <Edit3 size={16} />
                            <span className="hide-mobile">Düzenle</span>
                        </Link>
                        <button onClick={handleDelete} className="button button-danger">
                            <Trash2 size={16} />
                            <span className="hide-mobile">Sil</span>
                        </button>
                    </div>
                </div>
                <h1 className="page-title">{product.name}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                    <span className={`product-badge ${getStatusBadge(product.status)}`}>
                        {getStatusText(product.status)}
                    </span>
                    {product.barcode && (
                        <span className="product-badge" style={{ 
                            background: 'rgba(102, 126, 234, 0.1)', 
                            color: '#667eea',
                            border: '1px solid rgba(102, 126, 234, 0.2)'
                        }}>
                            <QrCode size={12} />
                            {product.barcode}
                        </span>
                    )}
                </div>
            </div>

            {/* Product Content */}
            <div style={{ display: 'grid', gap: '2rem' }}>
                {/* Product Image - Full Width */}
                <div className="form-container">
                    <h3 className="mb-4" style={{ color: '#2d3748' }}>Ürün Görseli</h3>
                    <div style={{ 
                        width: '100%', 
                        height: '300px',
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                        backgroundColor: '#f7fafc'
                    }}>
                        {product.imageUrl ? (
                            <ImageDisplay 
                                src={product.imageUrl} 
                                alt={product.name}
                                style={{ 
                                    width: '100%', 
                                    height: '100%',
                                    borderRadius: '0.75rem'
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full" style={{ color: '#a0aec0' }}>
                                <Package size={64} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Details - Full Width */}
                <div className="form-container">
                    <h3 className="mb-4" style={{ color: '#2d3748' }}>Ürün Bilgileri</h3>
                    
                    {product.description && (
                        <div className="mb-4">
                            <h4 style={{ color: '#4a5568', marginBottom: '0.5rem' }}>Açıklama</h4>
                            <p style={{ color: '#718096', lineHeight: '1.6' }}>{product.description}</p>
                        </div>
                    )}

                    {product.features && (
                        <div className="mb-4">
                            <h4 style={{ color: '#4a5568', marginBottom: '0.5rem' }}>Özellikler</h4>
                            <p style={{ color: '#718096', lineHeight: '1.6' }}>{product.features}</p>
                        </div>
                    )}

                    {product.category && (
                        <div className="mb-4">
                            <h4 style={{ color: '#4a5568', marginBottom: '0.5rem' }}>Kategori</h4>
                            <div className="flex items-center gap-2">
                                <Package size={16} style={{ color: '#667eea' }} />
                                <span style={{ color: '#718096', textTransform: 'capitalize' }}>{product.category}</span>
                            </div>
                        </div>
                    )}

                    {product.location && (
                        <div className="mb-4">
                            <h4 style={{ color: '#4a5568', marginBottom: '0.5rem' }}>Konum</h4>
                            <div className="flex items-center gap-2">
                                <MapPin size={16} style={{ color: '#667eea' }} />
                                <span style={{ color: '#718096' }}>{product.location}</span>
                            </div>
                            {product.locationDescription && (
                                <p style={{ color: '#a0aec0', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                    {product.locationDescription}
                                </p>
                            )}
                            {product.locationImage && (
                                <div style={{ marginTop: '0.75rem' }}>
                                    <h5 style={{ color: '#4a5568', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Konum Resmi</h5>
                                    <div style={{ 
                                        width: '200px', 
                                        height: '150px',
                                        borderRadius: '0.5rem',
                                        overflow: 'hidden'
                                    }}>
                                        <ImageDisplay 
                                            src={product.locationImage} 
                                            alt="Konum"
                                            style={{ 
                                                width: '100%', 
                                                height: '100%',
                                                borderRadius: '0.5rem'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {product.status === 'borrowed' && product.borrowedBy && (
                        <div className="mb-4">
                            <h4 style={{ color: '#4a5568', marginBottom: '0.5rem' }}>Ödünç Bilgileri</h4>
                            <div style={{ 
                                background: 'rgba(245, 101, 101, 0.05)', 
                                padding: '1rem', 
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(245, 101, 101, 0.1)'
                            }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Users size={16} style={{ color: '#c53030' }} />
                                    <span style={{ fontWeight: '500', color: '#c53030' }}>
                                        {product.borrowedBy}
                                    </span>
                                </div>
                                {product.borrowedDate && (
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} style={{ color: '#a0aec0' }} />
                                        <span style={{ fontSize: '0.875rem', color: '#718096' }}>
                                            {formatDate(product.borrowedDate)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mb-4">
                        <h4 style={{ color: '#4a5568', marginBottom: '0.5rem' }}>Oluşturulma Tarihi</h4>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} style={{ color: '#a0aec0' }} />
                            <span style={{ color: '#718096' }}>{formatDate(product.createdAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons - Full Width */}
                <div className="form-container">
                    <h3 className="mb-4" style={{ color: '#2d3748' }}>İşlemler</h3>
                    <div className="flex gap-3 flex-wrap">
                        {product.status === 'in_stock' ? (
                            <button
                                onClick={() => setShowBorrowModal(true)}
                                className="button button-primary"
                            >
                                <UserPlus size={16} />
                                Ödünç Ver
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowReturnModal(true)}
                                className="button button-success"
                            >
                                <RotateCcw size={16} />
                                Geri Al
                            </button>
                        )}
                        <Link
                            to={`/products/${product.id}/edit`}
                            className="button button-secondary"
                        >
                            <Edit3 size={16} />
                            Düzenle
                        </Link>
                    </div>
                </div>
            </div>

            {/* Borrow Modal */}
            {showBorrowModal && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="form-container" style={{ maxWidth: '500px', width: '100%' }}>
                        <h3 className="mb-4">Ödünç Ver</h3>
                        
                        <div className="form-group">
                            <label className="form-label">Kullanıcı Seç</label>
                            <select
                                value={borrowData.borrowedByUserId}
                                onChange={handleUserSelect}
                            >
                                <option value="">Kullanıcı seçin...</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Ödünç Alan Kişi</label>
                            <input
                                type="text"
                                value={borrowData.borrowedBy}
                                onChange={(e) => setBorrowData(prev => ({ ...prev, borrowedBy: e.target.value }))}
                                placeholder="Kişinin adını girin"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleBorrow}
                                className="button button-primary"
                                disabled={!borrowData.borrowedBy.trim()}
                            >
                                <UserPlus size={16} />
                                Ödünç Ver
                            </button>
                            <button
                                onClick={() => {
                                    setShowBorrowModal(false);
                                    setBorrowData({ borrowedBy: '', borrowedByUserId: '' });
                                }}
                                className="button button-secondary"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Return Modal */}
            {showReturnModal && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="form-container" style={{ maxWidth: '600px', width: '100%' }}>
                        <h3 className="mb-4">Ürünü Geri Al</h3>
                        
                        {/* Lokasyon Seçimi */}
                        <div className="form-group">
                            <label className="form-label">Depo Konumu</label>
                            <div className="location-row form-row">
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        value={returnData.location || locationSearch}
                                        onChange={(e) => {
                                            if (!returnData.location) {
                                                setLocationSearch(e.target.value);
                                            }
                                        }}
                                        placeholder="Konum ara veya yeni konum girin"
                                        onFocus={() => {
                                            if (returnData.location) {
                                                setReturnData(prev => ({ ...prev, location: '' }));
                                                setLocationSearch('');
                                            }
                                        }}
                                    />
                                    {locationSearch && filteredLocations.length > 0 && !returnData.location && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '0.375rem',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                            zIndex: 10,
                                            maxHeight: '200px',
                                            overflowY: 'auto'
                                        }}>
                                            {filteredLocations.map((location) => (
                                                <div
                                                    key={location.id}
                                                    onClick={() => handleLocationSelect(location)}
                                                    style={{
                                                        padding: '0.75rem',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid #f1f5f9'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                                >
                                                    <div style={{ fontWeight: '500' }}>{location.name}</div>
                                                    {location.description && (
                                                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                                            {location.description}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        className="button button-secondary"
                                        onClick={() => {
                                            const newLocation = locationSearch.trim();
                                            if (newLocation) {
                                                setReturnData(prev => ({ ...prev, location: newLocation }));
                                                setLocationSearch('');
                                            }
                                        }}
                                    >
                                        Ekle
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Konum Açıklaması</label>
                            <textarea
                                value={returnData.locationDescription}
                                onChange={(e) => setReturnData(prev => ({ ...prev, locationDescription: e.target.value }))}
                                placeholder="Konumla ilgili ek bilgiler..."
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Konum Fotoğrafı</label>
                            <div className="image-row form-row">
                                <div>
                                    <input
                                        type="text"
                                        value={returnData.locationImage}
                                        onChange={(e) => setReturnData(prev => ({ ...prev, locationImage: e.target.value }))}
                                        placeholder="Fotoğraf URL'si"
                                    />
                                </div>
                                <div className="image-buttons">
                                    <button
                                        type="button"
                                        onClick={() => handleCameraCapture('location')}
                                        className="button button-secondary"
                                        title="Kamera"
                                    >
                                        <Camera size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleImageCapture('location')}
                                        className="button button-secondary"
                                        title="Galeri"
                                    >
                                        <FileImage size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {returnData.locationImage && (
                            <div className="mb-4">
                                <div style={{ 
                                    width: '100%', 
                                    height: '200px',
                                    borderRadius: '0.5rem',
                                    overflow: 'hidden'
                                }}>
                                    <ImageDisplay 
                                        src={returnData.locationImage}
                                        alt="Konum fotoğrafı"
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handleReturn}
                                className="button button-success"
                            >
                                <RotateCcw size={16} />
                                Geri Al
                            </button>
                            <button
                                onClick={() => {
                                    setShowReturnModal(false);
                                    setReturnData({ location: '', locationDescription: '', locationImage: '' });
                                    setLocationSearch('');
                                }}
                                className="button button-secondary"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Camera Component - Koşullu render */}
            {showCamera && (
                <CameraCapture
                    onClose={handleCloseCamera}
                    onCapture={handleCameraPhoto}
                />
            )}
        </div>
    );
};

export default ProductDetailPage; 