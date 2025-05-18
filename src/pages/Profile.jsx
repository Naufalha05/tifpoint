import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Edit2, X, ArrowLeft, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const [userData, setUserData] = useState({
    username: '',
    nim: '',
    email: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Anda belum login. Silakan login terlebih dahulu.');
          setIsLoading(false);
          return;
        }

        // Fetch user profile from the TIFPoint API
        const response = await fetch('https://pweb-tifpoint-backend-production-1a28.up.railway.app/api/student/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Check if response is successful
        if (!response.ok) {
          // Try to parse error as JSON, but handle non-JSON responses too
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal memuat data profil');
          } else {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
        }

        // Parse the response data
        const data = await response.json();
        console.log('Profile data:', data);
        
        // Map the API response to our component's data structure
        setUserData({
          username: data.name || data.fullName || data.username || '',
          nim: data.nim || data.studentId || '',
          email: data.email || ''
        });
        
        // Also set form data for edit mode
        setFormData({ 
          username: data.name || data.fullName || data.username || '' 
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err.message || 'Gagal memuat data profil. Silakan coba lagi.');
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.username) {
      setError('Nama pengguna tidak boleh kosong.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Anda belum login. Silakan login terlebih dahulu.');
        return;
      }

      // Update user profile to the API endpoint
      const response = await fetch('https://pweb-tifpoint-backend-production-1a28.up.railway.app/api/student/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.username
        })
      });

      // Check if response is successful
      if (!response.ok) {
        // Try to parse error as JSON, but handle non-JSON responses too
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal memperbarui profil');
        } else {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
      }
      
      // Parse response data
      const data = await response.json();
      
      // Update local state with new data
      setUserData({ ...userData, username: formData.username });
      setSuccess('Profil berhasil diperbarui.');
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Gagal memperbarui profil. Silakan coba lagi.');
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF0F5] to-[#508C9B] overflow-hidden">
      {/* Animated Background Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-64 h-64 rounded-full bg-blue-300/20 top-1/4 -left-20 animate-float-slow"></div>
        <div className="absolute w-96 h-96 rounded-full bg-teal-300/20 top-5 -right-20 animate-float"></div>
        <div className="absolute w-40 h-40 rounded-full bg-purple-300/10 bottom-10 left-1/4 animate-float-delay"></div>
      </div>
      
      <main className="relative z-10 container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        {/* Back to Dashboard Button */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center px-5 py-2.5 bg-[#201E43] text-white rounded-lg hover:bg-[#134B70] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali ke Dashboard
          </Link>
        </motion.div>

        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#134B70] mb-3">Profil Saya</h2>
          <p className="text-lg text-[#134B70]/90 max-w-3xl">
            Lihat dan kelola informasi profil Anda.
          </p>
        </motion.section>

        <motion.section 
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          {error && (
            <motion.div 
              className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle className="text-red-500 mr-3 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}
          
          {success && (
            <motion.div 
              className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle className="text-green-500 mr-3 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </motion.div>
          )}
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block w-12 h-12 border-4 border-[#201E43] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-[#134B70]">Memuat data profil...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {!editMode ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div 
                    className="flex justify-center mb-8"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#201E43] to-[#134B70] flex items-center justify-center shadow-lg">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div 
                      className="bg-white/70 p-4 rounded-lg shadow-md"
                      whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-sm font-medium text-[#134B70]">Nama Pengguna</label>
                      <p className="mt-1 text-lg font-semibold text-gray-900">{userData.username}</p>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white/70 p-4 rounded-lg shadow-md"
                      whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-sm font-medium text-[#134B70]">NIM</label>
                      <p className="mt-1 text-lg font-semibold text-gray-900">{userData.nim}</p>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white/70 p-4 rounded-lg shadow-md md:col-span-2"
                      whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-sm font-medium text-[#134B70]">Email</label>
                      <p className="mt-1 text-lg font-semibold text-gray-900">{userData.email}</p>
                    </motion.div>
                  </div>
                  
                  <motion.button
                    onClick={() => setEditMode(true)}
                    className="mt-8 bg-[#201E43] text-white px-6 py-3 rounded-lg hover:bg-[#134B70] transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-xl transform hover:-translate-y-1 w-full md:w-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit2 className="w-5 h-5 mr-2" />
                    Edit Profil
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form 
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="bg-white/80 p-6 rounded-lg shadow-md"
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <label htmlFor="username" className="block text-sm font-medium text-[#134B70] mb-2">
                      Nama Pengguna
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#201E43] focus:ring focus:ring-[#201E43] focus:ring-opacity-50 transition-all duration-300 py-3"
                      autoFocus
                    />
                  </motion.div>
                  
                  <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                    <motion.button
                      type="submit"
                      className="bg-[#201E43] text-white px-6 py-3 rounded-lg hover:bg-[#134B70] transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Save className="w-5 h-5 mr-2" />
                      Simpan Perubahan
                    </motion.button>
                    
                    <motion.button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all duration-300 flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X className="w-5 h-5 mr-2" />
                      Batal
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </div>
          )}
        </motion.section>
      </main>

      {/* Add custom animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float-slow {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float-delay {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float-delay 10s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Profile;