import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isLoggedIn = false;
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (isAuthMenuOpen) setIsAuthMenuOpen(false);
  };

  const toggleAuthMenu = (e) => {
    e.stopPropagation();
    setIsAuthMenuOpen(!isAuthMenuOpen);
  };

  useEffect(() => {
    const closeAuthMenu = () => {
      if (isAuthMenuOpen) setIsAuthMenuOpen(false);
    };

    document.addEventListener('click', closeAuthMenu);
    return () => document.removeEventListener('click', closeAuthMenu);
  }, [isAuthMenuOpen]);

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-lg py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link 
          to="/" 
          className="flex items-center space-x-2 group"
        >
          <div className="relative overflow-hidden rounded-lg">
            <img 
              src="/logo.png" 
              alt="TIFPoint Logo" 
              className="h-10 w-10 object-contain transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shiny-effect"></div>
          </div>
          <div className="flex flex-col">
            <span className={`font-bold tracking-tight text-lg transition-colors duration-300 ${
              scrolled ? 'text-[#134B70]' : 'text-[#201E43]'
            }`}>
              TIFPoint
            </span>
            <span className="text-xs text-[#508C9B] hidden sm:block">Integrated Point System</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className={`font-medium transition-all duration-300 relative ${
              location.pathname === '/' 
                ? 'text-[#201E43]' 
                : scrolled ? 'text-[#134B70] hover:text-[#201E43]' : 'text-[#134B70] hover:text-[#201E43]'
            }`}
          >
            <span>Beranda</span>
            {location.pathname === '/' && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#201E43] rounded-full"></span>
            )}
          </Link>

          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={toggleAuthMenu}
              className={`flex items-center space-x-1 px-3 py-2 rounded-full transition-all duration-300 ${
                isAuthMenuOpen || ['/login', '/register'].includes(location.pathname)
                  ? 'bg-[#201E43] text-white'
                  : scrolled 
                    ? 'bg-[#134B70]/10 text-[#134B70] hover:bg-[#134B70]/20' 
                    : 'bg-white/90 text-[#134B70] hover:bg-white shadow-md'
              }`}
            >
              <FaUserCircle className="text-xl" />
              <span className="text-sm font-medium hidden sm:inline">Akun</span>
              <span 
                className={`transition-transform duration-300 ${isAuthMenuOpen ? 'rotate-180' : ''}`}
              >
                ▾
              </span>
            </button>

            {isAuthMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden origin-top-right animate-dropdown">
                <div className="py-1">
                  <Link
                    to="/login"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-[#134B70]/10 transition-colors duration-200"
                    onClick={() => setIsAuthMenuOpen(false)}
                  >
                    <span className="w-8 text-[#134B70]">↪</span>
                    <span>Login</span>
                  </Link>
                  <div className="border-b border-gray-200 my-1"></div>
                  <Link
                    to="/register"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-[#134B70]/10 transition-colors duration-200"
                    onClick={() => setIsAuthMenuOpen(false)}
                  >
                    <span className="w-8 text-[#134B70]">✎</span>
                    <span>Register</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:hidden">
          <button 
            onClick={toggleMenu} 
            className={`p-2 rounded-full transition-colors duration-300 ${
              scrolled 
                ? 'text-[#134B70] bg-[#134B70]/10 hover:bg-[#134B70]/20' 
                : 'text-[#134B70] bg-white/80 hover:bg-white'
            }`}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md shadow-lg mt-2 py-4 px-6 animate-slideDown">
          <div className="flex flex-col space-y-4">
            <Link
              to="/"
              className={`py-2 px-4 rounded-lg font-medium transition-colors duration-300 ${
                location.pathname === '/' 
                  ? 'bg-[#134B70]/10 text-[#201E43]' 
                  : 'text-[#134B70] hover:bg-[#134B70]/10'
              }`}
              onClick={toggleMenu}
            >
              Beranda
            </Link>
            <div className="border-t border-gray-200 my-2"></div>
            <Link
              to="/login"
              className="flex items-center space-x-2 py-2 px-4 rounded-lg font-medium text-[#134B70] hover:bg-[#134B70]/10 transition-colors duration-300"
              onClick={toggleMenu}
            >
              <span className="text-[#134B70]">↪</span>
              <span>Login</span>
            </Link>
            <Link
              to="/register"
              className="flex items-center space-x-2 py-2 px-4 rounded-lg font-medium text-[#134B70] hover:bg-[#134B70]/10 transition-colors duration-300"
              onClick={toggleMenu}
            >
              <span className="text-[#134B70]">✎</span>
              <span>Register</span>
            </Link>
          </div>
        </div>
      )}

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
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes dropdown {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
        
        .animate-dropdown {
          animation: dropdown 0.2s ease-out forwards;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;