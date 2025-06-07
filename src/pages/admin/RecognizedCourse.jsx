import { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw,
  PlusCircle,
  Edit,
  Trash,
  AlertCircle,
  XCircle
} from 'lucide-react';

export default function RecognizedCourse({ showSuccessNotification }) {
  const [recognizedCourses, setRecognizedCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modal states for courses
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form states
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

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
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

        // Fetch recognized courses
        const coursesResponse = await fetch(`${API_BASE_URL}/recognized-courses`, {
          method: 'GET',
          headers
        });
        
        if (!coursesResponse.ok) {
          throw new Error('Failed to fetch recognized courses');
        }
        const coursesData = await coursesResponse.json();

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

        setRecognizedCourses(transformedCourses);
        setFilteredCourses(transformedCourses);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err.message || 'Terjadi kesalahan saat memuat data kursus');
        setLoading(false);
      }
    };

    fetchCourses();
  }, [refreshTrigger]);

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

  // Handle course form
  const handleCourseFormChange = (e) => {
    const { name, value } = e.target;
    setCourseFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  // Delete course
  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/recognized-courses/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gagal menghapus kursus: ${errorText}`);
      }
      
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setLoading(false);
      showSuccessNotification('Kursus berhasil dihapus!');
      refreshData();
      
    } catch (error) {
      console.error('Error deleting course:', error);
      setError(error.message || 'Gagal menghapus kursus');
      setLoading(false);
    }
  };

  // Open modals
  const openCourseModal = (course = null) => {
    setError(null);
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

  const openDeleteModal = (item) => {
    setError(null);
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

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
                            onClick={() => openDeleteModal(course)}
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
                Apakah Anda yakin ingin menghapus kursus ini?
                <br />
                <span className="font-semibold">
                  {itemToDelete.name || 'Unknown'}
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