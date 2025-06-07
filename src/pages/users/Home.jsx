import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleStartClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#EEEEEE] to-[#508C9B] overflow-hidden">
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

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-center min-h-screen py-12">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="mb-8 flex justify-center"
            initial={{ scale: 0 }}
            animate={isLoaded ? { scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-24 h-24 rounded-full bg-[#201E43] flex items-center justify-center shadow-xl">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 24L22 32L34 20" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold text-[#134B70] mb-6"
            initial={{ opacity: 0, y: -30 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            Selamat Datang di{' '}
            <span className="relative inline-block text-[#201E43]">
              TIF Point
              <span className="absolute left-0 -bottom-1 w-full h-2 bg-[#201E43]/30 rounded-full"></span>
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-[#134B70] mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Aplikasi manajemen Capaian Kompetensi Mandiri yang terintegrasi untuk mahasiswa Teknik Informatika UIN Suska Riau.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <button
              onClick={handleStartClick}
              disabled={isLoading}
              className="inline-block bg-[#201E43] hover:bg-[#1A1A36] text-white font-semibold py-4 px-10 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loader">
                    <p className="loader-text">Loading...</p>
                    <span className="load"></span>
                  </div>
                </div>
              ) : (
                "Mulai Sekarang"
              )}
            </button>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden">
        <svg className="w-full h-24 md:h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,105.94,133.81,113.48,198.11,104.28c67.53-9.61,126.99-39.06,189.23-42.25A714.92,714.92,0,0,1,321.39,56.44Z" fill="#201E43" fillOpacity="0.2"></path>
        </svg>
      </div>
    </div>
  );
};

export default Home;