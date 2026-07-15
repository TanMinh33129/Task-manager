import { useTasks } from '../hooks/useTasks';
import useAuthStore from '../store/useAuthStore';
import { isBefore, format } from 'date-fns';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function ReportPage() {
  const { data: tasks = [] } = useTasks({});
  const { user } = useAuthStore();
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const now = new Date();
  const stats = {
    done:      tasks.filter(t => t.status === 'done').length,
    inProgress:tasks.filter(t => t.status === 'in-progress').length,
    overdue:   tasks.filter(t => t.deadline && isBefore(new Date(t.deadline), now) && t.status !== 'done').length,
    total:     tasks.length,
  };
  const overdueTasks = tasks.filter(t => t.deadline && isBefore(new Date(t.deadline), now) && t.status !== 'done');

  const handleSendReport = async () => {
    setSending(true);
    try {
      await api.post('/auth/send-report', { stats, overdueTasks: overdueTasks.map(t => t.title) });
      toast.success('Đã gửi báo cáo qua email!');
    } catch {
      toast.error('Lỗi gửi email! Kiểm tra cấu hình Nodemailer.');
    } finally {
      setSending(false);
    }
  };

  const statCards = [
    { label: 'Hoàn thành', value: stats.done,       icon: '✅', color: 'text-green-600 bg-green-50' },
    { label: 'Đang làm',   value: stats.inProgress, icon: '⚡', color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Quá hạn',   value: stats.overdue,    icon: '⚠️', color: 'text-red-600 bg-red-50' },
    { label: 'Tổng cộng', value: stats.total,       icon: '📋', color: 'text-indigo-600 bg-indigo-50' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Báo cáo tuần</h1>
        <p className="text-gray-500 text-sm mt-1">Tổng kết nhiệm vụ & gửi email báo cáo cho bản thân</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon, color }) => (
          <div key={label} className="card p-5 flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 ${color}`}>{icon}</div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {overdueTasks.length > 0 && (
        <div className="card p-5 mb-6 border-red-200">
          <h2 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
            <span>⚠️</span> Nhiệm vụ quá hạn ({overdueTasks.length})
          </h2>
          <div className="space-y-2">
            {overdueTasks.map(t => (
              <div key={t._id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-700">{t.title}</span>
                <div className="flex items-center gap-3">
                  {t.tags?.map(tag => (
                    <span key={tag._id} className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: tag.color }}>{tag.name}</span>
                  ))}
                  <span className="text-xs text-red-500 font-medium">{format(new Date(t.deadline), 'dd/MM/yyyy')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-semibold text-gray-800 mb-2">Gửi báo cáo qua email</h2>
        <p className="text-sm text-gray-500 mb-4">
          Báo cáo sẽ được gửi đến <span className="font-semibold text-primary-600">{user?.email}</span> — bao gồm tất cả thống kê, nhiệm vụ hoàn thành và quá hạn.
        </p>
        <div className="flex gap-3">
          <button onClick={handleSendReport} disabled={sending}
            className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            {sending ? 'Đang gửi...' : 'Gửi báo cáo ngay'}
          </button>
          <button onClick={() => setShowPreview(!showPreview)} className="btn-secondary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Xem trước email
          </button>
        </div>

        {showPreview && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm">
            <p className="font-semibold mb-2">📧 Preview nội dung email:</p>
            <p>Xin chào <strong>{user?.name}</strong>,</p>
            <p className="mt-2">Báo cáo nhiệm vụ tuần này của bạn:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
              <li>✅ Hoàn thành: <strong>{stats.done}</strong> nhiệm vụ</li>
              <li>⚡ Đang làm: <strong>{stats.inProgress}</strong> nhiệm vụ</li>
              <li>⚠️ Quá hạn: <strong>{stats.overdue}</strong> nhiệm vụ</li>
              <li>📋 Tổng: <strong>{stats.total}</strong> nhiệm vụ</li>
            </ul>
            {overdueTasks.length > 0 && (
              <div className="mt-2">
                <p className="font-medium text-red-600">Nhiệm vụ quá hạn cần xử lý:</p>
                <ul className="list-disc list-inside text-red-500">
                  {overdueTasks.map(t => <li key={t._id}>{t.title}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
          <span>💡</span> Gợi ý: Bạn có thể bấm "Gửi báo cáo ngay" vào mỗi sáng thứ Hai để nhận tổng kết tuần qua qua email.
        </p>
      </div>
    </div>
  );
}