import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const [userData, setUserData] = useState({
    username: '',
    name: '',
    nim: '',
    email: ''
  });
  const [error, setError] = useState(null);
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

        // First check if we have cached user data in localStorage
        const cachedUserData = localStorage.getItem('userData');
        let initialData = null;
        
        if (cachedUserData) {
          try {
            initialData = JSON.parse(cachedUserData);
            console.log('Found cached user data:', initialData);
          } catch (e) {
            console.error('Error parsing cached user data:', e);
          }
        }

        // Fetch fresh user profile from the TIFPoint API
        const response = await fetch('https://pweb-tifpoint-backend-production-1a28.up.railway.app/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Check if response is successful
        if (!response.ok) {
          // If API call fails but we have cached data, use that instead
          if (initialData) {
            setUserData({
              username: initialData.username || '',
              name: initialData.name || '',
              nim: initialData.nim || '',
              email: initialData.email || ''
            });
            setIsLoading(false);
            
            // Show warning that we're using cached data
            
            return;
          }
          
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
        console.log('Profile data from API:', data);
        
        // Store updated data in localStorage for caching
        if (data) {
          const updatedUserData = {
            username: data.username || '',
            name: data.name || data.fullName || '',
            nim: data.nim || data.studentId || data.student_id || '',
            email: data.email || ''
          };
          
          console.log('Processed user data:', updatedUserData);
          
          localStorage.setItem('userData', JSON.stringify(updatedUserData));
          
          // Set the user data state
          setUserData(updatedUserData);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        
        // If API call fails, try to use cached data
        const cachedUserData = localStorage.getItem('userData');
        if (cachedUserData) {
          try {
            const data = JSON.parse(cachedUserData);
            setUserData({
              username: data.username || '',
              name: data.name || '',
              nim: data.nim || '',
              email: data.email || ''
            });
            setError('Gagal memuat data terbaru. Menampilkan data tersimpan.');
          } catch (e) {
            setError('Gagal memuat data profil. Silakan coba lagi.');
          }
        } else {
          setError(err.message || 'Gagal memuat data profil. Silakan coba lagi.');
        }
        
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
            Lihat informasi profil Anda.
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
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block w-12 h-12 border-4 border-[#201E43] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-[#134B70]">Memuat data profil...</p>
            </div>
          ) : (
            <div className="space-y-6">
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
                    <label className="block text-sm font-medium text-[#134B70]">Username</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{userData.username || '-'}</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-white/70 p-4 rounded-lg shadow-md"
                    whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-[#134B70]">Nama Lengkap</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{userData.name || '-'}</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-white/70 p-4 rounded-lg shadow-md"
                    whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-[#134B70]">NIM</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{userData.nim || '-'}</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-white/70 p-4 rounded-lg shadow-md"
                    whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-[#134B70]">Email</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{userData.email || '-'}</p>
                  </motion.div>
                </div>
              </motion.div>
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