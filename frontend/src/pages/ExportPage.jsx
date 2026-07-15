import { useTasks } from '../hooks/useTasks';
import { useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ExportPage() {
  const [filterStatus, setFilterStatus] = useState('');
  const { data: tasks = [] } = useTasks({ status: filterStatus });

  const exportCSV = () => {
    const headers = ['Tiêu đề','Mô tả','Trạng thái','Độ ưu tiên','Deadline','Tags'];
    const rows = tasks.map(t => [
      t.title,
      t.description || '',
      t.status,
      t.priority,
      t.deadline ? format(new Date(t.deadline), 'dd/MM/yyyy') : '',
      t.tags?.map(tg => tg.name).join('; ') || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    download(csv, 'tasks.csv', 'text/csv');
    toast.success('Đã xuất CSV!');
  };

  const exportJSON = () => {
    const json = JSON.stringify(tasks.map(t => ({
      title: t.title, description: t.description,
      status: t.status, priority: t.priority,
      deadline: t.deadline, tags: t.tags?.map(tg => tg.name),
    })), null, 2);
    download(json, 'tasks.json', 'application/json');
    toast.success('Đã xuất JSON!');
  };

  const exportPDF = () => {
    const html = `<html><head><title>Tasks</title><style>body{font-family:Arial;padding:20px}h1{color:#6366f1}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f3f4f6}</style></head><body><h1>Danh sách nhiệm vụ</h1><table><tr><th>Tiêu đề</th><th>Trạng thái</th><th>Ưu tiên</th><th>Deadline</th></tr>${tasks.map(t=>`<tr><td>${t.title}</td><td>${t.status}</td><td>${t.priority}</td><td>${t.deadline?format(new Date(t.deadline),'dd/MM/yyyy'):''}</td></tr>`).join('')}</table></body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.print();
    toast.success('Mở hộp thoại in PDF!');
  };

  const exportWord = () => {
    const rows = tasks.map(t =>
      `<tr><td>${t.title}</td><td>${t.description||''}</td><td>${t.status}</td><td>${t.priority}</td><td>${t.deadline?format(new Date(t.deadline),'dd/MM/yyyy'):''}</td></tr>`
    ).join('');
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>Tasks</title></head><body><h1>Danh sách nhiệm vụ</h1><table border="1"><tr><th>Tiêu đề</th><th>Mô tả</th><th>Trạng thái</th><th>Ưu tiên</th><th>Deadline</th></tr>${rows}</table></body></html>`;
    download(html, 'tasks.doc', 'application/msword');
    toast.success('Đã xuất Word!');
  };

  const download = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const formats = [
    { label: 'Excel (CSV)', desc: 'Mở được bằng Excel, Google Sheets', icon: '📊', color: 'text-green-600 bg-green-50', action: exportCSV },
    { label: 'JSON',        desc: 'Định dạng dữ liệu chuẩn',          icon: '📋', color: 'text-orange-600 bg-orange-50', action: exportJSON },
    { label: 'PDF',         desc: 'Định dạng tài liệu di động',        icon: '📄', color: 'text-red-600 bg-red-50',    action: exportPDF },
    { label: 'Word (DOC)',  desc: 'Mở được bằng Microsoft Word',       icon: '📝', color: 'text-blue-600 bg-blue-50',  action: exportWord },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Xuất dữ liệu</h1>
        <p className="text-gray-500 text-sm mt-1">Xuất nhiệm vụ ra các định dạng file khác nhau</p>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Bộ lọc trước khi xuất</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select className="input-field" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="todo">Cần làm</option>
              <option value="in-progress">Đang làm</option>
              <option value="done">Hoàn thành</option>
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Đã chọn: <span className="font-semibold text-primary-600">{tasks.length} nhiệm vụ</span>
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {formats.map(({ label, desc, icon, color, action }) => (
          <div key={label} className="card p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 ${color}`}>
              {icon}
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">{label}</h3>
            <p className="text-xs text-gray-400 mb-4">{desc}</p>
            <button onClick={action} className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Tải xuống
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}