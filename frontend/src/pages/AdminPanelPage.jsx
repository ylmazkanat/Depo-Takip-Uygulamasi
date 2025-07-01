import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, productsAPI, locationsAPI, usersAPI } from '../config/api';
import { 
    ArrowLeft, 
    Users, 
    Package, 
    BarChart3, 
    Settings, 
    Shield,
    UserCheck,
    UserX,
    Plus,
    Edit,
    Trash2,
    Crown,
    User as UserIcon,
    Calendar,
    Mail,
    TrendingUp,
    AlertTriangle,
    MapPin,
    Building,
    Power
} from 'lucide-react';

const AdminPanelPage = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [locations, setLocations] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [newLocation, setNewLocation] = useState({ name: '', description: '' });
    const [showUserModal, setShowUserModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
    const [editUser, setEditUser] = useState(null);
    const [showEditUserModal, setShowEditUserModal] = useState(false);

    useEffect(() => {
        checkAdminAccess();
        fetchData();
    }, []);

    const checkAdminAccess = async () => {
        try {
            const response = await authAPI.getMe();
            if (response.data.success) {
                setCurrentUser(response.data.user);
                if (response.data.user.role !== 'admin') {
                    alert('Bu sayfaya erişim yetkiniz bulunmamaktadır.');
                    navigate('/');
                    return;
                }
            }
        } catch (error) {
            // Kullanıcı kontrolü hatası
            navigate('/login');
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Paralel olarak tüm verileri getir
            const [statsResponse, productsResponse, locationsResponse, usersResponse] = await Promise.all([
                productsAPI.getWarehouseStats(),
                productsAPI.getAllProducts(),
                locationsAPI.getAllLocations(),
                usersAPI.getAllUsers()
            ]);

            if (statsResponse.data.success) {
                setStats(statsResponse.data.data);
            }

            if (productsResponse.data.success) {
                setProducts(productsResponse.data.data);
            }

            if (locationsResponse.data.success) {
                setLocations(locationsResponse.data.data);
            }

            if (usersResponse.data.success) {
                setUsers(usersResponse.data.data);
            }

        } catch (error) {
            // Veri yükleme hatası
            setError('Veriler yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
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

    const handleUserToggle = async (userId) => {
        try {
            const response = await usersAPI.toggleUserStatus(userId);
            if (response.data.success) {
                setUsers(prev => prev.map(user => 
                    user.id === userId 
                        ? { ...user, isActive: !user.isActive }
                        : user
                ));
                alert(response.data.message || 'Kullanıcı durumu güncellendi');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Kullanıcı durumu güncellenirken hata oluştu');
        }
    };

    const handleUserDelete = async (userId) => {
        if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const response = await usersAPI.deleteUser(userId);
            if (response.data.success) {
                setUsers(prev => prev.filter(user => user.id !== userId));
                alert(response.data.message || 'Kullanıcı başarıyla silindi');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Kullanıcı silinirken hata oluştu');
        }
    };

    const handleAddUser = async () => {
        if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
            alert('Tüm alanlar gereklidir');
            return;
        }

        if (newUser.password.length < 6) {
            alert('Şifre en az 6 karakter olmalıdır');
            return;
        }

        try {
            const response = await usersAPI.createUser(newUser);
            if (response.data.success) {
                setUsers(prev => [...prev, response.data.data]);
                setNewUser({ name: '', email: '', password: '', role: 'user' });
                setShowUserModal(false);
                alert(response.data.message || 'Kullanıcı başarıyla eklendi');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Kullanıcı eklenirken hata oluştu');
        }
    };

    const handleEditUser = async () => {
        if (!editUser.name.trim() || !editUser.email.trim()) {
            alert('Ad ve e-posta alanları gereklidir');
            return;
        }

        try {
            const response = await usersAPI.updateUser(editUser.id, {
                name: editUser.name,
                email: editUser.email,
                role: editUser.role,
                isActive: editUser.isActive
            });
            if (response.data.success) {
                setUsers(prev => prev.map(user => 
                    user.id === editUser.id ? response.data.data : user
                ));
                setEditUser(null);
                setShowEditUserModal(false);
                alert(response.data.message || 'Kullanıcı başarıyla güncellendi');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Kullanıcı güncellenirken hata oluştu');
        }
    };

    const openEditUserModal = (user) => {
        setEditUser({ ...user });
        setShowEditUserModal(true);
    };

    const handleAddLocation = async () => {
        if (!newLocation.name.trim()) {
            alert('Konum adı gereklidir');
            return;
        }

        try {
            const response = await locationsAPI.createLocation(newLocation);
            if (response.data.success) {
                setLocations(prev => [...prev, response.data.data]);
                setNewLocation({ name: '', description: '' });
                setShowLocationModal(false);
                alert('Yeni konum başarıyla eklendi');
            }
        } catch (error) {
            // Konum ekleme hatası
            alert(error.response?.data?.message || 'Konum eklenirken hata oluştu');
        }
    };

    const handleDeleteLocation = async (locationId) => {
        if (!window.confirm('Bu konumu kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
            return;
        }

        try {
            await locationsAPI.deleteLocation(locationId);
            setLocations(prev => prev.filter(location => location.id !== locationId));
            alert('Konum kalıcı olarak silindi');
        } catch (error) {
            // Konum silme hatası
            alert(error.response?.data?.message || 'Konum silinirken hata oluştu');
        }
    };

    const handleToggleLocationStatus = async (locationId) => {
        try {
            const response = await locationsAPI.toggleLocationStatus(locationId);
            if (response.data.success) {
                setLocations(prev => prev.map(location => 
                    location.id === locationId 
                        ? { ...location, isActive: !location.isActive }
                        : location
                ));
                alert(response.data.message);
            }
        } catch (error) {
            // Konum durumu değiştirme hatası
            alert(error.response?.data?.message || 'Konum durumu değiştirilirken hata oluştu');
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingBox}>
                    <Shield size={48} color="#667eea" />
                    <h2>Admin paneli yükleniyor...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.errorBox}>
                    <h2>Hata</h2>
                    <p>{error}</p>
                    <button onClick={fetchData} style={styles.retryButton}>
                        Tekrar Dene
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <Link to="/" style={styles.backButton}>
                        <ArrowLeft size={16} />
                        Ana Sayfa
                    </Link>
                    <h1 style={styles.title}>🛡️ Admin Paneli</h1>
                    <p style={styles.subtitle}>Sistem yönetimi ve istatistikler</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
                <button 
                    style={{...styles.tab, ...(activeTab === 'overview' ? styles.activeTab : {})}}
                    onClick={() => setActiveTab('overview')}
                >
                    <BarChart3 size={16} />
                    Genel Bakış
                </button>
                <button 
                    style={{...styles.tab, ...(activeTab === 'users' ? styles.activeTab : {})}}
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={16} />
                    Kullanıcılar
                </button>
                <button 
                    style={{...styles.tab, ...(activeTab === 'products' ? styles.activeTab : {})}}
                    onClick={() => setActiveTab('products')}
                >
                    <Package size={16} />
                    Ürün Yönetimi
                </button>
                <button 
                    style={{...styles.tab, ...(activeTab === 'locations' ? styles.activeTab : {})}}
                    onClick={() => setActiveTab('locations')}
                >
                    <MapPin size={16} />
                    Depo Konumları
                </button>
                <button 
                    style={{...styles.tab, ...(activeTab === 'settings' ? styles.activeTab : {})}}
                    onClick={() => setActiveTab('settings')}
                >
                    <Settings size={16} />
                    Ayarlar
                </button>
            </div>

            {/* Tab Content */}
            <div style={styles.tabContent}>
                {activeTab === 'overview' && (
                    <div style={styles.overviewTab}>
                        {/* Stats Cards */}
                        <div style={styles.statsGrid}>
                            <div style={styles.statCard}>
                                <div style={{...styles.statIcon, backgroundColor: '#e3f2fd'}}>
                                    <Package size={32} color="#1976d2" />
                                </div>
                                <div style={styles.statContent}>
                                    <h3>{stats?.totalCount || 0}</h3>
                                    <p>Toplam Ürün</p>
                                    <small style={{color: '#28a745'}}>+5% bu ay</small>
                                </div>
                            </div>

                            <div style={styles.statCard}>
                                <div style={{...styles.statIcon, backgroundColor: '#e8f5e8'}}>
                                    <TrendingUp size={32} color="#2e7d32" />
                                </div>
                                <div style={styles.statContent}>
                                    <h3>{stats?.inStockCount || 0}</h3>
                                    <p>Depodaki Ürün</p>
                                    <small style={{color: '#28a745'}}>Mevcut</small>
                                </div>
                            </div>

                            <div style={styles.statCard}>
                                <div style={{...styles.statIcon, backgroundColor: '#fff3e0'}}>
                                    <AlertTriangle size={32} color="#f57c00" />
                                </div>
                                <div style={styles.statContent}>
                                    <h3>{stats?.borrowedCount || 0}</h3>
                                    <p>Ödünç Alınan</p>
                                    <small style={{color: '#dc3545'}}>Takip ediliyor</small>
                                </div>
                            </div>

                            <div style={styles.statCard}>
                                <div style={{...styles.statIcon, backgroundColor: '#f3e5f5'}}>
                                    <Users size={32} color="#7b1fa2" />
                                </div>
                                <div style={styles.statContent}>
                                    <h3>{users.filter(u => u.isActive).length}</h3>
                                    <p>Aktif Kullanıcı</p>
                                    <small style={{color: '#667eea'}}>Toplam {users.length}</small>
                                </div>
                            </div>
                        </div>

                        {/* Son Aktiviteler */}
                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>Son Eklenen Ürünler</h3>
                            <div style={styles.recentList}>
                                {products.slice(0, 5).map(product => (
                                    <div key={product.id} style={styles.recentItem}>
                                        <div style={styles.recentInfo}>
                                            <strong>{product.name}</strong>
                                            <span style={styles.recentMeta}>
                                                {formatDate(product.createdAt)}
                                            </span>
                                        </div>
                                        <span 
                                            style={{
                                                ...styles.statusBadge,
                                                backgroundColor: product.status === 'in_stock' ? '#28a745' : '#dc3545'
                                            }}
                                        >
                                            {product.status === 'in_stock' ? 'Depoda' : 'Ödünç'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div style={styles.usersTab}>
                        <div style={styles.section}>
                            <div style={styles.sectionHeader}>
                                <h3 style={styles.sectionTitle}>Kullanıcı Yönetimi</h3>
                                <button 
                                    style={styles.addButton}
                                    onClick={() => setShowUserModal(true)}
                                >
                                    <Plus size={16} />
                                    Yeni Kullanıcı
                                </button>
                            </div>

                            <div style={styles.usersGrid}>
                                {users.map(user => (
                                    <div key={user.id} style={styles.userCard}>
                                        <div style={styles.userHeader}>
                                            <div style={styles.userAvatar}>
                                                {user.role === 'admin' ? (
                                                    <Crown size={24} color="#ffc107" />
                                                ) : (
                                                    <UserIcon size={24} color="#667eea" />
                                                )}
                                            </div>
                                            <div style={styles.userInfo}>
                                                <h4 style={styles.userName}>
                                                    {user.name}
                                                    {user.role === 'admin' && (
                                                        <span style={styles.adminBadge}>ADMIN</span>
                                                    )}
                                                </h4>
                                                <p style={styles.userEmail}>{user.email}</p>
                                            </div>
                                            <div style={styles.userStatus}>
                                                <span 
                                                    style={{
                                                        ...styles.statusDot,
                                                        backgroundColor: user.isActive ? '#28a745' : '#dc3545'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div style={styles.userDetails}>
                                            <div style={styles.userDetail}>
                                                <Calendar size={14} color="#666" />
                                                <span>Kayıt: {formatDate(user.createdAt)}</span>
                                            </div>
                                            <div style={styles.userDetail}>
                                                <Mail size={14} color="#666" />
                                                <span>Son giriş: {user.lastLogin ? formatDate(user.lastLogin) : 'Hiç giriş yapmamış'}</span>
                                            </div>
                                        </div>

                                        <div style={styles.userActions}>
                                            <button 
                                                style={styles.userActionButton}
                                                onClick={() => handleUserToggle(user.id)}
                                                title={user.isActive ? 'Deaktif et' : 'Aktif et'}
                                            >
                                                {user.isActive ? (
                                                    <UserX size={14} />
                                                ) : (
                                                    <UserCheck size={14} />
                                                )}
                                            </button>
                                            <button 
                                                style={styles.userActionButton}
                                                onClick={() => openEditUserModal(user)}
                                                title="Düzenle"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            {user.id !== currentUser?.id && (
                                                <button 
                                                    style={{...styles.userActionButton, color: '#dc3545'}}
                                                    onClick={() => handleUserDelete(user.id)}
                                                    title="Sil"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div style={styles.productsTab}>
                        <div style={styles.section}>
                            <div style={styles.sectionHeader}>
                                <h3 style={styles.sectionTitle}>Ürün Yönetimi</h3>
                                <Link to="/products/add" style={styles.addButton}>
                                    <Plus size={16} />
                                    Yeni Ürün Ekle
                                </Link>
                            </div>

                            <div style={styles.quickActions}>
                                <Link to="/products" style={styles.quickAction}>
                                    <Package size={20} />
                                    <span>Tüm Ürünleri Görüntüle</span>
                                    <small>{products.length} ürün</small>
                                </Link>
                                <div style={styles.quickAction}>
                                    <TrendingUp size={20} />
                                    <span>Depodaki Ürünler</span>
                                    <small>{stats?.inStockCount || 0} ürün</small>
                                </div>
                                <div style={styles.quickAction}>
                                    <AlertTriangle size={20} />
                                    <span>Ödünç Alınanlar</span>
                                    <small>{stats?.borrowedCount || 0} ürün</small>
                                </div>
                            </div>

                            <div style={styles.productsSummary}>
                                <h4>Son Eklenen Ürünler</h4>
                                <div style={styles.recentList}>
                                    {products.slice(0, 8).map(product => (
                                        <div key={product.id} style={styles.recentItem}>
                                            <div style={styles.recentInfo}>
                                                <strong>{product.name}</strong>
                                                <span style={styles.recentMeta}>
                                                    ID: #{product.id} • {formatDate(product.createdAt)}
                                                </span>
                                            </div>
                                            <Link 
                                                to={`/products/${product.id}`}
                                                style={styles.viewLink}
                                            >
                                                Görüntüle
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'locations' && (
                    <div style={styles.locationsTab}>
                        <div style={styles.section}>
                            <div style={styles.sectionHeader}>
                                <h3 style={styles.sectionTitle}>Depo Konumları Yönetimi</h3>
                                <button 
                                    style={styles.addButton}
                                    onClick={() => setShowLocationModal(true)}
                                >
                                    <Plus size={16} />
                                    Yeni Konum Ekle
                                </button>
                            </div>

                            <div style={styles.locationsGrid}>
                                {locations.map(location => (
                                    <div key={location.id} style={{
                                        ...styles.locationCard,
                                        opacity: location.isActive ? 1 : 0.6,
                                        border: location.isActive ? '1px solid #e9ecef' : '1px solid #ffc107'
                                    }}>
                                        <div style={styles.locationHeader}>
                                            <div style={styles.locationIcon}>
                                                <Building size={24} style={{ color: location.isActive ? '#667eea' : '#ffc107' }} />
                                            </div>
                                            <div style={styles.locationInfo}>
                                                <h4 style={styles.locationName}>
                                                    {location.name}
                                                    {!location.isActive && (
                                                        <span style={{
                                                            fontSize: '12px',
                                                            color: '#ffc107',
                                                            fontWeight: 'normal',
                                                            marginLeft: '8px'
                                                        }}>
                                                            (Pasif)
                                                        </span>
                                                    )}
                                                </h4>
                                                <p style={styles.locationDescription}>
                                                    {location.description || 'Açıklama bulunmuyor'}
                                                </p>
                                            </div>
                                        </div>

                                        <div style={styles.locationMeta}>
                                            <div style={styles.locationDetail}>
                                                <Calendar size={14} style={{ color: '#666' }} />
                                                <span>Oluşturulma: {formatDate(location.createdAt)}</span>
                                            </div>
                                            <div style={styles.locationDetail}>
                                                <Package size={14} style={{ color: '#666' }} />
                                                <span>
                                                    {products.filter(p => p.location === location.name).length} ürün
                                                </span>
                                            </div>
                                            <div style={styles.locationDetail}>
                                                <Power size={14} style={{ color: location.isActive ? '#28a745' : '#ffc107' }} />
                                                <span style={{ color: location.isActive ? '#28a745' : '#ffc107' }}>
                                                    {location.isActive ? 'Aktif' : 'Pasif'}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={styles.locationActions}>
                                            <button 
                                                style={styles.locationActionButton}
                                                title="Düzenle"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button 
                                                style={{
                                                    ...styles.locationActionButton, 
                                                    color: location.isActive ? '#ffc107' : '#28a745'
                                                }}
                                                onClick={() => handleToggleLocationStatus(location.id)}
                                                title={location.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                                            >
                                                <Power size={14} />
                                            </button>
                                            <button 
                                                style={{...styles.locationActionButton, color: '#dc3545'}}
                                                onClick={() => handleDeleteLocation(location.id)}
                                                title="Kalıcı Sil"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {locations.length === 0 && (
                                <div style={styles.emptyState}>
                                    <MapPin size={48} style={{ color: '#cbd5e0' }} />
                                    <h4>Henüz konum bulunmuyor</h4>
                                    <p>İlk depo konumunuzu ekleyerek başlayın</p>
                                    <button 
                                        style={styles.addButton}
                                        onClick={() => setShowLocationModal(true)}
                                    >
                                        <Plus size={16} />
                                        İlk Konumu Ekle
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div style={styles.settingsTab}>
                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>Sistem Ayarları</h3>
                            
                            <div style={styles.settingItem}>
                                <div style={styles.settingInfo}>
                                    <h4>Veritabanı Yönetimi</h4>
                                    <p>Veritabanı senkronizasyonu ve data yönetimi</p>
                                </div>
                                <button style={styles.settingButton}>
                                    Veritabanını Senkronize Et
                                </button>
                            </div>

                            <div style={styles.settingItem}>
                                <div style={styles.settingInfo}>
                                    <h4>Yedekleme</h4>
                                    <p>Sistem verilerinin yedeğini al</p>
                                </div>
                                <button style={styles.settingButton}>
                                    Yedek Al
                                </button>
                            </div>

                            <div style={styles.settingItem}>
                                <div style={styles.settingInfo}>
                                    <h4>Sistem Logları</h4>
                                    <p>Uygulama loglarını görüntüle</p>
                                </div>
                                <button style={styles.settingButton}>
                                    Logları Göster
                                </button>
                            </div>

                            <div style={styles.settingItem}>
                                <div style={styles.settingInfo}>
                                    <h4>Kullanıcı İzinleri</h4>
                                    <p>Rol bazlı erişim kontrollerini yönet</p>
                                </div>
                                <button style={styles.settingButton}>
                                    İzinleri Yönet
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* New Location Modal */}
            {showLocationModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3>Yeni Depo Konumu Ekle</h3>
                            <button
                                type="button"
                                onClick={() => setShowLocationModal(false)}
                                style={styles.modalCloseButton}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div style={styles.modalBody}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Konum Adı *</label>
                                <input
                                    type="text"
                                    value={newLocation.name}
                                    onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                                    style={styles.input}
                                    placeholder="Örnek: Raf A-1"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Açıklama</label>
                                <textarea
                                    value={newLocation.description}
                                    onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
                                    style={styles.textarea}
                                    rows="3"
                                    placeholder="Konum hakkında detaylı bilgi"
                                />
                            </div>
                        </div>

                        <div style={styles.modalFooter}>
                            <button
                                onClick={handleAddLocation}
                                style={styles.primaryButton}
                                disabled={!newLocation.name.trim()}
                            >
                                Konum Ekle
                            </button>
                            <button
                                onClick={() => {
                                    setShowLocationModal(false);
                                    setNewLocation({ name: '', description: '' });
                                }}
                                style={styles.secondaryButton}
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New User Modal */}
            {showUserModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3>Yeni Kullanıcı Ekle</h3>
                            <button
                                type="button"
                                onClick={() => setShowUserModal(false)}
                                style={styles.modalCloseButton}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div style={styles.modalBody}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Ad Soyad *</label>
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                                    style={styles.input}
                                    placeholder="Kullanıcının tam adı"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>E-posta *</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                                    style={styles.input}
                                    placeholder="ornek@email.com"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Şifre *</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                                    style={styles.input}
                                    placeholder="En az 6 karakter"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Rol *</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                                    style={styles.input}
                                >
                                    <option value="user">Kullanıcı</option>
                                    <option value="admin">Yönetici</option>
                                </select>
                            </div>
                        </div>

                        <div style={styles.modalFooter}>
                            <button
                                onClick={handleAddUser}
                                style={styles.primaryButton}
                                disabled={!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()}
                            >
                                Kullanıcı Ekle
                            </button>
                            <button
                                onClick={() => {
                                    setShowUserModal(false);
                                    setNewUser({ name: '', email: '', password: '', role: 'user' });
                                }}
                                style={styles.secondaryButton}
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditUserModal && editUser && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3>Kullanıcı Düzenle</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowEditUserModal(false);
                                    setEditUser(null);
                                }}
                                style={styles.modalCloseButton}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div style={styles.modalBody}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Ad Soyad *</label>
                                <input
                                    type="text"
                                    value={editUser.name}
                                    onChange={(e) => setEditUser(prev => ({ ...prev, name: e.target.value }))}
                                    style={styles.input}
                                    placeholder="Kullanıcının tam adı"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>E-posta *</label>
                                <input
                                    type="email"
                                    value={editUser.email}
                                    onChange={(e) => setEditUser(prev => ({ ...prev, email: e.target.value }))}
                                    style={styles.input}
                                    placeholder="ornek@email.com"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Rol *</label>
                                <select
                                    value={editUser.role}
                                    onChange={(e) => setEditUser(prev => ({ ...prev, role: e.target.value }))}
                                    style={styles.input}
                                >
                                    <option value="user">Kullanıcı</option>
                                    <option value="admin">Yönetici</option>
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <input
                                        type="checkbox"
                                        checked={editUser.isActive}
                                        onChange={(e) => setEditUser(prev => ({ ...prev, isActive: e.target.checked }))}
                                        style={{ marginRight: '8px' }}
                                    />
                                    Aktif kullanıcı
                                </label>
                            </div>
                        </div>

                        <div style={styles.modalFooter}>
                            <button
                                onClick={handleEditUser}
                                style={styles.primaryButton}
                                disabled={!editUser.name.trim() || !editUser.email.trim()}
                            >
                                Güncelle
                            </button>
                            <button
                                onClick={() => {
                                    setShowEditUserModal(false);
                                    setEditUser(null);
                                }}
                                style={styles.secondaryButton}
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        padding: '20px',
    },
    header: {
        marginBottom: '30px',
    },
    headerLeft: {
        flex: 1,
    },
    backButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#6c757d',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '5px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '15px',
    },
    title: {
        fontSize: '32px',
        color: '#333',
        margin: 0,
    },
    subtitle: {
        color: '#666',
        fontSize: '16px',
        margin: '5px 0 0 0',
    },
    tabs: {
        display: 'flex',
        marginBottom: '30px',
        borderBottom: '2px solid #e9ecef',
        flexWrap: 'wrap',
        gap: '5px',
    },
    tab: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        border: 'none',
        backgroundColor: 'transparent',
        color: '#666',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        borderBottom: '3px solid transparent',
        transition: 'all 0.3s',
    },
    activeTab: {
        color: '#667eea',
        borderBottomColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
    },
    tabContent: {
        minHeight: '400px',
    },
    overviewTab: {
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e9ecef',
    },
    statIcon: {
        padding: '15px',
        borderRadius: '10px',
    },
    statContent: {
        flex: 1,
    },
    section: {
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px',
    },
    sectionTitle: {
        fontSize: '18px',
        color: '#333',
        margin: 0,
    },
    addButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#28a745',
        color: 'white',
        padding: '10px 16px',
        border: 'none',
        borderRadius: '5px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        textDecoration: 'none',
    },
    recentList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    recentItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '5px',
        gap: '10px',
    },
    recentInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    recentMeta: {
        fontSize: '12px',
        color: '#666',
    },
    statusBadge: {
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
    },
    usersGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
    },
    userCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '15px',
        border: '1px solid #e9ecef',
    },
    userHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '10px',
    },
    userAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #e9ecef',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        margin: '0 0 2px 0',
        fontSize: '16px',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    adminBadge: {
        backgroundColor: '#ffc107',
        color: '#333',
        padding: '2px 6px',
        borderRadius: '10px',
        fontSize: '10px',
        fontWeight: 'bold',
    },
    userEmail: {
        margin: 0,
        fontSize: '14px',
        color: '#666',
    },
    userStatus: {
        display: 'flex',
        alignItems: 'center',
    },
    statusDot: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
    },
    userDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        marginBottom: '10px',
    },
    userDetail: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: '#666',
    },
    userActions: {
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end',
    },
    userActionButton: {
        padding: '6px',
        border: 'none',
        backgroundColor: 'white',
        color: '#666',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
    },
    quickActions: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px',
    },
    quickAction: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        textDecoration: 'none',
        color: '#333',
        border: '1px solid #e9ecef',
        transition: 'all 0.2s',
    },
    productsSummary: {
        marginTop: '20px',
    },
    viewLink: {
        color: '#667eea',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 'bold',
    },
    settingItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 0',
        borderBottom: '1px solid #e9ecef',
        gap: '20px',
    },
    settingInfo: {
        flex: 1,
    },
    settingButton: {
        backgroundColor: '#667eea',
        color: 'white',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '5px',
        fontSize: '14px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
    loadingBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        color: '#666',
        gap: '20px',
    },
    errorBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        color: '#dc3545',
        gap: '15px',
    },
    retryButton: {
        backgroundColor: '#667eea',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        fontSize: '14px',
        cursor: 'pointer',
    },
    // Location styles
    locationsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
    },
    locationCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '15px',
        border: '1px solid #e9ecef',
        transition: 'all 0.2s',
    },
    locationHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '10px',
    },
    locationIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #e9ecef',
    },
    locationInfo: {
        flex: 1,
    },
    locationName: {
        margin: '0 0 4px 0',
        fontSize: '16px',
        color: '#333',
        fontWeight: '600',
    },
    locationDescription: {
        margin: 0,
        fontSize: '14px',
        color: '#666',
        lineHeight: '1.4',
    },
    locationMeta: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        marginBottom: '12px',
    },
    locationDetail: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: '#666',
    },
    locationActions: {
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end',
    },
    locationActionButton: {
        padding: '6px',
        border: 'none',
        backgroundColor: 'white',
        color: '#666',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        color: '#666',
        gap: '15px',
    },
    // Modal styles
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px',
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    },
    modalHeader: {
        padding: '20px',
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalCloseButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '5px',
        borderRadius: '50%',
        color: '#666',
        fontSize: '16px',
        fontWeight: 'bold',
    },
    modalBody: {
        padding: '20px',
    },
    modalFooter: {
        padding: '20px',
        borderTop: '1px solid #e9ecef',
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
    },
    inputGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: '500',
        color: '#333',
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '14px',
        fontFamily: 'inherit',
    },
    textarea: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '14px',
        fontFamily: 'inherit',
        resize: 'vertical',
    },
    primaryButton: {
        backgroundColor: '#28a745',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    secondaryButton: {
        backgroundColor: '#6c757d',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
};

export default AdminPanelPage; 