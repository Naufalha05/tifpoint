import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Competencies = () => {
  const [competencies, setCompetencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompetencies = async () => {
      try {
        // Fetch recognized courses from API - sesuai dokumentasi, GET /recognized-courses tidak perlu token
        const response = await fetch('https://tifpoint-production.up.railway.app/api/recognized-courses', {
          headers: { 
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch recognized courses');
          } else {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
        }
        
        const data = await response.json();
        
        // Transform data sesuai struktur API recognized-courses
        const transformedCompetencies = Array.isArray(data)
          ? data.map(course => ({
              id: course.id,
              title: course.name,
              description: `Provider: ${course.provider} | Durasi: ${course.duration} jam`,
              points: `${course.pointValue} poin`,
              url: course.url,
              provider: course.provider,
              duration: course.duration
            }))
          : [];
        
        setCompetencies(transformedCompetencies);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching competencies:', error);
        setError('Gagal memuat data kursus terekognisi: ' + error.message);
        setIsLoading(false);
      }
    };

    fetchCompetencies();
  }, []);

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
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    }),
    hover: { 
      scale: 1.03,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 }
    }
  };

  // Animated shapes in background
  const floatingBubbles = [
    { size: "w-24 h-24", position: "top-[15%] right-[8%]", delay: 0 },
    { size: "w-16 h-16", position: "top-[65%] left-[10%]", delay: 1 },
    { size: "w-20 h-20", position: "top-[35%] left-[85%]", delay: 2 },
    { size: "w-12 h-12", position: "top-[80%] left-[75%]", delay: 3 },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF0F5] to-[#508C9B] overflow-hidden">
      {/* Animated background elements */}
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
        className="relative z-10 container mx-auto px-4 py-6 sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Back to Dashboard Button */}
        <motion.div 
          className="mb-6"
          variants={itemVariants}
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-[#201E43] text-white rounded-lg hover:bg-[#134B70] transition-colors duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
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
          </motion.div>
        </motion.div>

        <motion.section 
          className="mb-12"
          variants={itemVariants}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-[#134B70] mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Kursus Terekognisi
          </motion.h2>
          <motion.p 
            className="text-lg text-[#134B70]/90 max-w-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Pelajari berbagai kursus terekognisi yang tersedia dan cara mendapatkan poin untuk masing-masing kursus.
          </motion.p>
        </motion.section>

        <motion.section 
          className="bg-white/30 backdrop-blur-sm rounded-xl shadow-lg p-6"
          variants={itemVariants}
          whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
          transition={{ duration: 0.3 }}
        >
          {error && (
            <motion.div 
              className="mb-6 bg-red-50 border-l-4 border-red-500 p-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}
          
          {isLoading ? (
            <motion.div 
              className="flex flex-col items-center justify-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="w-16 h-16 border-4 border-[#201E43]/30 border-t-[#201E43] rounded-full"
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <p className="mt-4 text-[#134B70]">Memuat data kursus terekognisi...</p>
            </motion.div>
          ) : competencies.length === 0 ? (
            <motion.div 
              className="text-center text-gray-500 py-12"
              variants={itemVariants}
            >
              Belum ada data kursus terekognisi.
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {competencies.map((competency, index) => (
                <motion.div 
                  key={competency.id} 
                  className="bg-white/60 rounded-lg p-6 relative overflow-hidden"
                  variants={cardVariants}
                  custom={index}
                  whileHover="hover"
                >
                  <motion.div 
                    className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-[#201E43]/5"
                    animate={{ 
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                      delay: index * 0.2
                    }}
                  />

                  <motion.h3 
                    className="text-xl font-semibold text-[#134B70] mb-2 relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    {competency.title}
                  </motion.h3>
                  
                  <motion.div
                    className="space-y-2 mb-4 relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Provider:</span> {competency.provider}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Durasi:</span> {competency.duration} jam
                    </p>
                  </motion.div>

                  <motion.div
                    className="relative z-10 flex items-center justify-between"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                  >
                    <motion.span 
                      className="inline-block px-3 py-1 bg-[#201E43]/10 rounded-full text-sm text-[#201E43] font-medium"
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(32, 30, 67, 0.15)" }}
                      transition={{ duration: 0.2 }}
                    >
                      {competency.points}
                    </motion.span>
                    
                    {competency.url && (
                      <motion.a
                        href={competency.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 bg-[#134B70] text-white text-sm rounded-full hover:bg-[#201E43] transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Kunjungi
                      </motion.a>
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.section>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <motion.button
            className="inline-flex items-center px-6 py-3 bg-[#201E43] text-white rounded-lg hover:bg-[#134B70] transition-colors duration-200"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.open('/documents/pedoman-kompetensi.pdf', '_blank')}
          >
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Unduh Pedoman Kompetensi
          </motion.button>
        </motion.div>
      </motion.main>
    </div>
  );
};

export default Competencies;