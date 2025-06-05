import { useState, useEffect } from 'react';

const DashboardNavbar = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileAnimated, setIsProfileAnimated] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen && !event.target.closest('.profile-menu-container')) {
        setIsProfileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);
  
  // Trigger profile animation periodically
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setIsProfileAnimated(true);
      setTimeout(() => setIsProfileAnimated(false), 1000);
    }, 8000);
    
    return () => clearInterval(animationInterval);
  }, []);

  // Auto-hide success message
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    
    try {
      // Call your logout API endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear any stored tokens or user data
      localStorage.removeItem('token');
      sessionStorage.removeItem('userData');
      
      // Show success message
      setShowLogoutConfirm(false);
      setShowSuccessMessage(true);
      setIsLoggingOut(false);
      
      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  // Logout Confirmation Modal
  const LogoutConfirmationModal = () => {
    if (!showLogoutConfirm) return null;

    return (
      <div className="fixed inset-0 bg-gray-800/60 flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-sm w-full animate-scale-in">
          <div className="text-center">
            {/* Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-6">
              <svg className="h-8 w-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Konfirmasi Logout
            </h3>
            
            {/* Message */}
            <p className="text-gray-600 mb-8 leading-relaxed">
              Apakah Anda yakin ingin keluar dari sistem?
            </p>
            
            {/* Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleLogoutCancel}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold"
                disabled={isLoggingOut}
              >
                Batal
              </button>
              <button
                onClick={handleLogoutConfirm}
                disabled={isLoggingOut}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoggingOut ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Ya, Logout</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Success Message Component
  const SuccessMessage = () => {
    if (!showSuccessMessage) return null;

    return (
      <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-sm w-full animate-scale-in">
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Berhasil!
            </h3>
            
            {/* Message */}
            <p className="text-gray-600 leading-relaxed">
              Berhasil logout! Anda akan dialihkan...
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-[#201E43] w-full shadow-md py-3 mb-5">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center">
            <a href="/dashboard" className="flex items-center space-x-2 group">
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
            </a>
          </div>
          
          <div className="flex items-center">
            <div className="relative profile-menu-container">
              <button 
                type="button" 
                className={`flex items-center gap-2 text-white bg-[#201E43]/70 hover:bg-[#201E43] focus:ring-2 focus:ring-white/30 font-medium rounded-lg text-sm px-4 py-2 transition-all duration-300 ${isProfileAnimated ? 'profile-pulse' : ''}`}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                onMouseOver={() => setIsProfileAnimated(true)}
                onMouseOut={() => setIsProfileAnimated(false)}
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
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Lihat Profil</a>
                    <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Pengaturan</a>
                    <hr className="my-1" />
                    <button 
                      onClick={handleLogout}
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

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal />

      {/* Success Message */}
      <SuccessMessage />
      
      <style jsx>{`
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

        .profile-pulse {
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
        
        .profile-icon-spin {
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

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }

        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.4s ease-out;
        }

        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(100%);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default DashboardNavbar;