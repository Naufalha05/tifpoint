import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaSyncAlt, FaTrophy } from 'react-icons/fa';
import { ArrowLeft } from 'lucide-react';
import DashboardNavbar from '../components/DashboardNavbar';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [targetPoints, setTargetPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isLoggedIn = !!localStorage.getItem('token');
  const API_BASE_URL = 'https://tifpoint-production.up.railway.app/api';

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchLeaderboard();
  }, [isLoggedIn, navigate]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching leaderboard with token:', token);
      // Endpoint yang benar sesuai dokumentasi API
      const response = await axios.get(`${API_BASE_URL}/dashboard/leaderboard?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Leaderboard data:', response.data);
      setLeaderboardData(response.data.leaderboard || []);
      setTargetPoints(response.data.targetPoints || 36);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('userData');
        navigate('/login');
      } else if (err.response?.status === 404) {
        setError('Endpoint leaderboard tidak ditemukan. Hubungi administrator.');
      } else {
        setError('Gagal mengambil data leaderboard. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: 'beforeChildren', staggerChildren: 0.2, duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: (i) => ({
      scale: 1,
      opacity: 1,
      transition: { delay: i * 0.1, duration: 0.5, type: 'spring', stiffness: 100 },
    }),
    hover: {
      scale: 1.05,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: { duration: 0.3 },
    },
  };

  const floatingBubbles = [
    { size: 'w-24 h-24', position: 'top-[15%] left-[8%]', delay: 0 },
    { size: 'w-16 h-16', position: 'top-[65%] left-[15%]', delay: 1 },
    { size: 'w-20 h-20', position: 'top-[25%] left-[80%]', delay: 2 },
    { size: 'w-14 h-14', position: 'top-[70%] left-[75%]', delay: 3 },
    { size: 'w-10 h-10', position: 'top-[40%] left-[45%]', delay: 4 },
    { size: 'w-12 h-12', position: 'top-[85%] left-[30%]', delay: 5 },
  ];

  const bubbleVariants = {
    float: (i) => ({
      y: [0, -15, 0],
      transition: {
        duration: 6,
        delay: i * 0.5,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF0F5] to-[#508C9B] overflow-hidden">
      <div className="sticky top-0 z-50 w-full">
        <DashboardNavbar />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#201E43_1px,transparent_1px)] bg-[length:40px_40px]" />
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
        className="relative z-10 container mx-auto px-4 py-6 sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
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
        {error && (
          <motion.div
            className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg"
            variants={itemVariants}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <p className="text-xs text-red-600 mt-1">
                  Data mungkin tidak tersedia. Silakan hubungi administrator.
                </p>
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
            Leaderboard TIF Point
          </motion.h2>
          <motion.p
            className="text-lg text-[#134B70]/90 max-w-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Lihat peringkat mahasiswa berdasarkan poin yang telah dikumpulkan untuk Capaian
            Kompetensi Mandiri.
          </motion.p>
        </motion.section>

        <motion.section
          className="mb-12 bg-white/30 backdrop-blur-sm rounded-xl shadow-lg p-6"
          variants={itemVariants}
          whileHover={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-[#134B70]">Peringkat Mahasiswa</h3>
            <motion.button
              onClick={fetchLeaderboard}
              className="flex items-center gap-2 text-white bg-[#201E43] hover:bg-[#201E43]/80 focus:ring-2 focus:ring-[#508C9B] font-medium rounded-lg text-sm px-4 py-2 transition-all duration-300"
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSyncAlt className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </motion.button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg
                className="animate-spin h-12 w-12 text-[#201E43] mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-[#134B70] font-medium">Memuat data leaderboard...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-gray-500 bg-white/40 rounded-lg">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-lg font-medium mb-2">Gagal memuat leaderboard</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : leaderboardData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaderboardData.map((student, index) => (
                <motion.div
                  key={student.id}
                  custom={index}
                  variants={cardVariants}
                  whileHover="hover"
                  className="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-[#508C9B]/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FaTrophy
                        className={`h-6 w-6 ${
                          index === 0
                            ? 'text-yellow-500'
                            : index === 1
                            ? 'text-gray-400'
                            : index === 2
                            ? 'text-amber-600'
                            : 'text-[#201E43]'
                        }`}
                      />
                      <h4 className="text-lg font-bold text-[#134B70]">
                        Peringkat {index + 1}
                      </h4>
                    </div>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        student.isCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {student.isCompleted ? 'Selesai' : 'Belum Selesai'}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-[#201E43] font-medium">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.nim}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-[#201E43]">
                        {student.totalPoints}/{targetPoints}
                      </p>
                      <p className="text-sm text-gray-600">Poin</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-[#134B70]">
                        {student.completionPercentage}%
                      </p>
                      <p className="text-sm text-gray-600">Tercapai</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
                    <motion.div
                      className="bg-[#201E43] h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${student.completionPercentage}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 bg-white/40 rounded-lg">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-lg font-medium mb-2">Belum ada data leaderboard</p>
              <p className="text-sm">Data peringkat akan muncul setelah ada aktivitas.</p>
              <Link
                to="/submit-activity"
                className="mt-4 inline-flex items-center px-4 py-2 bg-[#201E43] text-white rounded-lg hover:bg-[#201E43]/80 transition-colors duration-200"
              >
                Ajukan Kegiatan
              </Link>
            </div>
          )}
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
            <p className="text-[#134B70] text-sm mb-4 md:mb-0">
              © 2025 TIF Point - Teknik Informatika UIN Suska Riau
            </p>
            <div className="flex items-center space-x-4 text-sm text-[#134B70]/80">
              <span>Build v1.2.0</span>
              <span>•</span>
              <span>API Status: {error ? 'Offline' : 'Online'}</span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Leaderboard;