import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { homeAPI, productsAPI } from '../config/api';
import ImageDisplay from '../components/ImageDisplay';
import { 
    Package, 
    TrendingUp, 
    AlertTriangle, 
    Users,
    Plus,
    Search,
    Settings,
    LogOut,
    Shield,
    Clock,
    MapPin,
    Eye,
    Edit,
    CheckCircle,
    Calendar
} from 'lucide-react';

const HomePage = () => {
    const navigate = useNavigate();
    const [homeData, setHomeData] = useState(null);
    const [stats, setStats] = useState(null);
    const [recentProducts, setRecentProducts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
        loadUserInfo();
    }, []);

    const loadUserInfo = () => {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            try {
                setCurrentUser(JSON.parse(userStr));
            } catch (error) {
                // User bilgisi parse edilemedi
            }
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            
            const [homeResponse, statsResponse, productsResponse] = await Promise.all([
                homeAPI.getHome(),
                productsAPI.getWarehouseStats(),
                productsAPI.getAllProducts({ limit: 3, sortBy: 'createdAt', sortOrder: 'DESC' })
            ]);

            if (homeResponse.data.success) {
                setHomeData(homeResponse.data);
            }

            if (statsResponse.data.success) {
                setStats(statsResponse.data.data);
            }

            if (productsResponse.data.success) {
                setRecentProducts(productsResponse.data.data);
            }

        } catch (error) {
            // Ana sayfa verileri yüklenirken hata
            if (error.response?.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                navigate('/login');
            } else {
                setError('Veriler yüklenirken bir hata oluştu');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            navigate('/login');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'short',
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
                <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
                    <div className="text-center">
                        <div className="spinner mx-auto mb-4"></div>
                        <h2 style={{ color: '#fff' }}>Yükleniyor...</h2>
                        <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Ana sayfa verileri getiriliyor</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="form-container text-center">
                    <div className="text-center">
                        <AlertTriangle size={48} className="mx-auto mb-4" style={{ color: '#e53e3e' }} />
                        <h2>Hata Oluştu</h2>
                        <p className="mb-6">{error}</p>
                        <button onClick={fetchData} className="button button-primary">
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="page-title mb-2">📦 Depo Yönetim Sistemi</h1>
                        <p className="page-description" style={{ margin: 0 }}>
                            Hoş geldiniz, <strong>{currentUser?.name || homeData?.user?.name || 'Kullanıcı'}</strong>!
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {currentUser?.role === 'admin' && (
                            <Link to="/admin" className="button button-secondary">
                                <Shield size={16} />
                                <span className="hide-mobile">Admin Panel</span>
                            </Link>
                        )}
                        <button onClick={handleLogout} className="button button-danger">
                            <LogOut size={16} />
                            <span className="hide-mobile">Çıkış</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="flex items-center gap-4">
                        <div style={{ 
                            padding: '1rem', 
                            borderRadius: '1rem',
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                        }}>
                            <Package size={32} style={{ color: '#667eea' }} />
                        </div>
                        <div>
                            <div className="stat-number">{stats?.totalCount || 0}</div>
                            <div className="stat-label">Toplam Ürün</div>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-4">
                        <div style={{ 
                            padding: '1rem', 
                            borderRadius: '1rem',
                            background: 'linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(56, 161, 105, 0.1) 100%)'
                        }}>
                            <CheckCircle size={32} style={{ color: '#48bb78' }} />
                        </div>
                        <div>
                            <div className="stat-number">{stats?.inStockCount || 0}</div>
                            <div className="stat-label">Depoda Mevcut</div>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-4">
                        <div style={{ 
                            padding: '1rem', 
                            borderRadius: '1rem',
                            background: 'linear-gradient(135deg, rgba(245, 101, 101, 0.1) 0%, rgba(229, 62, 62, 0.1) 100%)'
                        }}>
                            <Users size={32} style={{ color: '#f56565' }} />
                        </div>
                        <div>
                            <div className="stat-number">{stats?.borrowedCount || 0}</div>
                            <div className="stat-label">Ödünç Alınan</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="form-container mb-6">
                <h3 className="mb-4" style={{ color: '#2d3748' }}>Hızlı İşlemler</h3>
                <div className="quick-actions-grid">
                    <Link to="/products/add" className="button button-primary">
                        <Plus size={16} />
                        Yeni Ürün Ekle
                    </Link>
                    <Link to="/products" className="button button-secondary">
                        <Search size={16} />
                        Ürün Ara
                    </Link>
                    <Link to="/products?status=borrowed" className="button button-secondary">
                        <Users size={16} />
                        Ödünç Alınanlar
                    </Link>
                    <Link to="/products?status=in_stock" className="button button-secondary">
                        <Package size={16} />
                        Depodakiler
                    </Link>
                </div>
            </div>

            {/* Recent Products */}
            <div className="form-container">
                <div className="flex items-center justify-between mb-4">
                    <h3 style={{ color: '#2d3748', margin: 0 }}>Son Eklenen Ürünler</h3>
                    <Link to="/products" className="button button-secondary">
                        <Search size={16} />
                        Tümünü Gör
                    </Link>
                </div>

                {recentProducts.length > 0 ? (
                    <div className="products-grid">
                        {recentProducts.map((product) => (
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
                                    <h4 className="product-title">{product.name}</h4>
                                    
                                    {product.description && (
                                        <p className="product-description">{product.description}</p>
                                    )}

                                    {/* Product Meta */}
                                    <div className="product-meta">
                                        <span className={`product-badge ${getStatusBadge(product.status)}`}>
                                            {getStatusText(product.status)}
                                        </span>
                                    </div>

                                    {/* Location Info */}
                                    {product.location && (
                                        <div className="flex items-center gap-2 mb-3" style={{ color: '#718096', fontSize: '0.875rem' }}>
                                            <MapPin size={14} />
                                            <span>{product.location}</span>
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
                    <div className="text-center" style={{ padding: '3rem 1rem' }}>
                        <Package size={48} style={{ color: '#cbd5e0' }} className="mx-auto mb-4" />
                        <h4 style={{ color: '#4a5568', marginBottom: '0.5rem' }}>Henüz Ürün Yok</h4>
                        <p style={{ color: '#718096', marginBottom: '2rem' }}>
                            İlk ürününüzü ekleyerek başlayın
                        </p>
                        <Link to="/products/add" className="button button-primary">
                            <Plus size={16} />
                            İlk Ürünü Ekle
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage; 