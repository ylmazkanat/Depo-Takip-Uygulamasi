import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import LogoutPage from './pages/LogoutPage';
import RegisterPage from './pages/RegisterPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductAddPage from './pages/ProductAddPage';
import AdminPanelPage from './pages/AdminPanelPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    // Basit admin kontrolü - gerçek uygulamada token'dan rol bilgisi alınır
    // Şimdilik bu şekilde bırakıyoruz, gerçek kontrol component içinde yapılıyor
    return children;
};

// Error Boundary Component
const ErrorPage = () => {
    return (
        <div className="error-page">
            <h1 className="error-code">404</h1>
            <h2 className="error-title">Sayfa Bulunamadı</h2>
            <p className="error-message">
                Aradığınız sayfa mevcut değil veya taşınmış olabilir.
            </p>
            <div className="error-actions">
                <a href="/" className="button button-primary">
                    Ana Sayfaya Dön
                </a>
                <a href="/products" className="button button-success">
                    Ürünleri Görüntüle
                </a>
            </div>
        </div>
    );
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: (
                    <ProtectedRoute>
                        <HomePage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'login',
                element: <LoginPage />,
            },
            {
                path: 'register',
                element: <RegisterPage />,
            },
            {
                path: 'logout',
                element: <LogoutPage />,
            },
            {
                path: 'products',
                element: (
                    <ProtectedRoute>
                        <ProductListPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'products/add',
                element: (
                    <ProtectedRoute>
                        <ProductAddPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'products/:id',
                element: (
                    <ProtectedRoute>
                        <ProductDetailPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'products/:id/edit',
                element: (
                    <ProtectedRoute>
                        <ProductAddPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'admin',
                element: (
                    <AdminRoute>
                        <AdminPanelPage />
                    </AdminRoute>
                ),
            },
            {
                path: '*',
                element: <ErrorPage />,
            },
        ],
    },
], {
    future: {
        v7_startTransition: true,
    },
});

export default router; 