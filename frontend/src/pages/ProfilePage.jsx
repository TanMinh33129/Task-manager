import { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, fetchMe } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/profile', { name: form.name });
      await fetchMe();
      toast.success('Cập nhật thành công!');
    } catch {
      toast.error('Lỗi cập nhật!');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error('Mật khẩu xác nhận không khớp!'); return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới tối thiểu 6 ký tự!'); return;
    }
    try {
      await api.put('/auth/change-password', {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Đổi mật khẩu thành công!');
      setPwForm({ oldPassword: '', newPassword: '', confirm: '' });
    } catch {
      toast.error('Mật khẩu cũ không đúng!');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
        <p className="text-gray-500 text-sm mt-1">Quản lý thông tin tài khoản của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="card p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-primary-600">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <span className={`mt-3 text-xs px-3 py-1 rounded-full font-medium ${
            user?.role === 'admin'
              ? 'bg-primary-50 text-primary-600'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {user?.role === 'admin' ? '👑 Admin' : '👤 User'}
          </span>
          <div className="w-full mt-6 pt-4 border-t border-gray-100 text-sm text-gray-500 space-y-2">
            <div className="flex justify-between">
              <span>Tham gia</span>
              <span className="font-medium text-gray-700">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('vi-VN')
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Update name */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Cập nhật thông tin</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                <input className="input-field" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input className="input-field bg-gray-50" value={form.email} disabled />
                <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
              </div>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>

          {/* Change password */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Đổi mật khẩu</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                <input type="password" className="input-field" placeholder="••••••"
                  value={pwForm.oldPassword}
                  onChange={e => setPwForm({ ...pwForm, oldPassword: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                <input type="password" className="input-field" placeholder="Tối thiểu 6 ký tự"
                  value={pwForm.newPassword}
                  onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                <input type="password" className="input-field" placeholder="Nhập lại mật khẩu mới"
                  value={pwForm.confirm}
                  onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} required />
              </div>
              <button type="submit" className="btn-secondary">Đổi mật khẩu</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}