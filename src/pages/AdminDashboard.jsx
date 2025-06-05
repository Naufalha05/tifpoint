import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileCheck, 
  Users, 
  Search, 
  LogOut, 
  ChevronDown, 
  CheckCircle2, 
  CircleAlert,
  XCircle, 
  BarChart3,
  User,
  RefreshCw,
  CalendarDays,
  Award,
  PlusCircle,
  Edit,
  Trash,
  AlertCircle,
  Upload,
  Check
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [recognizedCourses, setRecognizedCourses] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [approvalPoints, setApprovalPoints] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSubmissions: 0,
    approvedSubmissions: 0,
    pendingSubmissions: 0,
    rejectedSubmissions: 0
  });

  // Modal states for events and courses
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('');

  // Animation states
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Form states
  const [eventFormData, setEventFormData] = useState({
    id: '',
    title: '',
    description: '',
    date: '',
    location: '',
    pointValue: '',
    isEditing: false
  });

  const [courseFormData, setCourseFormData] = useState({
    id: '',
    name: '',
    provider: '',
    duration: '',
    pointValue: '',
    url: '',
    isEditing: false
  });

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
  };

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
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

        // Fetch submissions - Fixed endpoint
        const submissionsResponse = await fetch(`${API_BASE_URL}/activities`, {
          method: 'GET',
          headers
        });
        
        if (!submissionsResponse.ok) {
          throw new Error('Failed to fetch submissions');
        }
        const submissionsData = await submissionsResponse.json();
        
        // Fetch users (admin only) - Fixed endpoint
        const usersResponse = await fetch(`${API_BASE_URL}/users`, {
          method: 'GET',
          headers
        });
        
        let usersData = [];
        if (usersResponse.ok) {
          usersData = await usersResponse.json();
        } else {
          console.warn('Failed to fetch users - might not have admin permissions');
        }

        // Fetch events - Fixed endpoint
        const eventsResponse = await fetch(`${API_BASE_URL}/events`, {
          method: 'GET',
          headers
        });
        
        if (!eventsResponse.ok) {
          throw new Error('Failed to fetch events');
        }
        const eventsData = await eventsResponse.json();

        // Fetch recognized courses - Fixed endpoint
        const coursesResponse = await fetch(`${API_BASE_URL}/recognized-courses`, {
          method: 'GET',
          headers
        });
        
        if (!coursesResponse.ok) {
          throw new Error('Failed to fetch recognized courses');
        }
        const coursesData = await coursesResponse.json();
        
        // Transform submissions data
        const transformedSubmissions = Array.isArray(submissionsData) 
          ? submissionsData.map(sub => ({
              id: sub.id,
              userId: sub.userId,
              eventId: sub.eventId,
              evidence: sub.evidence,
              status: sub.status || 'pending',
              createdAt: sub.createdAt,
              updatedAt: sub.updatedAt,
              user: sub.user || {},
              event: sub.event || {}
            }))
          : [];
        
        const transformedUsers = Array.isArray(usersData)
          ? usersData.map(user => ({
              id: user.id,
              username: user.username,
              email: user.email,
              name: user.name,
              nim: user.nim,
              role: user.role,
              createdAt: user.createdAt
            }))
          : [];

        const transformedEvents = Array.isArray(eventsData)
          ? eventsData.map(event => ({
              id: event.id,
              title: event.title,
              description: event.description,
              date: event.date,
              location: event.location,
              pointValue: event.pointValue,
              createdAt: event.createdAt
            }))
          : [];

        const transformedCourses = Array.isArray(coursesData)
          ? coursesData.map(course => ({
              id: course.id,
              name: course.name,
              provider: course.provider,
              duration: course.duration,
              pointValue: course.pointValue,
              url: course.url,
              createdAt: course.createdAt
            }))
          : [];
        
        setSubmissions(transformedSubmissions);
        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
        setEvents(transformedEvents);
        setFilteredEvents(transformedEvents);
        setRecognizedCourses(transformedCourses);
        setFilteredCourses(transformedCourses);
        
        // Calculate statistics - Fixed to count only students
        const pendingCount = transformedSubmissions.filter(sub => sub.status === 'pending').length;
        const approvedCount = transformedSubmissions.filter(sub => sub.status === 'approved').length;
        const rejectedCount = transformedSubmissions.filter(sub => sub.status === 'rejected').length;
        
        // Count only students (users who are not admin)
        const studentCount = transformedUsers.filter(user => 
          user.role && user.role.toLowerCase() !== 'admin'
        ).length;
        
        setStats({
          totalStudents: studentCount, // Only count students, not all users
          totalSubmissions: transformedSubmissions.length,
          approvedSubmissions: approvedCount,
          pendingSubmissions: pendingCount,
          rejectedSubmissions: rejectedCount
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Terjadi kesalahan saat memuat data');
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  // Filter users by search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        (user.nim && user.nim.toLowerCase().includes(searchQuery.toLowerCase())) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Filter events by search query
  useEffect(() => {
    if (eventSearchQuery.trim() === '') {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(event => 
        event.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
        (event.location && event.location.toLowerCase().includes(eventSearchQuery.toLowerCase()))
      );
      setFilteredEvents(filtered);
    }
  }, [eventSearchQuery, events]);

  // Filter courses by search query
  useEffect(() => {
    if (courseSearchQuery.trim() === '') {
      setFilteredCourses(recognizedCourses);
    } else {
      const filtered = recognizedCourses.filter(course => 
        course.name.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
        course.provider.toLowerCase().includes(courseSearchQuery.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [courseSearchQuery, recognizedCourses]);

  // Handle approving submission
  const handleApprove = async (submissionId) => {
    try {
      setLoading(true);
      setError(null);
      
      const points = parseInt(approvalPoints);
      if (isNaN(points) || points < 0) {
        throw new Error('Jumlah poin tidak valid. Masukkan angka yang valid.');
      }
      
      // Use PATCH endpoint for updating submission status
      const response = await fetch(`${API_BASE_URL}/activities/${submissionId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          status: 'approved',
          points: points,
          feedback: 'Pengajuan Anda telah disetujui dengan poin: ' + points
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gagal menyetujui pengajuan: ${errorText}`);
      }
      
      // Update local data
      const updatedSubmissions = submissions.map(sub => 
        sub.id === submissionId ? {...sub, status: 'approved', points: points} : sub
      );
      
      setSubmissions(updatedSubmissions);
      setIsModalOpen(false);
      setApprovalPoints('');
      
      // Update stats
      setStats({
        ...stats,
        approvedSubmissions: stats.approvedSubmissions + 1,
        pendingSubmissions: stats.pendingSubmissions - 1
      });
      
      setLoading(false);
      showSuccessNotification('Pengajuan berhasil disetujui!');
      refreshData();
    } catch (error) {
      console.error('Error approving submission:', error);
      setError(error.message || 'Gagal menyetujui pengajuan');
      setLoading(false);
    }
  };

  // Handle rejecting submission
  const handleReject = async (submissionId) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!rejectionComment || rejectionComment.trim() === '') {
        throw new Error('Silakan berikan alasan penolakan');
      }
      
      // Use PATCH endpoint for updating submission status
      const response = await fetch(`${API_BASE_URL}/activities/${submissionId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          status: 'rejected',
          feedback: rejectionComment 
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gagal menolak pengajuan: ${errorText}`);
      }
      
      // Update local data
      const updatedSubmissions = submissions.map(sub => 
        sub.id === submissionId ? {...sub, status: 'rejected', feedback: rejectionComment} : sub
      );
      
      setSubmissions(updatedSubmissions);
      setRejectionComment('');
      setIsModalOpen(false);
      
      // Update stats
      setStats({
        ...stats,
        pendingSubmissions: stats.pendingSubmissions - 1,
        rejectedSubmissions: stats.rejectedSubmissions + 1
      });
      
      setLoading(false);
      showSuccessNotification('Pengajuan berhasil ditolak!');
      refreshData();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      setError(error.message || 'Gagal menolak pengajuan');
      setLoading(false);
    }
  };

  // Handle event form
  const handleEventFormChange = (e) => {
    const { name, value } = e.target;
    setEventFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle course form
  const handleCourseFormChange = (e) => {
    const { name, value } = e.target;
    setCourseFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save event
  const handleSaveEvent = async () => {
    try {
      setLoading(true);
      
      if (!eventFormData.title || !eventFormData.date || !eventFormData.pointValue) {
        throw new Error('Judul, tanggal, dan poin harus diisi.');
      }
      
      const payload = {
        title: eventFormData.title,
        description: eventFormData.description,
        date: eventFormData.date,
        location: eventFormData.location,
        pointValue: parseInt(eventFormData.pointValue)
      };
      
      let response;
      
      if (eventFormData.isEditing) {
        response = await fetch(`${API_BASE_URL}/events/${eventFormData.id}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/events`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
      }
      
      if (!response.ok) {
        throw new Error('Gagal menyimpan event');
      }
      
      // Reset form and close modal
      setEventFormData({
        id: '',
        title: '',
        description: '',
        date: '',
        location: '',
        pointValue: '',
        isEditing: false
      });
      
      setIsEventModalOpen(false);
      setLoading(false);
      showSuccessNotification(eventFormData.isEditing ? 'Event berhasil diperbarui!' : 'Event berhasil ditambahkan!');
      refreshData();
      
    } catch (error) {
      console.error('Error saving event:', error);
      setError(error.message || 'Gagal menyimpan event');
      setLoading(false);
    }
  };

  // Save recognized course
  const handleSaveCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!courseFormData.name || !courseFormData.provider || !courseFormData.pointValue) {
        throw new Error('Nama, provider, dan poin harus diisi.');
      }
      
      const payload = {
        name: courseFormData.name,
        provider: courseFormData.provider,
        duration: parseInt(courseFormData.duration) || 0,
        pointValue: parseInt(courseFormData.pointValue),
        url: courseFormData.url
      };
      
      let response;
      
      if (courseFormData.isEditing) {
        response = await fetch(`${API_BASE_URL}/recognized-courses/${courseFormData.id}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/recognized-courses`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
      }
      
      if (!response.ok) {
        throw new Error('Gagal menyimpan course');
      }
      
      // Reset form and close modal
      setCourseFormData({
        id: '',
        name: '',
        provider: '',
        duration: '',
        pointValue: '',
        url: '',
        isEditing: false
      });
      
      setIsCourseModalOpen(false);
      setLoading(false);
      showSuccessNotification(courseFormData.isEditing ? 'Kursus berhasil diperbarui!' : 'Kursus berhasil ditambahkan!');
      refreshData();
      
    } catch (error) {
      console.error('Error saving course:', error);
      setError(error.message || 'Gagal menyimpan course');
      setLoading(false);
    }
  };

  // Delete item
  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let endpoint;
      if (deleteType === 'event') {
        endpoint = `${API_BASE_URL}/events/${itemToDelete.id}`;
      } else if (deleteType === 'course') {
        endpoint = `${API_BASE_URL}/recognized-courses/${itemToDelete.id}`;
      } else if (deleteType === 'user') {
        endpoint = `${API_BASE_URL}/users/${itemToDelete.id}`;
      } else {
        throw new Error('Tipe item tidak valid');
      }
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gagal menghapus ${deleteType}: ${errorText}`);
      }
      
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setDeleteType('');
      setLoading(false);
      showSuccessNotification(`${deleteType === 'event' ? 'Event' : deleteType === 'course' ? 'Kursus' : 'Pengguna'} berhasil dihapus!`);
      refreshData();
      
    } catch (error) {
      console.error('Error deleting item:', error);
      setError(error.message || `Gagal menghapus ${deleteType === 'event' ? 'event' : 'course'}`);
      setLoading(false);
    }
  };

  // Open modals
  const openSubmissionModal = (submission) => {
    setSelectedSubmission(submission);
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const openEventModal = (event = null) => {
    setError(null);
    setSuccess(null);
    if (event) {
      setEventFormData({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
        location: event.location,
        pointValue: event.pointValue.toString(),
        isEditing: true
      });
    } else {
      setEventFormData({
        id: '',
        title: '',
        description: '',
        date: '',
        location: '',
        pointValue: '',
        isEditing: false
      });
    }
    setIsEventModalOpen(true);
  };

  const openCourseModal = (course = null) => {
    setError(null);
    setSuccess(null);
    if (course) {
      setCourseFormData({
        id: course.id,
        name: course.name,
        provider: course.provider,
        duration: course.duration.toString(),
        pointValue: course.pointValue.toString(),
        url: course.url,
        isEditing: true
      });
    } else {
      setCourseFormData({
        id: '',
        name: '',
        provider: '',
        duration: '',
        pointValue: '',
        url: '',
        isEditing: false
      });
    }
    setIsCourseModalOpen(true);
  };

  const openDeleteModal = (item, type) => {
    setError(null);
    setSuccess(null);
    setItemToDelete(item);
    setDeleteType(type);
    setIsDeleteModalOpen(true);
  };

  // Render dashboard content
  const renderDashboardContent = () => {
    const pendingSubmissions = submissions.filter(sub => sub.status === 'pending');
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Dashboard Admin</h2>
          <button 
            onClick={refreshData}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </button>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Mahasiswa</p>
                <h3 className="text-2xl font-bold">{stats.totalStudents}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Pengajuan</p>
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
                <p className="text-sm text-gray-500">Pengajuan Disetujui</p>
                <h3 className="text-2xl font-bold">{stats.approvedSubmissions}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
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
        
        {/* Submission Chart */}
        <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-500 hover:shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Statistik Pengajuan Kegiatan</h2>
          <div className="h-64 flex items-center justify-center">
            <div className="w-full max-w-lg">
              <div className="flex justify-between items-end h-40 mt-4">
                <div className="w-1/4 mx-1">
                  <div 
                    className="bg-blue-500 rounded-t-lg w-full transition-all duration-1000 ease-out" 
                    style={{ height: `${(stats.totalSubmissions / Math.max(stats.totalSubmissions, 1)) * 100}%`, minHeight: '20px' }}
                  ></div>
                  <p className="text-xs text-center mt-2">Total ({stats.totalSubmissions})</p>
                </div>
                <div className="w-1/4 mx-1">
                  <div 
                    className="bg-green-500 rounded-t-lg w-full transition-all duration-1000 ease-out delay-200" 
                    style={{ height: `${(stats.approvedSubmissions / Math.max(stats.totalSubmissions, 1)) * 100}%`, minHeight: '20px' }}
                  ></div>
                  <p className="text-xs text-center mt-2">Disetujui ({stats.approvedSubmissions})</p>
                </div>
                <div className="w-1/4 mx-1">
                  <div 
                    className="bg-yellow-500 rounded-t-lg w-full transition-all duration-1000 ease-out delay-400" 
                    style={{ height: `${(stats.pendingSubmissions / Math.max(stats.totalSubmissions, 1)) * 100}%`, minHeight: '20px' }}
                  ></div>
                  <p className="text-xs text-center mt-2">Pending ({stats.pendingSubmissions})</p>
                </div>
                <div className="w-1/4 mx-1">
                  <div 
                    className="bg-red-500 rounded-t-lg w-full transition-all duration-1000 ease-out delay-600" 
                    style={{ height: `${(stats.rejectedSubmissions / Math.max(stats.totalSubmissions, 1)) * 100}%`, minHeight: '20px' }}
                  ></div>
                  <p className="text-xs text-center mt-2">Ditolak ({stats.rejectedSubmissions})</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pending Submissions Table */}
        <div className="bg-white rounded-lg shadow transform transition-all duration-500 hover:shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Pengajuan yang Perlu Diverifikasi</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
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
                        {submission.event?.title || 'Unknown Event'}
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
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada pengajuan yang menunggu verifikasi
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

  // Render users content
  const renderUsersContent = () => {
    return (
      <div className="bg-white rounded-lg shadow transform transition-all duration-500 hover:shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Manajemen Data Pengguna</h2>
            <button 
              onClick={refreshData}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
          <div className="mt-4 relative">
            <input
              type="text"
              placeholder="Cari berdasarkan NIM, nama, atau email..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 focus:scale-105"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-3 text-gray-400">
              <Search size={18} />
            </div>
          </div>
        </div>
        
        {error && (
          <div className="p-4 m-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-slideIn">
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
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-gray-600 animate-pulse">Memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200 animate-slideInUp" style={{animationDelay: `${index * 100}ms`}}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.nim || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full transition-all duration-200 ${
                          user.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role !== 'ADMIN' && (
                          <button 
                            onClick={() => openDeleteModal(user, 'user')}
                            className="text-red-600 hover:text-red-900 transition-all duration-200 transform hover:scale-110"
                            title="Hapus User"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchQuery ? 'Tidak ada pengguna yang sesuai dengan pencarian' : 'Tidak ada data pengguna'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Render verification content
  const renderVerificationContent = () => {
    return (
      <div className="bg-white rounded-lg shadow transform transition-all duration-500 hover:shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Verifikasi Pengajuan</h2>
            <button 
              onClick={refreshData}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
        
        {error && (
          <div className="p-4 m-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-slideIn">
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
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-gray-600 animate-pulse">Memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Submit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.length > 0 ? (
                  submissions.map((submission, index) => (
                    <tr key={submission.id} className="hover:bg-gray-50 transition-colors duration-200 animate-slideInUp" style={{animationDelay: `${index * 100}ms`}}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.user?.name || 'Unknown User'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {submission.event?.title || 'Unknown Event'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.status === 'pending' && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 animate-pulse">
                            Menunggu
                          </span>
                        )}
                        {submission.status === 'approved' && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Disetujui
                          </span>
                        )}
                        {submission.status === 'rejected' && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Ditolak
                          </span>
                        )}
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
                      Tidak ada data pengajuan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Render events content
  const renderEventsContent = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow transform transition-all duration-500 hover:shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-semibold">Manajemen Event</h2>
              <div className="flex gap-2">
                <button 
                  onClick={refreshData}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
                <button 
                  onClick={() => openEventModal()}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Tambah Event
                </button>
              </div>
            </div>
            <div className="mt-4 relative">
              <input
                type="text"
                placeholder="Cari berdasarkan judul atau lokasi..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 focus:scale-105"
                value={eventSearchQuery}
                onChange={(e) => setEventSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-3 text-gray-400">
                <Search size={18} />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="p-4 m-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-slideIn">
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
          
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="ml-3 text-gray-600 animate-pulse">Memuat data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event, index) => (
                      <tr key={event.id} className="hover:bg-gray-50 transition-colors duration-200 animate-slideInUp" style={{animationDelay: `${index * 100}ms`}}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.location || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.pointValue}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{event.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => openEventModal(event)}
                              className="text-blue-600 hover:text-blue-900 transition-all duration-200 transform hover:scale-110"
                              title="Edit"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => openDeleteModal(event, 'event')}
                              className="text-red-600 hover:text-red-900 transition-all duration-200 transform hover:scale-110"
                              title="Hapus"
                            >
                              <Trash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        {eventSearchQuery ? 'Tidak ada event yang sesuai dengan pencarian' : 'Tidak ada data event'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render courses content
  const renderCoursesContent = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow transform transition-all duration-500 hover:shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-semibold">Manajemen Kursus Terakreditasi</h2>
              <div className="flex gap-2">
                <button 
                  onClick={refreshData}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
                <button 
                  onClick={() => openCourseModal()}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Tambah Kursus
                </button>
              </div>
            </div>
            <div className="mt-4 relative">
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau provider..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 focus:scale-105"
                value={courseSearchQuery}
                onChange={(e) => setCourseSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-3 text-gray-400">
                <Search size={18} />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="p-4 m-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-slideIn">
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
          
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="ml-3 text-gray-600 animate-pulse">Memuat data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course, index) => (
                      <tr key={course.id} className="hover:bg-gray-50 transition-colors duration-200 animate-slideInUp" style={{animationDelay: `${index * 100}ms`}}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.provider}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.duration} jam</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.pointValue}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {course.url ? (
                            <a href={course.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline">
                              Link
                            </a>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => openCourseModal(course)}
                              className="text-blue-600 hover:text-blue-900 transition-all duration-200 transform hover:scale-110"
                              title="Edit"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => openDeleteModal(course, 'course')}
                              className="text-red-600 hover:text-red-900 transition-all duration-200 transform hover:scale-110"
                              title="Hapus"
                            >
                              <Trash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        {courseSearchQuery ? 'Tidak ada kursus yang sesuai dengan pencarian' : 'Tidak ada data kursus'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading && submissions.length === 0 && users.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 animate-pulse">Memuat data...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return renderDashboardContent();
      case 'users':
        return renderUsersContent();
      case 'verification':
        return renderVerificationContent();
      case 'events':
        return renderEventsContent();
      case 'courses':
        return renderCoursesContent();
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
                <Users className="mr-3 h-5 w-5" />
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

      {/* Submission Detail Modal */}
      {isModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 transform transition-all duration-300 animate-slideInUp">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Detail Pengajuan</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors duration-200 transform hover:scale-110"
              >
                <XCircle />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="animate-slideInLeft">
                  <p className="text-sm text-gray-500">User</p>
                  <p className="font-medium">{selectedSubmission.user?.name || 'Unknown User'}</p>
                </div>
                <div className="animate-slideInRight">
                  <p className="text-sm text-gray-500">Event</p>
                  <p className="font-medium">{selectedSubmission.event?.title || 'Unknown Event'}</p>
                </div>
                <div className="animate-slideInLeft delay-100">
                  <p className="text-sm text-gray-500">Tanggal Submit</p>
                  <p className="font-medium">{new Date(selectedSubmission.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="animate-slideInRight delay-100">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    {selectedSubmission.status === 'pending' && (
                      <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs animate-pulse">
                        Menunggu
                      </span>
                    )}
                    {selectedSubmission.status === 'approved' && (
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                        Disetujui
                      </span>
                    )}
                    {selectedSubmission.status === 'rejected' && (
                      <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">
                        Ditolak
                      </span>
                    )}
                  </p>
                </div>
                <div className="md:col-span-2 animate-slideInUp delay-200">
                  <p className="text-sm text-gray-500">Bukti Kegiatan</p>
                  <div className="mt-2">
                    <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-center">
                      {selectedSubmission.evidence ? (
                        <p className="text-gray-700">{selectedSubmission.evidence}</p>
                      ) : (
                        <p className="text-gray-500">Tidak ada bukti</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedSubmission.status === 'pending' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 animate-slideInUp delay-300">
                  <div className="md:col-span-2">
                    <label htmlFor="approvalPoints" className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah Poin (untuk persetujuan) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="approvalPoints"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:scale-105"
                      placeholder="Masukkan jumlah poin..."
                      value={approvalPoints}
                      onChange={(e) => setApprovalPoints(e.target.value)}
                      min="0"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                      Komentar (untuk penolakan) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="comment"
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:scale-105"
                      placeholder="Masukkan alasan penolakan jika diperlukan..."
                      value={rejectionComment}
                      onChange={(e) => setRejectionComment(e.target.value)}
                    ></textarea>
                  </div>
                  <button
                    onClick={() => handleApprove(selectedSubmission.id)}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105"
                    disabled={loading}
                  >
                    <div className="flex items-center justify-center">
                      {loading ? (
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      ) : (
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                      )}
                      Setujui
                    </div>
                  </button>
                  <button
                    onClick={() => handleReject(selectedSubmission.id)}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105"
                    disabled={loading}
                  >
                    <div className="flex items-center justify-center">
                      {loading ? (
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      ) : (
                        <XCircle className="mr-2 h-5 w-5" />
                      )}
                      Tolak
                    </div>
                  </button>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 transform transition-all duration-300 animate-slideInUp">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {eventFormData.isEditing ? 'Edit Event' : 'Tambah Event Baru'}
              </h3>
              <button 
                onClick={() => setIsEventModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors duration-200 transform hover:scale-110"
              >
                <XCircle />
              </button>
            </div>
            <div>
              <div className="px-6 py-4 space-y-4">
                <div className="animate-slideInLeft">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Event <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:scale-105"
                    placeholder="Masukkan judul event..."
                    value={eventFormData.title}
                    onChange={handleEventFormChange}
                    required
                  />
                </div>
                
                <div className="animate-slideInRight delay-100">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:scale-105"
                    placeholder="Deskripsi event..."
                    value={eventFormData.description}
                    onChange={handleEventFormChange}
                  ></textarea>
                </div>
                
                <div className="animate-slideInLeft delay-200">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:scale-105"
                    value={eventFormData.date}
                    onChange={handleEventFormChange}
                    required
                  />
                </div>
                
                <div className="animate-slideInRight delay-300">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Lokasi
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:scale-105"
                    placeholder="Lokasi event..."
                    value={eventFormData.location}
                    onChange={handleEventFormChange}
                  />
                </div>
                
                <div className="animate-slideInLeft delay-400">
                  <label htmlFor="pointValue" className="block text-sm font-medium text-gray-700 mb-1">
                    Nilai Poin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="pointValue"
                    name="pointValue"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:scale-105"
                    placeholder="Masukkan nilai poin..."
                    value={eventFormData.pointValue}
                    onChange={handleEventFormChange}
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 animate-slideInUp delay-500">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEvent}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Menyimpan...
                    </div>
                  ) : (
                    'Simpan'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Form Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 transform transition-all duration-300 animate-slideInUp">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {courseFormData.isEditing ? 'Edit Kursus' : 'Tambah Kursus Baru'}
              </h3>
              <button 
                onClick={() => setIsCourseModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors duration-200 transform hover:scale-110"
              >
                <XCircle />
              </button>
            </div>
            <div>
              <div className="px-6 py-4 space-y-4">
                <div className="animate-slideInLeft">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Kursus <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:scale-105"
                    placeholder="Masukkan nama kursus..."
                    value={courseFormData.name}
                    onChange={handleCourseFormChange}
                    required
                  />
                </div>
                
                <div className="animate-slideInRight delay-100">
                  <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
                    Provider <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="provider"
                    name="provider"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:scale-105"
                    placeholder="Misalnya: Coursera, Udemy, dll..."
                    value={courseFormData.provider}
                    onChange={handleCourseFormChange}
                    required
                  />
                </div>
                
                <div className="animate-slideInLeft delay-200">
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Durasi (jam)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:scale-105"
                    placeholder="Durasi dalam jam..."
                    value={courseFormData.duration}
                    onChange={handleCourseFormChange}
                    min="0"
                  />
                </div>
                
                <div className="animate-slideInRight delay-300">
                  <label htmlFor="pointValue" className="block text-sm font-medium text-gray-700 mb-1">
                    Nilai Poin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="pointValue"
                    name="pointValue"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:scale-105"
                    placeholder="Masukkan nilai poin..."
                    value={courseFormData.pointValue}
                    onChange={handleCourseFormChange}
                    min="0"
                    required
                  />
                </div>
                
                <div className="animate-slideInLeft delay-400">
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                    URL Kursus
                  </label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:scale-105"
                    placeholder="https://..."
                    value={courseFormData.url}
                    onChange={handleCourseFormChange}
                  />
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 animate-slideInUp delay-500">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveCourse}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Menyimpan...
                    </div>
                  ) : (
                    'Simpan'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 animate-slideInUp">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                Konfirmasi Hapus
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-500">
                Apakah Anda yakin ingin menghapus {
                  deleteType === 'event' ? 'event' : 
                  deleteType === 'course' ? 'kursus' : 
                  deleteType === 'user' ? 'pengguna' : 'item'
                } ini?
                <br />
                <span className="font-semibold">
                  {itemToDelete.title || itemToDelete.name || itemToDelete.username || 'Unknown'}
                </span>
              </p>
              <p className="text-sm text-red-500 mt-2">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Menghapus...
                  </div>
                ) : (
                  'Hapus'
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