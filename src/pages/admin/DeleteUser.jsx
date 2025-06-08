import { useState } from 'react';
import { 
  Trash,
  AlertCircle,
  XCircle,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function DeleteUser({ user, isOpen, onClose, onDeleteSuccess }) {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [userActivities, setUserActivities] = useState([]);
  const [deleteActivitiesFirst, setDeleteActivitiesFirst] = useState(false);
  const [deletingActivities, setDeletingActivities] = useState(false);
  const [activitiesDeleted, setActivitiesDeleted] = useState(false);
  const [deletionProgress, setDeletionProgress] = useState({ current: 0, total: 0 });

  // Base API URL
  const API_BASE_URL = 'https://tifpoint-production.up.railway.app/api';

  // Get headers with token
  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token?.trim()}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  };

  // Check if user has activities - FIXED: Better filtering and validation
  const checkUserActivities = async () => {
    try {
      const headers = getHeaders();
      
      // Try multiple approaches to get user activities
      let userSpecificActivities = [];
      
      console.log(`🔍 Checking activities for user ID: ${user.id}`);
      
      // Approach 1: Try with userId parameter (if API supports it)
      try {
        const response1 = await fetch(`${API_BASE_URL}/activities/filter?userId=${user.id}`, {
          method: 'GET',
          headers: headers
        });

        if (response1.ok) {
          const data1 = await response1.json();
          const activities1 = data1.activities || data1 || [];
          console.log(`✅ Method 1 - Found ${activities1.length} activities via userId filter`);
          userSpecificActivities = activities1;
        } else {
          console.log(`⚠️ Method 1 failed (${response1.status}) - API might not support userId filter`);
        }
      } catch (error) {
        console.log('⚠️ Method 1 failed:', error.message);
      }

      // Approach 2: If method 1 fails, get all activities and filter manually
      if (userSpecificActivities.length === 0) {
        console.log('🔄 Trying Method 2 - Get all activities and filter manually...');
        
        const response2 = await fetch(`${API_BASE_URL}/activities`, {
          method: 'GET',
          headers: headers
        });

        if (response2.ok) {
          const data2 = await response2.json();
          const allActivities = data2.activities || data2 || [];
          
          // CRITICAL: Filter only activities that belong to this specific user
          userSpecificActivities = allActivities.filter(activity => {
            // Multiple ways to identify user ownership
            const isOwner = activity.userId === user.id || 
                           activity.user?.id === user.id ||
                           (activity.user && activity.user.id === user.id);
            
            if (isOwner) {
              console.log(`✅ Found user activity: "${activity.title}" (ID: ${activity.id})`);
            }
            
            return isOwner;
          });
          
          console.log(`✅ Method 2 - Filtered ${userSpecificActivities.length} activities from ${allActivities.length} total activities`);
        } else {
          throw new Error(`Failed to fetch activities (${response2.status})`);
        }
      }

      // Additional validation: Double-check each activity belongs to user
      const validatedActivities = userSpecificActivities.filter(activity => {
        const belongsToUser = activity.userId === user.id || 
                             activity.user?.id === user.id ||
                             (activity.user && activity.user.id === user.id);
        
        if (!belongsToUser) {
          console.error(`❌ SECURITY WARNING: Activity "${activity.title}" (ID: ${activity.id}) does not belong to user ${user.id}`);
          return false;
        }
        
        return true;
      });

      console.log(`🔐 Security validation passed: ${validatedActivities.length} activities confirmed to belong to user`);
      
      // Final validation: Log each activity for transparency
      if (validatedActivities.length > 0) {
        console.log('📋 Activities to be deleted:');
        validatedActivities.forEach((activity, index) => {
          console.log(`  ${index + 1}. "${activity.title}" (ID: ${activity.id}) - Status: ${activity.status}`);
        });
      }

      setUserActivities(validatedActivities);
      return validatedActivities;

    } catch (error) {
      console.error('❌ Error checking user activities:', error);
      throw new Error(`Gagal memeriksa aktivitas user: ${error.message}`);
    }
  };

  // Delete all user activities - ENHANCED: Additional safety checks
  const deleteAllUserActivities = async (activities) => {
    if (!activities || activities.length === 0) {
      console.log('ℹ️ No activities to delete');
      return true;
    }

    setDeletingActivities(true);
    setDeletionProgress({ current: 0, total: activities.length });
    
    const headers = getHeaders();
    let successCount = 0;
    let failedActivities = [];

    console.log(`🗑️ Starting deletion of ${activities.length} activities for user ${user.id}`);

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      
      // SECURITY CHECK: Verify activity belongs to user before deletion
      const belongsToUser = activity.userId === user.id || 
                           activity.user?.id === user.id ||
                           (activity.user && activity.user.id === user.id);

      if (!belongsToUser) {
        console.error(`🚨 SECURITY BREACH PREVENTED: Attempted to delete activity "${activity.title}" (ID: ${activity.id}) that does not belong to user ${user.id}`);
        failedActivities.push({
          ...activity,
          error: 'Security validation failed - activity does not belong to user'
        });
        continue;
      }

      try {
        console.log(`🗑️ Deleting activity ${i + 1}/${activities.length}: "${activity.title}" (ID: ${activity.id})`);
        
        const response = await fetch(`${API_BASE_URL}/activities/${activity.id}`, {
          method: 'DELETE',
          headers: headers
        });

        if (response.ok) {
          successCount++;
          console.log(`✅ Successfully deleted: "${activity.title}"`);
        } else {
          const errorText = await response.text();
          console.error(`❌ Failed to delete "${activity.title}": ${response.status} - ${errorText}`);
          failedActivities.push({
            ...activity,
            error: `HTTP ${response.status}: ${errorText}`
          });
        }
      } catch (error) {
        console.error(`❌ Error deleting "${activity.title}":`, error);
        failedActivities.push({
          ...activity,
          error: error.message
        });
      }
      
      setDeletionProgress({ current: i + 1, total: activities.length });
      
      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setDeletingActivities(false);
    
    if (failedActivities.length > 0) {
      const errorMessage = `Berhasil menghapus ${successCount} dari ${activities.length} aktivitas.\n\n` +
        `❌ ${failedActivities.length} aktivitas gagal dihapus:\n` +
        failedActivities.map(act => `- "${act.title}" (${act.error})`).join('\n');
      
      throw new Error(errorMessage);
    }
    
    console.log(`✅ All ${successCount} activities deleted successfully for user ${user.id}`);
    setActivitiesDeleted(true);
    return true;
  };

  // Main delete function - Enhanced with better error handling
  const handleDeleteConfirm = async () => {
    if (!user || !user.id) {
      setDeleteError('Data user tidak valid');
      return;
    }

    try {
      setDeleteLoading(true);
      setDeleteError(null);
      
      // Validate token
      const token = localStorage.getItem('token');
      if (!token || token.trim() === '') {
        throw new Error('Token tidak ditemukan. Silakan login kembali.');
      }

      console.log('=== DELETE USER PROCESS STARTED ===');
      console.log('User to delete:', {
        id: user.id,
        name: user.name,
        email: user.email,
        nim: user.nim
      });

      // Step 1: Check user activities
      console.log('Step 1: Checking user activities...');
      const activities = await checkUserActivities();
      
      if (activities.length > 0 && !activitiesDeleted) {
        // User has activities, show option to delete them first
        setDeleteLoading(false);
        throw new Error(
          `⚠️ User ini memiliki ${activities.length} aktivitas yang terkait.\n\n` +
          `Untuk menghapus user, Anda perlu menghapus semua aktivitas user tersebut terlebih dahulu.\n\n` +
          `📋 Aktivitas yang ditemukan:\n` +
          activities.slice(0, 5).map((act, idx) => 
            `${idx + 1}. "${act.title}" (${act.status}) - ${act.point || 0} poin`
          ).join('\n') +
          (activities.length > 5 ? `\n... dan ${activities.length - 5} aktivitas lainnya` : '') +
          `\n\n🔒 Semua aktivitas ini HANYA milik user "${user.name}" dan tidak akan mempengaruhi user lain.`
        );
      }

      // Step 2: Delete user (only if no activities or activities already deleted)
      console.log('Step 2: Deleting user...');
      
      const headers = getHeaders();
      const deleteUrl = `${API_BASE_URL}/users/${encodeURIComponent(user.id)}`;
      
      console.log(`🗑️ Sending DELETE request to: ${deleteUrl}`);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: headers
      });
      
      console.log('Delete user response status:', response.status);
      
      const responseText = await response.text();
      console.log('Delete user response:', responseText);
      
      if (!response.ok) {
        let errorMessage = 'Gagal menghapus pengguna';
        let errorData = null;
        
        try {
          if (responseText) {
            errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          }
        } catch (parseError) {
          errorMessage = responseText || errorMessage;
        }

        // Handle specific error cases
        switch (response.status) {
          case 401:
            errorMessage = 'Token tidak valid atau telah kadaluarsa. Silakan login kembali.';
            localStorage.removeItem('token');
            break;
          case 403:
            errorMessage = 'Anda tidak memiliki izin untuk menghapus pengguna ini.';
            break;
          case 404:
            errorMessage = 'Pengguna tidak ditemukan atau sudah terhapus sebelumnya.';
            break;
          case 409:
          case 500:
            errorMessage = `Database Error: User masih memiliki data terkait di sistem.\n\n` +
                          `Hal ini mungkin terjadi karena:\n` +
                          `• Masih ada aktivitas yang belum terhapus\n` +
                          `• Ada referensi data lain di sistem\n` +
                          `• Constraint database yang mencegah penghapusan\n\n` +
                          `Silakan coba lagi atau hubungi administrator sistem.`;
            break;
          default:
            errorMessage = `Error ${response.status}: ${errorMessage}`;
        }

        throw new Error(errorMessage);
      }

      // Success
      const deletedUserName = user.name || user.username || `User ${user.id}`;
      const successMessage = userActivities.length > 0 
        ? ` Pengguna "${deletedUserName}" beserta ${userActivities.length} aktivitas berhasil dihapus!`
        : ` Pengguna "${deletedUserName}" berhasil dihapus!`;
      
      console.log('✅ User deletion successful');
      setDeleteLoading(false);
      
      if (onDeleteSuccess) {
        onDeleteSuccess(user.id, successMessage);
      }
      
      onClose();
      
    } catch (error) {
      console.error('❌ Error in delete process:', error);
      setDeleteError(error.message || 'Terjadi kesalahan saat menghapus pengguna');
      setDeleteLoading(false);
    }
  };

  // Delete activities first, then user - Enhanced with safety checks
  const handleDeleteWithActivities = async () => {
    try {
      setDeleteError(null);
      
      if (userActivities.length === 0) {
        setDeleteError('Tidak ada aktivitas yang perlu dihapus');
        return;
      }

      // Final confirmation for activity deletion
      console.log('=== DELETING USER ACTIVITIES FIRST ===');
      console.log(`User: ${user.name} (${user.id})`);
      console.log(`Activities to delete: ${userActivities.length}`);
      
      // Step 1: Delete all user activities with enhanced safety
      await deleteAllUserActivities(userActivities);
      
      // Step 2: Delete user
      console.log('=== NOW DELETING USER ===');
      await handleDeleteConfirm();
      
    } catch (error) {
      console.error('❌ Error deleting activities:', error);
      setDeleteError(error.message);
      setDeletingActivities(false);
      setDeleteLoading(false);
    }
  };

  // Handle close modal
  const handleClose = () => {
    if (!deleteLoading && !deletingActivities) {
      setDeleteError(null);
      setShowDetails(false);
      setUserActivities([]);
      setDeleteActivitiesFirst(false);
      setActivitiesDeleted(false);
      setDeletionProgress({ current: 0, total: 0 });
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  // Validate user object
  if (!user.id) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <div className="flex items-center text-red-600 mb-4">
            <XCircle className="h-5 w-5 mr-2" />
            <span>Error: Data user tidak valid (ID tidak ditemukan)</span>
          </div>
          <button 
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const hasActivitiesError = deleteError && deleteError.includes('aktivitas yang terkait');

  return (
    <>
      {/* CSS Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
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
          
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          
          .animate-slideInUp {
            animation: slideInUp 0.3s ease-out;
          }
          
          .progress-bar {
            width: 100%;
            height: 8px;
            background-color: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
          }
          
          .progress-fill {
            height: 100%;
            background-color: #3b82f6;
            transition: width 0.3s ease;
          }
        `
      }} />

      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slideInUp">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Konfirmasi Hapus Pengguna
            </h3>
          </div>
          
          <div className="px-6 py-4">
            {/* Activities Deletion Progress */}
            {deletingActivities && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <Info className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-blue-800">
                    Menghapus Aktivitas User ({deletionProgress.current}/{deletionProgress.total})
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ 
                      width: `${deletionProgress.total > 0 ? (deletionProgress.current / deletionProgress.total) * 100 : 0}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  🔒 Hanya aktivitas milik "{user.name}" yang sedang dihapus...
                </p>
              </div>
            )}

            {/* Activities Deleted Success */}
            {activitiesDeleted && !deletingActivities && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-green-800">
                    ✅ Semua aktivitas user berhasil dihapus! Sekarang user dapat dihapus.
                  </span>
                </div>
              </div>
            )}

            {/* Error Display */}
            {deleteError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="ml-3 flex-1">
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                      {hasActivitiesError ? 'User Memiliki Aktivitas Terkait' : 'Gagal Menghapus User'}
                    </h4>
                    <div className="text-sm text-red-700">
                      <pre className="whitespace-pre-wrap font-sans text-sm">{deleteError}</pre>
                    </div>
                    
                    {/* Show option to delete activities first */}
                    {hasActivitiesError && userActivities.length > 0 && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                          <span className="text-sm font-medium text-yellow-800">
                            🔒 Solusi Aman: Hapus Aktivitas User Ini Saja
                          </span>
                        </div>
                        <p className="text-xs text-yellow-700 mb-3">
                          Sistem akan menghapus HANYA {userActivities.length} aktivitas milik "{user.name}", 
                          kemudian menghapus user. Aktivitas user lain TIDAK akan terpengaruh.
                        </p>
                        <div className="mb-3 p-2 bg-white rounded border text-xs">
                          <strong>🛡️ Jaminan Keamanan:</strong>
                          <ul className="list-disc list-inside mt-1 text-yellow-800">
                            <li>Hanya aktivitas dengan userId = {user.id}</li>
                            <li>Validasi ganda sebelum penghapusan</li>
                            <li>Aktivitas user lain tetap aman</li>
                          </ul>
                        </div>
                        <button
                          onClick={handleDeleteWithActivities}
                          disabled={deletingActivities || deleteLoading}
                          className="w-full px-3 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center"
                        >
                          {deletingActivities ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                              Menghapus Aktivitas User...
                            </>
                          ) : (
                            <>
                              <Trash className="h-4 w-4 mr-2" />
                              🔒 Hapus {userActivities.length} Aktivitas + User
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Technical Details */}
                    {deleteError.includes('Server Error') && (
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <button
                          onClick={() => setShowDetails(!showDetails)}
                          className="flex items-center text-sm text-red-600 hover:text-red-800"
                        >
                          <Info className="h-4 w-4 mr-1" />
                          {showDetails ? 'Sembunyikan' : 'Tampilkan'} Detail Teknis
                        </button>
                        
                        {showDetails && (
                          <div className="mt-2 p-3 bg-red-100 rounded text-xs">
                            <p><strong>User ID:</strong> {user.id}</p>
                            <p><strong>API Endpoint:</strong> DELETE {API_BASE_URL}/users/{user.id}</p>
                            <p><strong>User Activities Found:</strong> {userActivities.length}</p>
                            <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-600 mb-4">
              Apakah Anda yakin ingin menghapus pengguna berikut?
            </p>
            
            {/* User Info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">ID:</span>
                  <span className="ml-2 font-mono text-xs bg-gray-200 px-2 py-1 rounded">{user.id}</span>
                </div>
                {user.name && (
                  <div>
                    <span className="font-medium text-gray-700">Nama:</span>
                    <span className="ml-2">{user.name}</span>
                  </div>
                )}
                {user.username && (
                  <div>
                    <span className="font-medium text-gray-700">Username:</span>
                    <span className="ml-2">{user.username}</span>
                  </div>
                )}
                {user.email && (
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2">{user.email}</span>
                  </div>
                )}
                {user.nim && (
                  <div>
                    <span className="font-medium text-gray-700">NIM:</span>
                    <span className="ml-2">{user.nim}</span>
                  </div>
                )}
                {user.role && (
                  <div>
                    <span className="font-medium text-gray-700">Role:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                )}
                {userActivities.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Aktivitas:</span>
                    <span className="ml-2 px-2 py-1 rounded text-xs bg-orange-100 text-orange-800">
                      {userActivities.length} aktivitas terkait
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Enhanced Warning */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">
                    ⚠️ Peringatan Penting
                  </h4>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Tindakan ini <strong>tidak dapat dibatalkan</strong></li>
                      <li>Semua data user akan dihapus permanen</li>
                      {userActivities.length > 0 && (
                        <li><strong>{userActivities.length} aktivitas</strong> milik user ini juga akan ikut terhapus</li>
                      )}
                      <li>🔒 <strong>Aktivitas user lain TIDAK akan terpengaruh</strong></li>
                      <li>Data terkait di sistem lain mungkin akan terpengaruh</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Notice */}
            {userActivities.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                <div className="flex items-center">
                  <Info className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-blue-800">
                    🛡️ Keamanan Sistem Terjamin
                  </span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  Sistem telah memvalidasi bahwa semua {userActivities.length} aktivitas 
                  yang akan dihapus HANYA milik user "{user.name}". Tidak ada risk penghapusan 
                  data user lain.
                </p>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              disabled={deleteLoading || deletingActivities}
            >
              Batal
            </button>
            
            {/* Only show delete user button if no activities or activities already deleted */}
            {(!hasActivitiesError || activitiesDeleted) && (
              <button
                onClick={handleDeleteConfirm}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
                disabled={deleteLoading || deletingActivities}
              >
                {deleteLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Menghapus User...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Trash className="h-4 w-4 mr-2" />
                    Hapus Pengguna
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}