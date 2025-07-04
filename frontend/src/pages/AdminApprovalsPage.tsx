import React, { useState } from 'react';
import { usePendingAnimals, useApproveAnimal, useRejectAnimal } from '../hooks/useAnimals';
import Button from '../components/common/Button';
import authService from '../services/authService';

const AdminApprovalsPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = usePendingAnimals();
  const approveAnimal = useApproveAnimal();
  const rejectAnimal = useRejectAnimal();

  // Promotion form state
  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoteUsername, setPromoteUsername] = useState('');
  const [promoteRole, setPromoteRole] = useState('VOLUNTEER');
  const [promoteStatus, setPromoteStatus] = useState<string | null>(null);
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [promoteName, setPromoteName] = useState('');
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [userCheckError, setUserCheckError] = useState<string | null>(null);
  const [userCheckLoading, setUserCheckLoading] = useState(false);
  const [userCheckSuccess, setUserCheckSuccess] = useState(false);

  // Fetch user info when email or username is entered
  const handleUserFieldBlur = async () => {
    setUserCheckError(null);
    setUserCheckSuccess(false);
    setUserCheckLoading(true);
    setPromoteName('');
    setCurrentRole(null);
    
    // Sanitize inputs - trim whitespace and convert email to lowercase
    const sanitizedEmail = promoteEmail?.trim().toLowerCase() || '';
    const sanitizedUsername = promoteUsername?.trim() || '';
    
    if (!sanitizedEmail && !sanitizedUsername) {
      setUserCheckLoading(false);
      return;
    }
    
    try {
      const user: any = await authService.getUserInfo({
        email: sanitizedEmail || undefined,
        username: sanitizedUsername || undefined,
      });
      setPromoteName(user.name || '');
      setCurrentRole(user.role || null);
      setUserCheckError(null);
      setUserCheckSuccess(true);
      // Update the input fields with sanitized values
      if (sanitizedEmail && sanitizedEmail !== promoteEmail) {
        setPromoteEmail(sanitizedEmail);
      }
      if (sanitizedUsername && sanitizedUsername !== promoteUsername) {
        setPromoteUsername(sanitizedUsername);
      }
    } catch (err: any) {
      setUserCheckError('User not found. Please enter a valid email or username.');
      setPromoteName('');
      setCurrentRole(null);
      setUserCheckSuccess(false);
    } finally {
      setUserCheckLoading(false);
    }
  };

  // Determine button text
  const isPromote = currentRole && promoteRole && promoteRole !== currentRole;
  const buttonText = isPromote ? (['ADMIN', 'VOLUNTEER'].indexOf(promoteRole) > ['ADMIN', 'VOLUNTEER'].indexOf(currentRole || '') ? 'Promote' : 'Demote') : 'Promote';

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoteStatus(null);
    setPromoteLoading(true);
    
    // Sanitize inputs for the promotion request
    const sanitizedEmail = promoteEmail?.trim().toLowerCase() || '';
    const sanitizedUsername = promoteUsername?.trim() || '';
    
    try {
      const result: any = await authService.promoteUser({
        email: sanitizedEmail || undefined,
        username: sanitizedUsername || undefined,
        role: promoteRole,
      });
      // If backend returns an object with data/message, show only the relevant part
      if (result && typeof result === 'object') {
        setPromoteStatus(result && (result.data || result.message) || JSON.stringify(result));
      } else if (result) {
        setPromoteStatus(result);
      } else {
        setPromoteStatus('User promoted successfully');
      }
      // Clear form after successful promotion
      setPromoteEmail('');
      setPromoteUsername('');
      setPromoteName('');
      setCurrentRole(null);
      setUserCheckSuccess(false);
    } catch (err: any) {
      let errorMessage = err?.response?.data?.message || err?.response?.data || err?.message || 'Failed to promote user';
      if (typeof errorMessage === 'object') {
        errorMessage = JSON.stringify(errorMessage);
      }
      setPromoteStatus(errorMessage);
    } finally {
      setPromoteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-red-700 dark:text-red-300 mb-6">Pending Animal Reports</h1>

        {/* Promote User Form */}
        <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Promote User</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Enter either email or username to find and promote a user. Email addresses are automatically converted to lowercase.
          </p>
          <form className="flex flex-col md:flex-row md:items-end gap-4" onSubmit={handlePromote}>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={promoteEmail}
                onChange={e => setPromoteEmail(e.target.value)}
                onBlur={handleUserFieldBlur}
                className={`w-full px-3 py-2 border ${userCheckError ? 'border-red-500' : userCheckSuccess ? 'border-green-500' : 'border-gray-300'} dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white text-sm`}
                placeholder="e.g., john.doe@example.com"
                autoComplete="off"
              />
              {userCheckLoading && <span className="absolute right-2 top-8 text-gray-400 animate-spin">⏳</span>}
              {!userCheckLoading && userCheckSuccess && <span className="absolute right-2 top-8 text-green-500">✔️</span>}
              {!userCheckLoading && userCheckError && <span className="absolute right-2 top-8 text-red-500">❌</span>}
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={promoteUsername}
                onChange={e => setPromoteUsername(e.target.value)}
                onBlur={handleUserFieldBlur}
                className={`w-full px-3 py-2 border ${userCheckError ? 'border-red-500' : userCheckSuccess ? 'border-green-500' : 'border-gray-300'} dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white text-sm`}
                placeholder="e.g., johndoe"
                autoComplete="off"
              />
              {userCheckLoading && <span className="absolute right-2 top-8 text-gray-400 animate-spin">⏳</span>}
              {!userCheckLoading && userCheckSuccess && <span className="absolute right-2 top-8 text-green-500">✔️</span>}
              {!userCheckLoading && userCheckError && <span className="absolute right-2 top-8 text-red-500">❌</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={promoteRole}
                onChange={e => setPromoteRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="VOLUNTEER">VOLUNTEER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="PUBLIC_USER">PUBLIC_USER</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={promoteLoading || (!promoteEmail && !promoteUsername) || !!userCheckError || userCheckLoading}
                className="mt-4 md:mt-0"
              >
                {promoteLoading ? 'Processing...' : buttonText}
              </Button>
              {userCheckError && <span className="text-xs text-red-600">{userCheckError}</span>}
              {promoteName && typeof promoteName === 'string' && promoteName.length > 0 && (
                <span className="text-xs text-gray-600">Name: {promoteName} | Current Role: {currentRole}</span>
              )}
            </div>
          </form>
          {promoteStatus && (
            <div className={`mt-2 text-sm ${promoteStatus.includes('promoted') ? 'text-green-600' : 'text-red-600'}`}>{promoteStatus}</div>
          )}
          {/* Helper section for testing */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Test Users:</h4>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>• <strong>Email:</strong> john.doe@example.com | <strong>Username:</strong> johndoe | <strong>Role:</strong> PUBLIC_USER</div>
              <div>• <strong>Email:</strong> jane.smith@example.com | <strong>Username:</strong> janesmith | <strong>Role:</strong> PUBLIC_USER</div>
              <div>• <strong>Email:</strong> volunteer@straylove.com | <strong>Username:</strong> volunteer | <strong>Role:</strong> VOLUNTEER</div>
            </div>
          </div>
        </div>

        {/* Pending Animals Table */}
        {isLoading && <div>Loading...</div>}
        {isError && <div className="text-red-600">Failed to load pending animals.</div>}
        {data && data.content.length === 0 && (
          <div className="text-gray-600 dark:text-gray-300">No pending animal reports.</div>
        )}
        {data && data.content.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
              <thead>
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Species</th>
                  <th className="px-4 py-2">Breed</th>
                  <th className="px-4 py-2">Reported By</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map(animal => (
                  <tr key={animal.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2">{animal.uniqueIdentifier || animal.id}</td>
                    <td className="px-4 py-2">{animal.species}</td>
                    <td className="px-4 py-2">{animal.breed}</td>
                    <td className="px-4 py-2">{
                      typeof animal.reportedBy === 'string'
                        ? animal.reportedBy
                        : ((animal.reportedBy as any) && typeof (animal.reportedBy as any) === 'object' && 'name' in (animal.reportedBy as any) && typeof (animal.reportedBy as any).name === 'string')
                          ? (animal.reportedBy as any).name
                          : 'Unknown'
                    }</td>
                    <td className="px-4 py-2 space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={approveAnimal.isPending}
                        onClick={() => approveAnimal.mutate(animal.id, { onSuccess: () => refetch() })}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={rejectAnimal.isPending}
                        onClick={() => rejectAnimal.mutate(animal.id, { onSuccess: () => refetch() })}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApprovalsPage; 