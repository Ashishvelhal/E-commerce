import React, { useEffect, useState } from 'react';
import { Users, ShieldCheck, Mail, Calendar, Loader2, Search } from 'lucide-react';
import { User } from '../../types';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import api from '../../services/api';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/auth/users');
        setUsers(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <AdminNavbar
        title="Registered Customer Accounts"
        subtitle="Manage registered users and system administrators"
      />

      <div className="p-3 xs:p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-art-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user name or email..."
              className="w-full bg-white border border-art-700 rounded-xl pl-10 pr-4 py-2.5 sm:py-2 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="text-xs text-art-500 font-medium">
            Total Accounts: <span className="font-bold text-art-300">{users.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-brand-700">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-mono uppercase tracking-widest text-art-500">
              Loading Users...
            </span>
          </div>
        ) : (
          <div className="bg-white border border-art-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto touch-pan-x">
              <table className="w-full min-w-[650px] text-left text-xs text-art-400">
                <thead className="bg-art-900 border-b border-art-800 text-art-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5 sm:p-4">User</th>
                    <th className="p-3.5 sm:p-4">Email</th>
                    <th className="p-3.5 sm:p-4">Role</th>
                    <th className="p-3.5 sm:p-4">Phone</th>
                    <th className="p-3.5 sm:p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-art-800/60">
                  {filtered.map((user) => (
                    <tr key={user._id} className="hover:bg-art-900 transition-colors">
                      <td className="p-3.5 sm:p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              user.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                            }
                            alt=""
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/30 shrink-0"
                          />
                          <div className="font-bold text-art-300 truncate max-w-[160px]">{user.name}</div>
                        </div>
                      </td>

                      <td className="p-3.5 sm:p-4 font-mono text-art-500">{user.email}</td>

                      <td className="p-3.5 sm:p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                            user.role === 'admin'
                              ? 'bg-brand-50 text-brand-700 border-brand-500/40'
                              : 'bg-art-900 text-art-400 border-art-700'
                          }`}
                        >
                          {user.role === 'admin' ? 'Super Administrator' : 'Customer'}
                        </span>
                      </td>

                      <td className="p-3.5 sm:p-4 text-art-500">{user.phone || '—'}</td>

                      <td className="p-3.5 sm:p-4">
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Active / Verified</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
