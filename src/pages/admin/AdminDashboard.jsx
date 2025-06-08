import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileCheck, 
  Users as UsersIcon, 
  LogOut, 
  CircleAlert,
  XCircle, 
  User,
  RefreshCw,
  CalendarDays,
  Award,
  AlertCircle,
  Check
} from 'lucide-react';

// Import komponen-komponen terpisah
import Event from './Event';
import RecognizedCourse from './RecognizedCourse';
import Users from './Users';
import SubmissionVerification from './SubmissionVerification';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [statisticsData, setStatisticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [chartUpdateTime, setChartUpdateTime] = useState(Date.now());
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSubmissions: 0,
    approvedSubmissions: 0,
    pendingSubmissions: 0,
    rejectedSubmissions: 0,
    completedStudents: 0,
    inProgressStudents: 0,
    notStartedStudents: 0
  });

  // Modal states
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Animation states
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Base API URL
  const API_BASE_URL = 'https://tifpoint-production.up.railway.app/api';

  // Enhanced success notification function
  const showSuccessNotification = (message) => {
    setSuccessMessage(message);
    setShowSuccessAnimation(true);
    setTimeout(() => {
      setShowSuccessAnimation(false);
      setSuccessMessage('');
    }, 3000);
  };

  // Function to handle logout with confirmation
  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    
    // Simulate logout process with animation
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLogoutModalOpen(false);
      showSuccessNotification('Berhasil logout! Anda akan dialihkan...');
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }, 1000);
  };

  // Function to manually refresh data
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
    setChartUpdateTime(Date.now());
  };

  // Function to test with demo data
  const loadDemoData = () => {
    console.log('Loading demo data for chart testing...');
    const demoStats = {
      totalStudents: 150,
      totalSubmissions: 450,
      approvedSubmissions: 380,
      pendingSubmissions: 25,
      rejectedSubmissions: 45,
      completedStudents: 45,
      inProgressStudents: 85,
      notStartedStudents: 20
    };
    setStats(demoStats);
    setChartUpdateTime(Date.now());
    setDashboardData({
      overview: {
        totalStudents: 150,
        totalActivities: 450,
        approvedActivities: 380,
        pendingActivities: 25,
        rejectedActivities: 45,
        completedStudents: 45,
        inProgressStudents: 85,
        notStartedStudents: 20
      }
    });
    setStatisticsData({
      activitiesByType: [
        { type: "Seminar", count: 120, totalPoints: 360 },
        { type: "Workshop", count: 100, totalPoints: 500 },
        { type: "Sertifikasi", count: 80, totalPoints: 800 }
      ],
      activitiesByCompetency: [
        { competency: "Software Developer", count: 180, totalPoints: 900 },
        { competency: "Data Analyst", count: 120, totalPoints: 600 }
      ]
    });
    showSuccessNotification('Demo data loaded for testing charts!');
  };

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    // Force re-render to remove pulse effect after 3 seconds
    const timer = setTimeout(() => {
      setChartUpdateTime(prev => prev); // Trigger re-render
    }, 3100);
    
    return () => clearTimeout(timer);
  }, [chartUpdateTime]);

  // Fetch data from API for dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Sesi login telah berakhir. Silakan login kembali.');
          setLoading(false);
          return;
        }
        
        const headers = getAuthHeaders();

        // Fetch dashboard overview data
        const dashboardResponse = await fetch(`${API_BASE_URL}/dashboard/admin`, {
          method: 'GET',
          headers
        });
        
        if (!dashboardResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const dashboardData = await dashboardResponse.json();

        // Fetch statistics data
        const statisticsResponse = await fetch(`${API_BASE_URL}/dashboard/statistics`, {
          method: 'GET',
          headers
        });
        
        if (!statisticsResponse.ok) {
          throw new Error('Failed to fetch statistics data');
        }
        const statisticsData = await statisticsResponse.json();

        // Fetch recent activities for pending submissions table
        const activitiesResponse = await fetch(`${API_BASE_URL}/activities`, {
          method: 'GET',
          headers
        });
        
        let activitiesData = { activities: [] };
        if (activitiesResponse.ok) {
          activitiesData = await activitiesResponse.json();
        }

        // Transform activities data for pending submissions
        const activitiesArray = activitiesData.activities || activitiesData || [];
        const pendingActivities = Array.isArray(activitiesArray) 
          ? activitiesArray.filter(activity => activity.status === 'PENDING').slice(0, 5)
          : [];

        setDashboardData(dashboardData);
        setStatisticsData(statisticsData);
        setSubmissions(pendingActivities);
        
        // Set stats from dashboard overview
        if (dashboardData.overview) {
          const newStats = {
            totalStudents: dashboardData.overview.totalStudents || 0,
            totalSubmissions: dashboardData.overview.totalActivities || 0,
            approvedSubmissions: dashboardData.overview.approvedActivities || 0,
            pendingSubmissions: dashboardData.overview.pendingActivities || 0,
            rejectedSubmissions: dashboardData.overview.rejectedActivities || 0,
            completedStudents: dashboardData.overview.completedStudents || 0,
            inProgressStudents: dashboardData.overview.inProgressStudents || 0,
            notStartedStudents: dashboardData.overview.notStartedStudents || 0
          };
          
          console.log('Dashboard Stats Updated:', newStats);
          console.log('Statistics Data:', statisticsData);
          setStats(newStats);
          setChartUpdateTime(Date.now());
        } else {
          // Fallback demo data for testing chart functionality
          console.log('Using demo data for testing');
          const demoStats = {
            totalStudents: 150,
            totalSubmissions: 450,
            approvedSubmissions: 380,
            pendingSubmissions: 25,
            rejectedSubmissions: 45,
            completedStudents: 45,
            inProgressStudents: 85,
            notStartedStudents: 20
          };
          setStats(demoStats);
          setChartUpdateTime(Date.now());
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Terjadi kesalahan saat memuat data dashboard');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [refreshTrigger]);

  // Open submission modal for dashboard (simple view)
  const openSubmissionModal = (submission) => {
    // This is now handled by SubmissionVerification component
    // You can add a simple alert or redirect to verification tab
    setActiveTab('verification');
  };

  // Helper function to calculate bar height for charts
  const calculateBarHeight = (value, total, maxHeight = 160) => {
    if (total === 0 || value === 0) return 20; // minimum height
    const percentage = (value / total);
    const height = Math.max(20, percentage * maxHeight); // minimum 20px
    return Math.min(height, maxHeight); // maximum based on container
  };

  // Render dashboard content
  const renderDashboardContent = () => {
    const pendingSubmissions = submissions || [];
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Dashboard Admin</h2>
          <div className="flex items-center space-x-3">
            {dashboardData && (
              <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            )}
            <button 
              onClick={loadDemoData}
              className="flex items-center px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 text-sm"
            >
              📊 Test Charts
            </button>
            <button 
              onClick={refreshData}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-slideIn">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info - Show when data is available */}
        {dashboardData && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg animate-slideIn">
            <div className="flex">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Dashboard data loaded successfully. 
                  {statisticsData && " Statistics data also available."}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Current stats: {stats.totalSubmissions} total, {stats.approvedSubmissions} approved, {stats.pendingSubmissions} pending, {stats.rejectedSubmissions} rejected
                  <br />
                  Chart last updated: {new Date(chartUpdateTime).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Mahasiswa</p>
                <h3 className="text-2xl font-bold">{stats.totalStudents}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Kegiatan</p>
                <h3 className="text-2xl font-bold">{stats.totalSubmissions}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FileCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Kegiatan Disetujui</p>
                <h3 className="text-2xl font-bold">{stats.approvedSubmissions}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FileCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Menunggu Verifikasi</p>
                <h3 className="text-2xl font-bold">{stats.pendingSubmissions}</h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <CircleAlert className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Student Progress Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Mahasiswa Lulus</p>
                <h3 className="text-2xl font-bold text-green-600">{stats.completedStudents}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.totalStudents > 0 ? Math.round((stats.completedStudents / stats.totalStudents) * 100) : 0}% dari total
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sedang Berjalan</p>
                <h3 className="text-2xl font-bold text-blue-600">{stats.inProgressStudents}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.totalStudents > 0 ? Math.round((stats.inProgressStudents / stats.totalStudents) * 100) : 0}% dari total
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Belum Mulai</p>
                <h3 className="text-2xl font-bold text-gray-600">{stats.notStartedStudents}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.totalStudents > 0 ? Math.round((stats.notStartedStudents / stats.totalStudents) * 100) : 0}% dari total
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <CircleAlert className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Student Progress Chart - FIXED */}
        <div className={`bg-white rounded-lg shadow p-6 transform transition-all duration-500 hover:shadow-lg ${
          Date.now() - chartUpdateTime < 2000 ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
        }`} key={`student-chart-${chartUpdateTime}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Progress Mahasiswa</h2>
            {Date.now() - chartUpdateTime < 2000 && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded animate-pulse">
                Updated!
              </span>
            )}
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="w-full max-w-lg">
              <div className="flex justify-between items-end h-40 mt-4" style={{ height: '160px' }}>
                <div className="w-1/3 mx-1 flex flex-col justify-end h-full">
                  <div 
                    className={`bg-green-500 rounded-t-lg w-full transition-all duration-1000 ease-out ${
                      Date.now() - chartUpdateTime < 3000 ? 'animate-pulse' : ''
                    }`}
                    style={{ 
                      height: `${calculateBarHeight(stats.completedStudents, Math.max(stats.totalStudents, stats.completedStudents, stats.inProgressStudents, stats.notStartedStudents))}px`
                    }}
                    key={`green-bar-${chartUpdateTime}-${stats.completedStudents}`}
                  ></div>
                  <p className="text-xs text-center mt-2">Lulus ({stats.completedStudents})</p>
                </div>
                <div className="w-1/3 mx-1 flex flex-col justify-end h-full">
                  <div 
                    className={`bg-blue-500 rounded-t-lg w-full transition-all duration-1000 ease-out ${
                      Date.now() - chartUpdateTime < 3000 ? 'animate-pulse' : ''
                    }`}
                    style={{ 
                      height: `${calculateBarHeight(stats.inProgressStudents, Math.max(stats.totalStudents, stats.completedStudents, stats.inProgressStudents, stats.notStartedStudents))}px`
                    }}
                    key={`blue-bar-${chartUpdateTime}-${stats.inProgressStudents}`}
                  ></div>
                  <p className="text-xs text-center mt-2">Berjalan ({stats.inProgressStudents})</p>
                </div>
                <div className="w-1/3 mx-1 flex flex-col justify-end h-full">
                  <div 
                    className={`bg-gray-500 rounded-t-lg w-full transition-all duration-1000 ease-out ${
                      Date.now() - chartUpdateTime < 3000 ? 'animate-pulse' : ''
                    }`}
                    style={{ 
                      height: `${calculateBarHeight(stats.notStartedStudents, Math.max(stats.totalStudents, stats.completedStudents, stats.inProgressStudents, stats.notStartedStudents))}px`
                    }}
                    key={`gray-bar-${chartUpdateTime}-${stats.notStartedStudents}`}
                  ></div>
                  <p className="text-xs text-center mt-2">Belum Mulai ({stats.notStartedStudents})</p>
                </div>
              </div>
              
              {/* Percentage Labels */}
              <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                <div className="w-1/3 text-center">
                  {stats.totalStudents > 0 ? Math.round((stats.completedStudents / stats.totalStudents) * 100) : 0}%
                </div>
                <div className="w-1/3 text-center">
                  {stats.totalStudents > 0 ? Math.round((stats.inProgressStudents / stats.totalStudents) * 100) : 0}%
                </div>
                <div className="w-1/3 text-center">
                  {stats.totalStudents > 0 ? Math.round((stats.notStartedStudents / stats.totalStudents) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Statistics Chart - FIXED */}
        <div className={`bg-white rounded-lg shadow p-6 transform transition-all duration-500 hover:shadow-lg ${
          Date.now() - chartUpdateTime < 2000 ? 'ring-2 ring-green-500 ring-opacity-50' : ''
        }`} key={`activity-chart-${chartUpdateTime}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Statistik Kegiatan</h2>
            {Date.now() - chartUpdateTime < 2000 && (
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded animate-pulse">
                Updated!
              </span>
            )}
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="w-full max-w-lg">
              <div className="flex justify-between items-end h-40 mt-4" style={{ height: '160px' }}>
                <div className="w-1/4 mx-1 flex flex-col justify-end h-full">
                  <div 
                    className={`bg-blue-500 rounded-t-lg w-full transition-all duration-1000 ease-out ${
                      Date.now() - chartUpdateTime < 3000 ? 'animate-pulse' : ''
                    }`}
                    style={{ 
                      height: `${calculateBarHeight(stats.totalSubmissions, stats.totalSubmissions)}px`
                    }}
                    key={`total-bar-${chartUpdateTime}-${stats.totalSubmissions}`}
                  ></div>
                  <p className="text-xs text-center mt-2">Total ({stats.totalSubmissions})</p>
                </div>
                <div className="w-1/4 mx-1 flex flex-col justify-end h-full">
                  <div 
                    className={`bg-green-500 rounded-t-lg w-full transition-all duration-1000 ease-out ${
                      Date.now() - chartUpdateTime < 3000 ? 'animate-pulse' : ''
                    }`}
                    style={{ 
                      height: `${calculateBarHeight(stats.approvedSubmissions, stats.totalSubmissions)}px`
                    }}
                    key={`approved-bar-${chartUpdateTime}-${stats.approvedSubmissions}`}
                  ></div>
                  <p className="text-xs text-center mt-2">Disetujui ({stats.approvedSubmissions})</p>
                </div>
                <div className="w-1/4 mx-1 flex flex-col justify-end h-full">
                  <div 
                    className={`bg-yellow-500 rounded-t-lg w-full transition-all duration-1000 ease-out ${
                      Date.now() - chartUpdateTime < 3000 ? 'animate-pulse' : ''
                    }`}
                    style={{ 
                      height: `${calculateBarHeight(stats.pendingSubmissions, stats.totalSubmissions)}px`
                    }}
                    key={`pending-bar-${chartUpdateTime}-${stats.pendingSubmissions}`}
                  ></div>
                  <p className="text-xs text-center mt-2">Pending ({stats.pendingSubmissions})</p>
                </div>
                <div className="w-1/4 mx-1 flex flex-col justify-end h-full">
                  <div 
                    className={`bg-red-500 rounded-t-lg w-full transition-all duration-1000 ease-out ${
                      Date.now() - chartUpdateTime < 3000 ? 'animate-pulse' : ''
                    }`}
                    style={{ 
                      height: `${calculateBarHeight(stats.rejectedSubmissions, stats.totalSubmissions)}px`
                    }}
                    key={`rejected-bar-${chartUpdateTime}-${stats.rejectedSubmissions}`}
                  ></div>
                  <p className="text-xs text-center mt-2">Ditolak ({stats.rejectedSubmissions})</p>
                </div>
              </div>
              
              {/* Percentage Labels */}
              <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                <div className="w-1/4 text-center">
                  100%
                </div>
                <div className="w-1/4 text-center">
                  {stats.totalSubmissions > 0 ? Math.round((stats.approvedSubmissions / stats.totalSubmissions) * 100) : 0}%
                </div>
                <div className="w-1/4 text-center">
                  {stats.totalSubmissions > 0 ? Math.round((stats.pendingSubmissions / stats.totalSubmissions) * 100) : 0}%
                </div>
                <div className="w-1/4 text-center">
                  {stats.totalSubmissions > 0 ? Math.round((stats.rejectedSubmissions / stats.totalSubmissions) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Type Statistics */}
        {statisticsData?.activitiesByType && (
          <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-500 hover:shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Kegiatan Berdasarkan Tipe</h2>
            <div className="space-y-3">
              {statisticsData.activitiesByType.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.type}</h4>
                    <p className="text-sm text-gray-500">{item.count} kegiatan</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{item.totalPoints} poin</p>
                    <p className="text-xs text-gray-400">Total poin</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Competency Statistics */}
        {statisticsData?.activitiesByCompetency && (
          <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-500 hover:shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Kegiatan Berdasarkan Kompetensi</h2>
            <div className="space-y-3">
              {statisticsData.activitiesByCompetency.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.competency}</h4>
                    <p className="text-sm text-gray-500">{item.count} kegiatan</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{item.totalPoints} poin</p>
                    <p className="text-xs text-gray-400">Total poin</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Recent Pending Activities Table */}
        <div className="bg-white rounded-lg shadow transform transition-all duration-500 hover:shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Kegiatan Terbaru yang Perlu Diverifikasi</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingSubmissions.length > 0 ? (
                  pendingSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.user?.name || 'Unknown User'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {submission.title || 'Unknown Activity'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 animate-pulse">
                          Menunggu
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          onClick={() => openSubmissionModal(submission)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium transition-colors duration-200 hover:underline"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada kegiatan yang menunggu verifikasi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading && !dashboardData && !statisticsData) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 animate-pulse">Memuat data dashboard...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return renderDashboardContent();
      case 'users':
        return <Users showSuccessNotification={showSuccessNotification} />;
      case 'verification':
        return <SubmissionVerification showSuccessNotification={showSuccessNotification} />;
      case 'events':
        return <Event showSuccessNotification={showSuccessNotification} />;
      case 'courses':
        return <RecognizedCourse showSuccessNotification={showSuccessNotification} />;
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] animate-fadeIn">
          <div className="bg-white rounded-lg p-8 shadow-2xl transform transition-all duration-500 animate-bounceIn">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-checkmark">
                <Check className="h-8 w-8 text-green-600 animate-checkScale" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Berhasil!</h3>
              <p className="text-gray-600 text-center">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-gray-800">
          <div className="flex items-center justify-center h-16 bg-gray-900">
            <h1 className="text-white font-bold text-xl">TIFPoint Admin</h1>
          </div>
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`${
                  activeTab === 'dashboard'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full transition-all duration-200 transform hover:scale-105`}
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`${
                  activeTab === 'users'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full transition-all duration-200 transform hover:scale-105`}
              >
                <UsersIcon className="mr-3 h-5 w-5" />
                Manajemen Pengguna
              </button>

              <button
                onClick={() => setActiveTab('verification')}
                className={`${
                  activeTab === 'verification'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full transition-all duration-200 transform hover:scale-105`}
              >
                <FileCheck className="mr-3 h-5 w-5" />
                Verifikasi Pengajuan
              </button>

              <button
                onClick={() => setActiveTab('events')}
                className={`${
                  activeTab === 'events'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full transition-all duration-200 transform hover:scale-105`}
              >
                <CalendarDays className="mr-3 h-5 w-5" />
                Manajemen Event
              </button>

              <button
                onClick={() => setActiveTab('courses')}
                className={`${
                  activeTab === 'courses'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full transition-all duration-200 transform hover:scale-105`}
              >
                <Award className="mr-3 h-5 w-5" />
                Kursus Terakreditasi
              </button>
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="bg-gray-300 rounded-full p-1">
                  <User className="h-8 w-8 text-gray-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Admin TIFPoint</p>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center text-xs font-medium text-gray-400 hover:text-white transition-colors duration-200 hover:underline"
                  >
                    <LogOut className="mr-1 h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 border-b border-gray-200 bg-white">
          <div className="flex items-center md:hidden">
            <h1 className="text-lg font-medium">TIFPoint Admin</h1>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 animate-slideInUp">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                Konfirmasi Logout
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600">
                Apakah Anda yakin ingin keluar dari sistem?
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                disabled={isLoggingOut}
              >
                Batal
              </button>
              <button
                onClick={confirmLogout}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Logging out...
                  </div>
                ) : (
                  'Ya, Logout'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from { 
            opacity: 0;
            transform: translateX(-20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from { 
            opacity: 0;
            transform: translateX(20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes checkScale {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.3s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.6s ease-out;
        }
        
        .animate-checkScale {
          animation: checkScale 0.4s ease-out 0.2s both;
        }
        
        .animate-checkmark {
          animation: bounceIn 0.5s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        
        .delay-100 {
          animation-delay: 0.1s;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-400 {
          animation-delay: 0.4s;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
}