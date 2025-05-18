import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import axios from 'axios';

const Settings = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    receiveNotifications: true
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Trigger animation on component mount
    setTimeout(() => setShowAnimation(true), 100);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Kata sandi baru dan konfirmasi tidak cocok.');
      setIsSubmitting(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Kata sandi baru harus minimal 6 karakter.');
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.put('/api/user/settings', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        receiveNotifications: formData.receiveNotifications
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Pengaturan berhasil diperbarui.');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        receiveNotifications: formData.receiveNotifications
      });
    } catch (err) {
      setError('Gagal memperbarui pengaturan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF0F5] to-[#508C9B] overflow-hidden">
      {/* Background animated shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="animate-pulse absolute top-20 left-20 w-64 h-64 rounded-full bg-blue-200/20 blur-3xl"></div>
        <div className="animate-pulse absolute bottom-20 right-20 w-80 h-80 rounded-full bg-teal-200/20 blur-3xl delay-700"></div>
        <div className="animate-bounce absolute top-1/2 left-1/3 w-4 h-4 bg-white/40 rounded-full"></div>
        <div className="animate-bounce absolute top-1/4 right-1/4 w-3 h-3 bg-white/30 rounded-full delay-1000"></div>
        <div className="animate-bounce absolute bottom-1/3 left-1/4 w-5 h-5 bg-white/20 rounded-full delay-500"></div>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Back to Dashboard Button with hover effect */}
        <div className="mb-6">
          <Link
            to="/dashboard"
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
          </Link>
        </div>

        {/* Title section with fade-in animation */}
        <section 
          className={`mb-12 transform transition-all duration-700 ${
            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#134B70] mb-3">Pengaturan</h2>
          <p className="text-lg text-[#134B70]/90 max-w-3xl">
            Kelola preferensi akun Anda, termasuk kata sandi dan notifikasi.
          </p>
        </section>

        {/* Form section with glass effect and animations */}
        <section 
          className={`bg-white/30 backdrop-blur-sm rounded-xl shadow-lg p-6 transition-all duration-500 hover:shadow-xl transform hover:scale-[1.01] ${
            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 animate-pulse">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 animate-pulse">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div 
              className={`transform transition-all duration-500 ${
                showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '150ms' }}
            >
              <label htmlFor="currentPassword" className="block text-sm font-medium text-[#134B70]">
                Kata Sandi Saat Ini
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#201E43] focus:ring-[#201E43] transition-all duration-300 hover:shadow-md focus:shadow-lg"
              />
            </div>
            <div 
              className={`transform transition-all duration-500 ${
                showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <label htmlFor="newPassword" className="block text-sm font-medium text-[#134B70]">
                Kata Sandi Baru
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#201E43] focus:ring-[#201E43] transition-all duration-300 hover:shadow-md focus:shadow-lg"
              />
            </div>
            <div 
              className={`transform transition-all duration-500 ${
                showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '250ms' }}
            >
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#134B70]">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#201E43] focus:ring-[#201E43] transition-all duration-300 hover:shadow-md focus:shadow-lg"
              />
            </div>
            <div 
              className={`flex items-center transform transition-all duration-500 ${
                showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="receiveNotifications"
                  checked={formData.receiveNotifications}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#201E43] focus:ring-[#201E43] border-gray-300 rounded transition-all duration-300 hover:scale-110"
                />
                <span className="ml-2 text-sm text-[#134B70]">
                  Terima notifikasi email
                </span>
              </label>
            </div>
            <div 
              className={`flex justify-end transform transition-all duration-500 ${
                showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '350ms' }}
            >
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#201E43] text-white px-6 py-2 rounded-lg hover:bg-[#134B70] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Settings;