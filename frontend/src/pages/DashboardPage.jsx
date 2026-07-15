import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isBefore, format, isWithinInterval, startOfDay, endOfDay, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  useTasks, useCreateTask, useUpdateTask, useDeleteTask,
  useTags, useCategories,
} from '../hooks/useTasks';
import TaskCard  from '../components/tasks/TaskCard';
import TaskForm  from '../components/tasks/TaskForm';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const STATUS_TABS = [
  { value: '',            label: 'Tất cả'     },
  { value: 'todo',        label: 'Cần làm'    },
  { value: 'in-progress', label: 'Đang làm'   },
  { value: 'done',        label: 'Hoàn thành' },
];

export default function DashboardPage() {
  const [searchParams]  = useSearchParams();
  const categoryFilter  = searchParams.get('category') || '';

  const [status,    setStatus]    = useState('');
  const [search,    setSearch]    = useState('');
  const [showForm,  setShowForm]  = useState(false);
  const [editTask,  setEditTask]  = useState(null);
  const [dismissed, setDismissed] = useState([]);

  const { data: tasks    = [], isLoading } = useTasks({ status, search, category: categoryFilter });
  const { data: allTasks = [] }            = useTasks({});
  const { data: tags     = [] }            = useTags();
  const { data: categories = [] }          = useCategories();

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const now    = new Date();
  const in24h  = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const upcomingDeadlines = allTasks.filter(t =>
    t.deadline &&
    t.status !== 'done' &&
    !dismissed.includes(t._id) &&
    isBefore(new Date(t.deadline), in24h)
  );

  const stats = {
    todo:       allTasks.filter(t => t.status === 'todo').length,
    inProgress: allTasks.filter(t => t.status === 'in-progress').length,
    done:       allTasks.filter(t => t.status === 'done').length,
    overdue:    allTasks.filter(t =>
      t.deadline && isBefore(new Date(t.deadline), now) && t.status !== 'done'
    ).length,
  };

  const activityData = Array.from({ length: 7 }, (_, i) => {
    const day   = subDays(now, 6 - i);
    const count = allTasks.filter(t =>
      t.createdAt && isWithinInterval(new Date(t.createdAt), {
        start: startOfDay(day),
        end:   endOfDay(day),
      })
    ).length;
    return { name: format(day, 'EEE', { locale: vi }), value: count };
  });

  const categoryChartData = categories.map(cat => ({
    name:  cat.name,
    value: allTasks.filter(t => t.category?._id === cat._id).length,
    color: cat.color,
  })).filter(c => c.value > 0);

  const recentTasks = [...allTasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const activeCategoryName = categories.find(c => c._id === categoryFilter)?.name || '';

  const handleSubmit = (data) => {
    if (editTask) updateTask.mutate({ id: editTask._id, ...data });
    else          createTask.mutate(data);
    setShowForm(false);
    setEditTask(null);
  };

  return (
    <div className="space-y-6">

      {/* Deadline Alert */}
      {upcomingDeadlines.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-semibold text-red-700 text-sm">
              {upcomingDeadlines.length} nhiệm vụ sắp đến hạn trong 24h
            </span>
          </div>
          <div className="space-y-1.5">
            {upcomingDeadlines.map(t => (
              <div key={t._id}
                className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-red-100">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t.title}
                </div>
                <div className="flex items-center gap-2">
                  {isBefore(new Date(t.deadline), now) && (
                    <span className="text-xs px-2 py-0.5 border border-red-300 text-red-600 rounded-full">
                      Đã quá hạn
                    </span>
                  )}
                  <button
                    onClick={() => setDismissed(d => [...d, t._id])}
                    className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Cần làm',    value: stats.todo,       icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2', bg: 'bg-indigo-50',  text: 'text-indigo-500' },
          { label: 'Đang làm',   value: stats.inProgress, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',                                                        bg: 'bg-yellow-50', text: 'text-yellow-500' },
          { label: 'Hoàn thành', value: stats.done,       icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',                                                      bg: 'bg-green-50',  text: 'text-green-500'  },
          { label: 'Quá hạn',   value: stats.overdue,    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', bg: 'bg-red-50', text: 'text-red-500' },
        ].map(({ label, value, icon, bg, text }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
                <svg className={`w-5 h-5 ${text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Hoạt động 7 ngày qua</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2}
                dot={{ fill: '#6366f1' }} name="Task tạo" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Phân bổ theo danh mục</h3>
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryChartData} cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {categoryChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend formatter={(value) => <span className="text-sm">{value}</span>} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-300 gap-2">
              <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <p className="text-sm">Chưa có task theo danh mục</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Nhiệm vụ gần đây</h3>
        {recentTasks.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Chưa có nhiệm vụ nào</p>
        ) : (
          <div className="space-y-2">
            {recentTasks.map(t => {
              const isOverdue = t.deadline && isBefore(new Date(t.deadline), now) && t.status !== 'done';
              return (
                <div key={t._id}
                  className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      t.status === 'done'        ? 'bg-green-400'  :
                      t.status === 'in-progress' ? 'bg-yellow-400' : 'bg-gray-300'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${
                        t.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'
                      }`}>
                        {t.title}
                      </p>
                      {t.category && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {t.category.icon} {t.category.name}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {t.tags?.slice(0, 2).map(tag => (
                        <span key={tag._id}
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: tag.color }}>
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                    {t.deadline && (
                      <span className={`text-xs font-medium ${
                        isOverdue ? 'text-red-500' : 'text-gray-400'
                      }`}>
                        {format(new Date(t.deadline), 'dd/MM/yyyy')}
                        {isOverdue && ' · Quá hạn'}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.status === 'done'        ? 'bg-green-100 text-green-700'  :
                      t.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                                                   'bg-gray-100 text-gray-600'
                    }`}>
                      {t.status === 'done' ? 'Hoàn thành' :
                       t.status === 'in-progress' ? 'Đang làm' : 'Cần làm'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter + Task list */}
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-3">
            {activeCategoryName && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg">
                {categories.find(c => c._id === categoryFilter)?.icon} {activeCategoryName}
              </span>
            )}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {STATUS_TABS.map(t => (
                <button key={t.value} onClick={() => setStatus(t.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    status === t.value
                      ? 'bg-white shadow text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="input-field pl-9 w-52"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => { setEditTask(null); setShowForm(true); }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm task
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-500 font-medium">
              {activeCategoryName
                ? `Không có task nào trong "${activeCategoryName}"`
                : 'Chưa có task nào'}
            </p>
            <p className="text-gray-400 text-sm mt-1">Nhấn "Thêm task" để bắt đầu!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={() => { setEditTask(task); setShowForm(true); }}
                onDelete={() => deleteTask.mutate(task._id)}
                onStatusChange={(s) => updateTask.mutate({ id: task._id, status: s })}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <TaskForm
          task={editTask}
          tags={tags}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditTask(null); }}
        />
      )}
    </div>
  );
}