import { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw,
  Trash,
  AlertCircle,
  XCircle
} from 'lucide-react';

export default function Users({ showSuccessNotification }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modal states for users
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

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

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
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

        // Fetch users (admin only)
        const usersResponse = await fetch(`${API_BASE_URL}/users`, {
          method: 'GET',
          headers
        });
        
        let usersData = [];
        if (usersResponse.ok) {
          usersData = await usersResponse.json();
        } else {
          console.warn('Failed to fetch users - might not have admin permissions');
          throw new Error('Anda tidak memiliki izin untuk mengakses data pengguna');
        }

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

        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Terjadi kesalahan saat memuat data pengguna');
        setLoading(false);
      }
    };

    fetchUsers();
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

  // Delete user
  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/users/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gagal menghapus pengguna: ${errorText}`);
      }
      
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setLoading(false);
      showSuccessNotification('Pengguna berhasil dihapus!');
      refreshData();
      
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.message || 'Gagal menghapus pengguna');
      setLoading(false);
    }
  };

  // Open delete modal
  const openDeleteModal = (item) => {
    setError(null);
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

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
                          onClick={() => openDeleteModal(user)}
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
                Apakah Anda yakin ingin menghapus pengguna ini?
                <br />
                <span className="font-semibold">
                  {itemToDelete.username || 'Unknown'}
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
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}