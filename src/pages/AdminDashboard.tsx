import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { collection, query, getDocs, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';
import * as XLSX from 'xlsx';
import { Upload, Users, FileText, CheckCircle, Clock, AlertCircle, Shield, Settings, UserPlus, BookOpen, Search, Filter, MoreVertical, Download, ArrowUpRight } from 'lucide-react';
import FormSettings from '../components/admin/FormSettings';

export default function AdminDashboard() {
  const [applications, setApplications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [adminEmails, setAdminEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const filterStatus = searchParams.get('status') || 'all';
  
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const setFilterStatus = (status: string) => {
    setSearchParams(prev => {
      prev.set('status', status);
      return prev;
    });
  };

  const fetchData = async () => {
    try {
      const [appsSnapshot, usersSnapshot, adminEmailsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'applications'))),
        getDocs(query(collection(db, 'users'))),
        getDocs(query(collection(db, 'admin_emails')))
      ]);
      
      const apps: any[] = [];
      appsSnapshot.forEach((doc) => apps.push({ id: doc.id, ...doc.data() }));
      setApplications(apps);

      const usersList: any[] = [];
      usersSnapshot.forEach((doc) => usersList.push({ id: doc.id, ...doc.data() }));
      setUsers(usersList);

      const adminEmailsList: any[] = [];
      adminEmailsSnapshot.forEach((doc) => adminEmailsList.push({ id: doc.id, ...doc.data() }));
      setAdminEmails(adminEmailsList);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'applications/users');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'applications', id), { status });
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `applications/${id}`);
    }
  };

  const assignApplication = async (appId: string, reviewerId: string) => {
    try {
      const reviewer = users.find(u => u.id === reviewerId);
      const updateData: any = {
        assignedTo: reviewerId || null,
        assignedToName: reviewer ? (reviewer.fullName || reviewer.email) : null,
      };
      
      const app = applications.find(a => a.id === appId);
      if (reviewerId && app?.status === 'submitted') {
        updateData.status = 'assigned';
      } else if (!reviewerId && app?.status === 'assigned') {
        updateData.status = 'submitted';
      }

      await updateDoc(doc(db, 'applications', appId), updateData);
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `applications/${appId}`);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;

    setAddingAdmin(true);
    try {
      const emailLower = newAdminEmail.toLowerCase().trim();
      await setDoc(doc(db, 'admin_emails', emailLower), {
        email: emailLower,
        fullName: newAdminName,
        createdAt: new Date().toISOString()
      });
      setNewAdminEmail('');
      setNewAdminName('');
      fetchData();
      alert('Đã thêm tài khoản Đảng viên hướng dẫn thành công. Họ có thể đăng nhập bằng Google hoặc Đăng ký bằng email này.');
    } catch (error) {
      console.error('Error adding admin:', error);
      alert('Lỗi khi thêm Đảng viên hướng dẫn');
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (emailId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa quyền Đảng viên hướng dẫn của email này?')) return;
    try {
      await deleteDoc(doc(db, 'admin_emails', emailId));
      fetchData();
    } catch (error) {
      console.error('Error removing admin:', error);
      alert('Lỗi khi xóa Đảng viên hướng dẫn');
    }
  };

  const handleExport = () => {
    let dataToExport: any[] = [];
    let filename = 'danh_sach.xlsx';

    if (activeTab === 'training') {
      dataToExport = applications
        .filter(app => app.conditions?.hasPartyAwarenessClass === 'false' || app.conditions?.hasPartyAwarenessClass === false)
        .map((app, index) => ({
          'STT': index + 1,
          'MSSV': app.basicInfo?.studentId || '',
          'CCCD': app.basicInfo?.cccd || '',
          'HỌ VÀ TÊN': app.basicInfo?.fullName || '',
          'LỚP': app.basicInfo?.class || '',
          'KHOA': app.basicInfo?.faculty || '',
          'TÌNH TRẠNG': app.status === 'approved' ? 'Đã duyệt' : 
                        app.status === 'rejected' ? 'Cần sửa' : 
                        app.status === 'assigned' ? 'Đã phân kiểm tra' :
                        app.status === 'writing_hardcopy' ? 'Đang viết bản cứng' :
                        app.status === 'verifying_background' ? 'Đang thẩm tra lý lịch' :
                        app.status === 'submitted' ? 'Chờ duyệt' : 'Đang soạn',
          'ĐV HƯỚNG DẪN': app.assignedToName || '',
          'NGÀY NHẬN HỒ SƠ': app.createdAt ? new Date(app.createdAt).toLocaleDateString('vi-VN') : '',
          'NGÀY SINH': app.basicInfo?.dob ? new Date(app.basicInfo.dob).toLocaleDateString('vi-VN') : '',
          'QUÊ QUÁN': app.basicInfo?.hometown || '',
          'FACEBOOK': app.basicInfo?.facebookLink || '',
          'SĐT': app.basicInfo?.zaloPhone || '',
          'EMAIL': app.basicInfo?.email || '',
          'GHI CHÚ': 'Chưa học cảm tình Đảng',
          'Giấy khen, Giấy chứng nhận': (app.conditions?.certificates || []).map((c: any) => c.name).join(', '),
          'ĐIỂM HỌC TẬP, RÈN LUYỆN': (app.conditions?.academicScores || []).map((s: any) => `Kỳ ${s.semester}: ${s.academicScore}/${s.trainingScore}`).join('; ')
        }));
      filename = 'danh_sach_chua_hoc_cam_tinh_dang.xlsx';
    } else {
      dataToExport = filteredApplications.map((app, index) => ({
        'STT': index + 1,
        'MSSV': app.basicInfo?.studentId || '',
        'CCCD': app.basicInfo?.cccd || '',
        'HỌ VÀ TÊN': app.basicInfo?.fullName || '',
        'LỚP': app.basicInfo?.class || '',
        'KHOA': app.basicInfo?.faculty || '',
        'TÌNH TRẠNG': app.status === 'approved' ? 'Đã duyệt' : 
                      app.status === 'rejected' ? 'Cần sửa' : 
                      app.status === 'assigned' ? 'Đã phân kiểm tra' :
                      app.status === 'writing_hardcopy' ? 'Đang viết bản cứng' :
                      app.status === 'verifying_background' ? 'Đang thẩm tra lý lịch' :
                      app.status === 'submitted' ? 'Chưa duyệt' : 'Đang soạn',
        'ĐV HƯỚNG DẪN': app.assignedToName || '',
        'NGÀY NHẬN HỒ SƠ': app.createdAt ? new Date(app.createdAt).toLocaleDateString('vi-VN') : '',
        'NGÀY SINH': app.basicInfo?.dob ? new Date(app.basicInfo.dob).toLocaleDateString('vi-VN') : '',
        'QUÊ QUÁN': app.basicInfo?.hometown || '',
        'FACEBOOK': app.basicInfo?.facebookLink || '',
        'SĐT': app.basicInfo?.zaloPhone || '',
        'EMAIL': app.basicInfo?.email || '',
        'GHI CHÚ': (app.conditions?.hasPartyAwarenessClass === 'true' || app.conditions?.hasPartyAwarenessClass === true) ? 'Đã học cảm tình Đảng' : 'Chưa học cảm tình Đảng',
        'Giấy khen, Giấy chứng nhận': (app.conditions?.certificates || []).map((c: any) => c.name).join(', '),
        'ĐIỂM HỌC TẬP, RÈN LUYỆN': (app.conditions?.academicScores || []).map((s: any) => `Kỳ ${s.semester}: ${s.academicScore}/${s.trainingScore}`).join('; ')
      }));
      filename = 'danh_sach_ho_so.xlsx';
    }

    if (dataToExport.length === 0) {
      alert('Không có dữ liệu để xuất');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách");
    XLSX.writeFile(wb, filename);
  };

  const stats = {
    total: applications.length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    draft: applications.filter(a => a.status === 'draft' || !a.status).length,
    unassigned: applications.filter(a => a.status === 'submitted' && !a.assignedTo).length,
    assigned: applications.filter(a => a.status === 'assigned').length,
    writing_hardcopy: applications.filter(a => a.status === 'writing_hardcopy').length,
    verifying_background: applications.filter(a => a.status === 'verifying_background').length,
  };

  const filteredApplications = applications.filter(app => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  if (loading) {
    return <div className="text-center py-10">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
        <div>
          <h1 className="text-lg font-extrabold text-gray-900 tracking-tight uppercase">Quản trị hệ thống</h1>
          <p className="text-gray-500 mt-0.5 text-[10px]">Quản lý hồ sơ, đảng viên và cấu hình hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExport}
            className="inline-flex items-center px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-[10px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Download className="w-3 h-3 mr-1" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="p-1 bg-gray-50 text-gray-500 rounded group-hover:bg-gray-100 transition-colors">
                  <FileText size={12} />
                </div>
                <span className="text-[8px] font-bold text-gray-400 bg-gray-50 px-1 py-0.5 rounded">Tổng cộng</span>
              </div>
              <p className="text-lg font-black text-gray-900">
                {stats.submitted + stats.approved + stats.rejected + stats.assigned + stats.writing_hardcopy + stats.verifying_background}
              </p>
              <p className="text-[9px] text-gray-500 mt-0.5 font-medium">Hồ sơ đã nộp</p>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="p-1 bg-green-50 text-green-600 rounded group-hover:bg-green-100 transition-colors">
                  <CheckCircle size={12} />
                </div>
                <span className="text-[8px] font-bold text-green-600 bg-green-50 px-1 py-0.5 rounded">Hoàn tất</span>
              </div>
              <p className="text-base font-black text-green-600">{stats.approved}</p>
              <p className="text-[8px] text-gray-500 mt-0.5 font-medium">Đã duyệt</p>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="p-1 bg-blue-50 text-blue-600 rounded group-hover:bg-blue-100 transition-colors">
                  <Clock size={12} />
                </div>
                <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-1 py-0.5 rounded">Đang chờ</span>
              </div>
              <p className="text-base font-black text-blue-600">{stats.submitted}</p>
              <p className="text-[8px] text-gray-500 mt-0.5 font-medium">Chưa duyệt</p>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="p-1 bg-yellow-50 text-yellow-600 rounded group-hover:bg-yellow-100 transition-colors">
                  <Users size={12} />
                </div>
                <span className="text-[8px] font-bold text-yellow-600 bg-yellow-50 px-1 py-0.5 rounded">Cần phân công</span>
              </div>
              <p className="text-base font-black text-yellow-600">{stats.unassigned}</p>
              <p className="text-[8px] text-gray-500 mt-0.5 font-medium">Chưa phân kiểm tra</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-2.5 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-[11px]">Tiến độ xử lý hồ sơ</h3>
                <button className="text-[8px] font-bold text-brand-red hover:underline flex items-center gap-0.5">
                  Xem tất cả <ArrowUpRight size={10} />
                </button>
              </div>
              <div className="p-2.5 space-y-2.5">
                {[
                  { label: 'Đã phân kiểm tra', value: stats.assigned, color: 'bg-purple-500' },
                  { label: 'Đang viết bản cứng', value: stats.writing_hardcopy, color: 'bg-indigo-500' },
                  { label: 'Đang thẩm tra lý lịch', value: stats.verifying_background, color: 'bg-orange-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold text-gray-700">{item.label}</span>
                      <span className="text-[9px] font-black text-gray-900">{item.value}</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${(item.value / (stats.total || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-2.5">
              <h3 className="font-bold text-gray-900 text-[11px] mb-2">Hoạt động gần đây</h3>
              <div className="space-y-2">
                {applications.slice(0, 4).map((app, i) => (
                  <div key={app.id} className="flex gap-2">
                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                      i % 2 === 0 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <UserPlus size={10} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-900">
                        {app.basicInfo?.fullName || 'Sinh viên mới'}
                      </p>
                      <p className="text-[8px] text-gray-500 leading-tight">
                        {app.status === 'submitted' ? 'Vừa nộp hồ sơ' : 'Cập nhật thông tin'}
                      </p>
                      <p className="text-[7px] text-gray-400 mt-0.5">
                        {app.updatedAt ? new Date(app.updatedAt).toLocaleTimeString('vi-VN') : 'Vừa xong'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Danh sách hồ sơ sinh viên</h2>
              <p className="text-[8px] text-gray-500 mt-0.5">Quản lý và phê duyệt hồ sơ xin vào Đảng</p>
            </div>
            <div className="flex items-center gap-1.5 w-full md:w-auto">
              <div className="relative flex-1 md:w-40">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm sinh viên..."
                  className="w-full pl-6 pr-2 py-1 bg-gray-50 border border-gray-100 rounded text-[9px] focus:ring-brand-red focus:border-brand-red transition-all"
                />
              </div>
            </div>
          </div>
          
          <div className="px-3 py-2 border-b border-gray-50 bg-gray-50/30 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'submitted', label: 'Chưa duyệt' },
                { id: 'assigned', label: 'Đã phân kiểm tra' },
                { id: 'approved', label: 'Đã duyệt' },
                { id: 'rejected', label: 'Cần sửa' },
                { id: 'writing_hardcopy', label: 'Đang viết bản cứng' },
                { id: 'verifying_background', label: 'Đang thẩm tra lý lịch' }
              ].map(status => (
                <button
                  key={status.id}
                  onClick={() => setFilterStatus(status.id)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all whitespace-nowrap ${
                    filterStatus === status.id 
                      ? 'bg-brand-red text-white shadow-sm' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-3 py-1.5 text-left text-[8px] font-bold text-gray-400 uppercase tracking-wider">Sinh viên</th>
                  <th className="px-3 py-1.5 text-left text-[8px] font-bold text-gray-400 uppercase tracking-wider">Thông tin học tập</th>
                  <th className="px-3 py-1.5 text-left text-[8px] font-bold text-gray-400 uppercase tracking-wider">Ngày cập nhật</th>
                  <th className="px-3 py-1.5 text-left text-[8px] font-bold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-3 py-1.5 text-right text-[8px] font-bold text-gray-400 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-gray-500 font-medium text-[9px]">
                      <div className="flex flex-col items-center gap-1">
                        <FileText size={16} className="text-gray-200" />
                        Chưa có hồ sơ nào phù hợp
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Link to={`/application/${app.id}?from=${encodeURIComponent(location.search)}`} className="flex items-center gap-1.5 group cursor-pointer">
                          <div className="w-5 h-5 rounded bg-brand-red/5 text-brand-red flex items-center justify-center font-bold text-[8px] group-hover:bg-brand-red group-hover:text-white transition-colors">
                            {(app.basicInfo?.fullName || 'S')[0]}
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-gray-900 group-hover:text-brand-red transition-colors">{app.basicInfo?.fullName || 'Chưa cập nhật'}</p>
                            <p className="text-[8px] text-gray-500">{app.basicInfo?.studentId || 'N/A'}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <p className="text-[9px] text-gray-700 font-medium">{app.basicInfo?.class || 'N/A'}</p>
                        <p className="text-[8px] text-gray-500">{app.basicInfo?.faculty || 'N/A'}</p>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-[8px] text-gray-500 font-medium">
                        {app.updatedAt ? new Date(app.updatedAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`px-1 py-0.5 inline-flex text-[7px] leading-3 font-black uppercase tracking-wider rounded border
                          ${app.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' : 
                            app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' : 
                            app.status === 'submitted' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                            app.status === 'assigned' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                            app.status === 'writing_hardcopy' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                            app.status === 'verifying_background' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                            'bg-gray-50 text-gray-700 border-gray-100'}`}>
                          {app.status === 'approved' ? 'Đã duyệt' : 
                           app.status === 'rejected' ? 'Cần sửa' : 
                           app.status === 'submitted' ? 'Chưa duyệt' : 
                           app.status === 'assigned' ? 'Đã phân kiểm tra' :
                           app.status === 'writing_hardcopy' ? 'Đang viết bản cứng' :
                           app.status === 'verifying_background' ? 'Đang thẩm tra lý lịch' :
                           'Đang soạn'}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right text-[9px] font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <select 
                            className="bg-white border border-gray-200 rounded text-[8px] py-0.5 px-1 font-bold text-gray-700 focus:ring-brand-red focus:border-brand-red transition-all"
                            value={app.status || 'draft'}
                            onChange={(e) => updateStatus(app.id, e.target.value)}
                          >
                            <option value="draft">Đang soạn</option>
                            <option value="submitted">Chưa duyệt</option>
                            <option value="assigned">Đã phân kiểm tra</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="rejected">Yêu cầu sửa</option>
                            <option value="writing_hardcopy">Đang viết bản cứng</option>
                            <option value="verifying_background">Đang thẩm tra lý lịch</option>
                          </select>
                          <Link 
                            to={`/application/${app.id}`}
                            className="p-1 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded transition-all"
                            title="Xem chi tiết"
                          >
                            <ArrowUpRight size={12} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'training' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-50">
            <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Danh sách chưa học cảm tình Đảng</h2>
            <p className="text-[8px] text-gray-500 mt-0.5">Sinh viên cần được ưu tiên cử đi học lớp nhận thức về Đảng</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-3 py-1.5 text-left text-[8px] font-bold text-gray-400 uppercase tracking-wider">Họ và tên</th>
                  <th className="px-3 py-1.5 text-left text-[8px] font-bold text-gray-400 uppercase tracking-wider">MSSV</th>
                  <th className="px-3 py-1.5 text-left text-[8px] font-bold text-gray-400 uppercase tracking-wider">Lớp / Khoa</th>
                  <th className="px-3 py-1.5 text-left text-[8px] font-bold text-gray-400 uppercase tracking-wider">Trạng thái hồ sơ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {applications.filter(app => app.conditions?.hasPartyAwarenessClass === 'false' || app.conditions?.hasPartyAwarenessClass === false).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-3 text-center text-gray-500 font-medium text-[9px]">
                      Tất cả sinh viên đã hoàn thành lớp cảm tình Đảng
                    </td>
                  </tr>
                ) : (
                  applications.filter(app => app.conditions?.hasPartyAwarenessClass === 'false' || app.conditions?.hasPartyAwarenessClass === false).map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap text-[9px] font-bold text-gray-900">
                        {app.basicInfo?.fullName || 'Chưa cập nhật'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-[9px] text-gray-500 font-medium">
                        {app.basicInfo?.studentId || 'Chưa cập nhật'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <p className="text-[9px] text-gray-700 font-medium">{app.basicInfo?.class || 'N/A'}</p>
                        <p className="text-[8px] text-gray-500">{app.basicInfo?.faculty || 'N/A'}</p>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`px-1 py-0.5 inline-flex text-[7px] leading-3 font-black uppercase tracking-wider rounded border ${
                          app.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' : 
                          app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' : 
                          app.status === 'assigned' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          app.status === 'writing_hardcopy' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                          app.status === 'verifying_background' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                          'bg-yellow-50 text-yellow-700 border-yellow-100'
                        }`}>
                          {app.status === 'approved' ? 'Đã duyệt' : 
                           app.status === 'rejected' ? 'Cần sửa' : 
                           app.status === 'assigned' ? 'Đã phân kiểm tra' :
                           app.status === 'writing_hardcopy' ? 'Đang viết bản cứng' :
                           app.status === 'verifying_background' ? 'Đang thẩm tra lý lịch' :
                           app.status === 'submitted' ? 'Chờ duyệt' : 'Đang soạn'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-50">
            <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Quản lý Đảng viên hướng dẫn</h2>
            <p className="text-[8px] text-gray-500 mt-0.5">Cấp quyền cho Đảng viên tham gia hướng dẫn và kiểm tra hồ sơ sinh viên</p>
          </div>
          
          <div className="p-3 bg-gray-50/50 border-b border-gray-50">
            <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
              <div>
                <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email Đảng viên *</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-[10px] focus:ring-brand-red focus:border-brand-red transition-all"
                  placeholder="email@due.udn.vn"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Họ và tên</label>
                <input
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-[10px] focus:ring-brand-red focus:border-brand-red transition-all"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <button
                type="submit"
                disabled={addingAdmin}
                className="bg-brand-red text-white px-2 py-1 rounded font-bold hover:bg-brand-red-dark disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-1 text-[10px] w-full md:w-auto"
              >
                <UserPlus size={12} />
                {addingAdmin ? 'Đang xử lý...' : 'Thêm Đảng viên'}
              </button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-3 py-1.5 text-left text-[8px] font-bold text-gray-400 uppercase tracking-wider">Đảng viên</th>
                  <th className="px-3 py-1.5 text-left text-[8px] font-bold text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-3 py-1.5 text-left text-[8px] font-bold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-3 py-1.5 text-left text-[8px] font-bold text-gray-400 uppercase tracking-wider">Ngày thêm</th>
                  <th className="px-3 py-1.5 text-right text-[8px] font-bold text-gray-400 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {adminEmails.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-3 text-center text-gray-500 font-medium text-[9px]">Chưa có Đảng viên hướng dẫn nào</td>
                  </tr>
                ) : (
                  adminEmails.map((admin) => {
                    const hasRegistered = users.some(u => u.email?.toLowerCase() === admin.email?.toLowerCase());
                    return (
                      <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-3 py-2 whitespace-nowrap text-[9px] font-bold text-gray-900">
                          {admin.fullName || 'Chưa cập nhật'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-[9px] text-gray-500 font-medium">
                          {admin.email}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`px-1 py-0.5 inline-flex text-[7px] leading-3 font-black uppercase tracking-wider rounded border ${hasRegistered ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                            {hasRegistered ? 'Đã đăng ký' : 'Chờ kích hoạt'}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-[9px] text-gray-500 font-medium">
                          {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right text-[9px] font-medium">
                          <button
                            onClick={() => handleRemoveAdmin(admin.id)}
                            className="text-gray-400 hover:text-brand-red p-1 rounded hover:bg-red-50 transition-all text-[8px]"
                            title="Xóa quyền"
                          >
                            Xóa quyền
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-50">
            <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Phân công Đảng viên hướng dẫn</h2>
            <p className="text-[8px] text-gray-500 mt-0.5">Giao hồ sơ cho Đảng viên để thẩm định và hướng dẫn sinh viên</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-3 py-1.5 text-left text-[8px] font-bold text-gray-400 uppercase tracking-wider">Hồ sơ sinh viên</th>
                  <th className="px-3 py-1.5 text-left text-[8px] font-bold text-gray-400 uppercase tracking-wider">MSSV</th>
                  <th className="px-3 py-1.5 text-left text-[8px] font-bold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-3 py-1.5 text-left text-[8px] font-bold text-gray-400 uppercase tracking-wider">Đảng viên hướng dẫn</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {applications.filter(app => app.status !== 'draft').length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-3 text-center text-gray-500 font-medium text-[9px]">Không có hồ sơ nào cần phân công</td>
                  </tr>
                ) : (
                  applications.filter(app => app.status !== 'draft').map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap text-[9px] font-bold text-gray-900">
                        {app.basicInfo?.fullName || 'Chưa cập nhật'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-[9px] text-gray-500 font-medium">
                        {app.basicInfo?.studentId || 'Chưa cập nhật'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`px-1 py-0.5 inline-flex text-[7px] leading-3 font-black uppercase tracking-wider rounded border ${app.assignedTo ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                          {app.assignedTo ? 'Đã phân công' : 'Chưa phân công'}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-[9px] text-gray-500">
                        <select
                          className="bg-white border border-gray-200 rounded text-[8px] py-0.5 px-1 font-bold text-gray-700 focus:ring-brand-red focus:border-brand-red transition-all w-full max-w-xs"
                          value={app.assignedTo || ''}
                          onChange={(e) => assignApplication(app.id, e.target.value)}
                        >
                          <option value="">-- Chọn đảng viên --</option>
                          {users.filter(u => u.role === 'admin').map(admin => (
                            <option key={admin.id} value={admin.id}>
                              {admin.fullName || admin.email}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-50">
            <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Cấu hình biểu mẫu</h2>
            <p className="text-[8px] text-gray-500 mt-0.5">Quản lý danh sách dân tộc, tôn giáo, khoa và các trường dữ liệu</p>
          </div>
          <div className="p-3">
            <FormSettings />
          </div>
        </div>
      )}
    </div>
  );
}