import { useState, useEffect } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    username: '', 
    nim: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  // Auto redirect after success modal is shown
  useEffect(() => {
    if (registrationSuccess) {
      const timer = setTimeout(() => {
        window.location.href = '/login';
      }, 3000); // Redirect after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [registrationSuccess]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Kata sandi tidak cocok');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('https://tifpoint-production.up.railway.app/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formData.name, 
          username: formData.username, 
          nim: formData.nim, 
          email: formData.email, 
          password: formData.password 
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Pendaftaran gagal');
      
      // Show success modal instead of immediate redirect
      setShowSuccessModal(true);
      setRegistrationSuccess(true);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    window.location.href = '/login';
  };

  // Eye icon components (since we can't import react-icons)
  const EyeIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
  );

  const EyeSlashIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
    </svg>
  );

  // Success Modal Component - Made Much Wider
  const SuccessModal = () => {
    if (!showSuccessModal) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        {/* Modal Content - Much Wider */}
        <div 
          className="relative bg-white rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-500 max-w-md w-full mx-4"
          style={{
            animation: showSuccessModal ? 'modalSlideIn 0.5s ease-out' : '',
            minWidth: '400px', // Ensure minimum width
            maxWidth: '500px'   // Set maximum width
          }}
        >
          {/* Success Icon - Bigger */}
          <div 
            className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6"
            style={{
              animation: showSuccessModal ? 'checkmarkBounce 0.8s ease-out 0.3s both' : ''
            }}
          >
            <svg 
              className="h-10 w-10 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{
                animation: showSuccessModal ? 'checkmarkDraw 0.5s ease-out 0.8s both' : ''
              }}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="3" 
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message - Bigger Text */}
          <h3 
            className="text-2xl font-bold text-gray-900 mb-4"
            style={{
              animation: showSuccessModal ? 'fadeInUp 0.6s ease-out 0.5s both' : ''
            }}
          >
            Registrasi Berhasil!
          </h3>

          {/* Additional Message */}
          <p 
            className="text-gray-600 mb-6 text-lg"
            style={{
              animation: showSuccessModal ? 'fadeInUp 0.6s ease-out 0.7s both' : ''
            }}
          >
            Akun Anda telah berhasil dibuat. Anda akan dialihkan ke halaman login.
          </p>

          {/* Loading Indicator */}
          <div 
            className="flex items-center justify-center space-x-2 text-gray-500"
            style={{
              animation: showSuccessModal ? 'fadeInUp 0.6s ease-out 0.9s both' : ''
            }}
          >
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            <span className="text-sm">Mengalihkan ke halaman login...</span>
          </div>

          {/* Manual Close Button (Optional) */}
          <button
            onClick={handleSuccessModalClose}
            className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
            style={{
              animation: showSuccessModal ? 'fadeInUp 0.6s ease-out 1.1s both' : ''
            }}
          >
            Lanjut ke Login
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-b from-[#EEEEEE] to-[#508C9B] overflow-hidden flex items-center justify-center p-4">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-[10%] left-[5%] w-20 h-20 rounded-full bg-[#201E43]/20"
            style={{
              animation: 'float1 6s ease-in-out infinite'
            }}
          />
          <div
            className="absolute top-[70%] left-[10%] w-10 h-10 rounded-full bg-[#201E43]/20"
            style={{
              animation: 'float2 8s ease-in-out infinite'
            }}
          />
          <div
            className="absolute top-[30%] left-[85%] w-16 h-16 rounded-full bg-[#201E43]/20"
            style={{
              animation: 'float3 7s ease-in-out infinite'
            }}
          />
          <div
            className="absolute top-[20%] left-[80%] w-12 h-12 bg-[#201E43]/20 rotate-45"
            style={{
              animation: 'float4 9s ease-in-out infinite'
            }}
          />
        </div>

        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#201E43_1px,transparent_1px)] bg-[length:30px_30px]" />

        <div 
          className="relative z-10 max-w-sm w-full bg-[#201E43] rounded-lg shadow-xl p-6 sm:p-8"
          style={{
            opacity: isPageLoaded ? 1 : 0,
            transform: isPageLoaded ? 'scale(1)' : 'scale(0.8)',
            transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
          }}
        >
          <h2 
            className="text-center text-xl sm:text-2xl font-extrabold text-[#EEEEEE] poppins-font"
            style={{
              opacity: isPageLoaded ? 1 : 0,
              transform: isPageLoaded ? 'translateY(0)' : 'translateY(-20px)',
              transition: 'opacity 0.5s ease-out 0.2s, transform 0.5s ease-out 0.2s'
            }}
          >
            Sign Up
          </h2>
          <p 
            className="mt-1 sm:mt-2 text-center text-xs sm:text-sm text-[#508C9B] poppins-font"
            style={{
              opacity: isPageLoaded ? 1 : 0,
              transform: isPageLoaded ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'opacity 0.5s ease-out 0.3s, transform 0.5s ease-out 0.3s'
            }}
          >
            Daftar untuk memulai
          </p>
          {error && (
            <div 
              className="mt-2 sm:mt-4 p-2 sm:p-3 bg-red-100 text-red-700 rounded-md text-center poppins-font text-xs sm:text-sm"
              style={{
                animation: 'shake 0.5s ease-in-out'
              }}
            >
              {error}
            </div>
          )}
          <div 
            className="mt-4 sm:mt-6 space-y-3 sm:space-y-4"
            style={{
              opacity: isPageLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease-out 0.4s'
            }}
          >
            <div className="space-y-3 sm:space-y-4">
              <div
                style={{
                  opacity: isPageLoaded ? 1 : 0,
                  transform: isPageLoaded ? 'translateX(0)' : 'translateX(-20px)',
                  transition: 'opacity 0.5s ease-out 0.5s, transform 0.5s ease-out 0.5s'
                }}
              >
                <label htmlFor="name" className="block text-xs sm:text-sm text-[#508C9B] poppins-font">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nama Lengkap"
                  className="mt-1 w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#134B70] bg-[#EEEEEE] text-[#134B70] rounded-md focus:outline-none focus:ring-2 focus:ring-[#201E43] focus:border-[#201E43] poppins-font text-xs sm:text-sm"
                  required
                />
              </div>
              <div
                style={{
                  opacity: isPageLoaded ? 1 : 0,
                  transform: isPageLoaded ? 'translateX(0)' : 'translateX(-20px)',
                  transition: 'opacity 0.5s ease-out 0.55s, transform 0.5s ease-out 0.55s'
                }}
              >
                <label htmlFor="username" className="block text-xs sm:text-sm text-[#508C9B] poppins-font">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className="mt-1 w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#134B70] bg-[#EEEEEE] text-[#134B70] rounded-md focus:outline-none focus:ring-2 focus:ring-[#201E43] focus:border-[#201E43] poppins-font text-xs sm:text-sm"
                  required
                />
              </div>
              <div
                style={{
                  opacity: isPageLoaded ? 1 : 0,
                  transform: isPageLoaded ? 'translateX(0)' : 'translateX(-20px)',
                  transition: 'opacity 0.5s ease-out 0.6s, transform 0.5s ease-out 0.6s'
                }}
              >
                <label htmlFor="nim" className="block text-xs sm:text-sm text-[#508C9B] poppins-font">
                  NIM
                </label>
                <input
                  type="text"
                  id="nim"
                  name="nim"
                  value={formData.nim}
                  onChange={handleChange}
                  placeholder="NIM"
                  className="mt-1 w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#134B70] bg-[#EEEEEE] text-[#134B70] rounded-md focus:outline-none focus:ring-2 focus:ring-[#201E43] focus:border-[#201E43] poppins-font text-xs sm:text-sm"
                  required
                />
              </div>
              <div
                style={{
                  opacity: isPageLoaded ? 1 : 0,
                  transform: isPageLoaded ? 'translateX(0)' : 'translateX(-20px)',
                  transition: 'opacity 0.5s ease-out 0.7s, transform 0.5s ease-out 0.7s'
                }}
              >
                <label htmlFor="email" className="block text-xs sm:text-sm text-[#508C9B] poppins-font">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Alamat Email Students"
                  className="mt-1 w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#134B70] bg-[#EEEEEE] text-[#134B70] rounded-md focus:outline-none focus:ring-2 focus:ring-[#201E43] focus:border-[#201E43] poppins-font text-xs sm:text-sm"
                  required
                />
              </div>
              <div 
                style={{
                  opacity: isPageLoaded ? 1 : 0,
                  transform: isPageLoaded ? 'translateX(0)' : 'translateX(-20px)',
                  transition: 'opacity 0.5s ease-out 0.8s, transform 0.5s ease-out 0.8s'
                }}
              >
                <label htmlFor="password" className="block text-xs sm:text-sm text-[#508C9B] poppins-font">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Kata Sandi"
                    className="mt-1 w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#134B70] bg-[#EEEEEE] text-[#134B70] rounded-md focus:outline-none focus:ring-2 focus:ring-[#201E43] focus:border-[#201E43] poppins-font text-xs sm:text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#134B70] hover:text-[#201E43] focus:outline-none"
                  >
                    {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                  </button>
                </div>
              </div>
              <div 
                style={{
                  opacity: isPageLoaded ? 1 : 0,
                  transform: isPageLoaded ? 'translateX(0)' : 'translateX(-20px)',
                  transition: 'opacity 0.5s ease-out 0.9s, transform 0.5s ease-out 0.9s'
                }}
              >
                <label htmlFor="confirmPassword" className="block text-xs sm:text-sm text-[#508C9B] poppins-font">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Konfirmasi Kata Sandi"
                    className="mt-1 w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#134B70] bg-[#EEEEEE] text-[#134B70] rounded-md focus:outline-none focus:ring-2 focus:ring-[#201E43] focus:border-[#201E43] poppins-font text-xs sm:text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#134B70] hover:text-[#201E43] focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeIcon /> : <EyeSlashIcon />}
                  </button>
                </div>
              </div>
            </div>

            <div 
              className="mt-4 sm:mt-6"
              style={{
                opacity: isPageLoaded ? 1 : 0,
                transform: isPageLoaded ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.5s ease-out 1.0s, transform 0.5s ease-out 1.0s'
              }}
            >
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full py-2 sm:py-3 px-4 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-[#3A59D1] hover:bg-[#4A6FE3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A59D1] transition poppins-font disabled:bg-gray-300 flex justify-center items-center"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  "Daftar"
                )}
              </button>
            </div>
          </div>
          <div 
            className="mt-2 sm:mt-3 text-center"
            style={{
              opacity: isPageLoaded ? 1 : 0,
              transform: isPageLoaded ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.5s ease-out 1.1s, transform 0.5s ease-out 1.1s'
            }}
          >
            <span className="text-[#EEEEEE] poppins-font text-xs sm:text-sm">Sudah punya akun? </span>
            <button
              onClick={() => window.location.href = '/login'}
              className="font-bold text-[#3A59D1] hover:text-[#4A6FE3] transition poppins-font underline text-xs sm:text-sm"
            >
              Masuk
            </button>
          </div>
        </div>

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

      {/* Success Modal */}
      <SuccessModal />

      {/* Custom CSS for animations */}
      <style jsx>{`
        .poppins-font {
          font-family: 'Poppins', sans-serif;
        }

        @keyframes float1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes float2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        @keyframes float3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
        }

        @keyframes float4 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }

        @keyframes modalSlideIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes checkmarkBounce {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes checkmarkDraw {
          0% {
            stroke-dasharray: 0 100;
          }
          100% {
            stroke-dasharray: 100 0;
          }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        /* Hide elements initially for animation */
        [style*="opacity: 0"] {
          opacity: 0 !important;
        }
      `}</style>
    </>
  );
};

export default Register;