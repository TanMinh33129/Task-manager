import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { isBefore, format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [tab, setTab]             = useState('users');
  const [search, setSearch]       = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const qc = useQueryClient();

  const { data: stats = {} } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/admin/users')).data,
  });

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['admin-tasks'],
    queryFn: async () => (await api.get('/admin/tasks')).data,
  });

  const setRole = useMutation({
    mutationFn: ({ id, role }) => api.put(`/admin/users/${id}/role`, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Đã cập nhật vai trò!');
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users', 'admin-stats'] });
      toast.success('Đã xóa người dùng!');
      setSelectedUser(null);
    },
  });

  const now = new Date();

  const getTasksOfUser = (userId) => tasks.filter(t => t.user?._id === userId);
  const getDone    = (userId) => getTasksOfUser(userId).filter(t => t.status === 'done').length;
  const getOverdue = (userId) => getTasksOfUser(userId).filter(t =>
    t.deadline && isBefore(new Date(t.deadline), now) && t.status !== 'done'
  ).length;

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const selectedUserTasks = selectedUser ? getTasksOfUser(selectedUser._id) : [];

  return (
    <div>
    
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trang quản trị</h1>
          <p className="text-gray-500 text-sm">Quản lý người dùng và nhiệm vụ</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Người dùng',    value: stats.totalUsers, color: 'text-indigo-600' },
          { label: 'Tổng nhiệm vụ', value: stats.totalTasks, color: 'text-gray-700'   },
          { label: 'Hoàn thành',    value: stats.done,       color: 'text-green-600'  },
          { label: 'Quá hạn',      value: stats.overdue,    color: 'text-red-600'    },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-5">
            <p className="text-sm text-gray-500 mb-2">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value ?? '—'}</p>
          </div>
        ))}
      </div>

     
      <div className="card p-6">
        
        <div className="flex gap-6 mb-5 border-b border-gray-100">
          {[
            { key: 'users', label: 'Người dùng' },
            { key: 'tasks', label: 'Tất cả nhiệm vụ' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => { setTab(key); setSearch(''); setSelectedUser(null); }}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {!selectedUser && (
          <div className="relative mb-5">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input className="input-field pl-9"
              placeholder={tab === 'users' ? 'Tìm tên, email...' : 'Tìm tiêu đề task...'}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        )}

        {tab === 'users' && !selectedUser && (
          loadingUsers ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map(u => (
                <div key={u._id}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-primary-200 hover:bg-primary-50/30 transition-all">
                  
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary-600">
                      {u.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800 text-sm">{u.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        u.role === 'admin'
                          ? 'bg-primary-50 text-primary-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {u.role === 'admin' ? ' Admin' : ' User'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                  </div>

              
                  <div className="flex items-center gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-800">{u.taskCount}</p>
                      <p className="text-xs text-gray-400">Tổng</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{getDone(u._id)}</p>
                      <p className="text-xs text-gray-400">Hoàn thành</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-red-500">{getOverdue(u._id)}</p>
                      <p className="text-xs text-gray-400">Quá hạn</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Xem task
                    </button>
                    <select value={u.role}
                      onChange={e => setRole.mutate({ id: u._id, role: e.target.value })}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => {
                        if (window.confirm(`Xóa tài khoản "${u.name}" và toàn bộ task?`)) {
                          deleteUser.mutate(u._id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'users' && selectedUser && (
          <div>

            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
              <button onClick={() => setSelectedUser(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary-600">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{selectedUser.name}</p>
                <p className="text-xs text-gray-400">{selectedUser.email}</p>
              </div>
              <div className="ml-auto flex gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-700">{selectedUserTasks.length}</p>
                  <p className="text-xs text-gray-400">Tổng</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{getDone(selectedUser._id)}</p>
                  <p className="text-xs text-gray-400">Hoàn thành</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-yellow-500">
                    {selectedUserTasks.filter(t => t.status === 'in-progress').length}
                  </p>
                  <p className="text-xs text-gray-400">Đang làm</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-500">{getOverdue(selectedUser._id)}</p>
                  <p className="text-xs text-gray-400">Quá hạn</p>
                </div>
              </div>
            </div>

            {selectedUserTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">📭</p>
                <p className="text-sm">Người dùng này chưa có nhiệm vụ nào</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {selectedUserTasks.map(t => {
                  const isOverdue = t.deadline && isBefore(new Date(t.deadline), now) && t.status !== 'done';
                  return (
                    <div key={t._id} className={`border rounded-xl p-4 flex flex-col gap-2 ${
                      isOverdue ? 'border-red-200 bg-red-50/30' :
                      t.status === 'done' ? 'border-green-200 bg-green-50/30 opacity-70' :
                      'border-gray-200 bg-white'
                    }`}>
                      <p className={`font-semibold text-sm ${
                        t.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'
                      }`}>{t.title}</p>

                      {t.description && (
                        <p className="text-xs text-gray-400 line-clamp-2">{t.description}</p>
                      )}

                      <div className="flex flex-wrap gap-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          t.status === 'done'        ? 'bg-green-100 text-green-700' :
                          t.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                                                       'bg-gray-100 text-gray-600'
                        }`}>
                          {t.status === 'done' ? '✅ Hoàn thành' :
                           t.status === 'in-progress' ? '⚡ Đang làm' : '📋 Cần làm'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          t.priority === 'high'   ? 'bg-red-100 text-red-600' :
                          t.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-green-100 text-green-600'
                        }`}>
                          {t.priority === 'high' ? 'Cao' :
                           t.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                        </span>
                        {t.tags?.map(tag => (
                          <span key={tag._id}
                            className="text-xs px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: tag.color }}>
                            {tag.name}
                          </span>
                        ))}
                      </div>

                      {t.deadline && (
                        <div className={`flex items-center gap-1 text-xs font-medium ${
                          isOverdue ? 'text-red-500' : 'text-gray-400'
                        }`}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {format(new Date(t.deadline), 'dd/MM/yyyy')}
                          {isOverdue && ' · Quá hạn!'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'tasks' && (
          loadingTasks ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Tiêu đề</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Người dùng</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Trạng thái</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Ưu tiên</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Deadline</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks
                    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
                    .map(t => {
                      const isOverdue = t.deadline && isBefore(new Date(t.deadline), now) && t.status !== 'done';
                      return (
                        <tr key={t._id} className={`border-b border-gray-50 transition-colors ${
                          isOverdue ? 'bg-red-50/40 hover:bg-red-50' : 'hover:bg-gray-50'
                        }`}>
                          <td className="py-3 px-2 font-medium text-gray-800 max-w-xs">
                            <p className="truncate">{t.title}</p>
                            {t.description && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">{t.description}</p>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-primary-600">
                                  {t.user?.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-xs text-gray-600">{t.user?.name || '—'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              t.status === 'done'        ? 'bg-green-100 text-green-700' :
                              t.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                                                           'bg-gray-100 text-gray-600'
                            }`}>
                              {t.status === 'done' ? 'Hoàn thành' :
                               t.status === 'in-progress' ? 'Đang làm' : 'Cần làm'}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              t.priority === 'high'   ? 'bg-red-100 text-red-600' :
                              t.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-green-100 text-green-600'
                            }`}>
                              {t.priority === 'high' ? 'Cao' :
                               t.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            {t.deadline ? (
                              <span className={`text-xs font-medium ${
                                isOverdue ? 'text-red-500' : 'text-gray-400'
                              }`}>
                                {format(new Date(t.deadline), 'dd/MM/yyyy')}
                                {isOverdue && ' ⚠️'}
                              </span>
                            ) : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex flex-wrap gap-1">
                              {t.tags?.map(tag => (
                                <span key={tag._id}
                                  className="text-xs px-2 py-0.5 rounded-full text-white"
                                  style={{ backgroundColor: tag.color }}>
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}