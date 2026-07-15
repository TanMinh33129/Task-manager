import { useState } from 'react';
import { useCategories } from '../../hooks/useTasks';

export default function TaskForm({ task, tags, onSubmit, onClose }) {
  const { data: categories = [] } = useCategories();

  const [form, setForm] = useState({
    title:       task?.title       || '',
    description: task?.description || '',
    status:      task?.status      || 'todo',
    priority:    task?.priority    || 'medium',
    deadline:    task?.deadline
      ? new Date(task.deadline).toISOString().split('T')[0]
      : '',
    tags:        task?.tags?.map(t => t._id || t) || [],
    category:    task?.category?._id || task?.category || '',
  });

  const [tagInput,    setTagInput]    = useState('');
  const [customTags,  setCustomTags]  = useState([]);

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !customTags.includes(val)) {
        setCustomTags(prev => [...prev, val]);
      }
      setTagInput('');
    }
  };

  const removeCustomTag = (tag) => {
    setCustomTags(prev => prev.filter(t => t !== tag));
  };

  const toggleTag = (id) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(id)
        ? f.tags.filter(t => t !== id)
        : [...f.tags, id],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({
      ...form,
      deadline: form.deadline || null,
      category: form.category || null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {task?._id ? '✏️ Chỉnh sửa task' : '➕ Tạo task mới'}
          </h2>
          <button onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tiêu đề */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
            <input
              className="input-field"
              placeholder="Nhập tiêu đề công việc..."
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              autoFocus
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Mô tả chi tiết công việc..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Danh mục */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, category: '' })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all font-medium ${
                    !form.category
                      ? 'border-primary-400 bg-primary-50 text-primary-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  <span>📋</span> Tất cả
                </button>
                {categories.map(cat => (
                  <button
                    type="button"
                    key={cat._id}
                    onClick={() => setForm({ ...form, category: cat._id })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all font-medium ${
                      form.category === cat._id
                        ? 'border-primary-400 bg-primary-50 text-primary-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    <span>{cat.icon}</span>
                    <span className="max-w-20 truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trạng thái + Ưu tiên */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select className="input-field" value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="todo">📋 To-do</option>
                <option value="in-progress">⚡ Đang làm</option>
                <option value="done">✅ Hoàn thành</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Độ ưu tiên</label>
              <select className="input-field" value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">🟢 Thấp</option>
                <option value="medium">🟡 Trung bình</option>
                <option value="high">🔴 Cao</option>
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <input
              type="date"
              className="input-field"
              value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Tags có sẵn từ DB */}
          {tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags có sẵn</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    type="button"
                    key={tag._id}
                    onClick={() => toggleTag(tag._id)}
                    className={`text-xs px-3 py-1.5 rounded-full border-2 transition-all font-medium ${
                      form.tags.includes(tag._id)
                        ? 'text-white border-transparent scale-105'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                    style={form.tags.includes(tag._id)
                      ? { backgroundColor: tag.color, borderColor: tag.color }
                      : {}
                    }>
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags nhập tay */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thẻ (Tags) — Ấn Enter để lưu
            </label>
            <div
              className="input-field flex flex-wrap gap-2 min-h-[42px] cursor-text p-2"
              onClick={() => document.getElementById('tag-input-field').focus()}>
              {customTags.map(tag => (
                <span key={tag}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                  {tag}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeCustomTag(tag); }}
                    className="hover:text-red-500 transition-colors ml-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <input
                id="tag-input-field"
                className="flex-1 min-w-28 outline-none text-sm bg-transparent placeholder-gray-400"
                placeholder={customTags.length === 0
                  ? 'Gõ nhãn (vd: HocTap, Gấp, Dev) rồi nhấn Enter...'
                  : 'Thêm tag...'}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Gõ tag rồi nhấn Enter để thêm nhiều tag</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Hủy
            </button>
            <button type="submit" className="btn-primary flex-1">
              {task?._id ? 'Cập nhật' : 'Tạo task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}