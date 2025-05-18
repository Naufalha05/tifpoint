import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ActivitiesInfo = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Sesi login telah berakhir. Silakan login kembali.');
          setIsLoading(false);
          return;
        }
        
        // Fetch activities from API
        const response = await fetch('https://pweb-tifpoint-backend-production-1a28.up.railway.app/api/activity-info', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          // Try to parse error as JSON, but handle non-JSON responses too
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch activities');
          } else {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
        }
        
        const data = await response.json();
        
        // Transform data if needed
        const transformedActivities = Array.isArray(data.activities || data)
          ? (data.activities || data).map(activity => ({
              id: activity._id,
              title: activity.title || activity.activityName,
              type: activity.type || activity.activityType,
              date: activity.date || activity.activityDate,
              points: activity.points || 0,
              description: activity.description
            }))
          : [];
        
        setActivities(transformedActivities);
        setIsLoading(false);
        
        // Trigger animation after data loads
        setTimeout(() => setShowAnimation(true), 100);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError('Gagal memuat data kegiatan: ' + error.message);
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF0F5] to-[#508C9B] overflow-hidden relative">
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
          <h2 className="text-3xl md:text-4xl font-bold text-[#134B70] mb-3">Info Kegiatan</h2>
          <p className="text-lg text-[#134B70]/90 max-w-3xl">
            Temukan daftar kursus terekognisi dan kegiatan kampus yang akan datang.
          </p>
        </section>
        
        {/* Content section with glass effect and animations */}
        <section className="bg-white/30 backdrop-blur-sm rounded-xl shadow-lg p-6 transition-all duration-500 hover:shadow-xl">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 animate-pulse">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center text-gray-500 py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#134B70]"></div>
              <p className="mt-4">Memuat...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center text-gray-500 py-12">Belum ada kegiatan tersedia.</div>
          ) : (
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className={`bg-white/60 rounded-lg p-6 transition-all duration-500 hover:bg-white/90 hover:shadow-md transform hover:scale-[1.01] cursor-pointer 
                  ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="flex justify-between items-center flex-wrap">
                    <div className="transition-all duration-300 hover:translate-x-1 mb-2 md:mb-0">
                      <h3 className="text-xl font-semibold text-[#134B70]">{activity.title}</h3>
                      <p className="text-sm text-gray-500">{activity.type} - {new Date(activity.date).toLocaleDateString()}</p>
                      <p className="text-gray-600 mt-2">{activity.description}</p>
                    </div>
                    <span className="bg-[#201E43] text-white px-3 py-1 rounded-lg transition-all duration-300 hover:bg-[#134B70] hover:shadow-md">
                      {activity.points} Poin
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ActivitiesInfo;