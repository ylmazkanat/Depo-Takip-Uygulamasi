import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Çıkış işlemini gerçekleştir
        const performLogout = () => {
            // localStorage'dan tüm auth verilerini temizle
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Login sayfasına yönlendir
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        };

        performLogout();
    }, [navigate]);

    return (
        <div style={styles.container}>
            <div style={styles.logoutBox}>
                <div style={styles.icon}>👋</div>
                <h1 style={styles.title}>Çıkış Yapılıyor...</h1>
                <p style={styles.message}>
                    Güvenli bir şekilde çıkış yapıldı. Login sayfasına yönlendiriliyorsunuz.
                </p>
                <div style={styles.loader}>
                    <div style={styles.dot}></div>
                    <div style={styles.dot}></div>
                    <div style={styles.dot}></div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
    },
    logoutBox: {
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '50px',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        width: '100%',
        maxWidth: '400px',
    },
    icon: {
        fontSize: '64px',
        marginBottom: '20px',
        display: 'block',
    },
    title: {
        color: '#333',
        fontSize: '28px',
        marginBottom: '15px',
    },
    message: {
        color: '#666',
        fontSize: '16px',
        lineHeight: '1.6',
        marginBottom: '30px',
    },
    loader: {
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
    },
    dot: {
        width: '12px',
        height: '12px',
        backgroundColor: '#667eea',
        borderRadius: '50%',
        animation: 'bounce 1.4s ease-in-out infinite both',
    },
};

// CSS animation için style ekleme
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = `
    @keyframes bounce {
        0%, 80%, 100% { 
            transform: scale(0);
        } 
        40% { 
            transform: scale(1.0);
        }
    }
    
    .dot:nth-child(1) { animation-delay: -0.32s; }
    .dot:nth-child(2) { animation-delay: -0.16s; }
    .dot:nth-child(3) { animation-delay: 0s; }
`;
document.head.appendChild(styleSheet);

export default LogoutPage; 