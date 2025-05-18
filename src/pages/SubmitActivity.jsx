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

  // Animation effect when component mounts
  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
      setFormData(prev => ({ ...prev, evidence: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Get authentication token
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Anda belum login. Silakan login terlebih dahulu.');
      }

      // Create FormData object to handle file upload
      const submissionData = new FormData();
      submissionData.append('activityName', formData.title);
      submissionData.append('activityType', formData.activityType);
      submissionData.append('activityDate', formData.date);
      submissionData.append('description', formData.description);
      submissionData.append('competencyArea', formData.competencyArea);
      submissionData.append('proposedPoints', formData.expectedPoints);
      
      // Append file if it exists
      if (formData.evidence) {
        submissionData.append('evidence', formData.evidence);
      }
      
      // Add additional notes if provided
      if (formData.additionalNotes) {
        submissionData.append('notes', formData.additionalNotes);
      }
      
      // Send the data to the API
      const response = await fetch('https://pweb-tifpoint-backend-production-1a28.up.railway.app/api/student/activities', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submissionData
      });
      
      // Check if the request was successful
      if (!response.ok) {
        // Try to parse error as JSON, but handle non-JSON responses too
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Terjadi kesalahan saat mengirim data.');
        } else {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
      }
      
      // Parse response if needed
      const data = await response.json();
      console.log('Submission successful:', data);
      
      // Success! Handle successful submission
      setSuccess(true);
      setTimeout(() => {
        navigate('/activity-history');
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting activity:', err);
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
            <p className="mt-2 text-gray-600 animate-fadeIn transition-opacity delay-100">Kegiatan Anda telah berhasil diajukan dan sedang menunggu persetujuan.</p>
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