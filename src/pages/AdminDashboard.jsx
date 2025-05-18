import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileCheck, 
  Users, 
  Search, 
  LogOut, 
  ChevronDown, 
  CheckCircle2, 
  XCircle, 
  BarChart3,
  User,
  RefreshCw,
  CalendarDays,
  Award,
  PlusCircle,
  Edit,
  Trash,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [approvalPoints, setApprovalPoints] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSubmissions: 0,
    approvedSubmissions: 0,
    pendingSubmissions: 0,
    rejectedSubmissions: 0
  });

  // New state variables for managing activities and competencies
  const [activities, setActivities] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [filteredCompetencies, setFilteredCompetencies] = useState([]);
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [competencySearchQuery, setCompetencySearchQuery] = useState('');
  
  // State for modal forms
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isCompetencyModalOpen, setIsCompetencyModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('');

  // State for new/edit activity
  const [activityFormData, setActivityFormData] = useState({
    id: '',
    title: '',
    type: '',
    date: '',
    points: '',
    description: '',
    isEditing: false
  });

  // State for new/edit competency
  const [competencyFormData, setCompetencyFormData] = useState({
    id: '',
    title: '',
    description: '',
    points: '',
    isEditing: false
  });
  
  // Function to handle logout
  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      // Clear token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  // Function to manually refresh data
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Sesi login telah berakhir. Silakan login kembali.');
          setLoading(false);
          return;
        }
        
        // Fetch submissions from correct API endpoint
        const submissionsResponse = await fetch('https://pweb-tifpoint-backend-production-1a28.up.railway.app/api/admin/activities', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!submissionsResponse.ok) {
          // Try to parse error as JSON, but handle non-JSON responses too
          const contentType = submissionsResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await submissionsResponse.json();
            throw new Error(errorData.message || 'Failed to fetch submissions');
          } else {
            throw new Error(`Error: ${submissionsResponse.status} ${submissionsResponse.statusText}`);
          }
        }
        
        const submissionsData = await submissionsResponse.json();
        
        // Fetch users from correct API endpoint
        const usersResponse = await fetch('https://pweb-tifpoint-backend-production-1a28.up.railway.app/api/admin/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!usersResponse.ok) {
          const contentType = usersResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await usersResponse.json();
            throw new Error(errorData.message || 'Failed to fetch users');
          } else {
            throw new Error(`Error: ${usersResponse.status} ${usersResponse.statusText}`);
          }
        }
        
        const usersData = await usersResponse.json();

        // Fetch activities from API
        const activitiesResponse = await fetch('https://pweb-tifpoint-backend-production-1a28.up.railway.app/api/admin/activity-info', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!activitiesResponse.ok) {
          const contentType = activitiesResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await activitiesResponse.json();
            console.warn('Failed to fetch activities info:', errorData);
          } else {
            console.warn(`Error fetching activities: ${activitiesResponse.status} ${activitiesResponse.statusText}`);
          }
        }

        // Fetch competencies from API
        const competenciesResponse = await fetch('https://pweb-tifpoint-backend-production-1a28.up.railway.app/api/admin/competencies', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!competenciesResponse.ok) {
          const contentType = competenciesResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await competenciesResponse.json();
            console.warn('Failed to fetch competencies:', errorData);
          } else {
            console.warn(`Error fetching competencies: ${competenciesResponse.status} ${competenciesResponse.statusText}`);
          }
        }
        
        // Transform data if needed to match component structure
        const transformedSubmissions = Array.isArray(submissionsData.activities || submissionsData) 
          ? (submissionsData.activities || submissionsData).map(sub => ({
              id: sub._id,
              nim: sub.nim || sub.studentId,
              studentName: sub.studentName,
              activityName: sub.activityName || sub.title,
              date: sub.activityDate || sub.date,
              description: sub.description,
              status: sub.status || 'pending',
              points: sub.points || 0,
              proposedPoints: sub.proposedPoints || sub.expectedPoints || 0,
              documentUrl: sub.documentUrl || sub.evidenceUrl,
              comment: sub.feedback || sub.comment || '',
              competencyArea: sub.competencyArea || '',
              activityType: sub.activityType || ''
            }))
          : [];
        
        const transformedUsers = Array.isArray(usersData.users || usersData)
          ? (usersData.users || usersData).map(user => ({
              id: user._id,
              nim: user.nim || user.studentId,
              name: user.name || user.fullName,
              major: user.major || user.department || 'Teknik Informatika',
              email: user.email
            }))
          : [];

        let transformedActivities = [];
        try {
          const activitiesData = await activitiesResponse.json();
          transformedActivities = Array.isArray(activitiesData.activities || activitiesData)
            ? (activitiesData.activities || activitiesData).map(activity => ({
                id: activity._id,
                title: activity.title || activity.activityName,
                type: activity.type || activity.activityType,
                date: activity.date || activity.activityDate,
                points: activity.points || 0,
                description: activity.description
              }))
            : [];
        } catch (err) {
          console.warn('Error parsing activities:', err);
          transformedActivities = [];
        }

        let transformedCompetencies = [];
        try {
          const competenciesData = await competenciesResponse.json();
          transformedCompetencies = Array.isArray(competenciesData.competencies || competenciesData)
            ? (competenciesData.competencies || competenciesData).map(comp => ({
                id: comp._id,
                title: comp.title || comp.name,
                description: comp.description,
                points: comp.points || comp.pointsDescription || 'Nilai bervariasi'
              }))
            : [];
        } catch (err) {
          console.warn('Error parsing competencies:', err);
          transformedCompetencies = [];
        }
        
        setSubmissions(transformedSubmissions);
        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
        setActivities(transformedActivities);
        setFilteredActivities(transformedActivities);
        setCompetencies(transformedCompetencies);
        setFilteredCompetencies(transformedCompetencies);
        
        // Calculate statistics
        const pendingCount = transformedSubmissions.filter(sub => sub.status === 'pending').length;
        const approvedCount = transformedSubmissions.filter(sub => sub.status === 'approved').length;
        const rejectedCount = transformedSubmissions.filter(sub => sub.status === 'rejected').length;
        
        setStats({
          totalUsers: transformedUsers.length,
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

  // Filter users by NIM or name
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Filter activities by title or type
  useEffect(() => {
    if (activitySearchQuery.trim() === '') {
      setFilteredActivities(activities);
    } else {
      const filtered = activities.filter(activity => 
        activity.title.toLowerCase().includes(activitySearchQuery.toLowerCase()) ||
        (activity.type && activity.type.toLowerCase().includes(activitySearchQuery.toLowerCase()))
      );
      setFilteredActivities(filtered);
    }
  }, [activitySearchQuery, activities]);

  // Filter competencies by title
  useEffect(() => {
    if (competencySearchQuery.trim() === '') {
      setFilteredCompetencies(competencies);
    } else {
      const filtered = competencies.filter(competency => 
        competency.title.toLowerCase().includes(competencySearchQuery.toLowerCase())
      );
      setFilteredCompetencies(filtered);
    }
  }, [competencySearchQuery, competencies]);

  // Handle approving submission
  const handleApprove = async (submissionId) => {
    try {
      setLoading(true);
      
      // Get token
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Sesi login telah berakhir. Silakan login kembali.');
      }
      
      // Validate points
      const points = parseInt(approvalPoints);
      if (isNaN(points) || points < 0) {
        throw new Error('Jumlah poin tidak valid. Masukkan angka yang valid.');
      }
      
      // Send approval request to API
      const response = await fetch(`https://pweb-tifpoint-backend-production-1a28.up.railway.app/api/admin/activities/${submissionId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          points: points,
          feedback: 'Pengajuan Anda telah disetujui dengan poin: ' + points
        })
      });
      
      if (!response.ok) {
        // Try to parse error as JSON, but handle non-JSON responses too
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal menyetujui pengajuan');
        } else {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
      }
      
      // Update local data
      const updatedSubmissions = submissions.map(sub => 
        sub.id === submissionId ? {...sub, status: 'approved', points: points} : sub
      );
      
      setSubmissions(updatedSubmissions);
      setIsModalOpen(false);
      
      // Update stats
      setStats({
        ...stats,
        approvedSubmissions: stats.approvedSubmissions + 1,
        pendingSubmissions: stats.pendingSubmissions - 1
      });
      
      // Reset fields
      setApprovalPoints('');
      
      setLoading(false);
      
      // Refresh data after successful approval
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
      
      // Get token
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Sesi login telah berakhir. Silakan login kembali.');
      }
      
      // Validate comment
      if (!rejectionComment || rejectionComment.trim() === '') {
        throw new Error('Silakan berikan alasan penolakan');
      }
      
      // Send rejection request to API
      const response = await fetch(`https://pweb-tifpoint-backend-production-1a28.up.railway.app/api/admin/activities/${submissionId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          feedback: rejectionComment 
        })
      });
      
      if (!response.ok) {
        // Try to parse error as JSON, but handle non-JSON responses too
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal menolak pengajuan');
        } else {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
      }
      
      // Update local data
      const updatedSubmissions = submissions.map(sub => 
        sub.id === submissionId ? {...sub, status: 'rejected', comment: rejectionComment} : sub
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
      
      // Refresh data after successful rejection
      refreshData();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      setError(error.message || 'Gagal menolak pengajuan');
      setLoading(false);
    }
  };

  // Open modal with submission details
  const openSubmissionModal = (submission) => {
    setSelectedSubmission(submission);
    
    // Set initial points from the proposed points
    if (submission.proposedPoints) {
      setApprovalPoints(submission.proposedPoints.toString());
    }
    
    setIsModalOpen(true);
  };

  // Handle opening activity form modal (for create or edit)
  const openActivityModal = (activity = null) => {
    if (activity) {
      // Edit mode
      setActivityFormData({
        id: activity.id,
        title: activity.title,
        type: activity.type || '',
        date: formatDateForInput(activity.date),
        points: activity.points.toString(),
        description: activity.description,
        isEditing: true
      });
    } else {
      // Create mode
      setActivityFormData({
        id: '',
        title: '',
        type: '',
        date: '',
        points: '',
        description: '',
        isEditing: false
      });
    }
    setIsActivityModalOpen(true);
  };

  // Handle opening competency form modal (for create or edit)
  const openCompetencyModal = (competency = null) => {
    if (competency) {
      // Edit mode
      setCompetencyFormData({
        id: competency.id,
        title: competency.title,
        description: competency.description,
        points: competency.points,
        isEditing: true
      });
    } else {
      // Create mode
      setCompetencyFormData({
        id: '',
        title: '',
        description: '',
        points: '',
        isEditing: false
      });
    }
    setIsCompetencyModalOpen(true);
  };

  // Handle opening delete confirmation modal
  const openDeleteModal = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setIsDeleteModalOpen(true);
  };

  // Helper function to format date for input field
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Handle form input changes for activity
  const handleActivityFormChange = (e) => {
    const { name, value } = e.target;
    setActivityFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form input changes for competency
  const handleCompetencyFormChange = (e) => {
    const { name, value } = e.target;
    setCompetencyFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle saving activity (create or update)
  const handleSaveActivity = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Get token
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Sesi login telah berakhir. Silakan login kembali.');
      }
      
      // Validate required fields
      if (!activityFormData.title || !activityFormData.date || !activityFormData.points) {
        throw new Error('Judul, tanggal, dan poin harus diisi.');
      }
      
      const payload = {
        title: activityFormData.title,
        type: activityFormData.type,
        date: activityFormData.date,
        points: parseInt(activityFormData.points),
        description: activityFormData.description
      };
      
      let response;
      
      if (activityFormData.isEditing) {
        // Update existing activity
        response = await fetch(`https://pweb-tifpoint-backend-production-1a28.up.railway.app/api/admin/activity-info/${activityFormData.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new activity
        response = await fetch('https://pweb-tifpoint-backend-production-1a28.up.railway.app/api/admin/activity-info', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      }
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal menyimpan kegiatan');
        } else {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
      }
      
      // Reset form and close modal
      setActivityFormData({
        id: '',
        title: '',
        type: '',
        date: '',
        points: '',
        description: '',
        isEditing: false
      });
      
      setIsActivityModalOpen(false);
      setLoading(false);
      
      // Refresh data
      refreshData();
      
    } catch (error) {
      console.error('Error saving activity:', error);
      setError(error.message || 'Gagal menyimpan kegiatan');
      setLoading(false);
    }
  };

  // Handle saving competency (create or update)
  const handleSaveCompetency = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Get token
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Sesi login telah berakhir. Silakan login kembali.');
      }
      
      // Validate required fields
      if (!competencyFormData.title || !competencyFormData.description || !competencyFormData.points) {
        throw new Error('Judul, deskripsi, dan informasi poin harus diisi.');
      }
      
      const payload = {
        title: competencyFormData.title,
        description: competencyFormData.description,
        points: competencyFormData.points
      };
      
      let response;
      
      if (competencyFormData.isEditing) {
        // Update existing competency
        response = await fetch(`https://pweb-tifpoint-backend-production-1a28.up.railway.app/api/admin/competencies/${competencyFormData.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new competency
        response = await fetch('https://pweb-tifpoint-backend-production-1a28.up.railway.app/api/admin/competencies', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      }
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal menyimpan kompetensi');
        } else {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
      }
      
      // Reset form and close modal
      setCompetencyFormData({
        id: '',
        title: '',
        description: '',
        points: '',
        isEditing: false
      });
      
      setIsCompetencyModalOpen(false);
      setLoading(false);
      
      // Refresh data
      refreshData();
      
    } catch (error) {
      console.error('Error saving competency:', error);
      setError(error.message || 'Gagal menyimpan kompetensi');
      setLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      
      // Get token
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Sesi login telah berakhir. Silakan login kembali.');
      }
      
      let endpoint;
      
      if (deleteType === 'activity') {
        endpoint = `https://pweb-tifpoint-backend-production-1a28.up.railway.app/api/admin/activity-info/${itemToDelete.id}`;
      } else if (deleteType === 'competency') {
        endpoint = `https://pweb-tifpoint-backend-production-1a28.up.railway.app/api/admin/competencies/${itemToDelete.id}`;
      } else {
        throw new Error('Tipe data yang akan dihapus tidak valid');
      }
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Gagal menghapus ${deleteType === 'activity' ? 'kegiatan' : 'kompetensi'}`);
        } else {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
      }
      
      // Close modal
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setDeleteType('');
      setLoading(false);
      
      // Refresh data
      refreshData();
      
    } catch (error) {
      console.error('Error deleting item:', error);
      setError(error.message || `Gagal menghapus ${deleteType === 'activity' ? 'kegiatan' : 'kompetensi'}`);
      setLoading(false);
    }
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
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Mahasiswa</p>
                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
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
          
          <div className="bg-white rounded-lg shadow p-6">
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
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Menunggu Verifikasi</p>
                <h3 className="text-2xl font-bold">{stats.pendingSubmissions}</h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <XCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Submission Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Statistik Pengajuan Kegiatan</h2>
          <div className="h-64 flex items-center justify-center">
            <div className="w-full max-w-lg">
              <div className="flex justify-between items-end h-40 mt-4">
                <div className="w-1/4 mx-1">
                  <div 
                    className="bg-blue-500 rounded-t-lg w-full" 
                    style={{ height: `${(stats.totalSubmissions / Math.max(stats.totalSubmissions, 1)) * 100}%`, minHeight: '20px' }}
                  ></div>
                  <p className="text-xs text-center mt-2">Total Pengajuan ({stats.totalSubmissions})</p>
                </div>
                <div className="w-1/4 mx-1">
                  <div 
                    className="bg-green-500 rounded-t-lg w-full" 
                    style={{ height: `${(stats.approvedSubmissions / Math.max(stats.totalSubmissions, 1)) * 100}%`, minHeight: '20px' }}
                  ></div>
                  <p className="text-xs text-center mt-2">Disetujui ({stats.approvedSubmissions})</p>
                </div>
                <div className="w-1/4 mx-1">
                  <div 
                    className="bg-yellow-500 rounded-t-lg w-full" 
                    style={{ height: `${(stats.pendingSubmissions / Math.max(stats.totalSubmissions, 1)) * 100}%`, minHeight: '20px' }}
                  ></div>
                  <p className="text-xs text-center mt-2">Pending ({stats.pendingSubmissions})</p>
                </div>
                <div className="w-1/4 mx-1">
                  <div 
                    className="bg-red-500 rounded-t-lg w-full" 
                    style={{ height: `${(stats.rejectedSubmissions / Math.max(stats.totalSubmissions, 1)) * 100}%`, minHeight: '20px' }}
                  ></div>
                  <p className="text-xs text-center mt-2">Ditolak ({stats.rejectedSubmissions})</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pending Submissions Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Pengajuan yang Perlu Diverifikasi</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Kegiatan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingSubmissions.length > 0 ? (
                  pendingSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{submission.nim}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{submission.activityName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(submission.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Menunggu
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          onClick={() => openSubmissionModal(submission)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
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

  // Render users management content
  const renderUsersContent = () => {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Manajemen Data Pengguna</h2>
            <button 
              onClick={refreshData}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
          <div className="mt-4 relative">
            <input
              type="text"
              placeholder="Cari berdasarkan NIM atau nama..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-3 text-gray-400">
              <Search size={18} />
            </div>
          </div>
        </div>
        
        {error && (
          <div className="p-4 m-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
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
            <p className="ml-3 text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program Studi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.nim}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.major}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
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

  // Render verification management content
  const renderVerificationContent = () => {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Verifikasi Kegiatan</h2>
            <button 
              onClick={refreshData}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
        
        {error && (
          <div className="p-4 m-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
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
            <p className="ml-3 text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Kegiatan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.length > 0 ? (
                  submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{submission.nim}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{submission.activityName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(submission.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.status === 'pending' && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
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
                        {submission.status === 'approved' ? submission.points : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          onClick={() => openSubmissionModal(submission)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
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

  // Render activities management content
  const renderActivitiesContent = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-semibold">Manajemen Info Kegiatan</h2>
              <div className="flex gap-2">
                <button 
                  onClick={refreshData}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
                <button 
                  onClick={() => openActivityModal()}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Tambah Kegiatan
                </button>
              </div>
            </div>
            <div className="mt-4 relative">
              <input
                type="text"
                placeholder="Cari berdasarkan judul atau tipe kegiatan..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={activitySearchQuery}
                onChange={(e) => setActivitySearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-3 text-gray-400">
                <Search size={18} />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="p-4 m-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
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
              <p className="ml-3 text-gray-600">Memuat data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredActivities.length > 0 ? (
                    filteredActivities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.type || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(activity.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.points}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{activity.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => openActivityModal(activity)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => openDeleteModal(activity, 'activity')}
                              className="text-red-600 hover:text-red-900"
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
                        {activitySearchQuery ? 'Tidak ada kegiatan yang sesuai dengan pencarian' : 'Tidak ada data kegiatan'}
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

  // Render competencies management content
  const renderCompetenciesContent = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-semibold">Manajemen Info Kompetensi</h2>
              <div className="flex gap-2">
                <button 
                  onClick={refreshData}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
                <button 
                  onClick={() => openCompetencyModal()}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Tambah Kompetensi
                </button>
              </div>
            </div>
            <div className="mt-4 relative">
              <input
                type="text"
                placeholder="Cari berdasarkan judul kompetensi..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={competencySearchQuery}
                onChange={(e) => setCompetencySearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-3 text-gray-400">
                <Search size={18} />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="p-4 m-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
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
              <p className="ml-3 text-gray-600">Memuat data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Informasi Poin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCompetencies.length > 0 ? (
                    filteredCompetencies.map((competency) => (
                      <tr key={competency.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{competency.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{competency.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{competency.points}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => openCompetencyModal(competency)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => openDeleteModal(competency, 'competency')}
                              className="text-red-600 hover:text-red-900"
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
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        {competencySearchQuery ? 'Tidak ada kompetensi yang sesuai dengan pencarian' : 'Tidak ada data kompetensi'}
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
          <p className="mt-4 text-gray-600">Memuat data...</p>
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
      case 'activities':
        return renderActivitiesContent();
      case 'competencies':
        return renderCompetenciesContent();
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
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
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
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
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
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
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
              >
                <FileCheck className="mr-3 h-5 w-5" />
                Verifikasi Kegiatan
              </button>

              {/* New tabs for managing activities and competencies */}
              <button
                onClick={() => setActiveTab('activities')}
                className={`${
                  activeTab === 'activities'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
              >
                <CalendarDays className="mr-3 h-5 w-5" />
                Manajemen Info Kegiatan
              </button>

              <button
                onClick={() => setActiveTab('competencies')}
                className={`${
                  activeTab === 'competencies'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
              >
                <Award className="mr-3 h-5 w-5" />
                Manajemen Kompetensi
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
                    className="flex items-center text-xs font-medium text-gray-400 hover:text-white"
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
          <div className="flex items-center">
            <div className="ml-3 relative md:hidden">
              <div className="flex items-center text-sm rounded-full text-gray-400">
                <User className="h-8 w-8" />
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </div>

      {/* Submission Detail Modal */}
      {isModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Detail Pengajuan</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">NIM</p>
                  <p className="font-medium">{selectedSubmission.nim}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nama Mahasiswa</p>
                  <p className="font-medium">{selectedSubmission.studentName || 'Tidak tersedia'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nama Kegiatan</p>
                  <p className="font-medium">{selectedSubmission.activityName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal</p>
                  <p className="font-medium">{new Date(selectedSubmission.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jenis Kegiatan</p>
                  <p className="font-medium">{selectedSubmission.activityType || 'Tidak tersedia'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Area Kompetensi</p>
                  <p className="font-medium">{selectedSubmission.competencyArea || 'Tidak tersedia'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Deskripsi</p>
                  <p className="font-medium">{selectedSubmission.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Poin yang Diusulkan</p>
                  <p className="font-medium">{selectedSubmission.proposedPoints || 'Tidak tersedia'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    {selectedSubmission.status === 'pending' && (
                      <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                        Menunggu
                      </span>
                    )}
                    {selectedSubmission.status === 'approved' && (
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                        Disetujui ({selectedSubmission.points} poin)
                      </span>
                    )}
                    {selectedSubmission.status === 'rejected' && (
                      <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">
                        Ditolak
                      </span>
                    )}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Bukti Kegiatan</p>
                  <div className="mt-2">
                    <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-center">
                      {selectedSubmission.documentUrl ? (
                        <a 
                          href={selectedSubmission.documentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <FileCheck className="mr-2" />
                          Lihat Dokumen
                        </a>
                      ) : (
                        <p className="text-gray-500">Tidak ada dokumen</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedSubmission.status === 'pending' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div className="md:col-span-2">
                    <label htmlFor="approvalPoints" className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah Poin (untuk persetujuan) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="approvalPoints"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Masukkan jumlah poin..."
                      value={approvalPoints}
                      onChange={(e) => setApprovalPoints(e.target.value)}
                      min="0"
                      max="15"
                    />
                    <p className="mt-1 text-xs text-gray-500">Nilai usulan: {selectedSubmission.proposedPoints || 'Tidak tersedia'}</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                      Komentar (untuk penolakan) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="comment"
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Masukkan alasan penolakan jika diperlukan..."
                      value={rejectionComment}
                      onChange={(e) => setRejectionComment(e.target.value)}
                    ></textarea>
                  </div>
                  <button
                    onClick={() => handleApprove(selectedSubmission.id)}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <div className="flex items-center justify-center">
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Setujui
                    </div>
                  </button>
                  <button
                    onClick={() => handleReject(selectedSubmission.id)}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <div className="flex items-center justify-center">
                      <XCircle className="mr-2 h-5 w-5" />
                      Tolak
                    </div>
                  </button>
                </div>
              )}
              
              {selectedSubmission.status === 'approved' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Poin yang Diberikan</p>
                  <p className="text-green-600 font-bold text-xl">{selectedSubmission.points}</p>
                </div>
              )}
              
              {selectedSubmission.status === 'rejected' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Alasan Penolakan</p>
                  <p className="text-red-600">{selectedSubmission.comment || 'Tidak ada komentar'}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Form Modal */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {activityFormData.isEditing ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
              </h3>
              <button 
                onClick={() => setIsActivityModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle />
              </button>
            </div>
            <form onSubmit={handleSaveActivity}>
              <div className="px-6 py-4 space-y-4">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Kegiatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Masukkan judul kegiatan..."
                    value={activityFormData.title}
                    onChange={handleActivityFormChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Kegiatan
                  </label>
                  <input
                    type="text"
                    id="type"
                    name="type"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Misalnya: Workshop, Seminar, Kompetisi..."
                    value={activityFormData.type}
                    onChange={handleActivityFormChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={activityFormData.date}
                    onChange={handleActivityFormChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
                    Poin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="points"
                    name="points"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Masukkan jumlah poin..."
                    value={activityFormData.points}
                    onChange={handleActivityFormChange}
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Deskripsi tentang kegiatan..."
                    value={activityFormData.description}
                    onChange={handleActivityFormChange}
                    required
                  ></textarea>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
            </form>
          </div>
        </div>
      )}

      {/* Competency Form Modal */}
      {isCompetencyModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {competencyFormData.isEditing ? 'Edit Kompetensi' : 'Tambah Kompetensi Baru'}
              </h3>
              <button 
                onClick={() => setIsCompetencyModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle />
              </button>
            </div>
            <form onSubmit={handleSaveCompetency}>
              <div className="px-6 py-4 space-y-4">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Kompetensi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Masukkan judul kompetensi..."
                    value={competencyFormData.title}
                    onChange={handleCompetencyFormChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Deskripsi tentang kompetensi..."
                    value={competencyFormData.description}
                    onChange={handleCompetencyFormChange}
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
                    Informasi Poin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="points"
                    name="points"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Contoh: Hingga 12 poin per proyek tergantung kompleksitas"
                    value={competencyFormData.points}
                    onChange={handleCompetencyFormChange}
                    required
                  />
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCompetencyModalOpen(false)}
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Hapus</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-500">
                Apakah Anda yakin ingin menghapus {deleteType === 'activity' ? 'kegiatan' : 'kompetensi'} ini?
                <br />
                <span className="font-semibold">{itemToDelete.title}</span>
              </p>
              <p className="text-sm text-red-500 mt-2">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
    </div>
  )
}