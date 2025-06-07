import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Sending login request with:', { email, password });
      
      const response = await fetch('https://tifpoint-production.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login gagal');
      }
      
      console.log('Login successful:', data);
      
      localStorage.setItem('token', data.token);
      
      if (data.user) {
        localStorage.setItem('userData', JSON.stringify({
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          name: data.user.name,
          nim: data.user.nim,
          role: data.user.role
        }));
        
        if (data.user.role && data.user.role.toUpperCase() === 'ADMIN') {
          console.log('Admin user detected, redirecting to admin dashboard');
          navigate('/admin-dashboard');
        } else {
          console.log('Regular user detected, redirecting to user dashboard');
          navigate('/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#EEEEEE] to-[#508C9B] overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-[10%] left-[5%] w-20 h-20 rounded-full bg-[#201E43]/20"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-[70%] left-[10%] w-10 h-10 rounded-full bg-[#201E43]/20"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute top-[30%] left-[85%] w-16 h-16 rounded-full bg-[#201E43]/20"
          animate={{ y: [0, -25, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
        <motion.div
          className="absolute top-[20%] left-[80%] w-12 h-12 bg-[#201E43]/20 rotate-45"
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        />
      </div>

      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#201E43_1px,transparent_1px)] bg-[length:30px_30px]" />

      <motion.div 
        className="relative z-10 max-w-md w-full bg-[#201E43] rounded-lg shadow-xl p-6 sm:p-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isPageLoaded ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5 }}
      >
        <motion.h2 
          className="text-center text-xl sm:text-3xl font-extrabold text-[#EEEEEE] poppins-font"
          initial={{ opacity: 0, y: -20 }}
          animate={isPageLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Login
        </motion.h2>
        <motion.p 
          className="mt-1 sm:mt-2 text-center text-xs sm:text-base text-[#508C9B] poppins-font"
          initial={{ opacity: 0, y: -10 }}
          animate={isPageLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Masuk untuk melanjutkan
        </motion.p>
        
        {error && (
          <motion.div 
            className="mt-2 sm:mt-4 p-2 sm:p-3 bg-red-100 text-red-700 rounded-md text-center poppins-font text-xs sm:text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="mt-4 sm:mt-6 space-y-3 sm:space-y-4"
          initial={{ opacity: 0 }}
          animate={isPageLoaded ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="space-y-3 sm:space-y-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={isPageLoaded ? { x: 0, opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <label htmlFor="email" className="block text-xs sm:text-sm text-[#508C9B] poppins-font">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Alamat Email Students"
                className="mt-1 w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#134B70] bg-[#EEEEEE] text-[#134B70] rounded-md focus:outline-none focus:ring-2 focus:ring-[#201E43] focus:border-[#201E43] poppins-font text-xs sm:text-base"
                required
              />
            </motion.div>
            <motion.div 
              className="relative"
              initial={{ x: -20, opacity: 0 }}
              animate={isPageLoaded ? { x: 0, opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <label htmlFor="password" className="block text-xs sm:text-sm text-[#508C9B] poppins-font">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kata Sandi"
                  className="mt-1 w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#134B70] bg-[#EEEEEE] text-[#134B70] rounded-md focus:outline-none focus:ring-2 focus:ring-[#201E43] focus:border-[#201E43] poppins-font text-xs sm:text-base"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#134B70] hover:text-[#201E43] focus:outline-none text-lg"
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="flex items-center justify-between mt-2 sm:mt-4"
            initial={{ opacity: 0 }}
            animate={isPageLoaded ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                className="h-3 sm:h-4 w-3 sm:w-4 text-[#201E43] focus:ring-[#201E43] border-[#134B70] rounded"
              />
              <label htmlFor="remember-me" className="ml-1 sm:ml-2 block text-xs sm:text-sm text-[#508C9B] poppins-font">
                Ingat saya
              </label>
            </div>
            <div className="text-xs sm:text-sm">
              <Link to="/forgot-password" className="font-medium text-[#EEEEEE] hover:text-[#508C9B] transition poppins-font">
                Lupa kata sandi?
              </Link>
            </div>
          </motion.div>

          <motion.div 
            className="mt-4 sm:mt-6"
            initial={{ y: 20, opacity: 0 }}
            animate={isPageLoaded ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 sm:py-3 px-3 sm:px-4 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-[#3A59D1] hover:bg-[#4A6FE3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A59D1] transition poppins-font disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isLoading ? (
                <div className="loader">
                  <p className="loader-text">Loading...</p>
                  <span className="load"></span>
                </div>
              ) : (
                "Masuk"
              )}
            </button>
          </motion.div>
        </motion.form>
        <motion.div 
          className="mt-2 sm:mt-4 text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={isPageLoaded ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <span className="text-[#EEEEEE] poppins-font text-xs sm:text-base">Belum punya akun? </span>
          <Link
            to="/register"
            className="font-bold text-[#3A59D1] hover:text-[#4A6FE3] transition poppins-font underline text-xs sm:text-base"
          >
            Daftar
          </Link>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden">
        <svg className="w-full h-24 md:h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,105.94,133.81,113.48,198.11,104.28c67.53-9.61,126.99-39.06,189.23-42.25A714.92,714.92,0,0,1,321.39,56.44Z"
            fill="#201E43"
            fillOpacity="0.2"
          />
        </svg>
      </div>
    </div>
  );
};

export default Login;