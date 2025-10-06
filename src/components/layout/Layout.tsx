import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Palette, Home, Grid, Search, Upload, Sparkles, Zap, Menu, X, User, LogOut, Settings, Image } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Home, color: 'from-pink-400 to-violet-400' },
    { name: 'Gallery', href: '/gallery', icon: Grid, color: 'from-cyan-400 to-blue-400' },
    { name: 'Search', href: '/search', icon: Search, color: 'from-green-400 to-emerald-400' },
    { name: 'Upload', href: '/upload', icon: Upload, color: 'from-orange-400 to-red-400' }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-15 animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-60 h-60 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-15 animate-bounce"></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-15 animate-pulse"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-40 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/40 backdrop-blur-xl border-b border-white/20' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <Palette className="h-10 w-10 text-white relative z-10 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    NisArt
                  </span>
                  <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                </div>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <nav className="flex space-x-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group relative flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                        isActive(item.href)
                          ? 'text-white shadow-lg scale-105'
                          : 'text-white hover:text-white hover:scale-105'
                      }`}
                    >
                      {/* Gradient background for active/hover */}
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                        isActive(item.href) ? 'opacity-100 shadow-lg' : ''
                      }`}></div>
                      
                      {/* Glow effect */}
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${item.color} blur-lg opacity-0 group-hover:opacity-50 transition-all duration-300 ${
                        isActive(item.href) ? 'opacity-30' : ''
                      }`}></div>
                      
                      <Icon className="h-5 w-5 relative z-10 text-white drop-shadow-lg" />
                      <span className="relative z-10 text-white drop-shadow-lg">{item.name}</span>
                      
                      {/* Active indicator */}
                      {isActive(item.href) && (
                        <Zap className="h-4 w-4 relative z-10 text-yellow-300 animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    {user.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full border-2 border-purple-500"
                      />
                    ) : (
                      <User className="w-8 h-8 text-white bg-purple-600 rounded-full p-1" />
                    )}
                    <span className="text-white text-sm font-medium">{user.name}</span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-12 w-48 bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl py-2">
                      <div className="px-4 py-2 border-b border-white/10">
                        <p className="text-white font-medium text-sm">{user.name}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                      
                      <Link
                        to={user.profile_completed ? "/profile/edit" : "/profile/setup"}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span className="text-white text-sm">
                          {user.profile_completed ? "Edit Profile" : "Complete Profile"}
                        </span>
                      </Link>
                      
                      {user.profile_completed && (
                        <Link
                          to="/profile/images"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Image className="w-4 h-4 text-gray-400" />
                          <span className="text-white text-sm">My Images</span>
                        </Link>
                      )}
                      
                      <button
                        onClick={logout}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4 text-gray-400" />
                        <span className="text-white text-sm">Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="group relative flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 text-white hover:text-white hover:scale-105"
                >
                  {/* Gradient background for hover */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-lg opacity-0 group-hover:opacity-50 transition-all duration-300"></div>
                  
                  <User className="w-5 h-5 relative z-10 text-white drop-shadow-lg" />
                  <span className="relative z-10 text-white drop-shadow-lg">Sign In</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative p-2 rounded-full text-white hover:text-pink-300 transition-colors"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full opacity-20 hover:opacity-40 transition-opacity"></div>
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 relative z-10" />
                ) : (
                  <Menu className="h-6 w-6 relative z-10" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-20 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10">
            <div className="px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group relative flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold transition-all duration-300 ${
                      isActive(item.href)
                        ? 'text-white scale-105'
                        : 'text-white hover:text-white'
                    }`}
                  >
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                      isActive(item.href) ? 'opacity-100' : ''
                    }`}></div>
                    
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} blur-lg opacity-0 group-hover:opacity-30 transition-all duration-300 ${
                      isActive(item.href) ? 'opacity-20' : ''
                    }`}></div>
                    
                    <Icon className="h-6 w-6 relative z-10 text-white drop-shadow-lg" />
                    <span className="relative z-10 text-white drop-shadow-lg">{item.name}</span>
                    
                    {isActive(item.href) && (
                      <Zap className="h-4 w-4 relative z-10 text-yellow-300 animate-pulse ml-auto" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-sm border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-300">
            <p>&copy; 2024 NisArt Gallery. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};