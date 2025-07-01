import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../config/api';
import { LogIn, Mail, Lock, Eye, EyeOff, User, UserCheck, Package } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const handleDemoLogin = (email, password) => {
        setFormData({
            email: email,
            password: password
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login(formData);
            
            if (response.data.success) {
                localStorage.setItem('authToken', response.data.token);
                
                if (response.data.user) {
                    localStorage.setItem('currentUser', JSON.stringify(response.data.user));
                }
                
                navigate('/');
            }
        } catch (error) {
            // Giriş hatası
            setError(
                error.response?.data?.message || 
                'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '2rem 1rem'
        }}>
            <div className="form-container" style={{ maxWidth: '450px', width: '100%' }}>
                {/* Header */}
                <div className="text-center mb-6">
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        borderRadius: '50%',
                        marginBottom: '1.5rem'
                    }}>
                        <Package size={40} style={{ color: '#667eea' }} />
                    </div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Giriş Yap</h1>
                    <p style={{ color: '#718096', margin: 0 }}>
                        Depo yönetim sistemine hoş geldiniz
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">E-posta</label>
                        <div className="relative">
                            <div className="absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                                <Mail size={20} style={{ color: '#a0aec0' }} />
                            </div>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="ornek@email.com"
                                autoComplete="email"
                                style={{ paddingLeft: '3rem' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Şifre</label>
                        <div className="relative">
                            <div className="absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                                <Lock size={20} style={{ color: '#a0aec0' }} />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Şifrenizi girin"
                                autoComplete="current-password"
                                style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute"
                                style={{ 
                                    right: '1rem', 
                                    top: '50%', 
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {showPassword ? 
                                    <EyeOff size={20} style={{ color: '#a0aec0' }} /> : 
                                    <Eye size={20} style={{ color: '#a0aec0' }} />
                                }
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="button button-primary w-full"
                        style={{ 
                            marginTop: '1.5rem',
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? (
                            <div className="spinner" style={{ width: '20px', height: '20px' }} />
                        ) : (
                            <>
                                <LogIn size={20} />
                                Giriş Yap
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
                        Hesabınız yok mu?{' '}
                        <Link to="/register" style={{ color: '#667eea', fontWeight: '600' }}>
                            Kayıt olun
                        </Link>
                    </p>
                    
                    {/* Demo Accounts */}
                    <div style={{
                        background: 'rgba(102, 126, 234, 0.05)',
                        padding: '1.5rem',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                        <h4 style={{ 
                            color: '#4a5568', 
                            marginBottom: '1rem',
                            fontSize: '0.95rem',
                            fontWeight: '600'
                        }}>
                            Demo Hesaplar:
                        </h4>
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '0.75rem',
                            fontSize: '0.875rem'
                        }}>
                            {/* Admin Demo Button */}
                            <button
                                type="button"
                                onClick={() => handleDemoLogin('admin@example.com', 'test1234')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    width: '100%',
                                    transition: 'all 0.2s ease',
                                    fontSize: '0.875rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.15)';
                                    e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                                    e.target.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <UserCheck size={16} style={{ color: '#dc2626' }} />
                                    <span style={{ color: '#dc2626', fontWeight: '600' }}>Admin</span>
                                </div>
                                <span style={{ color: '#718096' }}>admin@example.com</span>
                            </button>

                            {/* User Demo Button */}
                            <button
                                type="button"
                                onClick={() => handleDemoLogin('test@example.com', 'test1234')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    border: '1px solid rgba(34, 197, 94, 0.2)',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    width: '100%',
                                    transition: 'all 0.2s ease',
                                    fontSize: '0.875rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(34, 197, 94, 0.15)';
                                    e.target.style.borderColor = 'rgba(34, 197, 94, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(34, 197, 94, 0.1)';
                                    e.target.style.borderColor = 'rgba(34, 197, 94, 0.2)';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <User size={16} style={{ color: '#16a34a' }} />
                                    <span style={{ color: '#16a34a', fontWeight: '600' }}>Kullanıcı</span>
                                </div>
                                <span style={{ color: '#718096' }}>test@example.com</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage; 