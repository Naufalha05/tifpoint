import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardNavbar from './components/DashboardNavbar';

const Dashboard = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState({
    username: '',
    name: '',
    nim: '',
    totalPoints: 0,
    maxPoints: 36,
    activities: { total: 0, approved: 0, pending: 0, rejected: 0 }
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
        fetchDashboardData(token);
      } else {
        setIsAuthenticated(false);
        setIsLoaded(true);
      }
    };

    const fetchDashboardData = async (token) => {
      try {
        // Get user data from localStorage first (set during login)
        const storedUserData = localStorage.getItem('userData');
        let localUserData = {};
        
        if (storedUserData) {
          localUserData = JSON.parse(storedUserData);
          // Update the initial user data with localStorage values
          setUserData(prevData => ({
            ...prevData,
            username: localUserData.username || '',
            name: localUserData.name || 'Mahasiswa',
            nim: localUserData.nim || '',
          }));
        }
        
        // Fetch additional dashboard data from the server
        const response = await fetch('/api/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        
        // Update state with combined user data (localStorage + API response)
        setUserData({
          username: localUserData.username || data.username || '',
          name: localUserData.name || data.name || 'Mahasiswa',
          nim: localUserData.nim || data.nim || '',
          totalPoints: data.totalPoints || 0,
          maxPoints: 36,
          activities: {
            total: data.activities?.total || 0,
            approved: data.activities?.approved || 0,
            pending: data.activities?.pending || 0,
            rejected: data.activities?.rejected || 0
          }
        });
        
        setRecentActivities(data.recentActivities || []);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // Even if API call fails, try to display user data from localStorage
        try {
          const storedUserData = localStorage.getItem('userData');
          if (storedUserData) {
            const localUserData = JSON.parse(storedUserData);
            setUserData(prevData => ({
              ...prevData,
              username: localUserData.username || '',
              name: localUserData.name || 'Mahasiswa',
              nim: localUserData.nim || '',
            }));
          }
        } catch (localStorageError) {
          console.error('Error retrieving data from localStorage:', localStorageError);
        }
        
        setError('Gagal memuat data. Silakan coba lagi nanti.');
        setIsLoaded(true);
      }
    };

    checkAuthentication();
  }, []);

  // If not authenticated, redirect to login page
  if (isLoaded && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const cards = [
    {
      id: 'submit-activity',
      title: 'Ajukan Kegiatan',
      description: 'Ajukan kegiatan untuk mendapatkan point lab',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      path: '/submit-activity'
    },
    {
      id: 'activity-history',
      title: 'Riwayat Pengajuan',
      description: 'Lihat status dan riwayat pengajuan kegiatan',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      path: '/activity-history'
    },
    {
      id: 'competencies',
      title: 'Info Kompetensi',
      description: 'Lihat daftar kompetensi dan cara mendapatkan poin',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      path: '/competencies'
    },
    {
      id: 'activities',
      title: 'Info Kegiatan',
      description: 'Lihat daftar kegiatan yang bisa diikuti',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      path: '/activities-info'
    }
  ];

  const pointPercentage = Math.floor((userData.totalPoints / userData.maxPoints) * 100);

  const renderActivityIcon = (type) => {
    switch(type) {
      case 'approved':
      case 'APPROVED':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'pending':
      case 'PENDING':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'rejected':
      case 'REJECTED':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren", 
        staggerChildren: 0.2,
        duration: 0.3 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: (i) => ({ 
      scale: 1, 
      opacity: 1,
      transition: { 
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    }),
    hover: { 
      scale: 1.05,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.3 }
    }
  };

  const activityVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({ 
      opacity: 1, 
      x: 0, 
      transition: { 
        delay: i * 0.1,
        duration: 0.5
      } 
    }),
    hover: { 
      scale: 1.02,
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      transition: { duration: 0.2 }
    }
  };

  // Animated shapes in background
  const floatingBubbles = [
    { size: "w-24 h-24", position: "top-[15%] left-[8%]", delay: 0 },
    { size: "w-16 h-16", position: "top-[65%] left-[15%]", delay: 1 },
    { size: "w-20 h-20", position: "top-[25%] left-[80%]", delay: 2 },
    { size: "w-14 h-14", position: "top-[70%] left-[75%]", delay: 3 },
    { size: "w-10 h-10", position: "top-[40%] left-[45%]", delay: 4 },
    { size: "w-12 h-12", position: "top-[85%] left-[30%]", delay: 5 },
  ];

  const bubbleVariants = {
    float: (i) => ({
      y: [0, -15, 0],
      transition: {
        duration: 6,
        delay: i * 0.5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    })
  };

  const progressVariants = {
    hidden: { width: 0 },
    visible: { 
      width: `${pointPercentage}%`,
      transition: { 
        duration: 1.5,
        ease: "easeOut" 
      }
    }
  };

  // Display a loading spinner when data is being fetched
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EEF0F5] to-[#508C9B] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-[#201E43] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-[#134B70] font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF0F5] to-[#508C9B] overflow-hidden">
      {/* Fixed navbar with proper positioning */}
      <div className="sticky top-0 z-50 w-full">
        <DashboardNavbar />
      </div>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#201E43_1px,transparent_1px)] bg-[length:40px_40px]" />
        
        {/* Animated floating bubbles */}
        {floatingBubbles.map((bubble, index) => (
          <motion.div
            key={index}
            className={`absolute ${bubble.size} ${bubble.position} rounded-full bg-[#201E43]/15`}
            custom={bubble.delay}
            animate="float"
            variants={bubbleVariants}
          />
        ))}
      </div>

      <motion.main 
        className="relative z-10 container mx-auto px-4 py-6 sm:px-6 lg:px-8 pt-" // Added padding-top to account for fixed navbar
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {error && (
          <motion.div 
            className="mb-6 bg-red-50 border-l-4 border-red-500 p-4"
            variants={itemVariants}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.section className="mb-12" variants={itemVariants}>
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-[#134B70] mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Selamat Datang di Dashboard TIF Point, {userData.name}
          </motion.h2>
          <motion.p 
            className="text-lg text-[#134B70]/90 max-w-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            TIF Point adalah aplikasi manajemen Capaian Kompetensi Mandiri terintegrasi untuk mahasiswa Teknik Informatika UIN Suska Riau.
          </motion.p>
          <motion.p 
            className="text-md text-[#134B70]/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            NIM: {userData.nim}
          </motion.p>
        </motion.section>

        <motion.section 
          className="mb-12 bg-white/30 backdrop-blur-sm rounded-xl shadow-lg p-6"
          variants={itemVariants}
          whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-[#134B70] mb-4">Progress Point Lab</h3>
          <div className="bg-white/60 rounded-lg p-6 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <motion.h4 
                  className="text-2xl font-bold text-[#201E43]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  {isLoaded ? (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {userData.totalPoints} / {userData.maxPoints} Point
                    </motion.span>
                  ) : (
                    "Loading..."
                  )}
                </motion.h4>
                <p className="text-gray-600">Target minimum untuk lulus: {userData.maxPoints} point</p>
              </div>
              <motion.div
                className="mt-4 md:mt-0 px-4 py-2 bg-[#201E43] text-white rounded-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {pointPercentage}% Tercapai
              </motion.div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <motion.div 
                className="bg-[#201E43] h-4 rounded-full"
                variants={progressVariants}
              ></motion.div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div 
                className="bg-green-50 p-4 rounded-lg border border-green-200"
                whileHover={{ scale: 1.03, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-green-800 font-medium">Disetujui</span>
                  <motion.span 
                    className="bg-green-200 text-green-800 px-2 py-1 rounded font-medium"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.7
                    }}
                  >
                    {userData.activities.approved}
                  </motion.span>
                </div>
              </motion.div>
              <motion.div 
                className="bg-yellow-50 p-4 rounded-lg border border-yellow-200"
                whileHover={{ scale: 1.03, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-yellow-800 font-medium">Menunggu</span>
                  <motion.span 
                    className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded font-medium"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.8
                    }}
                  >
                    {userData.activities.pending}
                  </motion.span>
                </div>
              </motion.div>
              <motion.div 
                className="bg-red-50 p-4 rounded-lg border border-red-200"
                whileHover={{ scale: 1.03, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-red-800 font-medium">Ditolak</span>
                  <motion.span 
                    className="bg-red-200 text-red-800 px-2 py-1 rounded font-medium"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.9
                    }}
                  >
                    {userData.activities.rejected}
                  </motion.span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          variants={itemVariants}
        >
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              custom={i}
              variants={cardVariants}
              whileHover="hover"
              className="bg-[#201E43] rounded-2xl shadow-xl overflow-hidden"
            >
              <Link to={card.path} className="block h-full">
                <div className="p-6 flex flex-col h-full">
                  <motion.div 
                    className="mb-4 p-3 rounded-full bg-[#ffffff20] w-fit"
                    whileHover={{ 
                      rotate: 360, 
                      backgroundColor: "rgba(255, 255, 255, 0.3)" 
                    }}
                    transition={{ duration: 0.8 }}
                  >
                    {card.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-white/80 mb-6">{card.description}</p>
                  <div className="mt-auto flex justify-end">
                    <motion.div 
                      className="rounded-full bg-white/20 p-2"
                      whileHover={{ 
                        x: 5, 
                        backgroundColor: "rgba(255, 255, 255, 0.3)" 
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.section>

        <motion.section 
          className="mt-12 bg-white/30 backdrop-blur-sm rounded-xl shadow-lg p-6"
          variants={itemVariants}
          whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-[#134B70] mb-4">Aktivitas Terbaru</h3>
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div 
                  key={activity.id || index} 
                  custom={index}
                  variants={activityVariants}
                  whileHover="hover"
                  className="flex items-start p-3 bg-white/60 rounded-lg"
                >
                  <motion.div 
                    className={`min-w-10 w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      activity.type === 'approved' || activity.type === 'APPROVED' ? 'bg-green-100' :
                      activity.type === 'pending' || activity.type === 'PENDING' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderActivityIcon(activity.type)}
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-[#134B70]">{activity.text}</p>
                      {(activity.type === 'approved' || activity.type === 'APPROVED') && (
                        <motion.span 
                          className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                        >
                          +{activity.points} Point
                        </motion.span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>Belum ada aktivitas terbaru.</p>
            </div>
          )}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Link to="/activity-history" className="mt-4 block w-full py-2 bg-[#201E43]/10 hover:bg-[#201E43]/20 rounded-lg text-[#201E43] font-medium transition-colors duration-200 text-center">
              Lihat Semua Aktivitas
            </Link>
          </motion.div>
        </motion.section>
      </motion.main>

      <motion.footer 
        className="relative z-10 mt-12 py-6 bg-[#201E43]/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#134B70] text-sm mb-4 md:mb-0">© 2025 TIF Point - Teknik Informatika UIN Suska Riau</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Dashboard;