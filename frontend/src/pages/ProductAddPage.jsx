import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft,
    Package, 
    MapPin, 
    QrCode, 
    Camera,
    FileImage,
    Plus 
} from 'lucide-react';
import { productsAPI, locationsAPI, uploadAPI } from '../config/api';
import ImageDisplay from '../components/ImageDisplay';
import CameraCapture from '../components/CameraCapture';
import BarcodeScanner from '../components/BarcodeScanner';

const ProductAddPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);
    
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        barcode: '',
        description: '',
        features: '',
        imageUrl: '',
        status: 'in_stock',
        location: '',
        locationDescription: '',
        locationImage: ''
    });

    const [locations, setLocations] = useState([]);
    const [locationSearch, setLocationSearch] = useState('');
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [newLocation, setNewLocation] = useState({
        name: '',
        description: ''
    });
    const [showCamera, setShowCamera] = useState(false);
    const [cameraType, setCameraType] = useState('');
    const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

    useEffect(() => {
        fetchLocations();
        if (isEditMode) {
            fetchProductData();
        }
    }, [isEditMode, id]);

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

    const fetchProductData = async () => {
        try {
            setInitialLoading(true);
            const response = await productsAPI.getProductById(id);
            if (response.data.success) {
                const product = response.data.data;
                setFormData({
                    name: product.name || '',
                    barcode: product.barcode || '',
                    description: product.description || '',
                    features: product.features || '',
                    imageUrl: product.imageUrl || '',
                    status: product.status || 'in_stock',
                    location: product.location || '',
                    locationDescription: product.locationDescription || '',
                    locationImage: product.locationImage || ''
                });
            }
        } catch (error) {
            // Ürün verisi yüklenirken hata
            setError('Ürün bilgileri yüklenemedi');
        } finally {
            setInitialLoading(false);
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
            // Lokasyonlar yüklenirken hata
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBarcodeCapture = () => {
        setShowBarcodeScanner(true);
    };

    const handleBarcodeScanned = (barcode) => {
        setFormData(prev => ({
            ...prev,
            barcode: barcode
        }));
        setShowBarcodeScanner(false);
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
                    setLoading(true);
                                const response = await uploadAPI.uploadSingleImage(file);
            if (response.data.success) {
                const imageUrl = response.data.data.url;
                        
                        if (type === 'product') {
                            setFormData(prev => ({
                                ...prev,
                                imageUrl: imageUrl
                            }));
                        } else if (type === 'location') {
                            setFormData(prev => ({
                                ...prev,
                                locationImage: imageUrl
                            }));
                        }
                        alert('Resim başarıyla yüklendi');
                    }
                } catch (error) {
                    // Resim yükleme hatası
                    alert('Resim yüklenemedi. Lütfen tekrar deneyin.');
                } finally {
                    setLoading(false);
                }
            }
        };
        
        fileInput.click();
    };

    const handleCameraCapture = (type) => {
        setCameraType(type);
        setShowCamera(true);
    };

    const handleCameraPhoto = async (file) => {
        try {
            setLoading(true);
            const response = await uploadAPI.uploadSingleImage(file);
            
            if (response.data.success) {
                const imageUrl = response.data.data.url;
                
                if (cameraType === 'product') {
                    setFormData(prev => ({
                        ...prev,
                        imageUrl: imageUrl
                    }));
                } else if (cameraType === 'location') {
                    setFormData(prev => ({
                        ...prev,
                        locationImage: imageUrl
                    }));
                }
                
                alert('Fotoğraf başarıyla yüklendi ve form güncellendi!');
            } else {
                throw new Error('Upload başarısız: ' + response.data.message);
            }
        } catch (error) {
            alert('Fotoğraf yüklenemedi. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
            setShowCamera(false);
        }
    };

    const handleCloseCamera = () => {
        setShowCamera(false);
    };

    const handleCloseBarcodeScanner = () => {
        setShowBarcodeScanner(false);
    };

    const handleLocationSelect = (location) => {
        setFormData(prev => ({
            ...prev,
            location: location.name
        }));
        setLocationSearch('');
    };

    const handleAddNewLocation = async () => {
        if (!newLocation.name.trim()) {
            alert('Konum adı gereklidir');
            return;
        }

        try {
            const response = await locationsAPI.createLocation(newLocation);
            if (response.data.success) {
                await fetchLocations();
                setFormData(prev => ({
                    ...prev,
                    location: newLocation.name
                }));
                setNewLocation({ name: '', description: '' });
                setShowLocationModal(false);
                alert('Yeni konum başarıyla eklendi');
            }
        } catch (error) {
            // Konum ekleme hatası
            alert(error.response?.data?.message || 'Konum eklenirken hata oluştu');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            setError('Ürün adı gereklidir');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            if (isEditMode) {
                await productsAPI.updateProduct(id, formData);
                setSuccess('Ürün başarıyla güncellendi!');
            } else {
                await productsAPI.createProduct(formData);
                setSuccess('Ürün başarıyla eklendi!');
            }
            
            setTimeout(() => {
                if (isEditMode) {
                    navigate(`/products/${id}`);
                } else {
                    navigate('/products');
                }
            }, 1500);
        } catch (error) {
            // Ürün kaydetme hatası
            setError(
                error.response?.data?.message || 
                'Ürün kaydedilirken hata oluştu'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            {/* Page Header */}
            <div className="page-header">
                <Link to={isEditMode ? `/products/${id}` : "/products"} className="button button-secondary mb-4">
                    <ArrowLeft size={16} />
                    Geri
                </Link>
                <h1 className="page-title">{isEditMode ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</h1>
            </div>

            {error && (
                <div style={{
                    background: 'rgba(245, 101, 101, 0.1)',
                    border: '1px solid rgba(245, 101, 101, 0.2)',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    marginBottom: '2rem',
                    color: '#c53030'
                }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    background: 'rgba(72, 187, 120, 0.1)',
                    border: '1px solid rgba(72, 187, 120, 0.2)',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    marginBottom: '2rem',
                    color: '#2f855a'
                }}>
                    {success}
                </div>
            )}

            {initialLoading ? (
                <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner mx-auto mb-4"></div>
                        <p className="text-lg">Ürün bilgileri yükleniyor...</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gap: '2rem' }}>
                        {/* Ürün Bilgileri */}
                        <div className="form-container">
                            <h3 className="flex items-center gap-2 mb-6" style={{ color: '#2d3748' }}>
                                <Package size={20} />
                                Ürün Bilgileri
                            </h3>

                            <div className="form-group">
                                <label className="form-label">Ürün Adı *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Ürün adını giriniz"
                                    required
                                />
                            </div>

                            {/* Barkod/QR Kod - Mobil responsive */}
                            <div className="form-group">
                                <label className="form-label">Barkod / QR Kod</label>
                                <div className="barcode-row form-row">
                                    <div>
                                        <input
                                            type="text"
                                            name="barcode"
                                            value={formData.barcode}
                                            onChange={handleInputChange}
                                            placeholder="Barkod giriniz veya taratınız"
                                        />
                                    </div>
                                    <div>
                                        <button
                                            type="button"
                                            onClick={handleBarcodeCapture}
                                            className="button button-secondary"
                                        >
                                            <QrCode size={16} />
                                            <span className="hide-mobile">Tara</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Açıklama</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Ürün açıklaması"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Özellikler</label>
                                <textarea
                                    name="features"
                                    value={formData.features}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Teknik özellikler, boyutlar vb."
                                />
                            </div>

                            {/* Ürün Görseli - Mobil responsive */}
                            <div className="form-group">
                                <label className="form-label">Ürün Görseli</label>
                                <div className="image-row form-row">
                                    <div>
                                        <input
                                            type="text"
                                            name="imageUrl"
                                            value={formData.imageUrl}
                                            onChange={handleInputChange}
                                            placeholder="Görsel URL'i"
                                        />
                                    </div>
                                    <div className="image-buttons">
                                        <button
                                            type="button"
                                            onClick={() => handleCameraCapture('product')}
                                            className="button button-primary"
                                            title="Kamera"
                                        >
                                            <Camera size={16} />
                                            <span className="hide-mobile">Kamera</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleImageCapture('product')}
                                            className="button button-secondary"
                                            title="Galeri"
                                        >
                                            <FileImage size={16} />
                                            <span className="hide-mobile">Galeri</span>
                                        </button>
                                    </div>
                                </div>
                                {formData.imageUrl && (
                                    <div className="mt-4">
                                        <ImageDisplay
                                            src={formData.imageUrl}
                                            alt="Ürün Görseli"
                                            style={{ width: '100px', height: '100px', borderRadius: '0.5rem' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Durum ve Lokasyon */}
                        <div className="form-container">
                            <h3 className="flex items-center gap-2 mb-6" style={{ color: '#2d3748' }}>
                                <MapPin size={20} />
                                Durum ve Lokasyon
                            </h3>

                            <div className="form-group">
                                <label className="form-label">Durum *</label>
                                <select
                                    name="status"
                                    value="in_stock"
                                    disabled
                                >
                                    <option value="in_stock">Depoda</option>
                                </select>
                                <small style={{ color: '#718096', fontSize: '0.875rem', marginTop: '0.5rem', display: 'block' }}>
                                    Yeni eklenen ürünler otomatik olarak "Depoda" durumunda olur
                                </small>
                            </div>

                            {/* Depo Konumu - Mobil responsive */}
                            <div className="form-group">
                                <label className="form-label">Depo Konumu</label>
                                <div className="location-row form-row">
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            value={formData.location || locationSearch}
                                            onChange={(e) => {
                                                if (!formData.location) {
                                                    setLocationSearch(e.target.value);
                                                }
                                            }}
                                            placeholder="Konum ara veya yeni konum girin"
                                            onFocus={() => {
                                                if (formData.location) {
                                                    setFormData(prev => ({ ...prev, location: '' }));
                                                    setLocationSearch('');
                                                }
                                            }}
                                        />
                                        
                                        {locationSearch && filteredLocations.length > 0 && !formData.location && (
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
                                            onClick={() => setShowLocationModal(true)}
                                            className="button button-success"
                                        >
                                            <Plus size={16} />
                                            <span className="hide-mobile">Ekle</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Konum Açıklaması</label>
                                <textarea
                                    name="locationDescription"
                                    value={formData.locationDescription}
                                    onChange={handleInputChange}
                                    rows="2"
                                    placeholder="Ürünü bulmak için detaylı açıklama"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Konum Resmi</label>
                                <div className="image-row form-row">
                                    <div>
                                        <input
                                            type="text"
                                            name="locationImage"
                                            value={formData.locationImage}
                                            onChange={handleInputChange}
                                            placeholder="Konum görseli URL'i"
                                        />
                                    </div>
                                    <div className="image-buttons">
                                        <button
                                            type="button"
                                            onClick={() => handleCameraCapture('location')}
                                            className="button button-primary"
                                            title="Kamera"
                                        >
                                            <Camera size={16} />
                                            <span className="hide-mobile">Kamera</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleImageCapture('location')}
                                            className="button button-secondary"
                                            title="Galeri"
                                        >
                                            <FileImage size={16} />
                                            <span className="hide-mobile">Galeri</span>
                                        </button>
                                    </div>
                                </div>
                                {formData.locationImage && (
                                    <div className="mt-4">
                                        <ImageDisplay
                                            src={formData.locationImage}
                                            alt="Konum Görseli"
                                            style={{ width: '100px', height: '100px', borderRadius: '0.5rem' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 justify-center">
                        <button
                            type="submit"
                            disabled={loading}
                            className="button button-success"
                            style={{ minWidth: '150px' }}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                                    Kaydediliyor...
                                </div>
                            ) : (
                                isEditMode ? 'Güncelle' : 'Kaydet'
                            )}
                        </button>
                        <Link 
                            to={isEditMode ? `/products/${id}` : "/products"} 
                            className="button button-secondary"
                            style={{ minWidth: '150px', textAlign: 'center' }}
                        >
                            İptal
                        </Link>
                    </div>
                </form>
            )}

            {/* Location Modal */}
            {showLocationModal && (
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
                        <h3 className="mb-4">Yeni Konum Ekle</h3>
                        
                        <div className="form-group">
                            <label className="form-label">Konum Adı *</label>
                            <input
                                type="text"
                                value={newLocation.name}
                                onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Örnek: Raf A-1"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Açıklama</label>
                            <textarea
                                value={newLocation.description}
                                onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
                                rows="3"
                                placeholder="Konum hakkında detaylı bilgi"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleAddNewLocation}
                                className="button button-success"
                                disabled={!newLocation.name.trim()}
                            >
                                <Plus size={16} />
                                Ekle
                            </button>
                            <button
                                onClick={() => {
                                    setShowLocationModal(false);
                                    setNewLocation({ name: '', description: '' });
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

            {/* Barcode Scanner Component - Koşullu render */}
            {showBarcodeScanner && (
                <BarcodeScanner
                    onClose={handleCloseBarcodeScanner}
                    onScan={handleBarcodeScanned}
                />
            )}
        </div>
    );
};

export default ProductAddPage; 