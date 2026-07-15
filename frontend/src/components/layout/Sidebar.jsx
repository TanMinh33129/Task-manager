import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import { useCategories, useCreateCategory, useDeleteCategory } from '../../hooks/useTasks';

const mainLinks = [
  { to: '/',        label: 'Tổng quan',        icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/kanban',  label: 'Kanban',            icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2' },
  { to: '/export',  label: 'Xuất dữ liệu',     icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' },
  { to: '/report',  label: 'Báo cáo tuần',      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { to: '/profile', label: 'Thông tin cá nhân', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

const adminLinks = [
  { to: '/admin', label: 'Quản lý Admin', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
];

const ICONS  = ['📁','💼','📚','👤','❤️','🎯','🏠','✈️','💡','🎮','💰','⚽'];
const COLORS = ['#6366f1','#3b82f6','#10b981','#ef4444','#f59e0b','#ec4899','#8b5cf6','#06b6d4'];

function NavItem({ to, label, icon }) {
  return (
    <NavLink to={to} end
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary-50 text-primary-600'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }>
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
      </svg>
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout }    = useAuthStore();
  const navigate            = useNavigate();
  const location            = useLocation();
  const isAdmin             = user?.role === 'admin';

  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const [showAddCat,  setShowAddCat]  = useState(false);
  const [newCatName,  setNewCatName]  = useState('');
  const [newCatIcon,  setNewCatIcon]  = useState('📁');
  const [newCatColor, setNewCatColor] = useState('#6366f1');

  const params      = new URLSearchParams(location.search);
  const activeCatId = params.get('category') || '';

  const handleSelectCategory = (catId) => {
    navigate(`/?category=${catId}`);
  };

  const handleAllCategories = () => {
    navigate('/');
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    createCategory.mutate({
      name:  newCatName.trim(),
      icon:  newCatIcon,
      color: newCatColor,
    });
    setNewCatName('');
    setNewCatIcon('📁');
    setNewCatColor('#6366f1');
    setShowAddCat(false);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">TaskManager</span>
        </div>
      </div>

      <nav className="p-4 flex-1 space-y-1 overflow-y-auto">
        {/* Main links */}
        {mainLinks.map(link => <NavItem key={link.to} {...link} />)}

        {/* Danh mục */}
        <div className="pt-4">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Danh mục
            </p>
            <button
              onClick={() => setShowAddCat(!showAddCat)}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-primary-500 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Form thêm danh mục */}
          {showAddCat && (
            <form onSubmit={handleAddCategory}
              className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <input
                className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Tên danh mục..."
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                autoFocus
              />
              {/* Chọn icon */}
              <div className="flex flex-wrap gap-1">
                {ICONS.map(ic => (
                  <button type="button" key={ic}
                    onClick={() => setNewCatIcon(ic)}
                    className={`text-sm p-1 rounded-lg transition-all ${
                      newCatIcon === ic
                        ? 'bg-primary-100 ring-1 ring-primary-400 scale-110'
                        : 'hover:bg-gray-100'
                    }`}>
                    {ic}
                  </button>
                ))}
              </div>
              {/* Chọn màu */}
              <div className="flex gap-1.5 flex-wrap">
                {COLORS.map(c => (
                  <button type="button" key={c}
                    onClick={() => setNewCatColor(c)}
                    className={`w-5 h-5 rounded-full transition-all ${
                      newCatColor === c ? 'ring-2 ring-offset-1 ring-gray-500 scale-110' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
              {/* Preview */}
              <div className="flex items-center gap-2 px-2 py-1 bg-white rounded-lg border border-gray-100">
                <span className="text-sm">{newCatIcon}</span>
                <span className="text-xs font-medium text-gray-700 flex-1 truncate">
                  {newCatName || 'Tên danh mục'}
                </span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: newCatColor }} />
              </div>
              <div className="flex gap-2">
                <button type="submit"
                  className="flex-1 text-xs bg-primary-500 text-white rounded-lg py-1.5 hover:bg-primary-600 font-medium transition-colors">
                  Thêm
                </button>
                <button type="button"
                  onClick={() => { setShowAddCat(false); setNewCatName(''); }}
                  className="flex-1 text-xs bg-gray-100 text-gray-600 rounded-lg py-1.5 hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
              </div>
            </form>
          )}

          {/* Tất cả danh mục */}
          <button
            onClick={handleAllCategories}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              !activeCatId && location.pathname === '/'
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}>
            <span className="text-base">📋</span>
            <span className="flex-1 text-left">Tất cả danh mục</span>
          </button>

          {/* Danh sách */}
          {categories.map(cat => (
            <div key={cat._id} className="group relative">
              <button
                onClick={() => handleSelectCategory(cat._id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCatId === cat._id
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <span className="text-base flex-shrink-0">{cat.icon}</span>
                <span className="flex-1 text-left truncate">{cat.name}</span>
                <span className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }} />
              </button>
              {/* Xóa danh mục */}
              <button
                onClick={() => {
                  if (window.confirm(`Xóa danh mục "${cat.name}"?`)) {
                    deleteCategory.mutate(cat._id);
                  }
                }}
                className="absolute right-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-red-500 text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Admin */}
        {isAdmin && (
          <div className="pt-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
              Admin
            </p>
            {adminLinks.map(link => <NavItem key={link.to} {...link} />)}
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-primary-600">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role || 'user'}</p>
          </div>
          <button onClick={logout} title="Đăng xuất"
            className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}