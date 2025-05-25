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
    expectedPoints: '',
    evidence: null,
    additionalNotes: ''
  });
  const [preview, setPreview] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);

  // Animation effect when component mounts
  useEffect(() => {
    setIsLoaded(true);
    // Load pending submissions
    const stored = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
    setPendingSubmissions(stored);
  }, []);

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
          proposedPoints: submission.formData.expectedPoints,
          additionalNotes: submission.formData.additionalNotes
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

  // Function to export as email format
  const exportAsEmailFormat = () => {
    const stored = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
    if (stored.length === 0) {
      alert('Tidak ada pengajuan tertunda untuk diekspor.');
      return;
    }

    let emailContent = 'Subject: Pengajuan Kegiatan - Manual Submission\n\n';
    emailContent += 'Yth. Admin TIF Point,\n\n';
    emailContent += 'Berikut adalah pengajuan kegiatan yang tidak dapat disubmit melalui sistem karena API sedang maintenance:\n\n';

    stored.forEach((submission, index) => {
      emailContent += `--- PENGAJUAN ${index + 1} ---\n`;
      emailContent += `Timestamp: ${new Date(submission.timestamp).toLocaleString('id-ID')}\n`;
      emailContent += `Nama: ${submission.profileData?.name || 'Unknown'}\n`;
      emailContent += `NIM: ${submission.profileData?.nim || 'Unknown'}\n`;
      emailContent += `Email: ${submission.profileData?.email || 'Unknown'}\n\n`;
      
      emailContent += `Judul Kegiatan: ${submission.formData.title}\n`;
      emailContent += `Jenis Kegiatan: ${submission.formData.activityType}\n`;
      emailContent += `Tanggal Kegiatan: ${submission.formData.date}\n`;
      emailContent += `Area Kompetensi: ${submission.formData.competencyArea}\n`;
      emailContent += `Usulan Poin: ${submission.formData.expectedPoints}\n`;
      emailContent += `Deskripsi: ${submission.formData.description}\n`;
      if (submission.formData.additionalNotes) {
        emailContent += `Catatan Tambahan: ${submission.formData.additionalNotes}\n`;
      }
      emailContent += `File Bukti: ${submission.formData.evidence?.name || 'Unknown'}\n`;
      emailContent += '\n';
    });

    emailContent += 'Mohon untuk memproses pengajuan ini secara manual.\n\n';
    emailContent += 'Terima kasih,\n';
    emailContent += 'Sistem TIF Point (Auto-generated)';

    // Create downloadable text file
    const blob = new Blob([emailContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-pengajuan-kegiatan-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Format email berhasil dibuat! Silakan kirim konten file ini via email ke admin.');
  };

  // Function to clear all pending submissions
  const clearAllPendingSubmissions = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua pengajuan tertunda? Pastikan Anda sudah mengekspor data terlebih dahulu.')) {
      localStorage.removeItem('pendingSubmissions');
      setPendingSubmissions([]);
      alert('Semua pengajuan tertunda telah dihapus.');
    }
  };

  // Function to test API endpoints manually
  const testAPIEndpoints = async () => {
    const token = localStorage.getItem('token');
    console.log('\n=== MANUAL API ENDPOINT TESTING ===');
    
    const testCases = [
      // GET endpoints that should work according to docs
      { method: 'GET', path: '/events', requiresAuth: false },
      { method: 'GET', path: '/recognized-courses', requiresAuth: false },
      { method: 'GET', path: '/profile', requiresAuth: true },
      { method: 'GET', path: '/submissions', requiresAuth: true },
      { method: 'GET', path: '/users', requiresAuth: true },
      
      // POST endpoints to test
      { method: 'POST', path: '/submissions', requiresAuth: true, testData: { userId: 'test', eventId: null, evidence: 'test' } },
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
        
        if (test.testData) {
          options.body = JSON.stringify(test.testData);
        }
        
        const response = await fetch(`https://pweb-tifpoint-backend-production-1a28.up.railway.app${test.path}`, options);
        const responseText = await response.text();
        
        console.log(`${test.method} ${test.path}: ${response.status}`);
        if (response.status !== 404) {
          console.log(`  Headers:`, Object.fromEntries(response.headers.entries()));
          console.log(`  Body preview:`, responseText.substring(0, 200));
        }
      } catch (error) {
        console.log(`${test.method} ${test.path}: ERROR -`, error.message);
      }
    }
  };

  // Function to retry pending submissions
  const retryPendingSubmissions = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const stored = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
    const successful = [];
    const failed = [];

    for (const submission of stored) {
      try {
        const response = await fetch('https://pweb-tifpoint-backend-production-1a28.up.railway.app/submissions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: submission.profileData?.id || 'temp-user',
            eventId: null,
            evidence: submission.evidenceUrl || `Activity: ${submission.formData.title}`
          })
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

  const activityTypes = [
    { id: 'seminar', name: 'Seminar', points: '2-4' },
    { id: 'course', name: 'Kursus', points: '4-8' },
    { id: 'program', name: 'Program', points: '5-10' },
    { id: 'research', name: 'Riset', points: '8-12' },
    { id: 'achievement', name: 'Prestasi', points: '6-15' }
  ];

  const competencyAreas = [
    { id: 'software-dev', name: 'Software Developer' },
    { id: 'network', name: 'Network' },
    { id: 'ai', name: 'Artificial Intelligence' },
    { id: 'softskills', name: 'Soft Skills' }
  ];

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

  // Convert file to base64 for embedding in submission
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Try multiple upload strategies
  const uploadFile = async (file, token) => {
    const baseUrl = 'https://pweb-tifpoint-backend-production-1a28.up.railway.app';
    
    // Strategy 1: Try original /upload endpoint
    try {
      const fileData = new FormData();
      fileData.append('file', file);
      
      const uploadResponse = await fetch(`${baseUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: fileData
      });
      
      if (uploadResponse.ok) {
        const result = await uploadResponse.json();
        return result.url;
      }
    } catch (error) {
      console.log('Upload endpoint not available, trying alternatives...');
    }

    // Strategy 2: Try /api/upload endpoint
    try {
      const fileData = new FormData();
      fileData.append('file', file);
      
      const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: fileData
      });
      
      if (uploadResponse.ok) {
        const result = await uploadResponse.json();
        return result.url;
      }
    } catch (error) {
      console.log('API upload endpoint not available...');
    }

    // Strategy 3: Try /files/upload endpoint
    try {
      const fileData = new FormData();
      fileData.append('file', file);
      
      const uploadResponse = await fetch(`${baseUrl}/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: fileData
      });
      
      if (uploadResponse.ok) {
        const result = await uploadResponse.json();
        return result.url;
      }
    } catch (error) {
      console.log('Files upload endpoint not available...');
    }

    // Strategy 4: Convert to base64 and include in submission
    try {
      const base64 = await convertFileToBase64(file);
      return base64;
    } catch (error) {
      console.error('Failed to convert file to base64:', error);
      throw new Error('Gagal memproses file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Add debug info and server connectivity check
    console.log('=== SUBMISSION DEBUG START ===');
    console.log('Form data:', formData);
    console.log('Base URL:', 'https://pweb-tifpoint-backend-production-1a28.up.railway.app');

    // Test server connectivity and available endpoints
    try {
      console.log('Testing server connectivity and available endpoints...');
      
      // Test 1: Basic connectivity
      const healthCheck = await fetch('https://pweb-tifpoint-backend-production-1a28.up.railway.app/', {
        method: 'GET',
        mode: 'cors'
      });
      console.log('Basic server response status:', healthCheck.status);
      
      // Test 2: Test known working endpoints from API docs
      const knownEndpoints = [
        { path: '/events', method: 'GET', requiresAuth: false },
        { path: '/recognized-courses', method: 'GET', requiresAuth: false },
        { path: '/profile', method: 'GET', requiresAuth: true },
        { path: '/submissions', method: 'GET', requiresAuth: true }
      ];
      
      console.log('Testing known endpoints from API documentation:');
      for (const endpoint of knownEndpoints) {
        try {
          const headers = {};
          if (endpoint.requiresAuth) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const response = await fetch(`https://pweb-tifpoint-backend-production-1a28.up.railway.app${endpoint.path}`, {
            method: endpoint.method,
            headers: headers
          });
          
          console.log(`${endpoint.method} ${endpoint.path}: ${response.status}`);
          
          if (response.status === 200) {
            const data = await response.text();
            console.log(`${endpoint.path} response length:`, data.length);
          }
        } catch (err) {
          console.log(`${endpoint.method} ${endpoint.path}: ERROR -`, err.message);
        }
      }
      
    } catch (connectError) {
      console.error('Server connectivity issue:', connectError);
      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda atau coba lagi nanti.');
    }

    try {
      // Get authentication token with validation
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Anda belum login. Silakan login terlebih dahulu.');
      }
      
      // Validate token format (basic JWT check)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        localStorage.removeItem('token'); // Remove invalid token
        throw new Error('Token tidak valid. Silakan login ulang.');
      }
      
      // Check if token is expired (basic check)
      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        const currentTime = Date.now() / 1000;
        if (payload.exp && payload.exp < currentTime) {
          localStorage.removeItem('token'); // Remove expired token
          throw new Error('Sesi telah berakhir. Silakan login ulang.');
        }
      } catch (tokenCheckError) {
        console.warn('Could not validate token expiry:', tokenCheckError.message);
        // Continue anyway - let server decide if token is valid
      }

      // Validate required fields
      if (!formData.title || !formData.activityType || !formData.date || 
          !formData.description || !formData.competencyArea || !formData.evidence) {
        throw new Error('Semua field yang wajib harus diisi, termasuk bukti kegiatan.');
      }

      // Get user profile with fallback endpoints
      let profileData = null;
      const profileEndpoints = [
        '/profile',
        '/api/profile', 
        '/api/user/profile',
        '/user/profile',
        '/api/auth/profile',
        '/auth/profile',
        '/me'
      ];
      
      for (const endpoint of profileEndpoints) {
        try {
          console.log(`Trying profile endpoint: ${endpoint}`);
          
          const profileResponse = await fetch(`https://pweb-tifpoint-backend-production-1a28.up.railway.app${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (profileResponse.ok) {
            profileData = await profileResponse.json();
            console.log(`Success with profile endpoint: ${endpoint}`);
            break;
          } else {
            console.log(`Failed with profile endpoint ${endpoint}:`, profileResponse.status);
          }
        } catch (err) {
          console.log(`Error with profile endpoint ${endpoint}:`, err.message);
        }
      }
      
      // If no profile endpoint works, try to extract user info from token
      if (!profileData) {
        try {
          // Try to decode JWT token to get user info
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          profileData = {
            id: tokenPayload.userId || tokenPayload.id || tokenPayload.sub || 'user-' + Date.now(),
            username: tokenPayload.username || tokenPayload.email || 'user',
            email: tokenPayload.email || '',
            name: tokenPayload.name || tokenPayload.username || 'User',
            nim: tokenPayload.nim || tokenPayload.username || '',
            role: tokenPayload.role || 'student'
          };
          console.log('Using token payload as profile data:', profileData);
        } catch (tokenError) {
          console.error('Failed to decode token:', tokenError);
          // Use fallback user data
          profileData = {
            id: 'temp-user-' + Date.now(),
            username: 'user',
            email: '',
            name: 'User',
            nim: '',
            role: 'student'
          };
          console.log('Using fallback profile data');
        }
      }

      // Try to upload file
      let evidenceUrl = '';
      let uploadFailed = false;
      try {
        evidenceUrl = await uploadFile(formData.evidence, token);
        console.log('File processed successfully:', evidenceUrl);
      } catch (uploadError) {
        console.error('Upload failed:', uploadError);
        uploadFailed = true;
        
        // Ask user if they want to proceed without file attachment
        const proceedWithoutFile = window.confirm(
          'Gagal mengunggah file bukti kegiatan. ' + 
          'Apakah Anda ingin tetap mengajukan kegiatan tanpa file? ' +
          '(Anda dapat mengunggah bukti kegiatan nanti)'
        );
        
        if (!proceedWithoutFile) {
          throw new Error('Pengajuan dibatalkan. Silakan coba mengunggah file lagi.');
        }
        
        // Set evidence as text description of the file
        evidenceUrl = `File: ${formData.evidence.name} (${(formData.evidence.size / 1024 / 1024).toFixed(2)}MB) - Upload gagal, akan diupload ulang nanti`;
      }
      
      // Prepare submission data according to API documentation
      // Based on the API docs, /submissions expects: userId, eventId, evidence
      const simpleSubmissionData = {
        userId: profileData?.id || 'temp-user-' + Date.now(),
        eventId: null, // For general activity submission
        evidence: evidenceUrl || `Activity: ${formData.title} - ${formData.description}`
      };

      // Prepare extended submission data as fallback
      const extendedSubmissionData = {
        ...simpleSubmissionData,
        activityDetails: {
          title: formData.title,
          activityType: formData.activityType,
          date: formData.date,
          description: formData.description,
          competencyArea: formData.competencyArea,
          proposedPoints: parseInt(formData.expectedPoints) || 0,
          additionalNotes: formData.additionalNotes
        }
      };

      // Try the documented endpoint first with correct structure
      const submissionAttempts = [
        {
          endpoint: '/submissions',
          data: simpleSubmissionData,
          description: 'API documented endpoint with simple structure'
        },
        {
          endpoint: '/submissions', 
          data: extendedSubmissionData,
          description: 'API documented endpoint with extended structure'
        }
      ];

      let submissionSuccess = false;
      let lastError = null;

      // Try documented endpoints first with more detailed testing
      for (const attempt of submissionAttempts) {
        try {
          console.log(`\n--- Trying ${attempt.description}: ${attempt.endpoint} ---`);
          console.log('Request headers:', {
            'Authorization': `Bearer ${token.substring(0, 20)}...`,
            'Content-Type': 'application/json'
          });
          console.log('Request body:', JSON.stringify(attempt.data, null, 2));
          
          const response = await fetch(`https://pweb-tifpoint-backend-production-1a28.up.railway.app${attempt.endpoint}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(attempt.data)
          });
          
          const responseText = await response.text();
          console.log(`Response status: ${response.status}`);
          console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
          console.log(`Response body (first 500 chars):`, responseText.substring(0, 500));
          
          if (response.ok) {
            console.log(`✅ SUCCESS with ${attempt.description}`);
            submissionSuccess = true;
            break;
          } else {
            lastError = `${response.status}: ${responseText}`;
            console.log(`❌ FAILED with ${attempt.description}:`, lastError);
            
            // If it's a 404, try to check if the server has any endpoints that work
            if (response.status === 404) {
              console.log('Testing if server has any working POST endpoints...');
              
              // Test some alternative endpoints that might exist
              const altEndpoints = [
                '/api/submissions',
                '/api/student/submit', 
                '/api/activities/submit',
                '/student/submit-activity',
                '/submit-activity',
                '/api/submit',
                '/submit'
              ];
              
              for (const altEndpoint of altEndpoints) {
                try {
                  const altResponse = await fetch(`https://pweb-tifpoint-backend-production-1a28.up.railway.app${altEndpoint}`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(attempt.data)
                  });
                  
                  console.log(`Alternative endpoint ${altEndpoint}: ${altResponse.status}`);
                  
                  if (altResponse.ok) {
                    console.log(`✅ Found working endpoint: ${altEndpoint}`);
                    submissionSuccess = true;
                    break;
                  } else if (altResponse.status !== 404) {
                    // Not a 404, so endpoint exists but might have different requirements
                    const altText = await altResponse.text();
                    console.log(`Endpoint ${altEndpoint} exists but returned ${altResponse.status}:`, altText.substring(0, 200));
                  }
                } catch (altError) {
                  // Silently continue to next endpoint
                }
              }
              
              if (submissionSuccess) break;
            }
          }
        } catch (err) {
          console.log(`❌ ERROR with ${attempt.description}:`, err.message);
          lastError = err.message;
        }
      }

      if (!submissionSuccess) {
        // Save submission data locally as fallback
        const fallbackSubmission = {
          id: 'draft-' + Date.now(),
          timestamp: new Date().toISOString(),
          formData: formData,
          profileData: profileData,
          evidenceUrl: evidenceUrl,
          status: 'pending_server_sync',
          retryCount: 0,
          lastError: lastError
        };
        
        // Get existing drafts
        const existingDrafts = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
        existingDrafts.push(fallbackSubmission);
        localStorage.setItem('pendingSubmissions', JSON.stringify(existingDrafts));
        setPendingSubmissions(existingDrafts);
        
        console.log('Submission saved locally as draft:', fallbackSubmission);
        
        // Provide more specific error messages based on the type of failure
        if (lastError && lastError.includes('401')) {
          localStorage.removeItem('token'); // Remove invalid token
          throw new Error('Sesi telah berakhir. Silakan login ulang untuk melanjutkan.');
        } else if (lastError && lastError.includes('403')) {
          throw new Error('Anda tidak memiliki izin untuk mengajukan kegiatan. Hubungi administrator.');
        } else if (lastError && lastError.includes('500')) {
          throw new Error('Terjadi kesalahan server. Data Anda telah disimpan dan akan otomatis dikirim saat server pulih.');
        } else if (lastError && lastError.includes('404')) {
          throw new Error('Layanan pengajuan kegiatan sedang dalam maintenance. Data Anda telah disimpan dan akan otomatis dikirim nanti.');
        } else {
          // More detailed error message
          throw new Error(`API endpoint tidak ditemukan atau tidak sesuai ekspektasi. Data Anda telah disimpan secara lokal.\n\nDetail teknis: ${lastError || 'Semua endpoint submission mengembalikan 404'}\n\nSilakan hubungi administrator dengan informasi ini atau gunakan tombol "Test API" untuk debugging lebih lanjut.`);
        }
      }
      
      // Success! Show success state
      setSuccess(true);
      
      // Show additional message if upload failed
      if (uploadFailed) {
        setTimeout(() => {
          setError('Kegiatan berhasil diajukan, namun file bukti gagal diupload. Silakan hubungi admin untuk melengkapi bukti kegiatan.');
        }, 1000);
      }
      
      // Redirect after showing success message
      setTimeout(() => {
        navigate('/activity-history');
      }, 2000);
      
      console.log('=== SUBMISSION DEBUG END: SUCCESS ===');
      
    } catch (err) {
      console.error('=== SUBMISSION DEBUG END: ERROR ===');
      console.error('Error details:', err);
      setError(err.message || 'Terjadi kesalahan saat mengirim data. Silakan coba lagi.');
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
      {error && error.includes('maintenance') && (
        <div className={`max-w-3xl mx-auto mb-6 transition-all duration-500 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Troubleshooting API Issues
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p className="mb-2">Kemungkinan penyebab masalah:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>API endpoint dalam dokumentasi belum diimplementasi</li>
                    <li>Server sedang maintenance atau down</li>
                    <li>Struktur data request tidak sesuai ekspektasi backend</li>
                    <li>Authentication token bermasalah</li>
                  </ul>
                  <div className="mt-3 space-x-2">
                    <button
                      onClick={testAPIEndpoints}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors duration-200"
                    >
                      🔍 Test API Endpoints
                    </button>
                    <button
                      onClick={() => {
                        console.log('Current token:', localStorage.getItem('token')?.substring(0, 50) + '...');
                        console.log('Pending submissions:', JSON.parse(localStorage.getItem('pendingSubmissions') || '[]'));
                      }}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors duration-200"
                    >
                      📊 Show Debug Info
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        alert('Token dihapus. Silakan login ulang.');
                      }}
                      className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 transition-colors duration-200"
                    >
                      🔄 Reset Token
                    </button>
                  </div>
                </div>
              </div>
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
            >
              <option value="" disabled>Pilih jenis kegiatan</option>
              {activityTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} (Estimasi: {type.points} poin)
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
              >
                <option value="" disabled>Pilih area kompetensi</option>
                {competencyAreas.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
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
          
          {/* Expected Points */}
          <div className={`mb-6 transition-all duration-300 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} 
                         ${activeField === 'expectedPoints' ? 'transform scale-[1.02]' : ''}`}>
            <label htmlFor="expectedPoints" className="block text-sm font-medium text-gray-700 mb-1">
              Usulan Poin
            </label>
            <input
              type="number"
              id="expectedPoints"
              name="expectedPoints"
              min="1"
              max="15"
              value={formData.expectedPoints}
              onChange={handleChange}
              onFocus={() => handleFocus('expectedPoints')}
              onBlur={handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-md 
                        focus:ring-[#201E43] focus:border-[#201E43] 
                        transition-all duration-300 
                        focus:shadow-md"
              placeholder="Berdasarkan panduan poin"
            />
            <p className="mt-1 text-sm text-gray-500">
              Usulan poin akan ditinjau oleh admin berdasarkan pedoman konversi kegiatan
            </p>
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
              disabled={isSubmitting}
              className={`px-6 py-2 bg-[#201E43] text-white rounded-md 
                        hover:bg-[#201E43]/80 transition-all duration-300 
                        transform hover:scale-105 hover:shadow-lg 
                        flex items-center relative overflow-hidden
                        ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
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