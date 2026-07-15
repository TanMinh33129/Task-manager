import { useState } from 'react';

const PRIORITY_STYLES = {
  low:    'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high:   'bg-red-100 text-red-700',
};

const PRIORITY_LABELS = {
  low: 'Thấp', medium: 'Trung bình', high: 'Cao',
};

const STATUS_OPTIONS = [
  { value: 'todo',        label: '📋 To-do' },
  { value: 'in-progress', label: '⚡ Đang làm' },
  { value: 'done',        label: '✅ Hoàn thành' },
];

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className={`card p-4 flex flex-col gap-3 hover:shadow-md transition-all duration-200 ${
      task.status === 'done' ? 'opacity-60' : ''
    }`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className={`font-semibold text-sm leading-snug flex-1 ${
          task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'
        }`}>
          {task.title}
        </h3>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-indigo-50 hover:text-primary-600 text-gray-400 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          ) : (
            <div className="flex gap-1">
              <button onClick={onDelete} className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg">Xóa</button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">Hủy</button>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        {task.tags?.map(tag => (
          <span
            key={tag._id}
            className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
          </span>
        ))}
      </div>

      {task.deadline && (
        <div className={`flex items-center gap-1.5 text-xs font-medium ${
          isOverdue ? 'text-red-500' : 'text-gray-400'
        }`}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(task.deadline)}
          {isOverdue && <span className="text-red-500 font-semibold">· Quá hạn!</span>}
        </div>
      )}

      <select
        value={task.status}
        onChange={e => onStatusChange(e.target.value)}
        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 mt-auto"
      >
        {STATUS_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}