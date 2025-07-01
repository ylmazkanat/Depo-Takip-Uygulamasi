import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../config/api';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Zaten giriş yapılmışsa ana sayfaya yönlendir
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/');
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Frontend validasyonları
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Tüm alanları doldurunuz');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Şifreler eşleşmiyor');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır');
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.register(formData);
            
            if (response.data.success) {
                // Token ve kullanıcı bilgilerini localStorage'a kaydet
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Ana sayfaya yönlendir
                navigate('/');
            }
        } catch (error) {
            // Register hatası
            setError(
                error.response?.data?.message || 
                'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h1 className="register-title">Kayıt Ol</h1>
                <p className="register-subtitle">Depo Yönetim Sistemi'ne hoş geldiniz</p>
                
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label className="form-label">Ad Soyad:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="input"
                            placeholder="Adınız ve soyadınız"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="input"
                            placeholder="email@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Şifre:</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="input"
                            placeholder="En az 6 karakter"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Şifre Tekrar:</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="input"
                            placeholder="Şifrenizi tekrar girin"
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="button button-primary"
                    >
                        {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                    </button>
                </form>

                <div className="register-login-link">
                    <p>Zaten hesabınız var mı? <Link to="/login" className="register-link">Giriş Yap</Link></p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage; 