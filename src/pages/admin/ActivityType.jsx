import { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw,
  Trash,
  XCircle,
  Plus,
  Edit,
  AlertCircle,
  Check,
  X
} from 'lucide-react';

export default function ActivityType({ showSuccessNotification }) {
  const [activityTypes, setActivityTypes] = useState([]);
  const [filteredActivityTypes, setFilteredActivityTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Base API URL for activity types
  const API_BASE_URL = 'https://tifpoint-production.up.railway.app/api/activity-types';

  // Function to manually refresh data
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Get auth headers with enhanced validation
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    
    if (!token || token.trim() === '') {
      throw new Error('Token tidak ditemukan. Silakan login kembali.');
    }

    return {
      'Authorization': `Bearer ${token.trim()}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return token && token.trim() !== '';
  };

  // Fetch activity types from API
  useEffect(() => {
    const fetchActivityTypes = async () => {
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

        const response = await fetch(API_BASE_URL, {
          method: 'GET',
          headers
        });
        
        if (response.ok) {
          const data = await response.json();
          const activityTypesArray = Array.isArray(data) ? data : data.activityTypes || [];
          setActivityTypes(activityTypesArray);
          setFilteredActivityTypes(activityTypesArray);
        } else if (response.status === 401) {
          setError('Sesi login telah berakhir. Silakan login kembali.');
        } else if (response.status === 403) {
          setError('Anda tidak memiliki izin untuk mengakses data jenis aktivitas');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Gagal memuat data jenis aktivitas');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching activity types:', err);
        setError(err.message || 'Terjadi kesalahan saat memuat data jenis aktivitas');
        setLoading(false);
      }
    };

    fetchActivityTypes();
  }, [refreshTrigger]);

  // Filter activity types by search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredActivityTypes(activityTypes);
    } else {
      const filtered = activityTypes.filter(activityType => 
        activityType.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activityType.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredActivityTypes(filtered);
    }
  }, [searchQuery, activityTypes]);

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Nama jenis aktivitas wajib diisi';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Nama jenis aktivitas minimal 3 karakter';
    }

    if (!formData.description.trim()) {
      errors.description = 'Deskripsi jenis aktivitas wajib diisi';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Deskripsi jenis aktivitas minimal 10 karakter';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
    setFormErrors({});
  };

  // Open create modal
  const openCreateModal = () => {
    setError(null);
    
    if (!isAuthenticated()) {
      setError('Sesi login telah berakhir. Silakan login kembali.');
      return;
    }
    
    resetForm();
    setIsCreateModalOpen(true);
  };

  // Close create modal
  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    resetForm();
  };

  // Open edit modal
  const openEditModal = (activityType) => {
    setError(null);
    
    if (!isAuthenticated()) {
      setError('Sesi login telah berakhir. Silakan login kembali.');
      return;
    }
    
    if (!activityType.id) {
      setError('ID jenis aktivitas tidak valid.');
      return;
    }
    
    setItemToEdit(activityType);
    setFormData({
      name: activityType.name,
      description: activityType.description
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setItemToEdit(null);
    resetForm();
  };

  // Open delete modal
  const openDeleteModal = (activityType) => {
    setError(null);
    
    if (!isAuthenticated()) {
      setError('Sesi login telah berakhir. Silakan login kembali.');
      return;
    }
    
    if (!activityType.id) {
      setError('ID jenis aktivitas tidak valid.');
      return;
    }
    
    setItemToDelete(activityType);
    setIsDeleteModalOpen(true);
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // Handle create activity type
  const handleCreateActivityType = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const headers = getAuthHeaders();
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim()
        })
      });

      if (response.ok) {
        const newActivityType = await response.json();
        setActivityTypes(prev => [...prev, newActivityType]);
        setFilteredActivityTypes(prev => [...prev, newActivityType]);
        closeCreateModal();
        
        if (showSuccessNotification) {
          showSuccessNotification('Jenis aktivitas berhasil ditambahkan!');
        }
        
        // Refresh data to ensure consistency
        setTimeout(() => {
          refreshData();
        }, 1000);
      } else if (response.status === 401) {
        setError('Sesi login telah berakhir. Silakan login kembali.');
      } else if (response.status === 403) {
        setError('Anda tidak memiliki izin untuk menambah jenis aktivitas.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Gagal menambah jenis aktivitas');
      }
    } catch (err) {
      console.error('Error creating activity type:', err);
      setError(err.message || 'Terjadi kesalahan saat menambah jenis aktivitas');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update activity type
  const handleUpdateActivityType = async () => {
    if (!validateForm() || !itemToEdit) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/${itemToEdit.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim()
        })
      });

      if (response.ok) {
        const updatedActivityType = await response.json();
        
        // Update local state
        setActivityTypes(prev => prev.map(actType => 
          actType.id === itemToEdit.id ? updatedActivityType : actType
        ));
        setFilteredActivityTypes(prev => prev.map(actType => 
          actType.id === itemToEdit.id ? updatedActivityType : actType
        ));
        
        closeEditModal();
        
        if (showSuccessNotification) {
          showSuccessNotification('Jenis aktivitas berhasil diperbarui!');
        }
        
        // Refresh data to ensure consistency
        setTimeout(() => {
          refreshData();
        }, 1000);
      } else if (response.status === 401) {
        setError('Sesi login telah berakhir. Silakan login kembali.');
      } else if (response.status === 403) {
        setError('Anda tidak memiliki izin untuk mengubah jenis aktivitas.');
      } else if (response.status === 404) {
        setError('Jenis aktivitas tidak ditemukan.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Gagal mengubah jenis aktivitas');
      }
    } catch (err) {
      console.error('Error updating activity type:', err);
      setError(err.message || 'Terjadi kesalahan saat mengubah jenis aktivitas');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete activity type
  const handleDeleteActivityType = async () => {
    if (!itemToDelete) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/${itemToDelete.id}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        // Update local state immediately for better UX
        setActivityTypes(prev => prev.filter(actType => actType.id !== itemToDelete.id));
        setFilteredActivityTypes(prev => prev.filter(actType => actType.id !== itemToDelete.id));
        
        closeDeleteModal();
        
        if (showSuccessNotification) {
          showSuccessNotification('Jenis aktivitas berhasil dihapus!');
        }
        
        // Refresh data to ensure consistency
        setTimeout(() => {
          refreshData();
        }, 1000);
      } else if (response.status === 401) {
        setError('Sesi login telah berakhir. Silakan login kembali.');
      } else if (response.status === 403) {
        setError('Anda tidak memiliki izin untuk menghapus jenis aktivitas.');
      } else if (response.status === 404) {
        setError('Jenis aktivitas tidak ditemukan.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Gagal menghapus jenis aktivitas');
      }
    } catch (err) {
      console.error('Error deleting activity type:', err);
      setError(err.message || 'Terjadi kesalahan saat menghapus jenis aktivitas');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow transform transition-all duration-500 hover:shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Manajemen Jenis Aktivitas</h2>
          <div className="flex items-center space-x-3">
            <button 
              onClick={openCreateModal}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Jenis Aktivitas
            </button>
            <button 
              onClick={refreshData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau deskripsi jenis aktivitas..."
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
          <p className="ml-3 text-gray-600 animate-pulse">Memuat data jenis aktivitas...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Jenis Aktivitas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredActivityTypes.length > 0 ? (
                filteredActivityTypes.map((activityType, index) => (
                  <tr key={activityType.id} className="hover:bg-gray-50 transition-colors duration-200 animate-slideInUp" style={{animationDelay: `${index * 100}ms`}}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activityType.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs">
                        <p className="truncate" title={activityType.description}>
                          {activityType.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => openEditModal(activityType)}
                          className="text-blue-600 hover:text-blue-900 transition-all duration-200 transform hover:scale-110"
                          title="Edit Jenis Aktivitas"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(activityType)}
                          className="text-red-600 hover:text-red-900 transition-all duration-200 transform hover:scale-110"
                          title="Hapus Jenis Aktivitas"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchQuery ? 'Tidak ada jenis aktivitas yang sesuai dengan pencarian' : 'Tidak ada data jenis aktivitas'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 animate-slideInUp">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Tambah Jenis Aktivitas Baru</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Jenis Aktivitas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan nama jenis aktivitas"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan deskripsi jenis aktivitas"
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeCreateModal}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                onClick={handleCreateActivityType}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
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
      )}

      {/* Edit Modal */}
      {isEditModalOpen && itemToEdit && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 animate-slideInUp">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Jenis Aktivitas</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Jenis Aktivitas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan nama jenis aktivitas"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan deskripsi jenis aktivitas"
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeEditModal}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                onClick={handleUpdateActivityType}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Menyimpan...
                  </div>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
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
              <p className="text-sm text-gray-600">
                Apakah Anda yakin ingin menghapus jenis aktivitas <strong>"{itemToDelete.name}"</strong>?
              </p>
              <p className="text-xs text-red-600 mt-2">
                ⚠️ Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                onClick={handleDeleteActivityType}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-all duration-200 transform hover:scale-105"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Menghapus...
                  </div>
                ) : (
                  'Ya, Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.3s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}