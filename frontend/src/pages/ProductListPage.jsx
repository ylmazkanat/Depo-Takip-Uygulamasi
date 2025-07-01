import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Plus, Package, AlertTriangle, Clock, MapPin, QrCode, Users, Eye, Calendar, Edit, CheckCircle, XCircle } from 'lucide-react';
import { productsAPI } from '../config/api';
import ImageDisplay from '../components/ImageDisplay';

const ProductListPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
    const [locationFilter, setLocationFilter] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const status = searchParams.get('status');
        if (status && status !== statusFilter) {
            setStatusFilter(status);
        }
        if (!isInitialized) {
            setIsInitialized(true);
        }
    }, [location.search]);

    useEffect(() => {
        if (isInitialized) {
            const timeoutId = setTimeout(() => {
                fetchProducts();
            }, 1000); // 1 saniye bekle
            
            return () => clearTimeout(timeoutId);
        }
    }, [searchQuery, statusFilter, locationFilter, isInitialized]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            if (searchQuery) params.append('search', searchQuery);
            if (statusFilter) params.append('status', statusFilter);
            if (locationFilter) params.append('location', locationFilter);
            
            const response = await productsAPI.getAllProducts(Object.fromEntries(params));
            
            if (response.data.success) {
                setProducts(response.data.data);
            }
        } catch (error) {
            // Ürünler yüklenemedi
            setError('Ürünler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // Form submit'i engelle - sadece onChange ile arama yap
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        if (status) {
            navigate(`?status=${status}`);
        } else {
            navigate('/products');
        }
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="container">
                <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner mx-auto mb-4"></div>
                        <p className="text-lg">Ürünler yükleniyor...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="form-container text-center">
                    <div className="text-center mb-6">
                        <AlertTriangle size={48} className="mx-auto mb-4" style={{ color: '#e53e3e' }} />
                        <h2>Hata Oluştu</h2>
                        <p className="mb-6">{error}</p>
                        <button onClick={fetchProducts} className="button button-primary">
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            {/* Page Header */}
            <div className="page-header">
                <div className="flex items-center justify-between mb-4">
                    <Link to="/" className="button button-secondary">
                        <ArrowLeft size={16} />
                        Ana Sayfa
                    </Link>
                    <Link to="/products/add" className="button button-primary">
                        <Plus size={16} />
                        Yeni Ürün Ekle
                    </Link>
                </div>
                <h1 className="page-title">Ürün Listesi</h1>
                <p className="page-description">
                    Tüm ürünleri görüntüleyin, arayın ve yönetin
                </p>
            </div>

            {/* Search and Filters */}
            <div className="form-container mb-6">
                {/* Search Box */}
                <form onSubmit={handleSearchSubmit}>
                    <div className="form-group">
                        <div className="relative">
                            <div className="absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                                <Search size={20} style={{ color: '#a0aec0' }} />
                            </div>
                            <input
                                type="text"
                                placeholder="Ürün adı, barkod, açıklama ara..."
                                value={searchQuery}
                                onChange={handleSearch}
                                style={{ paddingLeft: '3rem' }}
                                autoComplete="off"
                            />
                        </div>
                    </div>
                </form>
                
                {/* Filter Buttons */}
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => handleStatusFilter('')}
                        className={`button ${!statusFilter ? 'button-primary' : 'button-secondary'}`}
                    >
                        <Package size={16} />
                        Tümü ({products.length})
                    </button>
                    <button
                        onClick={() => handleStatusFilter('in_stock')}
                        className={`button ${statusFilter === 'in_stock' ? 'button-success' : 'button-secondary'}`}
                    >
                        <CheckCircle size={16} />
                        Depoda ({products.filter(p => p.status === 'in_stock').length})
                    </button>
                    <button
                        onClick={() => handleStatusFilter('borrowed')}
                        className={`button ${statusFilter === 'borrowed' ? 'button-danger' : 'button-secondary'}`}
                    >
                        <Users size={16} />
                        Ödünç Alınan ({products.filter(p => p.status === 'borrowed').length})
                    </button>
                </div>
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
                <div className="products-grid">
                    {products.map((product) => (
                        <div key={product.id} className="product-card">
                            {/* Product Image */}
                            <div className="product-image-container">
                                {product.imageUrl ? (
                                    <ImageDisplay 
                                        src={product.imageUrl} 
                                        alt={product.name}
                                        className="product-image"
                                    />
                                ) : (
                                    <div className="product-image-placeholder">
                                        <Package />
                                    </div>
                                )}
                            </div>

                            {/* Product Content */}
                            <div className="product-content">
                                <h3 className="product-title">{product.name}</h3>
                                
                                {product.description && (
                                    <p className="product-description">{product.description}</p>
                                )}

                                {/* Product Meta */}
                                <div className="product-meta">
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

                                {/* Location Info */}
                                {product.location && (
                                    <div className="flex items-center gap-2 mb-3" style={{ color: '#718096', fontSize: '0.875rem' }}>
                                        <MapPin size={14} />
                                        <span>{product.location}</span>
                                    </div>
                                )}

                                {/* Borrowed Info */}
                                {product.status === 'borrowed' && product.borrowedBy && (
                                    <div className="mb-3" style={{ 
                                        background: 'rgba(245, 101, 101, 0.05)', 
                                        padding: '0.75rem', 
                                        borderRadius: '0.5rem',
                                        border: '1px solid rgba(245, 101, 101, 0.1)'
                                    }}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Users size={14} style={{ color: '#c53030' }} />
                                            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#c53030' }}>
                                                {product.borrowedBy}
                                            </span>
                                        </div>
                                        {product.borrowedDate && (
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} style={{ color: '#a0aec0' }} />
                                                <span style={{ fontSize: '0.75rem', color: '#718096' }}>
                                                    {formatDate(product.borrowedDate)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Product Actions */}
                                <div className="product-actions">
                                    <Link
                                        to={`/products/${product.id}`}
                                        className="button button-secondary"
                                    >
                                        <Eye size={16} />
                                        Görüntüle
                                    </Link>
                                    <Link
                                        to={`/products/${product.id}/edit`}
                                        className="button button-primary"
                                    >
                                        <Edit size={16} />
                                        Düzenle
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="form-container text-center">
                    <div className="text-center">
                        <Package size={64} style={{ color: '#cbd5e0' }} className="mx-auto mb-4" />
                        <h3 style={{ color: '#4a5568' }}>Ürün Bulunamadı</h3>
                        <p style={{ color: '#718096', marginBottom: '2rem' }}>
                            {searchQuery || statusFilter 
                                ? 'Arama kriterlerinize uygun ürün bulunamadı.' 
                                : 'Henüz hiç ürün eklenmemiş.'}
                        </p>
                        {searchQuery || statusFilter ? (
                            <button 
                                onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('');
                                    navigate('/products');
                                }}
                                className="button button-secondary mr-4"
                            >
                                Filtreleri Temizle
                            </button>
                        ) : null}
                        <Link to="/products/add" className="button button-primary">
                            <Plus size={16} />
                            İlk Ürünü Ekle
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductListPage; 