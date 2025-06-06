import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SubmitActivity = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    activityType: '',
    date: '',
    description: '',
    competencyArea: '',
    evidence: null,
    additionalNotes: '',
    eventId: '', // Added eventId field
    recognizedCourseId: '' // Added recognizedCourseId field
  });
  const [preview, setPreview] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [events, setEvents] = useState([]); // State untuk events
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [competencies, setCompetencies] = useState([]); // State untuk competencies
  const [activityTypesData, setActivityTypesData] = useState([]); // State untuk activity types
  const [recognizedCourses, setRecognizedCourses] = useState([]); // State untuk recognized courses
  const [loadingData, setLoadingData] = useState(false);

  // Base URL for API - Mixed endpoints (some with /api prefix, some without)
  const API_BASE_URL = 'https://tifpoint-production.up.railway.app/api';

  // Animation effect when component mounts
  useEffect(() => {
    setIsLoaded(true);
    // Load pending submissions
    const stored = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
    setPendingSubmissions(stored);
    // Load all required data saat component mount
    loadAllData();
  }, []);

  // Function to load all required data from API
  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login terlebih dahulu.');
      }

      // Load events, competencies, activity types, and recognized courses in parallel
      await Promise.all([
        loadEvents(token),
        loadCompetencies(token),
        loadActivityTypes(token),
        loadRecognizedCourses(token)
      ]);

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Gagal memuat data. ' + error.message);
    } finally {
      setLoadingData(false);
    }
  };

  // Function to load events from API
  const loadEvents = async (token) => {
    setLoadingEvents(true);
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load events: ${response.status}`);
      }

      const eventsData = await response.json();
      setEvents(eventsData);
      console.log('Events loaded:', eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
      // Don't throw error, just log it as events are optional
    } finally {
      setLoadingEvents(false);
    }
  };

  // Function to load competencies from API
  const loadCompetencies = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/competencies`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load competencies: ${response.status}`);
      }

      const competenciesData = await response.json();
      setCompetencies(competenciesData);
      console.log('Competencies loaded:', competenciesData);
    } catch (error) {
      console.error('Error loading competencies:', error);
      // Fallback to static data if API fails
      setCompetencies([
        { id: 'software-dev', name: 'Software Developer' },
        { id: 'network', name: 'Network' },
        { id: 'ai', name: 'Artificial Intelligence' },
        { id: 'softskills', name: 'Soft Skills' }
      ]);
    }
  };

  // Function to load activity types from API
  const loadActivityTypes = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/activity-types`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load activity types: ${response.status}`);
      }

      const activityTypesData = await response.json();
      setActivityTypesData(activityTypesData);
      console.log('Activity Types loaded:', activityTypesData);
    } catch (error) {
      console.error('Error loading activity types:', error);
      // Fallback to static data if API fails
      setActivityTypesData([
        { id: 'seminar', name: 'Seminar', points: '2-4' },
        { id: 'course', name: 'Kursus', points: '4-8' },
        { id: 'program', name: 'Program', points: '5-10' },
        { id: 'research', name: 'Riset', points: '8-12' },
        { id: 'achievement', name: 'Prestasi', points: '6-15' }
      ]);
    }
  };

  // Function to load recognized courses from API
  const loadRecognizedCourses = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recognized-courses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load recognized courses: ${response.status}`);
      }

      const recognizedCoursesData = await response.json();
      setRecognizedCourses(recognizedCoursesData);
      console.log('Recognized Courses loaded:', recognizedCoursesData);
    } catch (error) {
      console.error('Error loading recognized courses:', error);
      // Set empty array if API fails (recognized courses are optional)
      setRecognizedCourses([]);
    }
  };

  // Function to export pending submissions as file
  const exportPendingSubmissions = () => {
    const stored = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
    if (stored.length === 0) {
      alert('Tidak ada pengajuan tertunda untuk diekspor.');
      return;
    }

    // Create detailed export data
    const exportData = {
      exportDate: new Date().toISOString(),
      totalSubmissions: stored.length,
      submissions: stored.map((submission, index) => ({
        submissionNumber: index + 1,
        submissionId: submission.id,
        timestamp: submission.timestamp,
        studentInfo: {
          name: submission.profileData?.name || 'Unknown',
          nim: submission.profileData?.nim || 'Unknown',
          email: submission.profileData?.email || 'Unknown'
        },
        activityDetails: {
          title: submission.formData.title,
          type: submission.formData.activityType,
          date: submission.formData.date,
          description: submission.formData.description,
          competencyArea: submission.formData.competencyArea,
          additionalNotes: submission.formData.additionalNotes,
          eventId: submission.formData.eventId,
          recognizedCourseId: submission.formData.recognizedCourseId
        },
        evidence: {
          fileName: submission.formData.evidence?.name || 'Unknown',
          fileSize: submission.formData.evidence?.size || 0,
          evidenceUrl: submission.evidenceUrl || 'Not uploaded'
        },
        status: submission.status,
        retryCount: submission.retryCount || 0,
        lastError: submission.lastError || 'Unknown'
      }))
    };

    // Create downloadable file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pengajuan-kegiatan-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Data pengajuan berhasil diekspor! Silakan kirim file ini ke admin untuk diproses manual.');
  };

  // Function to clear all pending submissions
  const clearAllPendingSubmissions = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua pengajuan tertunda? Pastikan Anda sudah mengekspor data terlebih dahulu.')) {
      localStorage.removeItem('pendingSubmissions');
      setPendingSubmissions([]);
      alert('Semua pengajuan tertunda telah dihapus.');
    }
  };

  // Function to test API endpoints
  const testAPIEndpoints = async () => {
    const token = localStorage.getItem('token');
    console.log('\n=== API ENDPOINT TESTING ===');
    
    const testCases = [
      // Test endpoints sesuai dokumentasi API
      { method: 'GET', path: '/events', requiresAuth: true },
      { method: 'GET', path: '/competencies', requiresAuth: true },
      { method: 'GET', path: '/activity-types', requiresAuth: true },
      { method: 'GET', path: '/recognized-courses', requiresAuth: true },
      { method: 'GET', path: '/auth/profile', requiresAuth: true },
      { method: 'GET', path: '/activities', requiresAuth: true },
    ];
    
    for (const test of testCases) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (test.requiresAuth && token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const options = {
          method: test.method,
          headers: headers
        };
        
        const response = await fetch(`${API_BASE_URL}${test.path}`, options);
        const responseText = await response.text();
        
        console.log(`${test.method} ${test.path}: ${response.status}`);
        if (response.ok) {
          console.log(`  Success - Response length: ${responseText.length}`);
        } else {
          console.log(`  Error - ${responseText.substring(0, 200)}`);
        }
      } catch (error) {
        console.log(`${test.method} ${test.path}: ERROR -`, error.message);
      }
    }
  };

  // Function to retry pending submissions
  const retryPendingSubmissions = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Token tidak ditemukan. Silakan login ulang.');
      return;
    }

    const stored = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
    const successful = [];
    const failed = [];

    for (const submission of stored) {
      try {
        // Create proper submission data according to API docs
        const submissionData = {
          title: submission.formData.title,
          description: submission.formData.description,
          competencyId: submission.formData.competencyArea,
          activityTypeId: submission.formData.activityType,
          documentUrl: submission.evidenceUrl,
          recognizedCourseId: submission.formData.recognizedCourseId || null,
          eventId: submission.formData.eventId || null
        };

        const response = await fetch(`${API_BASE_URL}/activities`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submissionData)
        });

        if (response.ok) {
          successful.push(submission.id);
          console.log('Successfully synced submission:', submission.id);
        } else {
          failed.push(submission.id);
          submission.retryCount = (submission.retryCount || 0) + 1;
        }
      } catch (error) {
        failed.push(submission.id);
        submission.retryCount = (submission.retryCount || 0) + 1;
      }
    }

    // Update localStorage - remove successful, keep failed
    const remainingSubmissions = stored.filter(s => !successful.includes(s.id));
    localStorage.setItem('pendingSubmissions', JSON.stringify(remainingSubmissions));
    setPendingSubmissions(remainingSubmissions);

    if (successful.length > 0) {
      alert(`Berhasil mengirim ${successful.length} pengajuan yang tertunda!`);
    }
  };

  // Function to remove pending submission
  const removePendingSubmission = (id) => {
    const stored = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
    const filtered = stored.filter(s => s.id !== id);
    localStorage.setItem('pendingSubmissions', JSON.stringify(filtered));
    setPendingSubmissions(filtered);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Ukuran file tidak boleh lebih dari 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError('Format file tidak didukung. Gunakan PDF, JPG, JPEG, atau PNG');
        return;
      }

      setFormData(prev => ({ ...prev, evidence: file }));
      setError(null);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  // Upload file using the correct API endpoint
  const uploadFile = async (file, token) => {
    try {
      console.log('Uploading file using /api/upload endpoint...');
      
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, browser will set it automatically with boundary
        },
        body: formData
      });
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }
      
      const result = await uploadResponse.json();
      console.log('Upload success:', result);
      
      // Return the URL from the response according to API docs
      return result.url;
      
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(`Gagal mengunggah file: ${error.message}`);
    }
  };

  // Get user profile - Updated endpoint
  const getUserProfile = async (token) => {
    try {
      const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!profileResponse.ok) {
        throw new Error(`Failed to get profile: ${profileResponse.status}`);
      }
      
      const profileData = await profileResponse.json();
      console.log('Profile data received:', profileData);
      return profileData;
      
    } catch (error) {
      console.warn('Failed to get profile from API, trying token decode...', error.message);
      
      // Fallback: try to decode JWT token
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        console.log('Decoded token payload:', tokenPayload);
        
        const fallbackProfile = {
          id: tokenPayload.userId || tokenPayload.id || tokenPayload.sub || 'user-' + Date.now(),
          username: tokenPayload.username || tokenPayload.email || 'user',
          email: tokenPayload.email || '',
          name: tokenPayload.name || tokenPayload.username || 'User',
          nim: tokenPayload.nim || '',
          role: tokenPayload.role || 'student'
        };
        
        console.log('Using fallback profile:', fallbackProfile);
        return fallbackProfile;
      } catch (tokenError) {
        console.error('Failed to decode token:', tokenError);
        throw new Error('Cannot get user information. Please login again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    console.log('=== SUBMISSION STARTED ===');

    try {
      // Get and validate authentication token
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Anda belum login. Silakan login terlebih dahulu.');
      }
      
      // Validate token format
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        localStorage.removeItem('token');
        throw new Error('Token tidak valid. Silakan login ulang.');
      }

      // Validate required fields according to API documentation
      if (!formData.title || !formData.activityType || !formData.description || 
          !formData.competencyArea || !formData.evidence) {
        throw new Error('Field wajib: judul, jenis kegiatan, deskripsi, area kompetensi, dan bukti kegiatan harus diisi.');
      }

      // Step 1: Get user profile (not needed for submission but for logging)
      console.log('Step 1: Getting user profile for logging...');
      const profileData = await getUserProfile(token);
      
      // Step 2: Upload file
      console.log('Step 2: Uploading evidence file...');
      const documentUrl = await uploadFile(formData.evidence, token);
      
      // Step 3: Create submission with correct data structure
      console.log('Step 3: Creating submission...');
      
      if (!documentUrl) {
        throw new Error('Document URL is missing after upload.');
      }
      
      // Create submission data according to API documentation
      const submissionData = {
        title: formData.title,
        description: formData.description,
        competencyId: formData.competencyArea,
        activityTypeId: formData.activityType,
        documentUrl: documentUrl,
        recognizedCourseId: formData.recognizedCourseId || null,
        eventId: formData.eventId || null
      };
      
      console.log('Submission data:', submissionData);
      console.log('ProfileData:', profileData);
      console.log('Document URL:', documentUrl);
      
      // Validate submission data
      if (!submissionData.title || !submissionData.description || 
          !submissionData.competencyId || !submissionData.activityTypeId || 
          !submissionData.documentUrl) {
        throw new Error('Invalid submission data: required fields are missing');
      }
      
      // Create submission menggunakan endpoint yang benar
      const submissionResponse = await fetch(`${API_BASE_URL}/activities`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });
      
      if (!submissionResponse.ok) {
        const errorText = await submissionResponse.text();
        console.error('Submission failed with status:', submissionResponse.status);
        console.error('Error response:', errorText);
        
        // Try to parse error response
        try {
          const errorJson = JSON.parse(errorText);
          console.error('Parsed error:', errorJson);
          throw new Error(`Submission failed: ${errorJson.message || errorText}`);
        } catch (parseError) {
          console.error('Could not parse error response as JSON');
          throw new Error(`Submission failed: ${submissionResponse.status} - ${errorText}`);
        }
      }
      
      const submissionResult = await submissionResponse.json();
      console.log('Submission success:', submissionResult);
      
      // Trigger event untuk refresh ActivityHistory
      const activitySubmittedEvent = new CustomEvent('activitySubmitted', {
        detail: {
          activityId: submissionResult.activity?.id,
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(activitySubmittedEvent);

      // Also set storage trigger
      localStorage.setItem('activitySubmitted', Date.now().toString());
      
      // Success! Show success state
      setSuccess(true);
      
      // Redirect after showing success message
      setTimeout(() => {
        navigate('/activity-history');
      }, 2000);
      
      console.log('=== SUBMISSION COMPLETED SUCCESSFULLY ===');
      
    } catch (err) {
      console.error('=== SUBMISSION FAILED ===');
      console.error('Error details:', err);
      
      // Save submission data locally as fallback
      const fallbackSubmission = {
        id: 'draft-' + Date.now(),
        timestamp: new Date().toISOString(),
        formData: formData,
        profileData: null,
        status: 'pending_server_sync',
        retryCount: 0,
        lastError: err.message
      };
      
      const existingDrafts = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
      existingDrafts.push(fallbackSubmission);
      localStorage.setItem('pendingSubmissions', JSON.stringify(existingDrafts));
      setPendingSubmissions(existingDrafts);
      
      // Provide specific error messages
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        localStorage.removeItem('token');
        setError('Sesi telah berakhir. Silakan login ulang untuk melanjutkan.');
      } else if (err.message.includes('403') || err.message.includes('Forbidden')) {
        setError('Anda tidak memiliki izin untuk mengajukan kegiatan. Hubungi administrator.');
      } else if (err.message.includes('404')) {
        setError('Endpoint tidak ditemukan. Silakan hubungi administrator untuk memperbarui sistem.');
      } else if (err.message.includes('500')) {
        setError('Terjadi kesalahan server. Data Anda telah disimpan dan akan otomatis dikirim saat server pulih.');
      } else {
        setError(err.message || 'Terjadi kesalahan saat mengirim data. Data telah disimpan secara lokal.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle focus effects
  const handleFocus = (fieldName) => {
    setActiveField(fieldName);
  };

  const handleBlur = () => {
    setActiveField(null);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EEF0F5] to-[#508C9B] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 
                      animate-fadeIn transition-all duration-500 transform">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100
                          animate-scaleIn transition-all duration-500">
              <svg className="h-10 w-10 text-green-600 animate-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-[#134B70] animate-slideUp">Pengajuan Berhasil!</h2>
            <p className="mt-2 text-gray-600 animate-fadeIn transition-opacity delay-100">
              Kegiatan Anda telah berhasil diajukan dan sedang menunggu persetujuan admin.
            </p>
            <div className="mt-6 animate-fadeIn transition-opacity delay-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="mr-4 px-4 py-2 border border-[#201E43] text-[#201E43] rounded-md 
                          hover:bg-[#201E43] hover:text-white transition-all duration-300 
                          transform hover:scale-105 hover:shadow-md"
              >
                Kembali ke Dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate('/activity-history')}
                className="px-4 py-2 bg-[#201E43] text-white rounded-md 
                          hover:bg-[#201E43]/80 transition-all duration-300 
                          transform hover:scale-105 hover:shadow-md"
              >
                Lihat Riwayat Pengajuan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF0F5] to-[#508C9B] py-12 px-4 sm:px-6 lg:px-8 transition-all duration-700">
      {/* Back to Dashboard Button */}
      <div className={`max-w-3xl mx-auto mb-6 transition-all duration-500 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-4 py-2 bg-[#201E43] text-white rounded-lg 
                    hover:bg-[#134B70] transition-all duration-300 
                    transform hover:scale-105 hover:shadow-md"
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

      {/* Loading Data Notice */}
      {loadingData && (
        <div className={`max-w-3xl mx-auto mb-6 transition-all duration-500 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  Memuat data sistem... Mohon tunggu sebentar.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Submissions Notice */}
      {pendingSubmissions.length > 0 && (
        <div className={`max-w-3xl mx-auto mb-6 transition-all duration-500 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    <strong>{pendingSubmissions.length} pengajuan</strong> tertunda karena server bermasalah.
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={retryPendingSubmissions}
                  className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md hover:bg-yellow-200 transition-colors duration-200"
                >
                  Coba Kirim Ulang
                </button>
                <button
                  onClick={testAPIEndpoints}
                  className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200 transition-colors duration-200"
                >
                  Test API
                </button>
                <button
                  onClick={exportPendingSubmissions}
                  className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-md hover:bg-green-200 transition-colors duration-200"
                >
                  Export Data
                </button>
                <button
                  onClick={() => setPendingSubmissions([])}
                  className="text-sm text-yellow-600 hover:text-yellow-800 transition-colors duration-200"
                >
                  Sembunyikan
                </button>
              </div>
            </div>
            
            {/* Show pending submissions details */}
            <div className="mt-3 space-y-2">
              {pendingSubmissions.slice(0, 3).map((submission) => (
                <div key={submission.id} className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded">
                  <span className="font-medium">{submission.formData.title}</span>
                  <span className="ml-2 text-yellow-600">
                    ({new Date(submission.timestamp).toLocaleDateString()})
                  </span>
                  <button
                    onClick={() => removePendingSubmission(submission.id)}
                    className="ml-2 text-red-600 hover:text-red-800"
                    title="Hapus dari daftar pending"
                  >
                    ×
                  </button>
                </div>
              ))}
              {pendingSubmissions.length > 3 && (
                <p className="text-xs text-yellow-600">
                  ... dan {pendingSubmissions.length - 3} pengajuan lainnya
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Main Form Card */}
      <div 
        className={`max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden 
                  transition-all duration-700 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="bg-[#201E43] py-4 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3a3876]/20 to-transparent animate-shimmer"></div>
          <h2 className="text-xl font-bold text-white relative z-10">Ajukan Kegiatan Baru</h2>
          <p className="text-blue-100 mt-1 text-sm relative z-10">Admin akan menentukan poin berdasarkan jenis kegiatan dan kursus yang dipilih</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6 animate-shake">
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
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Event Selection - Optional field */}
          <div className={`mb-6 transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} 
                         ${activeField === 'eventId' ? 'transform scale-[1.02]' : ''}`}>
            <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Event (Opsional)
            </label>
            <select
              id="eventId"
              name="eventId"
              value={formData.eventId}
              onChange={handleChange}
              onFocus={() => handleFocus('eventId')}
              onBlur={handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-md 
                        focus:ring-[#201E43] focus:border-[#201E43] 
                        transition-all duration-300 
                        focus:shadow-md"
              disabled={loadingEvents}
            >
              <option value="">Kegiatan Umum (Tidak terkait event tertentu)</option>
              {loadingEvents ? (
                <option value="">Memuat daftar event...</option>
              ) : (
                events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.title} - {event.pointValue} poin ({new Date(event.date).toLocaleDateString()})
                  </option>
                ))
              )}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Pilih event jika kegiatan Anda terkait dengan event tertentu yang sudah terdaftar
            </p>
          </div>

          {/* Recognized Course Selection - Optional field */}
          <div className={`mb-6 transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} 
                         ${activeField === 'recognizedCourseId' ? 'transform scale-[1.02]' : ''}`}>
            <label htmlFor="recognizedCourseId" className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Kursus Terakreditasi (Opsional)
            </label>
            <select
              id="recognizedCourseId"
              name="recognizedCourseId"
              value={formData.recognizedCourseId}
              onChange={handleChange}
              onFocus={() => handleFocus('recognizedCourseId')}
              onBlur={handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-md 
                        focus:ring-[#201E43] focus:border-[#201E43] 
                        transition-all duration-300 
                        focus:shadow-md"
              disabled={loadingData}
            >
              <option value="">Tidak terkait kursus terakreditasi</option>
              {recognizedCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} - {course.provider} ({course.pointValue} poin)
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Pilih jika kegiatan Anda terkait dengan kursus yang sudah diakui institusi
            </p>
          </div>

          {/* Activity Title */}
          <div className={`mb-6 transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} 
                         ${activeField === 'title' ? 'transform scale-[1.02]' : ''}`}>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Judul Kegiatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              onFocus={() => handleFocus('title')}
              onBlur={handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-md 
                        focus:ring-[#201E43] focus:border-[#201E43] 
                        transition-all duration-300 transform 
                        focus:shadow-md"
              placeholder="Contoh: Workshop UI/UX Design"
            />
          </div>
          
          {/* Activity Type */}
          <div className={`mb-6 transition-all duration-300 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} 
                         ${activeField === 'activityType' ? 'transform scale-[1.02]' : ''}`}>
            <label htmlFor="activityType" className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Kegiatan <span className="text-red-500">*</span>
            </label>
            <select
              id="activityType"
              name="activityType"
              required
              value={formData.activityType}
              onChange={handleChange}
              onFocus={() => handleFocus('activityType')}
              onBlur={handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-md 
                        focus:ring-[#201E43] focus:border-[#201E43] 
                        transition-all duration-300 
                        focus:shadow-md"
              disabled={loadingData}
            >
              <option value="" disabled>Pilih jenis kegiatan</option>
              {activityTypesData.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} {type.points && `(Estimasi: ${type.points} poin)`}
                </option>
              ))}
            </select>
          </div>
          
          {/* Row with two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Activity Date */}
            <div className={`transition-all duration-300 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} 
                           ${activeField === 'date' ? 'transform scale-[1.02]' : ''}`}>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Kegiatan <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                onFocus={() => handleFocus('date')}
                onBlur={handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-md 
                          focus:ring-[#201E43] focus:border-[#201E43] 
                          transition-all duration-300 
                          focus:shadow-md"
              />
            </div>
            
            {/* Competency Area */}
            <div className={`transition-all duration-300 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} 
                           ${activeField === 'competencyArea' ? 'transform scale-[1.02]' : ''}`}>
              <label htmlFor="competencyArea" className="block text-sm font-medium text-gray-700 mb-1">
                Area Kompetensi <span className="text-red-500">*</span>
              </label>
              <select
                id="competencyArea"
                name="competencyArea"
                required
                value={formData.competencyArea}
                onChange={handleChange}
                onFocus={() => handleFocus('competencyArea')}
                onBlur={handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-md 
                          focus:ring-[#201E43] focus:border-[#201E43] 
                          transition-all duration-300 
                          focus:shadow-md"
                disabled={loadingData}
              >
                <option value="" disabled>Pilih area kompetensi</option>
                {competencies.map(competency => (
                  <option key={competency.id} value={competency.id}>{competency.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Activity Description */}
          <div className={`mb-6 transition-all duration-300 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} 
                         ${activeField === 'description' ? 'transform scale-[1.02]' : ''}`}>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi Kegiatan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              required
              value={formData.description}
              onChange={handleChange}
              onFocus={() => handleFocus('description')}
              onBlur={handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-md 
                        focus:ring-[#201E43] focus:border-[#201E43] 
                        transition-all duration-300 
                        focus:shadow-md"
              placeholder="Jelaskan secara singkat tentang kegiatan yang diikuti..."
            ></textarea>
          </div>
          
          {/* Evidence Upload */}
          <div className={`mb-6 transition-all duration-300 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} 
                         ${activeField === 'evidence' ? 'transform scale-[1.02]' : ''}`}>
            <label htmlFor="evidence" className="block text-sm font-medium text-gray-700 mb-1">
              Bukti Kegiatan <span className="text-red-500">*</span>
            </label>
            <div 
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md 
                        transition-all duration-300 hover:border-[#201E43] 
                        ${activeField === 'evidence' ? 'border-[#201E43] shadow-md' : ''}`}
              onMouseOver={() => handleFocus('evidence')}
              onMouseOut={handleBlur}
            >
              <div className="space-y-1 text-center">
                {preview ? (
                  <div className="animate-fadeIn">
                    <img src={preview} alt="Preview" className="mx-auto h-32 object-cover transition-transform duration-300 hover:scale-105" />
                    <p className="mt-2 text-sm text-gray-600">{formData.evidence.name}</p>
                    <button 
                      type="button"
                      onClick={() => {
                        setPreview(null);
                        setFormData(prev => ({ ...prev, evidence: null }));
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 
                                transition-all duration-300 hover:underline"
                    >
                      Hapus file
                    </button>
                  </div>
                ) : formData.evidence ? (
                  <div className="animate-fadeIn">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">{formData.evidence.name}</p>
                    <button 
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, evidence: null }));
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 
                                transition-all duration-300 hover:underline"
                    >
                      Hapus file
                    </button>
                  </div>
                ) : (
                  <>
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 
                              transition-transform duration-300 group-hover:scale-110 
                              animate-pulse"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="evidence"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-[#201E43] 
                                  hover:text-[#201E43]/80 transition-colors duration-300"
                      >
                        <span className="hover:underline">Upload file</span>
                        <input
                          id="evidence"
                          name="evidence"
                          type="file"
                          required
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">atau drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, PNG, JPG hingga 10MB
                    </p>
                  </>
                )}
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Upload sertifikat, surat keterangan, atau bukti lainnya
            </p>
          </div>
          
          {/* Additional Notes */}
          <div className={`mb-6 transition-all duration-300 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} 
                         ${activeField === 'additionalNotes' ? 'transform scale-[1.02]' : ''}`}>
            <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
              Catatan Tambahan
            </label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              rows="2"
              value={formData.additionalNotes}
              onChange={handleChange}
              onFocus={() => handleFocus('additionalNotes')}
              onBlur={handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-md 
                        focus:ring-[#201E43] focus:border-[#201E43] 
                        transition-all duration-300 
                        focus:shadow-md"
              placeholder="Informasi tambahan yang perlu diketahui admin..."
            ></textarea>
          </div>
          
          {/* Submit Button */}
          <div className={`flex justify-end transition-all duration-300 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button
              type="submit"
              disabled={isSubmitting || loadingData}
              className={`px-6 py-2 bg-[#201E43] text-white rounded-md 
                        hover:bg-[#201E43]/80 transition-all duration-300 
                        transform hover:scale-105 hover:shadow-lg 
                        flex items-center relative overflow-hidden
                        ${isSubmitting || loadingData ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine"></span>
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mengirim...
                </>
              ) : loadingData ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memuat Data...
                </>
              ) : (
                'Ajukan Kegiatan'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Add Tailwind CSS animation keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes checkmark {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes shine {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out;
        }
        
        .animate-checkmark {
          animation: checkmark 0.8s ease-in-out;
        }
        
        .animate-shine {
          animation: shine 2s infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SubmitActivity;