import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ActivityHistory = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingActivity, setEditingActivity] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(null);

  // Function to show notification
  const showNotificationMessage = (message, type = 'success') => {
    setShowNotification({ message, type });
    setTimeout(() => setShowNotification(null), 4000);
  };

  // Function to refresh activities with auto-refresh after submission
  const refreshActivities = () => {
    setRefreshTrigger(prev => prev + 1);
    // Auto refresh every 5 seconds for newly submitted activities
    setTimeout(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 5000);
  };

  // Listen for activity submission events
  useEffect(() => {
    const handleActivitySubmitted = (event) => {
      console.log('Activity submitted event received:', event.detail);
      refreshActivities();
    };

    const handleStorageChange = (e) => {
      if (e.key === 'activitySubmitted') {
        console.log('Storage change detected for activity submission');
        refreshActivities();
      }
    };

    // Listen for custom event when activity is submitted
    window.addEventListener('activitySubmitted', handleActivitySubmitted);
    window.addEventListener('storage', handleStorageChange);
    
    // Also check if we came from submit activity page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('refresh') === 'true') {
      refreshActivities();
    }
    
    return () => {
      window.removeEventListener('activitySubmitted', handleActivitySubmitted);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        setError(null); // Clear any previous errors
        
        // Get user token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Sesi login telah berakhir. Silakan login kembali.');
          setIsLoading(false);
          return;
        }

        // Debug: Log the request
        console.log('Fetching activities from:', `https://tifpoint-production.up.railway.app/api/activities?page=${page}&limit=10`);

        // Fetch activities from the new API
        const response = await fetch(`https://tifpoint-production.up.railway.app/api/activities?page=${page}&limit=10`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Debug: Log response
        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Debug: Log received data
        console.log('Received data:', data);
        console.log('Data type:', typeof data);
        console.log('Is array:', Array.isArray(data));
        
        // Handle pagination
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
        }
        
        // Check if data is array directly or nested
        let activitiesArray = [];
        if (Array.isArray(data)) {
          activitiesArray = data;
        } else if (data.activities && Array.isArray(data.activities)) {
          activitiesArray = data.activities;
        } else if (data.data && Array.isArray(data.data)) {
          activitiesArray = data.data;
        } else {
          console.log('Unexpected data structure:', data);
          activitiesArray = [];
        }

        console.log('Activities array to process:', activitiesArray);

        // Transform API response to match our component's expected structure
        const transformedActivities = activitiesArray.map(activity => {
          console.log('Processing activity:', activity);
          console.log('Available fields:', Object.keys(activity));
          console.log('Raw activity from API:', JSON.stringify(activity, null, 2));
          
          // Specifically check for expectedPoints field from SubmitActivity form
          console.log('Looking for expectedPoints field:', {
            expectedPoints: activity.expectedPoints,
            proposedPoints: activity.proposedPoints,
            point: activity.point,
            points: activity.points,
            requestedPoints: activity.requestedPoints,
            submittedPoints: activity.submittedPoints,
            originalPoints: activity.originalPoints,
            userPoints: activity.userPoints
          });
          
          // Check if points are stored in user or submission related fields
          console.log('User and submission related fields:', {
            user: activity.user,
            userId: activity.userId,
            submissionDetails: activity.submissionDetails,
            originalRequest: activity.originalRequest,
            formData: activity.formData
          });
          
          // Check nested objects for point values
          if (activity.activityType) {
            console.log('ActivityType object:', activity.activityType);
            console.log('ActivityType point fields:', {
              point: activity.activityType.point,
              points: activity.activityType.points,
              pointValue: activity.activityType.pointValue,
              defaultPoints: activity.activityType.defaultPoints
            });
          }
          
          if (activity.competency) {
            console.log('Competency object:', activity.competency);
          }
          
          if (activity.event) {
            console.log('Event object:', activity.event);
            console.log('Event point fields:', {
              point: activity.event.point,
              points: activity.event.points,
              pointValue: activity.event.pointValue
            });
          }
          
          if (activity.recognizedCourse) {
            console.log('RecognizedCourse object:', activity.recognizedCourse);
            console.log('RecognizedCourse point fields:', {
              point: activity.recognizedCourse.point,
              points: activity.recognizedCourse.points,
              credits: activity.recognizedCourse.credits
            });
          }
          
          // Handle different status formats from API
          let activityStatus = 'pending'; // default
          if (activity.status) {
            const statusLower = activity.status.toLowerCase();
            if (statusLower === 'approved' || statusLower === 'accepted') {
              activityStatus = 'approved';
            } else if (statusLower === 'rejected' || statusLower === 'declined') {
              activityStatus = 'rejected';
            } else {
              activityStatus = 'pending'; // for 'pending', 'waiting', 'submitted', etc.
            }
          }

          // Get expected points (usulan poin) from SubmitActivity form
          const getExpectedPoints = () => {
            // PROBLEM IDENTIFIED: API tidak menyimpan expectedPoints dari form!
            // Solusi: Gunakan nilai dari recognizedCourse.pointValue atau activityType default
            
            // 1. Jika ada recognizedCourse, gunakan pointValue-nya sebagai usulan
            if (activity.recognizedCourse?.pointValue && activity.recognizedCourse.pointValue > 0) {
              console.log('Using recognizedCourse.pointValue as expectedPoints:', activity.recognizedCourse.pointValue);
              return activity.recognizedCourse.pointValue;
            }
            
            // 2. Jika ada event, gunakan pointValue-nya
            if (activity.event?.pointValue && activity.event.pointValue > 0) {
              console.log('Using event.pointValue as expectedPoints:', activity.event.pointValue);
              return activity.event.pointValue;
            }
            
            // 3. Field expectedPoints langsung (jika API menyimpannya di masa depan)
            if (activity.expectedPoints && activity.expectedPoints > 0) {
              console.log('Found expectedPoints in activity.expectedPoints:', activity.expectedPoints);
              return activity.expectedPoints;
            }
            
            // 4. Field proposedPoints (kemungkinan API mengubah nama)
            if (activity.proposedPoints && activity.proposedPoints > 0) {
              console.log('Found expectedPoints in activity.proposedPoints:', activity.proposedPoints);
              return activity.proposedPoints;
            }
            
            // 5. Field dengan nama lain yang mungkin
            const alternativeFields = [
              'requestedPoints',
              'submittedPoints', 
              'userPoints',
              'originalPoints',
              'studentPoints'
            ];
            
            for (const field of alternativeFields) {
              if (activity[field] && activity[field] > 0) {
                console.log(`Found expectedPoints in activity.${field}:`, activity[field]);
                return activity[field];
              }
            }
            
            // 6. Fallback ke default points dari activityType (estimasi berdasarkan jenis)
            const activityTypeEstimate = () => {
              const typeName = activity.activityType?.name?.toLowerCase();
              if (typeName?.includes('course')) return 6; // Course biasanya 6 poin
              if (typeName?.includes('seminar')) return 3; // Seminar biasanya 3 poin
              if (typeName?.includes('workshop')) return 4; // Workshop biasanya 4 poin
              if (typeName?.includes('certification')) return 5; // Sertifikasi biasanya 5 poin
              return 3; // Default 3 poin
            };
            
            const estimatedPoints = activityTypeEstimate();
            console.log(`Using estimated points based on activity type "${activity.activityType?.name}":`, estimatedPoints);
            return estimatedPoints;
          };
          
          // Get approved points (untuk activity yang sudah disetujui)
          const getApprovedPoints = () => {
            if (activityStatus === 'approved') {
              return activity.point || activity.points || activity.approvedPoints || 0;
            }
            return 0;
          };
          
          const expectedPointsValue = getExpectedPoints();
          const approvedPointsValue = getApprovedPoints();

          const transformed = {
            id: activity.id || activity._id,
            title: activity.title || activity.name || 'Untitled Activity',
            description: activity.description || '',
            status: activityStatus,
            submittedDate: activity.createdAt || activity.created_at || new Date().toISOString(),
            date: activity.createdAt || activity.created_at || activity.date || new Date().toISOString(),
            type: activity.activityType?.name || activity.activity_type?.name || activity.type || '-',
            competencyArea: activity.competency?.name || activity.competency_area || '-',
            points: approvedPointsValue, // Points yang sudah disetujui admin
            expectedPoints: expectedPointsValue, // Points yang diusulkan user dari form
            feedback: activity.comment || activity.feedback || '',
            feedbackDate: activity.verifiedAt || activity.verified_at || activity.updatedAt,
            documentUrl: activity.documentUrl || activity.document_url || activity.evidenceUrl || null,
            verifier: activity.verifier?.name || activity.verifier_name || null,
            competencyId: activity.competency?.id || activity.competencyId,
            activityTypeId: activity.activityType?.id || activity.activityTypeId,
            recognizedCourse: activity.recognizedCourse || activity.recognized_course,
            event: activity.event
          };
          
          console.log('Transformed activity:', transformed);
          
          return transformed;
        }).filter(activity => activity.id); // Filter out activities without valid ID
        
        console.log('Final transformed activities:', transformedActivities);
        console.log('Number of activities after transformation:', transformedActivities.length);
        
        if (transformedActivities.length === 0 && activitiesArray.length > 0) {
          console.warn('Warning: All activities were filtered out during transformation');
          console.log('Raw activities that failed transformation:', activitiesArray);
          
          // If transformation failed, try to show raw data for debugging
          const rawActivities = activitiesArray.map((activity, index) => ({
            id: activity.id || activity._id || `temp-${index}`,
            title: JSON.stringify(activity).substring(0, 50) + '...',
            description: 'Raw data - check console for details',
            status: 'pending',
            submittedDate: new Date().toISOString(),
            date: new Date().toISOString(),
            type: 'Debug',
            competencyArea: 'Debug',
            points: 0,
            expectedPoints: 0,
            feedback: 'Check browser console for raw data',
            feedbackDate: null,
            documentUrl: null,
            verifier: null,
            competencyId: null,
            activityTypeId: null,
            recognizedCourse: null,
            event: null
          }));
          
          setActivities(rawActivities);
        } else {
          setActivities(transformedActivities);
        }
        setIsLoading(false);
        setShowAnimation(true);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err.message || 'Gagal memuat data riwayat kegiatan. Silakan coba lagi nanti.');
        setIsLoading(false);
      }
    };
    
    fetchActivities();
  }, [page, refreshTrigger]);

  // Update activity function
  const updateActivity = async (activityId, updatedData) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://tifpoint-production.up.railway.app/api/activities/${activityId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        throw new Error('Gagal mengupdate aktivitas');
      }

      const result = await response.json();
      showNotificationMessage('Aktivitas berhasil diupdate!', 'success');
      setEditingActivity(null);
      refreshActivities();
    } catch (err) {
      showNotificationMessage(err.message || 'Gagal mengupdate aktivitas', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete activity function
  const deleteActivity = async (activityId) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://tifpoint-production.up.railway.app/api/activities/${activityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus aktivitas');
      }

      showNotificationMessage('Aktivitas berhasil dihapus!', 'success');
      setDeleteConfirm(null);
      refreshActivities();
    } catch (err) {
      showNotificationMessage(err.message || 'Gagal menghapus aktivitas', 'error');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Filter activities based on status and search query
  const filteredActivities = activities.filter(activity => {
    const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  
  // Map status to color schemes
  const getStatusStyles = (status) => {
    switch(status) {
      case 'approved':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          iconBg: 'bg-green-200',
          text: 'Disetujui'
        };
      case 'pending':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          iconBg: 'bg-yellow-200',
          text: 'Menunggu'
        };
      case 'rejected':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          iconBg: 'bg-red-200',
          text: 'Ditolak'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          iconBg: 'bg-gray-200',
          text: 'Unknown'
        };
    }
  };
  
  // Render status icon based on type
  const renderStatusIcon = (status) => {
    switch(status) {
      case 'approved':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'pending':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'rejected':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  // Format date from YYYY-MM-DD to DD Month YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch (error) {
      return dateString;
    }
  };

  // Handle activity selection
  const toggleActivitySelection = (activityId) => {
    if (selectedActivity === activityId) {
      setSelectedActivity(null);
    } else {
      setSelectedActivity(activityId);
    }
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  // Open document in new tab
  const openDocument = (documentUrl) => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  };

  // Edit Activity Modal Component
  const EditActivityModal = ({ activity, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      title: activity.title,
      description: activity.description,
      competencyId: activity.competencyId || '',
      activityTypeId: activity.activityTypeId || '',
      documentUrl: activity.documentUrl || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(activity.id, formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 transform animate-slideInUp">
          <h3 className="text-lg font-semibold mb-4">Edit Aktivitas</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                rows="3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Dokumen</label>
              <input
                type="url"
                value={formData.documentUrl}
                onChange={(e) => setFormData({...formData, documentUrl: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-all duration-200"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-all duration-200"
              >
                {actionLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmModal = ({ activity, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 transform animate-slideInUp">
        <div className="flex items-center mb-4">
          <div className="bg-red-100 p-2 rounded-full mr-3">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Hapus Aktivitas</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Apakah Anda yakin ingin menghapus aktivitas "{activity.title}"? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-all duration-200"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(activity.id)}
            disabled={actionLoading}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 transition-all duration-200"
          >
            {actionLoading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );

  // Notification Component
  const Notification = ({ notification }) => (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-500 animate-slideInRight ${
      notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      <div className="flex items-center">
        {notification.type === 'success' ? (
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zM9 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        )}
        {notification.message}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF0F5] to-[#508C9B] py-12 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="animate-pulse absolute top-20 right-20 w-96 h-96 rounded-full bg-blue-300/20 blur-3xl"></div>
        <div className="animate-pulse absolute bottom-20 left-20 w-64 h-64 rounded-full bg-teal-300/20 blur-3xl delay-1000"></div>
        <div className="animate-pulse absolute top-1/3 left-1/3 w-40 h-40 rounded-full bg-purple-300/10 blur-2xl delay-500"></div>
        <div className="animate-bounce absolute top-10 left-10 w-8 h-8 bg-white/10 rounded-full delay-300"></div>
        <div className="animate-bounce absolute bottom-10 right-10 w-6 h-6 bg-white/10 rounded-full delay-700"></div>
      </div>
      
      {/* Notification */}
      {showNotification && <Notification notification={showNotification} />}
      
      {/* Back to Dashboard Button */}
      <div className="max-w-5xl mx-auto mb-6 relative z-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center px-4 py-2 bg-[#201E43] text-white rounded-lg hover:bg-[#134B70] transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 hover:scale-105"
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
        
        <button
          onClick={refreshActivities}
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 hover:scale-105 ml-4"
        >
          <svg
            className="w-5 h-5 mr-2 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>
      
      {/* Main Content Card */}
      <div 
        className={`max-w-5xl mx-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden transition-all duration-700 transform ${
          showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        } relative z-10 hover:shadow-xl hover:shadow-blue-500/20`}
      >
        <div className="bg-gradient-to-r from-[#201E43] to-[#134B70] py-6 px-6">
          <h2 className="text-2xl font-bold text-white animate-fadeInLeft">Riwayat Pengajuan Kegiatan</h2>
          <p className="text-blue-100 mt-1 animate-fadeInLeft" style={{animationDelay: '0.2s'}}>
            Kelola dan pantau status pengajuan aktivitas Anda
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6 animate-slideInLeft">
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
          </div>
        )}
        
        {/* Filters and Search */}
        <div 
          className={`p-6 border-b border-gray-200 transition-all duration-500 ${
            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '50ms' }}
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <button 
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-md transition-all duration-300 transform hover:scale-105 ${
                  filterStatus === 'all' 
                    ? 'bg-[#134B70] text-white shadow-md animate-pulse' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Semua
              </button>
              <button 
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-md transition-all duration-300 transform hover:scale-105 ${
                  filterStatus === 'pending' 
                    ? 'bg-yellow-500 text-white shadow-md animate-pulse' 
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                Menunggu
              </button>
              <button 
                onClick={() => setFilterStatus('approved')}
                className={`px-4 py-2 rounded-md transition-all duration-300 transform hover:scale-105 ${
                  filterStatus === 'approved' 
                    ? 'bg-green-500 text-white shadow-md animate-pulse' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                Disetujui
              </button>
              <button 
                onClick={() => setFilterStatus('rejected')}
                className={`px-4 py-2 rounded-md transition-all duration-300 transform hover:scale-105 ${
                  filterStatus === 'rejected' 
                    ? 'bg-red-500 text-white shadow-md animate-pulse' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                Ditolak
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                </svg>
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-64 focus:ring-2 focus:ring-[#201E43] focus:border-[#201E43] transition-all duration-300 hover:shadow-md"
                placeholder="Cari kegiatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Activities List */}
        <div 
          className={`p-6 transition-all duration-500 ${
            showAnimation ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#201E43]"></div>
              <p className="ml-3 text-gray-600 animate-pulse">Memuat data...</p>
            </div>
          ) : filteredActivities.length > 0 ? (
            <div className="space-y-6">
              {filteredActivities.map((activity, index) => {
                const statusStyles = getStatusStyles(activity.status);
                const isSelected = selectedActivity === activity.id;
                
                return (
                  <div 
                    key={activity.id} 
                    className={`border ${statusStyles.borderColor} rounded-lg overflow-hidden transition-all duration-500 transform hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer hover:-translate-y-1 ${
                      showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    } ${isSelected ? 'shadow-lg scale-105' : ''}`}
                    style={{ transitionDelay: `${index * 50 + 150}ms` }}
                    onClick={() => toggleActivitySelection(activity.id)}
                  >
                    <div className={`${statusStyles.bgColor} px-4 py-3 flex justify-between items-center transition-all duration-300 hover:brightness-95`}>
                      <div className="flex items-center">
                        <div className={`${statusStyles.iconBg} p-2 rounded-full mr-3 transition-transform duration-300 ${isSelected ? 'transform rotate-12 scale-110' : ''}`}>
                          {renderStatusIcon(activity.status)}
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{activity.title}</h3>
                          <p className="text-sm text-gray-600">
                            Diajukan pada {formatDate(activity.submittedDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-3 py-1 rounded-full ${statusStyles.bgColor} ${statusStyles.textColor} font-medium text-sm transition-all duration-300 ${isSelected ? 'transform scale-110' : ''}`}>
                          {statusStyles.text}
                        </div>
                        
                        {/* Action Buttons */}
                        {(activity.status === 'pending' || activity.status === 'rejected') && (
                          <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setEditingActivity(activity)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-all duration-200 transform hover:scale-110"
                              title="Edit"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(activity)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-all duration-200 transform hover:scale-110"
                              title="Hapus"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className={`bg-white p-4 transition-all duration-500 ${isSelected ? 'max-h-auto' : 'max-h-auto'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="transition-all duration-300 hover:translate-x-1">
                          <p className="text-sm text-gray-500">Jenis Kegiatan</p>
                          <p className="font-medium capitalize">{activity.type}</p>
                        </div>
                        <div className="transition-all duration-300 hover:translate-x-1">
                          <p className="text-sm text-gray-500">Area Kompetensi</p>
                          <p className="font-medium">{activity.competencyArea}</p>
                        </div>
                        <div className="transition-all duration-300 hover:translate-x-1">
                          <p className="text-sm text-gray-500">Tanggal Kegiatan</p>
                          <p className="font-medium">{formatDate(activity.date)}</p>
                        </div>
                        <div className="transition-all duration-300 hover:translate-x-1">
                          <p className="text-sm text-gray-500">Poin</p>
                          <div className="flex items-center">
                            <span className="font-medium">
                              {activity.status === 'approved' 
                                ? `${activity.points} poin (disetujui)` 
                                : activity.status === 'rejected' 
                                  ? '0 poin (ditolak)' 
                                  : activity.expectedPoints > 0 
                                    ? `${activity.expectedPoints} poin (${activity.recognizedCourse ? 'dari kursus' : 'estimasi'})`
                                    : 'Menunggu evaluasi admin'}
                            </span>
                            {activity.status === 'approved' && (
                              <span className="ml-2 text-green-600 animate-bounce">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                            {/* Info icon untuk recognized course */}
                            {activity.recognizedCourse && activity.status === 'pending' && (
                              <span className="ml-2 text-blue-500 cursor-help" title={`Nilai standar untuk ${activity.recognizedCourse.name}: ${activity.recognizedCourse.pointValue} poin`}>
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Recognized Course Information */}
                      {activity.recognizedCourse && (
                        <div className="mt-4 pt-4 border-t border-gray-200 transition-all duration-300 hover:bg-blue-50 rounded p-3">
                          <div className="flex items-center mb-2">
                            <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-gray-500 font-medium">Kursus Terakreditasi</p>
                          </div>
                          <div className="ml-7">
                            <p className="font-medium text-gray-800">{activity.recognizedCourse.name}</p>
                            <p className="text-sm text-gray-600">Provider: {activity.recognizedCourse.provider}</p>
                            <p className="text-sm text-gray-600">Durasi: {activity.recognizedCourse.duration} minggu</p>
                            <p className="text-sm text-blue-600 font-medium">Nilai Standar: {activity.recognizedCourse.pointValue} poin</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Description */}
                      {activity.description && (
                        <div className="mt-4 pt-4 border-t border-gray-200 transition-all duration-300 hover:bg-gray-50 rounded p-2">
                          <p className="text-sm text-gray-500">Deskripsi</p>
                          <p className="text-sm text-gray-700 mt-1">{activity.description}</p>
                        </div>
                      )}
                      
                      {/* Verifier Information */}
                      {activity.verifier && (
                        <div className="mt-4 pt-4 border-t border-gray-200 transition-all duration-300 hover:bg-gray-50 rounded p-2">
                          <p className="text-sm text-gray-500">Diverifikasi oleh</p>
                          <p className="text-sm text-gray-700 mt-1 font-medium">{activity.verifier}</p>
                        </div>
                      )}
                      
                      {/* Document Link */}
                      {activity.documentUrl && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button 
                            className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-md flex items-center hover:from-blue-200 hover:to-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDocument(activity.documentUrl);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            Lihat Dokumen Bukti
                          </button>
                        </div>
                      )}
                      
                      {activity.feedback && (
                        <div className={`mt-4 pt-4 border-t border-gray-200 transition-all duration-500 bg-gradient-to-r from-yellow-50 to-orange-50 rounded p-3`}>
                          <div className="flex items-center mb-2">
                            <svg className="h-5 w-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-gray-500 font-medium">
                              Feedback ({formatDate(activity.feedbackDate)})
                            </p>
                          </div>
                          <p className="mt-1 text-gray-700 italic border-l-4 border-orange-300 pl-3">"{activity.feedback}"</p>
                        </div>
                      )}
                      
                      {activity.status === 'pending' && (
                        <div className={`mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500 italic transition-all duration-500 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded p-3`}>
                          <div className="flex items-center">
                            <div className="mr-2 h-2 w-2 bg-yellow-500 rounded-full animate-ping"></div>
                            <div className="mr-2 h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                            Pengajuan Anda sedang ditinjau oleh admin.
                          </div>
                        </div>
                      )}
                      
                      {activity.status === 'approved' && (
                        <div className={`mt-4 pt-4 border-t border-gray-200 text-sm transition-all duration-500 bg-gradient-to-r from-green-50 to-emerald-50 rounded p-3`}>
                          <div className="flex items-center text-green-700">
                            <svg className="mr-2 h-5 w-5 text-green-500 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Selamat! Aktivitas Anda telah disetujui dan poin telah ditambahkan.
                          </div>
                        </div>
                      )}
                      
                      {activity.status === 'rejected' && (
                        <div className={`mt-4 pt-4 border-t border-gray-200 text-sm transition-all duration-500 bg-gradient-to-r from-red-50 to-pink-50 rounded p-3`}>
                          <div className="flex items-center text-red-700">
                            <svg className="mr-2 h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Mohon maaf, aktivitas Anda tidak disetujui. Silakan periksa feedback dan ajukan kembali.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`text-center py-12 transition-all duration-500 transform ${
              showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="mx-auto h-24 w-24 text-gray-400 transition-transform duration-700 transform hover:rotate-12 hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900 animate-fadeInUp">Tidak ada kegiatan ditemukan</h3>
              <p className="mt-1 text-gray-500 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
                {searchQuery 
                  ? `Tidak ada hasil untuk "${searchQuery}"`
                  : filterStatus !== 'all'
                    ? `Tidak ada kegiatan dengan status "${getStatusStyles(filterStatus).text}"`
                    : 'Belum ada kegiatan yang diajukan'}
              </p>
              <div className="mt-6 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
                <Link
                  to="/submit-activity"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#201E43] to-[#134B70] text-white rounded-lg hover:from-[#134B70] hover:to-[#201E43] transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Ajukan Kegiatan Baru
                </Link>
              </div>
            </div>
          )}
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2 animate-fadeInUp">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                className={`px-4 py-2 rounded-md transition-all duration-300 transform hover:scale-105 ${
                  page === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#201E43] text-white hover:bg-[#134B70] hover:shadow-lg'
                }`}
              >
                &laquo; Sebelumnya
              </button>
              <div className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-md font-medium">
                {page} dari {totalPages}
              </div>
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-md transition-all duration-300 transform hover:scale-105 ${
                  page === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#201E43] text-white hover:bg-[#134B70] hover:shadow-lg'
                }`}
              >
                Selanjutnya &raquo;
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      {editingActivity && (
        <EditActivityModal
          activity={editingActivity}
          onClose={() => setEditingActivity(null)}
          onSave={updateActivity}
        />
      )}
      
      {deleteConfirm && (
        <DeleteConfirmModal
          activity={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={deleteActivity}
        />
      )}
      
      {/* Custom CSS for animations */}
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
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.5s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }
        
        .animate-fadeInLeft {
          animation: fadeInLeft 0.5s ease-out;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ActivityHistory;