import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState('request'); // 'request' or 'reset'
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setIsPageLoaded(true);
    // Check if token is provided in URL (e.g., from email link)
    const tokenFromUrl = searchParams.get('token');
    const emailFromUrl = searchParams.get('email');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      if (emailFromUrl) {
        setEmail(emailFromUrl);
      }
      setStep('reset');
    }
  }, [searchParams]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format email tidak valid');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://tifpoint-production.up.railway.app/api/auth/forgot-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengirim permintaan reset');
      }

      // Use the message from API response
      setSuccess(data.message || 'Jika email Anda terdaftar, Anda akan menerima link reset password');
      
      // Don't automatically switch to reset step since user needs to click email link
      // setStep('reset');
    } catch (err) {
      console.error('Request reset error:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        setError(err.message || 'Gagal mengirim permintaan reset');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate password match
    if (newPassword !== confirmPassword) {
      setError('Kata sandi baru dan konfirmasi tidak cocok');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (newPassword.length < 6) {
      setError('Kata sandi minimal 6 karakter');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://tifpoint-production.up.railway.app/api/auth/reset-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email, 
          token, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mereset kata sandi');
      }

      setSuccess('Kata sandi berhasil direset. Anda akan diarahkan ke halaman login.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        setError(err.message || 'Gagal mereset kata sandi');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleBackToRequest = () => {
    setStep('request');
    setToken('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#EEEEEE] to-[#508C9B] overflow-hidden flex items-center justify-center p-4">
      {/* Background animations */}
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
          {step === 'request' ? 'Lupa Kata Sandi' : 'Reset Kata Sandi'}
        </motion.h2>
        <motion.p 
          className="mt-1 sm:mt-2 text-center text-xs sm:text-base text-[#508C9B] poppins-font"
          initial={{ opacity: 0, y: -10 }}
          animate={isPageLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {step === 'request' 
            ? 'Masukkan email untuk menerima link reset password' 
            : 'Masukkan kata sandi baru Anda'
          }
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
        
        {success && (
          <motion.div 
            className="mt-2 sm:mt-4 p-2 sm:p-3 bg-green-100 text-green-700 rounded-md text-center poppins-font text-xs sm:text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {success}
          </motion.div>
        )}
        
        <motion.form 
          onSubmit={step === 'request' ? handleRequestReset : handleResetPassword} 
          className="mt-4 sm:mt-6 space-y-3 sm:space-y-4"
          initial={{ opacity: 0 }}
          animate={isPageLoaded ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="space-y-3 sm:space-y-4">
            {step === 'request' && (
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
            )}

            {step === 'reset' && (
              <>
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
                  <label htmlFor="new-password" className="block text-xs sm:text-sm text-[#508C9B] poppins-font">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Kata Sandi Baru (minimal 6 karakter)"
                      className="mt-1 w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#134B70] bg-[#EEEEEE] text-[#134B70] rounded-md focus:outline-none focus:ring-2 focus:ring-[#201E43] focus:border-[#201E43] poppins-font text-xs sm:text-base"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={toggleNewPasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#134B70] hover:text-[#201E43] focus:outline-none text-lg"
                    >
                      {showNewPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                </motion.div>

                <motion.div 
                  className="relative"
                  initial={{ x: -20, opacity: 0 }}
                  animate={isPageLoaded ? { x: 0, opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <label htmlFor="confirm-password" className="block text-xs sm:text-sm text-[#508C9B] poppins-font">
                    Konfirmasi Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Konfirmasi Kata Sandi"
                      className="mt-1 w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#134B70] bg-[#EEEEEE] text-[#134B70] rounded-md focus:outline-none focus:ring-2 focus:ring-[#201E43] focus:border-[#201E43] poppins-font text-xs sm:text-base"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#134B70] hover:text-[#201E43] focus:outline-none text-lg"
                    >
                      {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </div>

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
                step === 'request' ? 'Kirim Link Reset' : 'Reset Kata Sandi'
              )}
            </button>
          </motion.div>
        </motion.form>

        <motion.div 
          className="mt-2 sm:mt-4 text-center space-y-2"
          initial={{ y: 20, opacity: 0 }}
          animate={isPageLoaded ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          {step === 'reset' && (
            <button
              onClick={handleBackToRequest}
              className="font-bold text-[#508C9B] hover:text-[#4A6FE3] transition poppins-font underline text-xs sm:text-base block mx-auto"
            >
              Kirim Ulang Link Reset
            </button>
          )}
          <Link
            to="/login"
            className="font-bold text-[#3A59D1] hover:text-[#4A6FE3] transition poppins-font underline text-xs sm:text-base block"
          >
            Kembali ke Login
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

export default ForgotPassword;