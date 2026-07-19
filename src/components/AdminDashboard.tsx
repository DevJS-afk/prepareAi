
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/firebaseClient';
import type { Role } from '../types';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInterviews: 0,
    totalCVs: 0,
    totalPortfolios: 0,
  });
  const [users, setUsers] = useState<any[]>([]); // Using any for extended profile with email
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  const fetchUsers = useCallback(async (query: string = '', page: number = 1) => {
    if (!supabase) return;
    
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage - 1;

    let dbQuery = supabase
      .from('profiles')
      .select('id, full_name, email, is_admin, role, updated_at, avatar_url', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(start, end);

    if (query.trim()) {
        dbQuery = dbQuery.or(`email.ilike.%${query}%,full_name.ilike.%${query}%`);
    }
    
    const { data: userData, error, count } = await dbQuery;
    
    if (error) {
        console.error("Error fetching users:", error);
    } else {
        setUsers(userData || []);
        if (count !== null) setTotalUsersCount(count);
    }
  }, [itemsPerPage]);

  // Debounced Search & Pagination Effect
  useEffect(() => {
      const timer = setTimeout(() => {
          fetchUsers(searchQuery, currentPage);
      }, 500);

      return () => clearTimeout(timer);
  }, [searchQuery, currentPage, fetchUsers]);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) return;
      setLoading(true);
      try {
        // Fetch Stats
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: interviewCount } = await supabase.from('interviews').select('*', { count: 'exact', head: true });
        const { count: cvCount } = await supabase.from('cvs').select('*', { count: 'exact', head: true });
        const { count: pfCount } = await supabase.from('portfolios').select('*', { count: 'exact', head: true });

        setStats({
          totalUsers: userCount || 0,
          totalInterviews: interviewCount || 0,
          totalCVs: cvCount || 0,
          totalPortfolios: pfCount || 0,
        });

        // Initial User Fetch handled by the debounce effect on mount since searchQuery is ''

      } catch (error) {
        console.error("Admin fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: Role) => {
      if (!supabase) return;
      // Optimistic update
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole, is_admin: newRole === 'admin' } : u));
      
      try {
          const updates: any = { role: newRole };
          if (newRole === 'admin') updates.is_admin = true;
          else updates.is_admin = false;

          const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
          if (error) throw error;
      } catch (err: any) {
          alert("Failed to update role: " + err.message);
          fetchUsers(searchQuery, currentPage); // Revert on error
      }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setCurrentPage(1); // Reset to first page on search
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600 dark:text-gray-400">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="w-full px-6 space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h2>
          </div>
          <div className="px-3 py-1 bg-brand-red/20 border border-brand-red/50 rounded-full text-brand-red text-xs font-bold uppercase tracking-wider">
              Super Admin
          </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-xl border-l-4 border-l-brand-blue">
              <p className="text-slate-600 dark:text-gray-400 text-sm uppercase font-semibold">Total Users</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalUsers}</h3>
          </div>
          <div className="glass-panel p-6 rounded-xl border-l-4 border-l-brand-green">
              <p className="text-slate-600 dark:text-gray-400 text-sm uppercase font-semibold">Interviews Conducted</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalInterviews}</h3>
          </div>
          <div className="glass-panel p-6 rounded-xl border-l-4 border-l-brand-purple">
              <p className="text-slate-600 dark:text-gray-400 text-sm uppercase font-semibold">CVs Created</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalCVs}</h3>
          </div>
          <div className="glass-panel p-6 rounded-xl border-l-4 border-l-brand-yellow">
              <p className="text-slate-600 dark:text-gray-400 text-sm uppercase font-semibold">Portfolios Built</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalPortfolios}</h3>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* User Management */}
          <div className="glass-panel rounded-xl overflow-hidden col-span-1 lg:col-span-2">
              <div className="p-6 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">User Management</h3>
                      <div className="text-xs text-slate-500 dark:text-gray-500">Managing {users.length} users</div>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative w-full sm:w-64">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-slate-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                      </div>
                      <input
                          type="text"
                          value={searchQuery}
                          onChange={handleSearchChange}
                          className="w-full bg-slate-200/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-brand-blue outline-none placeholder-slate-400 dark:placeholder-gray-500 transition-all"
                          placeholder="Search name or email..."
                      />
                  </div>
              </div>
              
              <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                  <table className="w-full text-sm text-left text-slate-600 dark:text-gray-400">
                      <thead className="text-xs text-slate-500 dark:text-gray-500 uppercase bg-slate-200/30 dark:bg-black/20 sticky top-0 z-10">
                          <tr>
                              <th className="px-6 py-3">User</th>
                              <th className="px-6 py-3">Role</th>
                              <th className="px-6 py-3 text-center">Actions</th>
                              <th className="px-6 py-3 text-right">Last Active</th>
                          </tr>
                      </thead>
                      <tbody>
                          {users.length > 0 ? (
                              users.map((user) => (
                                <tr key={user.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt="User" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-lg font-bold text-slate-500 dark:text-gray-500">{user.email ? user.email.charAt(0).toUpperCase() : '?'}</span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-base font-bold text-slate-900 dark:text-white">{user.email || 'No Email'}</div>
                                            <div className="text-xs text-slate-600 dark:text-gray-400">{user.full_name || 'Anonymous'}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase
                                            ${user.role === 'admin' ? 'bg-brand-red/10 text-brand-red' : 
                                            user.role === 'interviewer' ? 'bg-brand-purple/10 text-brand-purple' :
                                            user.role === 'candidate' ? 'bg-brand-green/10 text-brand-green' :
                                            'bg-gray-700/50 text-gray-300'}
                                        `}>
                                            {user.role || (user.is_admin ? 'admin' : 'user')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <select 
                                            value={user.role || (user.is_admin ? 'admin' : 'user')}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                                            className="bg-slate-200/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-brand-blue outline-none cursor-pointer"
                                        >
                                            <option value="user" className="bg-slate-100 dark:bg-slate-900 text-white">User</option>
                                            <option value="interviewer" className="bg-slate-100 dark:bg-slate-900 text-white">Interviewer</option>
                                            <option value="candidate" className="bg-slate-100 dark:bg-slate-900 text-white">Candidate</option>
                                            <option value="admin" className="bg-slate-100 dark:bg-slate-900 text-white">Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-right">{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                              ))
                          ) : (
                              <tr>
                                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-gray-500">
                                      No users found matching "{searchQuery}"
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
              
              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-200 dark:border-white/5 bg-slate-200/30 dark:bg-black/20 gap-4">
                  <div className="flex items-center gap-4">
                      <div className="text-sm text-slate-600 dark:text-gray-400">
                          Showing <span className="text-slate-900 dark:text-white font-medium">{totalUsersCount > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}</span> to <span className="text-slate-900 dark:text-white font-medium">{Math.min(currentPage * itemsPerPage, totalUsersCount)}</span> of <span className="text-slate-900 dark:text-white font-medium">{totalUsersCount}</span> users
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="bg-slate-200/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-brand-blue outline-none cursor-pointer"
                        >
                            <option value={10} className="bg-slate-100 dark:bg-slate-900 text-white">10 / page</option>
                            <option value={20} className="bg-slate-100 dark:bg-slate-900 text-white">20 / page</option>
                            <option value={50} className="bg-slate-100 dark:bg-slate-900 text-white">50 / page</option>
                            <option value={100} className="bg-slate-100 dark:bg-slate-900 text-white">100 / page</option>
                        </select>
                      </div>
                  </div>

                  <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                           <span className="text-xs text-slate-600 dark:text-gray-400">Page</span>
                           <input
                              type="number"
                              min={1}
                              max={Math.ceil(totalUsersCount / itemsPerPage) || 1}
                              value={currentPage}
                              onChange={(e) => {
                                  const page = Number(e.target.value);
                                  if (page >= 1 && page <= (Math.ceil(totalUsersCount / itemsPerPage) || 1)) {
                                      setCurrentPage(page);
                                  }
                              }}
                              className="w-12 bg-slate-200/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-brand-blue outline-none text-center"
                           />
                           <span className="text-xs text-slate-600 dark:text-gray-400">of {Math.ceil(totalUsersCount / itemsPerPage) || 1}</span>
                      </div>

                      <div className="flex gap-2">
                          <button
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-slate-900 dark:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-slate-200 dark:border-white/5"
                          >
                              Previous
                          </button>
                          <button
                              onClick={() => setCurrentPage(p => p + 1)}
                              disabled={currentPage * itemsPerPage >= totalUsersCount}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-slate-900 dark:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-slate-200 dark:border-white/5"
                          >
                              Next
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
