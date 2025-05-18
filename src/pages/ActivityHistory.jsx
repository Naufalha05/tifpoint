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

  // Function to refresh activities
  const refreshActivities = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        
        // Get user token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Sesi login telah berakhir. Silakan login kembali.');
          setIsLoading(false);
          return;
        }

        // Fetch activities from the API with pagination
        const response = await fetch(`https://pweb-tifpoint-backend-production-1a28.up.railway.app/api/student/activities?page=${page}&limit=10`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Check if response is successful
        if (!response.ok) {
          // Try to parse error as JSON, but handle non-JSON responses too
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal memuat data aktivitas');
          } else {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
        }

        const data = await response.json();
        
        // Check if pagination info is available in the response
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
        }
        
        // Transform API response to match our component's expected structure
        const transformedActivities = (data.activities || data).map(activity => ({
          id: activity._id,
          title: activity.activityName || activity.title, 
          status: activity.status || 'pending',
          submittedDate: activity.createdAt, 
          date: activity.activityDate || activity.date,
          type: activity.activityType || '-',
          competencyArea: activity.competencyArea || '-',
          points: activity.points || 0,
          expectedPoints: activity.proposedPoints || activity.points || 0,
          feedback: activity.feedback || '',
          feedbackDate: activity.updatedAt,
          documentUrl: activity.documentUrl || activity.evidenceUrl || null,
        }));
        
        setActivities(transformedActivities);
        setIsLoading(false);
        // Trigger animation after data loads
        setShowAnimation(true);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err.message || 'Gagal memuat data riwayat kegiatan. Silakan coba lagi nanti.');
        setIsLoading(false);
      }
    };
    
    fetchActivities();
  }, [page, refreshTrigger]);
  
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
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF0F5] to-[#508C9B] py-12 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="animate-pulse absolute top-20 right-20 w-96 h-96 rounded-full bg-blue-300/20 blur-3xl"></div>
        <div className="animate-pulse absolute bottom-20 left-20 w-64 h-64 rounded-full bg-teal-300/20 blur-3xl delay-1000"></div>
        <div className="animate-pulse absolute top-1/3 left-1/3 w-40 h-40 rounded-full bg-purple-300/10 blur-2xl delay-500"></div>
      </div>
      
      {/* Back to Dashboard Button */}
      <div className="max-w-5xl mx-auto mb-6 relative z-10">
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
        
        <button
          onClick={refreshActivities}
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ml-4"
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
        } relative z-10 hover:shadow-xl`}
      >
        <div className="bg-[#201E43] py-4 px-6">
          <h2 className="text-xl font-bold text-white">Riwayat Pengajuan Kegiatan</h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6 animate-pulse">
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
                    ? 'bg-[#134B70] text-white shadow-md' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Semua
              </button>
              <button 
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-md transition-all duration-300 transform hover:scale-105 ${
                  filterStatus === 'pending' 
                    ? 'bg-yellow-500 text-white shadow-md' 
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                Menunggu
              </button>
              <button 
                onClick={() => setFilterStatus('approved')}
                className={`px-4 py-2 rounded-md transition-all duration-300 transform hover:scale-105 ${
                  filterStatus === 'approved' 
                    ? 'bg-green-500 text-white shadow-md' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                Disetujui
              </button>
              <button 
                onClick={() => setFilterStatus('rejected')}
                className={`px-4 py-2 rounded-md transition-all duration-300 transform hover:scale-105 ${
                  filterStatus === 'rejected' 
                    ? 'bg-red-500 text-white shadow-md' 
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-64 focus:ring-[#201E43] focus:border-[#201E43] transition-all duration-300"
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
                    className={`border ${statusStyles.borderColor} rounded-lg overflow-hidden transition-all duration-500 transform hover:shadow-lg ${
                      showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    } ${isSelected ? 'shadow-lg' : ''}`}
                    style={{ transitionDelay: `${index * 50 + 150}ms` }}
                    onClick={() => toggleActivitySelection(activity.id)}
                  >
                    <div className={`${statusStyles.bgColor} px-4 py-3 flex justify-between items-center cursor-pointer transition-all duration-300 hover:brightness-95`}>
                      <div className="flex items-center">
                        <div className={`${statusStyles.iconBg} p-2 rounded-full mr-3 transition-transform duration-300 ${isSelected ? 'transform rotate-12' : ''}`}>
                          {renderStatusIcon(activity.status)}
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{activity.title}</h3>
                          <p className="text-sm text-gray-600">
                            Diajukan pada {formatDate(activity.submittedDate)}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full ${statusStyles.bgColor} ${statusStyles.textColor} font-medium text-sm transition-all duration-300 ${isSelected ? 'transform scale-110' : ''}`}>
                        {statusStyles.text}
                      </div>
                    </div>
                    
                    <div className={`bg-white p-4 transition-all duration-500 ${isSelected ? 'max-h-96' : 'max-h-96'}`}>
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
                          <p className="font-medium">
                            {activity.status === 'approved' 
                              ? activity.points 
                              : activity.status === 'rejected' 
                                ? '0' 
                                : `${activity.expectedPoints || 'N/A'} (diusulkan)`}
                          </p>
                        </div>
                      </div>
                      
                      {/* Document Link */}
                      {activity.documentUrl && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button 
                            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md flex items-center hover:bg-blue-200 transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering parent onClick
                              openDocument(activity.documentUrl);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            Lihat Dokumen Bukti
                          </button>
                        </div>
                      )}
                      
                      {activity.feedback && (
                        <div className={`mt-4 pt-4 border-t border-gray-200 transition-all duration-500 ${
                          isSelected ? 'opacity-100 transform translate-y-0' : 'opacity-100 transform translate-y-0'
                        }`}>
                          <p className="text-sm text-gray-500">Feedback ({formatDate(activity.feedbackDate)})</p>
                          <p className="mt-1">{activity.feedback}</p>
                        </div>
                      )}
                      
                      {activity.status === 'pending' && (
                        <div className={`mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500 italic transition-all duration-500 ${
                          isSelected ? 'opacity-100' : 'opacity-100'
                        }`}>
                          <div className="flex items-center">
                            <div className="mr-2 h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                            Pengajuan Anda sedang ditinjau oleh admin.
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
              <div className="mx-auto h-24 w-24 text-gray-400 transition-transform duration-700 transform hover:rotate-12">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Tidak ada kegiatan ditemukan</h3>
              <p className="mt-1 text-gray-500">
                {searchQuery 
                  ? `Tidak ada hasil untuk "${searchQuery}"`
                  : filterStatus !== 'all'
                    ? `Tidak ada kegiatan dengan status "${getStatusStyles(filterStatus).text}"`
                    : 'Belum ada kegiatan yang diajukan'}
              </p>
            </div>
          )}
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                className={`px-4 py-2 rounded-md transition-all duration-300 ${
                  page === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#201E43] text-white hover:bg-[#134B70]'
                }`}
              >
                &laquo; Sebelumnya
              </button>
              <div className="px-4 py-2 bg-gray-100 rounded-md">
                {page} dari {totalPages}
              </div>
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-md transition-all duration-300 ${
                  page === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#201E43] text-white hover:bg-[#134B70]'
                }`}
              >
                Selanjutnya &raquo;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityHistory;