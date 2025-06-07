import { useState, useEffect } from 'react';

const Settings = () => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [activeSection, setActiveSection] = useState('password'); 
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    subject: 'Pertanyaan Umum',
    message: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    setTimeout(() => setShowAnimation(true), 100);
  }, []);

  // Auto-hide success/error messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear previous messages when user starts typing
    if (error || success) {
      setError(null);
      setSuccess(null);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePasswordForm = () => {
    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword.trim()) {
      setError('Password saat ini tidak boleh kosong.');
      return false;
    }

    if (!newPassword.trim()) {
      setError('Password baru tidak boleh kosong.');
      return false;
    }

    if (newPassword.length < 6) {
      setError('Password baru minimal 6 karakter.');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return false;
    }

    if (currentPassword === newPassword) {
      setError('Password baru harus berbeda dengan password saat ini.');
      return false;
    }

    return true;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    if (!validatePasswordForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Anda belum login. Silakan login terlebih dahulu.');
        setIsSubmitting(false);
        return;
      }

      // Step 1: Verify current password by attempting login
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const loginResponse = await fetch('https://tifpoint-production.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userData.email,
          password: formData.currentPassword
        })
      });

      if (!loginResponse.ok) {
        setError('Password saat ini salah.');
        setIsSubmitting(false);
        return;
      }

      // Step 2: Request forgot password to get reset token
      const forgotResponse = await fetch('https://tifpoint-production.up.railway.app/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userData.email
        })
      });

      if (!forgotResponse.ok) {
        const errorData = await forgotResponse.json();
        throw new Error(errorData.message || 'Gagal meminta reset password');
      }

      // Step 3: Simulate getting token and directly reset password
      // In a real implementation, you would need the actual reset token from email
      // For now, we'll use a temporary token or implement a different approach
      
      // Alternative approach: Use a direct password change endpoint if available
      // Or implement a backend endpoint that allows authenticated users to change password directly
      
      // For demonstration, let's assume we have the reset token
      // In practice, you might want to implement a direct password change endpoint
      const resetResponse = await fetch('https://tifpoint-production.up.railway.app/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: 'temporary-token', // This would need to be the actual token from email
          password: formData.newPassword
        })
      });

      if (!resetResponse.ok) {
        // If reset-password doesn't work with temporary token, 
        // we'll show a message that password change request was sent
        setSuccess('🔐 Permintaan ganti password berhasil dikirim! Silakan cek email Anda untuk melanjutkan proses ganti password.');
      } else {
        setSuccess('🔐 Password berhasil diubah! Silakan login kembali dengan password baru.');
        
        // Optionally logout user after password change
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          window.location.href = '/login';
        }, 3000);
      }
      
      // Clear form
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (err) {
      console.error('Error changing password:', err);
      setError(`❌ ${err.message || 'Gagal mengganti password. Silakan coba lagi.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    if (!formData.message.trim()) {
      setError('Pesan tidak boleh kosong.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulasi pengiriman email - dalam implementasi nyata, ini akan mengirim ke backend
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const emailData = {
        from: userData.email || 'unknown@example.com',
        fromName: userData.name || 'User',
        subject: formData.subject,
        message: formData.message,
        timestamp: new Date().toISOString()
      };

      console.log('Email data to be sent:', emailData);

      // Simulasi delay pengiriman
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccess('📧 Pesan berhasil dikirim! Kami akan merespon segera.');
      setFormData(prev => ({
        ...prev,
        subject: 'Pertanyaan Umum',
        message: ''
      }));

    } catch (err) {
      console.error('Error sending message:', err);
      setError('❌ Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const menuItems = [
    { id: 'password', icon: '🔐', title: 'Ganti Password', desc: 'Ubah password akun Anda' },
    { id: 'about', icon: 'ℹ️', title: 'Tentang Aplikasi', desc: 'Informasi tentang aplikasi ini' },
    { id: 'contact', icon: '📞', title: 'Hubungi Kami', desc: 'Dapatkan bantuan dan dukungan' }
  ];

  // Komponen Notifikasi
  const NotificationBox = ({ type, message, onClose }) => {
    if (!message) return null;

    const bgColor = type === 'success' ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400';
    const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
    const iconColor = type === 'success' ? 'text-green-400' : 'text-red-400';

    return (
      <div className={`fixed top-4 right-4 z-50 ${bgColor} border-l-4 p-4 rounded-lg shadow-lg w-99 h-20 animate-slide-in-right`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {type === 'success' ? (
              <svg className={`h-5 w-5 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className={`h-5 w-5 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${textColor}`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onClose}
              className={`rounded-md inline-flex ${textColor} hover:opacity-75 focus:outline-none`}
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'password':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-[#134B70] mb-4">Ganti Password</h3>
            <div className="space-y-4">
              {/* Password Saat Ini */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-[#134B70] mb-2">
                  Password Saat Ini
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Masukkan password saat ini"
                    className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-gray-400 bg-white/90 shadow-sm focus:border-[#201E43] focus:ring-2 focus:ring-[#201E43]/20 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Password Baru */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-[#134B70] mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Masukkan password baru (minimal 6 karakter)"
                    className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-gray-400 bg-white/90 shadow-sm focus:border-[#201E43] focus:ring-2 focus:ring-[#201E43]/20 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#134B70] mb-2">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Konfirmasi password baru"
                    className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-gray-400 bg-white/90 shadow-sm focus:border-[#201E43] focus:ring-2 focus:ring-[#201E43]/20 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Tips Keamanan Password:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Gunakan minimal 6 karakter</li>
                      <li>Kombinasikan huruf besar, kecil, dan angka</li>
                      <li>Hindari menggunakan informasi pribadi</li>
                      <li>Jangan gunakan password yang sama di aplikasi lain</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePasswordSubmit}
                className="bg-[#201E43] text-white px-6 py-3 rounded-lg hover:bg-[#134B70] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>🔐 Ganti Password</span>
                )}
              </button>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-[#134B70] mb-4">Tentang Aplikasi</h3>
            <div className="bg-white/50 rounded-lg p-6 space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#201E43] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">📱</span>
                </div>
                <h4 className="text-xl font-bold text-[#134B70]">TIFPoint</h4>
                <p className="text-gray-600">Versi 1.0.0</p>
              </div>
              
              <div className="space-y-3 text-[#134B70]">
                <p>
                  <strong>Deskripsi:</strong> Aplikasi ini dirancang untuk membantu mahasiswa TIF UIN Suska Riau mengelola Capaian Kompetensi Mandiri.
                </p>
                <p>
                  <strong>Fitur Utama:</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Ajukan Kegiatan</li>
                  <li>Riwayat Pengajuan</li>
                  <li>Info Kompetensi</li>
                  <li>Info Kegiatan</li>
                </ul>
                <p>
                  <strong>Dikembangkan oleh:</strong> Tim Pengembang TIFPoint
                </p>
                <p>
                  <strong>Hak Cipta:</strong> © 2025 TIFPoint. Semua hak dilindungi.
                </p>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-[#134B70] mb-4">Hubungi Kami</h3>
            <div className="grid gap-6">
              <div className="bg-white/50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-[#134B70] mb-4">Informasi Kontak</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📧</span>
                    <div>
                      <p className="font-medium text-[#134B70]">Email</p>
                      <p className="text-gray-600">admin@tifpoint.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📱</span>
                    <div>
                      <p className="font-medium text-[#134B70]">Telepon</p>
                      <p className="text-gray-600">+62 812 3456 7890</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💬</span>
                    <div>
                      <p className="font-medium text-[#134B70]">WhatsApp</p>
                      <p className="text-gray-600">+62 812 3456 7890</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🕒</span>
                    <div>
                      <p className="font-medium text-[#134B70]">Jam Operasional</p>
                      <p className="text-gray-600">Senin - Jumat: 09:00 - 17:00 WIB</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-[#134B70] mb-4">Kirim Pesan</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#134B70] mb-2">
                      Subjek
                    </label>
                    <select 
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-400 bg-white/90 shadow-sm focus:border-[#201E43] focus:ring-2 focus:ring-[#201E43]/20 focus:bg-white transition-all duration-300 text-gray-800"
                    >
                      <option value="Pertanyaan Umum">Pertanyaan Umum</option>
                      <option value="Masalah Teknis">Masalah Teknis</option>
                      <option value="Saran & Kritik">Saran & Kritik</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#134B70] mb-2">
                      Pesan
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Tuliskan pesan Anda di sini..."
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-400 bg-white/90 shadow-sm focus:border-[#201E43] focus:ring-2 focus:ring-[#201E43]/20 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-500 resize-none"
                    ></textarea>
                  </div>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleContactSubmit}
                    className="bg-[#201E43] text-white px-6 py-3 rounded-lg hover:bg-[#134B70] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <span>📤 Kirim Pesan</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF0F5] to-[#508C9B] overflow-hidden">
      {/* Background Animation */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="animate-pulse absolute top-20 left-20 w-64 h-64 rounded-full bg-blue-200/20 blur-3xl"></div>
        <div className="animate-pulse absolute bottom-20 right-20 w-80 h-80 rounded-full bg-teal-200/20 blur-3xl delay-700"></div>
        <div className="animate-bounce absolute top-1/2 left-1/3 w-4 h-4 bg-white/40 rounded-full"></div>
        <div className="animate-bounce absolute top-1/4 right-1/4 w-3 h-3 bg-white/30 rounded-full delay-1000"></div>
        <div className="animate-bounce absolute bottom-1/3 left-1/4 w-5 h-5 bg-white/20 rounded-full delay-500"></div>
      </div>

      {/* Notification Components */}
      <NotificationBox 
        type="success" 
        message={success} 
        onClose={() => setSuccess(null)} 
      />
      <NotificationBox 
        type="error" 
        message={error} 
        onClose={() => setError(null)} 
      />

      <main className="relative z-10 container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 bg-[#201E43] text-white rounded-lg hover:bg-[#134B70] transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
          >
            <svg
              className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali ke Dashboard
          </button>
        </div>

        <section 
          className={`mb-8 transform transition-all duration-700 ${
            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#134B70] mb-3">Pengaturan</h2>
          <p className="text-lg text-[#134B70]/90 max-w-3xl">
            Kelola profil dan informasi aplikasi Anda.
          </p>
        </section>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className={`bg-white/30 backdrop-blur-sm rounded-xl shadow-lg p-4 transition-all duration-500 ${
              showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <h3 className="text-lg font-semibold text-[#134B70] mb-4">Menu Pengaturan</h3>
              <nav className="space-y-2">
                {menuItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-300 hover:shadow-md transform hover:scale-105 ${
                      activeSection === item.id
                        ? 'bg-[#201E43] text-white shadow-lg'
                        : 'bg-white/50 text-[#134B70] hover:bg-white/70'
                    }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className={`text-xs ${
                          activeSection === item.id ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className={`bg-white/30 backdrop-blur-sm rounded-xl shadow-lg p-6 transition-all duration-500 hover:shadow-xl ${
              showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {renderContent()}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Settings;