import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { HomePage } from './components/pages/HomePage';
import { LoginPage } from './components/pages/LoginPage';
import { ProfileSetupPage } from './components/pages/ProfileSetupPage';
import { GalleryPage } from './components/pages/GalleryPage';
import { ImageDetailPage } from './components/pages/ImageDetailPage';
import { SearchPage } from './components/pages/SearchPage';
import { UploadPage } from './components/pages/UploadPage';
import { MyImagesPage } from './components/pages/MyImagesPage';
import { Toaster } from './components/ui/sonner';
import './App.css';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Routes with layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/image/:id" element={<ImageDetailPage />} />
                <Route path="/search" element={<SearchPage />} />
                
                {/* Protected routes - require authentication */}
                <Route path="/profile/setup" element={
                  <ProtectedRoute>
                    <ProfileSetupPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile/edit" element={
                  <ProtectedRoute>
                    <ProfileSetupPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile/images" element={
                  <ProtectedRoute requireCompleteProfile>
                    <MyImagesPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/upload" element={
                  <ProtectedRoute requireCompleteProfile>
                    <UploadPage />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-white mb-4">Page Not Found</h1>
                    <p className="text-gray-300">The page you're looking for doesn't exist.</p>
                  </div>
                } />
              </Routes>
            </Layout>
          } />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  </HelmetProvider>
  );
}

export default App;
