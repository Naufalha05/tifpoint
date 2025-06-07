import { useState, useEffect } from 'react';
import { 
  RefreshCw,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function SubmissionVerification({ showSuccessNotification }) {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [approvalPoints, setApprovalPoints] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Base API URL
  const API_BASE_URL = 'https://tifpoint-production.up.railway.app/api';

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

  // Fetch submissions from API
  useEffect(() => {
    const fetchSubmissions = async () => {
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

        // Fetch submissions
        const submissionsResponse = await fetch(`${API_BASE_URL}/activities`, {
          method: 'GET',
          headers
        });
        
        if (!submissionsResponse.ok) {
          throw new Error('Failed to fetch submissions');
        }
        const submissionsData = await submissionsResponse.json();
        
        // Transform submissions data - API returns {activities: [...]}
        const activitiesArray = submissionsData.activities || submissionsData || [];
        const transformedSubmissions = Array.isArray(activitiesArray) 
          ? activitiesArray.map(sub => ({
              id: sub.id,
              title: sub.title,
              description: sub.description,
              status: sub.status || 'PENDING',
              point: sub.point,
              documentUrl: sub.documentUrl,
              createdAt: sub.createdAt,
              verifiedAt: sub.verifiedAt,
              comment: sub.comment,
              user: sub.user || {},
              competency: sub.competency || {},
              activityType: sub.activityType || {},
              verifier: sub.verifier || {}
            }))
          : [];
        
        setSubmissions(transformedSubmissions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError(err.message || 'Terjadi kesalahan saat memuat data pengajuan');
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [refreshTrigger]);

  // Handle approving submission
  const handleApprove = async (submissionId) => {
    try {
      setLoading(true);
      setError(null);
      
      const points = parseInt(approvalPoints);
      if (isNaN(points) || points < 0) {
        throw new Error('Jumlah poin tidak valid. Masukkan angka yang valid.');
      }
      
      if (points === 0) {
        throw new Error('Poin tidak boleh 0. Masukkan jumlah poin yang akan diberikan.');
      }
      
      if (!rejectionComment || rejectionComment.trim() === '') {
        throw new Error('Silakan berikan komentar untuk persetujuan.');
      }
      
      const response = await fetch(`${API_BASE_URL}/activities/${submissionId}/verify`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          status: 'APPROVED',
          point: points,
          comment: rejectionComment
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gagal menyetujui pengajuan: ${errorText}`);
      }
      
      const responseData = await response.json();
      
      // Update local data
      const updatedSubmissions = submissions.map(sub => 
        sub.id === submissionId ? {
          ...sub, 
          status: 'APPROVED', 
          point: points, 
          comment: rejectionComment,
          verifiedAt: new Date().toISOString()
        } : sub
      );
      
      setSubmissions(updatedSubmissions);
      setIsModalOpen(false);
      setApprovalPoints('');
      setRejectionComment('');
      setLoading(false);
      showSuccessNotification(`Pengajuan berhasil disetujui! ${points} poin telah dikirim ke pengguna.`);
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
      
      const response = await fetch(`${API_BASE_URL}/activities/${submissionId}/verify`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          status: 'REJECTED',
          comment: rejectionComment 
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gagal menolak pengajuan: ${errorText}`);
      }
      
      const responseData = await response.json();
      
      // Update local data
      const updatedSubmissions = submissions.map(sub => 
        sub.id === submissionId ? {
          ...sub, 
          status: 'REJECTED', 
          comment: rejectionComment,
          verifiedAt: new Date().toISOString()
        } : sub
      );
      
      setSubmissions(updatedSubmissions);
      setRejectionComment('');
      setApprovalPoints('');
      setIsModalOpen(false);
      setLoading(false);
      showSuccessNotification('Pengajuan berhasil ditolak. Feedback telah dikirim ke pengguna.');
      refreshData();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      setError(error.message || 'Gagal menolak pengajuan');
      setLoading(false);
    }
  };

  // Open submission modal
  const openSubmissionModal = (submission) => {
    setSelectedSubmission(submission);
    setError(null);
    setRejectionComment('');
    setApprovalPoints('');
    setIsModalOpen(true);
  };

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

      {/* Submission Detail Modal */}
      {isModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slideInUp">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center z-10">
              <h3 className="text-lg font-semibold text-gray-900">Detail Pengajuan</h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setRejectionComment('');
                  setApprovalPoints('');
                }}
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
                  {selectedSubmission.user?.nim && (
                    <p className="text-sm text-gray-400">NIM: {selectedSubmission.user.nim}</p>
                  )}
                </div>
                <div className="animate-slideInRight">
                  <p className="text-sm text-gray-500">Activity</p>
                  <p className="font-medium">{selectedSubmission.title || 'Unknown Activity'}</p>
                  {selectedSubmission.activityType?.name && (
                    <p className="text-sm text-gray-400">Type: {selectedSubmission.activityType.name}</p>
                  )}
                </div>
                <div className="animate-slideInLeft delay-100">
                  <p className="text-sm text-gray-500">Competency</p>
                  <p className="font-medium">{selectedSubmission.competency?.name || '-'}</p>
                </div>
                <div className="animate-slideInRight delay-100">
                  <p className="text-sm text-gray-500">Tanggal Submit</p>
                  <p className="font-medium">{new Date(selectedSubmission.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="animate-slideInLeft delay-200">
                  <p className="text-sm text-gray-500">Status & Poin</p>
                  <div className="flex flex-col space-y-2">
                    <div>
                      {selectedSubmission.status === 'PENDING' && (
                        <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium animate-pulse">
                          Menunggu Verifikasi
                        </span>
                      )}
                      {selectedSubmission.status === 'APPROVED' && (
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                            Disetujui
                          </span>
                          {selectedSubmission.point && (
                            <div className="flex items-center bg-green-50 border border-green-200 rounded-lg px-3 py-1">
                              <svg className="w-4 h-4 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                              </svg>
                              <span className="text-green-700 font-semibold text-sm">
                                +{selectedSubmission.point} Poin
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {selectedSubmission.status === 'REJECTED' && (
                        <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
                          Ditolak
                        </span>
                      )}
                    </div>
                    {selectedSubmission.status === 'APPROVED' && selectedSubmission.point && (
                      <p className="text-xs text-green-600 bg-green-50 rounded px-2 py-1 inline-block">
                        Poin telah dikirim ke pengguna
                      </p>
                    )}
                  </div>
                </div>
                <div className="animate-slideInRight delay-200">
                  <p className="text-sm text-gray-500">Tanggal Verifikasi</p>
                  <p className="font-medium">
                    {selectedSubmission.verifiedAt ? new Date(selectedSubmission.verifiedAt).toLocaleDateString() : '-'}
                  </p>
                </div>
                
                {selectedSubmission.description && (
                  <div className="md:col-span-2 animate-slideInUp delay-250">
                    <p className="text-sm text-gray-500">Deskripsi</p>
                    <p className="text-gray-700">{selectedSubmission.description}</p>
                  </div>
                )}
                
                <div className="md:col-span-2 animate-slideInUp delay-300">
                  <p className="text-sm text-gray-500">Bukti Kegiatan</p>
                  <div className="mt-2">
                    <div className="border border-gray-300 rounded-lg p-4">
                      {selectedSubmission.documentUrl ? (
                        <div className="flex items-center justify-center space-x-4">
                          <a 
                            href={selectedSubmission.documentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Lihat Dokumen
                          </a>
                          <span className="text-sm text-gray-500">
                            {selectedSubmission.documentUrl.split('/').pop()}
                          </span>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center">Tidak ada bukti dokumen</p>
                      )}
                    </div>
                  </div>
                </div>

                {selectedSubmission.comment && (
                  <div className="md:col-span-2 animate-slideInUp delay-350">
                    <p className="text-sm text-gray-500">Komentar/Feedback Verifikasi</p>
                    <div className={`mt-2 p-3 rounded-lg ${
                      selectedSubmission.status === 'APPROVED' ? 'bg-green-50 border border-green-200' : 
                      selectedSubmission.status === 'REJECTED' ? 'bg-red-50 border border-red-200' : 
                      'bg-gray-50'
                    }`}>
                      <p className={`text-sm ${
                        selectedSubmission.status === 'APPROVED' ? 'text-green-700' : 
                        selectedSubmission.status === 'REJECTED' ? 'text-red-700' : 
                        'text-gray-700'
                      }`}>
                        {selectedSubmission.comment}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        {selectedSubmission.verifier?.name && (
                          <p className="text-xs text-gray-500">
                            Verifikator: {selectedSubmission.verifier.name}
                          </p>
                        )}
                        {selectedSubmission.status === 'APPROVED' && selectedSubmission.point && (
                          <div className="flex items-center text-xs text-green-600 bg-green-100 rounded px-2 py-1">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {selectedSubmission.point} poin telah dikirim
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary box for verified activities */}
                {selectedSubmission.status !== 'PENDING' && (
                  <div className="md:col-span-2 animate-slideInUp delay-375">
                    <div className={`p-4 rounded-lg border-2 ${
                      selectedSubmission.status === 'APPROVED' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {selectedSubmission.status === 'APPROVED' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mr-2" />
                          )}
                          <span className={`font-medium ${
                            selectedSubmission.status === 'APPROVED' ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {selectedSubmission.status === 'APPROVED' ? 'Pengajuan Disetujui' : 'Pengajuan Ditolak'}
                          </span>
                        </div>
                        {selectedSubmission.status === 'APPROVED' && selectedSubmission.point && (
                          <div className="bg-green-100 border border-green-300 rounded-lg px-3 py-1">
                            <span className="text-green-700 font-semibold text-sm">
                              +{selectedSubmission.point} Poin
                            </span>
                          </div>
                        )}
                      </div>
                      {selectedSubmission.verifiedAt && (
                        <p className="text-xs text-gray-600 mt-2">
                          Diverifikasi pada: {new Date(selectedSubmission.verifiedAt).toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {selectedSubmission.status === 'PENDING' && (
                <div className="mt-6 pt-6 border-t border-gray-200 animate-slideInUp delay-400">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-blue-800 font-medium">
                        Verifikasi Pengajuan
                      </p>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Poin yang Anda berikan akan langsung dikirim ke akun pengguna setelah persetujuan.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="approvalPoints" className="block text-sm font-medium text-gray-700 mb-1">
                        Jumlah Poin yang Akan Diberikan <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="approvalPoints"
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-12 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:scale-105"
                          placeholder="Masukkan jumlah poin (minimal 1)..."
                          value={approvalPoints}
                          onChange={(e) => setApprovalPoints(e.target.value)}
                          min="1"
                          max="100"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 text-sm">poin</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Poin akan ditambahkan ke total skor pengguna
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                        Komentar Verifikasi <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="comment"
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:scale-105"
                        placeholder="Berikan komentar untuk persetujuan atau alasan penolakan..."
                        value={rejectionComment}
                        onChange={(e) => setRejectionComment(e.target.value)}
                      ></textarea>
                      <p className="text-xs text-gray-500 mt-1">
                        Komentar ini akan dikirim sebagai feedback kepada pengguna
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleApprove(selectedSubmission.id)}
                      className="py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading || !approvalPoints || !rejectionComment}
                    >
                      <div className="flex items-center justify-center">
                        {loading ? (
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        ) : (
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                        )}
                        Setujui & Kirim Poin
                      </div>
                    </button>
                    <button
                      onClick={() => handleReject(selectedSubmission.id)}
                      className="py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading || !rejectionComment}
                    >
                      <div className="flex items-center justify-center">
                        {loading ? (
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        ) : (
                          <XCircle className="mr-2 h-5 w-5" />
                        )}
                        Tolak Pengajuan
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 z-10">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setRejectionComment('');
                  setApprovalPoints('');
                }}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
              >
                Tutup
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
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        
        .delay-100 {
          animation-delay: 0.1s;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-250 {
          animation-delay: 0.25s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-350 {
          animation-delay: 0.35s;
        }
        
        .delay-375 {
          animation-delay: 0.375s;
        }
        
        .delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}