import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrophy } from 'react-icons/fa';

const DashboardNavbar = () => {
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileAnimated, setIsProfileAnimated] = useState(false);
  const [isLeaderboardAnimated, setIsLeaderboardAnimated] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-menu-container')) {
        setIsProfileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  // Animasi sinkron untuk profile dan leaderboard
  useEffect(() => {
    const animationInterval = setInterval(() => {
      // Mulai animasi profile
      setIsProfileAnimated(true);
      setTimeout(() => setIsProfileAnimated(false), 1000);
      
      // Mulai animasi leaderboard dengan delay kecil untuk efek berurutan
      setTimeout(() => {
        setIsLeaderboardAnimated(true);
        setTimeout(() => setIsLeaderboardAnimated(false), 1000);
      }, 200);
    }, 8000);
    
    return () => clearInterval(animationInterval);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await axios.post('/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      localStorage.removeItem('token');
      sessionStorage.removeItem('userData');
      
      setShowLogoutDialog(false);
      setShowSuccessNotification(true);
      
      // Tampilkan notifikasi sukses selama 2 detik sebelum redirect
      setTimeout(() => {
        setShowSuccessNotification(false);
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('token');
      sessionStorage.removeItem('userData');
      
      setShowLogoutDialog(false);
      setShowSuccessNotification(true);
      
      setTimeout(() => {
        setShowSuccessNotification(false);
        navigate('/login');
      }, 2000);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const showLogoutConfirmation = () => {
    setIsProfileMenuOpen(false);
    setShowLogoutDialog(true);
  };

  const navigateToLeaderboard = () => {
    console.log('Leaderboard button clicked, isLoggedIn:', isLoggedIn);
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/leaderboard');
  };

  const handleProfileHover = (isHovering) => {
    setIsProfileAnimated(isHovering);
  };

  const handleLeaderboardHover = (isHovering) => {
    setIsLeaderboardAnimated(isHovering);
  };

  return (
    <>
      {/* Backdrop blur overlay */}
      {(showLogoutDialog || showSuccessNotification) && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"></div>
      )}
      
      <div className="bg-[#201E43] w-full shadow-md py-3 mb-5">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src="/logo.png" 
                  alt="TIFPoint Logo" 
                  className="h-10 w-10 object-contain transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shiny-effect"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-lg text-white">
                  TIFPoint
                </span>
                <span className="text-xs text-[#508C9B] hidden sm:block">Integrated Point System</span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="leaderboard-menu-container">
              <button 
                type="button" 
                className={`flex items-center gap-2 text-white bg-[#201E43]/70 hover:bg-[#201E43] focus:ring-2 focus:ring-white/30 font-medium rounded-lg text-sm px-4 py-2 transition-all duration-300 ${isLeaderboardAnimated ? 'leaderboard-pulse' : ''}`}
                onClick={navigateToLeaderboard}
                onMouseEnter={() => handleLeaderboardHover(true)}
                onMouseLeave={() => handleLeaderboardHover(false)}
                style={{ pointerEvents: 'auto', zIndex: 50 }}
              >
                <FaTrophy className={`w-5 h-5 transition-transform duration-500 ${isLeaderboardAnimated ? 'leaderboard-icon-spin' : ''}`} />
                <span className="hidden md:block">Leaderboard</span>
              </button>
            </div>

            <div className="relative profile-menu-container">
              <button 
                type="button" 
                className={`flex items-center gap-2 text-white bg-[#201E43]/70 hover:bg-[#201E43] focus:ring-2 focus:ring-white/30 font-medium rounded-lg text-sm px-4 py-2 transition-all duration-300 ${isProfileAnimated ? 'profile-pulse' : ''}`}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                onMouseEnter={() => handleProfileHover(true)}
                onMouseLeave={() => handleProfileHover(false)}
                style={{ pointerEvents: 'auto', zIndex: 50 }}
              >
                <span className="hidden md:block">Profil Saya</span>
                <svg className={`w-5 h-5 transition-transform duration-500 ${isProfileAnimated ? 'profile-icon-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <svg className={`w-2.5 h-2.5 transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                </svg>
              </button>
              
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 animate-dropdown">
                  <div className="py-2">
                    <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Lihat Profil</Link>
                    <Link to="/settings" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Pengaturan</Link>
                    <hr className="my-1" />
                    <button 
                      onClick={showLogoutConfirmation}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog Konfirmasi Logout */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-dialog-appear">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Konfirmasi Logout
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Apakah Anda yakin ingin keluar dari akun Anda? Anda perlu login kembali untuk mengakses dashboard.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                <button
                  onClick={() => setShowLogoutDialog(false)}
                  className="w-full sm:w-1/2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full sm:w-1/2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoggingOut ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Logout...
                    </div>
                  ) : (
                    'Ya, Logout'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifikasi Sukses Logout */}
      {showSuccessNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-dialog-appear">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Logout Berhasil
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Anda telah berhasil keluar dari akun. Mengarahkan ke halaman login...
                </p>
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx="true">{`
        .shiny-effect {
          opacity: 0;
          transform: translateX(-100%);
          animation: shine 3s infinite;
        }
        
        @keyframes shine {
          10% {
            opacity: 0;
            transform: translateX(-100%);
          }
          20% {
            opacity: 0.5;
          }
          30% {
            opacity: 0;
            transform: translateX(100%);
          }
          100% {
            opacity: 0;
            transform: translateX(100%);
          }
        }

        .profile-pulse,
        .leaderboard-pulse {
          box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
          animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
          }
        }
        
        .profile-icon-spin,
        .leaderboard-icon-spin {
          animation: spin 1s ease-in-out;
        }
        
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        .animate-dropdown {
          animation: dropdown 0.3s ease-out;
        }
        
        @keyframes dropdown {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-dialog-appear {
          animation: dialogAppear 0.3s ease-out;
        }
        
        @keyframes dialogAppear {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .leaderboard-menu-container button,
        .profile-menu-container button {
          pointer-events: auto;
          z-index: 50;
        }
      `}</style>
    </>
  );
};

export default DashboardNavbar;