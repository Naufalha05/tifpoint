import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrophy } from 'react-icons/fa';

const DashboardNavbar = () => {
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileAnimated, setIsProfileAnimated] = useState(false);
  const [isLeaderboardAnimated, setIsLeaderboardAnimated] = useState(false);
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
    try {
      await axios.post('/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      localStorage.removeItem('token');
      sessionStorage.removeItem('userData');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('token');
      sessionStorage.removeItem('userData');
      navigate('/login');
    }
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

        .leaderboard-menu-container button,
        .profile-menu-container button {
          pointer-events: auto;
          z-index: 50;
        }
      `}</style>
    </div>
  );
};

export default DashboardNavbar;