import { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw,
  Trash,
  XCircle
} from 'lucide-react';
import DeleteUser from './DeleteUser';

export default function Users({ showSuccessNotification }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modal states for delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Base API URL for users list
  const API_BASE_URL = 'https://tifpoint-production.up.railway.app/api/users';

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

        // Fetch users (admin only) - endpoint khusus untuk list users
        const usersResponse = await fetch(API_BASE_URL, {
          method: 'GET',
          headers
        });
        
        let usersData = [];
        if (usersResponse.ok) {
          usersData = await usersResponse.json();
        } else if (usersResponse.status === 401) {
          setError('Sesi login telah berakhir. Silakan login kembali.');
          setLoading(false);
          return;
        } else if (usersResponse.status === 403) {
          setError('Anda tidak memiliki izin untuk mengakses data pengguna');
          setLoading(false);
          return;
        } else {
          const errorData = await usersResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Gagal memuat data pengguna');
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
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Open delete modal with validation
  const openDeleteModal = (user) => {
    setError(null);
    
    // Check authentication first
    if (!isAuthenticated()) {
      setError('Sesi login telah berakhir. Silakan login kembali.');
      return;
    }
    
    // Additional validation
    if (user.role === 'ADMIN') {
      setError('Tidak dapat menghapus pengguna dengan role admin.');
      return;
    }
    
    // Validate user ID
    if (!user.id) {
      setError('ID pengguna tidak valid.');
      return;
    }
    
    setItemToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // Handle successful delete - callback from DeleteUser component
  const handleDeleteSuccess = (deletedUserId, message) => {
    // Update local state immediately for better UX
    setUsers(prevUsers => prevUsers.filter(user => user.id !== deletedUserId));
    setFilteredUsers(prevFiltered => prevFiltered.filter(user => user.id !== deletedUserId));
    
    // Close modal
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    
    // Show success message
    if (showSuccessNotification) {
      showSuccessNotification(message);
    }
    
    // Optional: refresh data to ensure consistency
    setTimeout(() => {
      refreshData();
    }, 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow transform transition-all duration-500 hover:shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Manajemen Data Pengguna</h2>
          <button 
            onClick={refreshData}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Cari berdasarkan NIM, nama, email, atau username..."
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
          <p className="ml-3 text-gray-600 animate-pulse">Memuat data pengguna...</p>
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
                      {user.role !== 'ADMIN' ? (
                        <button 
                          onClick={() => openDeleteModal(user)}
                          className="text-red-600 hover:text-red-900 transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Hapus User"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">Protected</span>
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

      {/* Delete User Modal Component */}
      {isDeleteModalOpen && itemToDelete && (
        <DeleteUser
          user={itemToDelete}
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onDeleteSuccess={handleDeleteSuccess}
        />
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