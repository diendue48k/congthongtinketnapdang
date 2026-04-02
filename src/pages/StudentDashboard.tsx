import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { FileText, CheckCircle, Clock, AlertCircle, ArrowRight, Download, User, Calendar, GraduationCap, Eye, X } from 'lucide-react';
import PrintableCV from '../components/PrintableCV';

const SAMPLE_DATA = {
  basicInfo: {
    fullName: "NGUYỄN VĂN A",
    gender: "Nam",
    dob: "01/01/2000",
    birthplace: "Phường X, Quận Y, Thành phố Đà Nẵng",
    hometown: "Xã Z, Huyện W, Tỉnh Quảng Nam",
    permanentAddress: "Số 123 Đường ABC, Phường X, Quận Y, Thành phố Đà Nẵng",
    temporaryAddress: "Ký túc xá Đại học Kinh tế, Đà Nẵng",
    ethnicity: "Kinh",
    religion: "Không",
    job: "Sinh viên",
    education: "12/12",
    degree: "Đang học Đại học",
    foreignLanguage: "Tiếng Anh B1",
    youthUnionJoinDate: "26/03/2015",
    youthUnionJoinPlace: "Trường THPT Lê Quý Đôn",
    cccd: "048200001234",
    cccdDate: "15/05/2021",
    cccdPlace: "Cục Cảnh sát QLHC về TTXH"
  },
  personalHistory: {
    history: [
      {
        startTime: "09/2006",
        endTime: "05/2011",
        content: "Học sinh Trường Tiểu học Nguyễn Du, TP Đà Nẵng"
      },
      {
        startTime: "09/2011",
        endTime: "05/2015",
        content: "Học sinh Trường THCS Trưng Vương, TP Đà Nẵng"
      },
      {
        startTime: "09/2015",
        endTime: "05/2018",
        content: "Học sinh Trường THPT Lê Quý Đôn, TP Đà Nẵng"
      },
      {
        startTime: "09/2018",
        endTime: "Nay",
        content: "Sinh viên Trường Đại học Kinh tế - ĐHĐN"
      }
    ]
  },
  familyHistory: [
    {
      relation: "Cha đẻ",
      fullName: "Nguyễn Văn B",
      birthYear: "1970",
      job: "Giáo viên",
      hometown: "Xã Z, Huyện W, Tỉnh Quảng Nam",
      permanentAddress: "Số 123 Đường ABC, Phường X, Quận Y, Thành phố Đà Nẵng",
      politicalAttitude: "Chấp hành tốt chủ trương, đường lối của Đảng, chính sách pháp luật của Nhà nước.",
      history: [
        {
          startTime: "1990",
          endTime: "Nay",
          content: "Giáo viên Trường THPT Trần Phú, TP Đà Nẵng"
        }
      ]
    },
    {
      relation: "Mẹ đẻ",
      fullName: "Trần Thị C",
      birthYear: "1975",
      job: "Nội trợ",
      hometown: "Phường M, Quận N, Thành phố Đà Nẵng",
      permanentAddress: "Số 123 Đường ABC, Phường X, Quận Y, Thành phố Đà Nẵng",
      politicalAttitude: "Chấp hành tốt chủ trương, đường lối của Đảng, chính sách pháp luật của Nhà nước.",
      history: [
        {
          startTime: "1995",
          endTime: "Nay",
          content: "Làm nội trợ tại gia đình"
        }
      ]
    }
  ],
  selfAssessment: {
    qualities: "Có lập trường tư tưởng chính trị vững vàng, tuyệt đối trung thành với mục tiêu lý tưởng của Đảng. Chấp hành tốt mọi chủ trương, đường lối của Đảng, chính sách pháp luật của Nhà nước.",
    shortcomings: "Còn rụt rè trong các buổi sinh hoạt tập thể đông người. Đôi khi chưa sắp xếp thời gian hợp lý giữa việc học và tham gia phong trào.",
    date: "15/08/2023",
    place: "Đà Nẵng"
  }
};

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSample, setShowSample] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!profile) return;
      try {
        const q = query(collection(db, 'applications'), where('userId', '==', profile.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setApplication({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
        }
      } catch (error) {
        console.error("Error fetching application:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [profile]);

  if (loading) {
    return <div className="text-center py-10">Đang tải dữ liệu...</div>;
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'draft':
        return { text: 'Đang soạn thảo', color: 'text-gray-600', bg: 'bg-gray-100', icon: <FileText size={20} /> };
      case 'submitted':
        return { text: 'Đã nộp, chờ duyệt', color: 'text-blue-600', bg: 'bg-blue-100', icon: <Clock size={20} /> };
      case 'approved':
        return { text: 'Đã được duyệt', color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle size={20} /> };
      case 'rejected':
        return { text: 'Cần chỉnh sửa', color: 'text-red-600', bg: 'bg-red-100', icon: <AlertCircle size={20} /> };
      default:
        return { text: 'Chưa tạo', color: 'text-gray-600', bg: 'bg-gray-100', icon: <FileText size={20} /> };
    }
  };

  const statusDisplay = getStatusDisplay(application?.status);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Chào mừng trở lại, <span className="text-brand-red">{profile?.fullName || 'Sinh viên'}</span>
        </h1>
        <p className="text-gray-500 mt-1 text-base">Hệ thống quản lý hồ sơ kết nạp Đảng - DUE</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Status Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 transition-all hover:shadow-md">
            <div className="h-1.5 bg-brand-red"></div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Hồ sơ xin vào Đảng</h2>
                  <p className="text-gray-500 text-sm">Mẫu 2-KNĐ (Lý lịch người xin vào Đảng)</p>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs ${statusDisplay.bg} ${statusDisplay.color} border border-current/10`}>
                  {statusDisplay.icon}
                  {statusDisplay.text}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                <p className="text-gray-600 leading-relaxed text-sm">
                  Hệ thống hỗ trợ sinh viên kê khai các thông tin cần thiết để xét duyệt kết nạp Đảng. 
                  Dữ liệu của bạn sẽ được bảo mật và chỉ sử dụng cho mục đích thẩm tra lý lịch.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {(!application || application.status === 'draft' || application.status === 'rejected') ? (
                  <Link
                    to="/application"
                    className="inline-flex items-center justify-center px-6 py-3 bg-brand-red text-white font-bold rounded-xl hover:bg-brand-red-dark transition-all shadow-md group text-sm"
                  >
                    {application ? 'Tiếp tục hoàn thiện' : 'Bắt đầu kê khai ngay'}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <Link
                    to="/application"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 border border-gray-200 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm"
                  >
                    Xem chi tiết hồ sơ
                  </Link>
                )}
                
                {application && (
                  <Link
                    to="/application?preview=true"
                    className="inline-flex items-center justify-center px-5 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-all border border-blue-100 text-sm"
                  >
                    <Eye className="mr-2 w-4 h-4" />
                    Xem trước Lý lịch
                  </Link>
                )}

                <button
                  onClick={() => setShowSample(true)}
                  className="inline-flex items-center justify-center px-5 py-3 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all border border-gray-200 text-sm"
                >
                  <FileText className="mr-2 w-4 h-4" />
                  Xem file mẫu 2-KNĐ
                </button>
              </div>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <GraduationCap size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Thông tin học tập</h3>
                <p className="text-xs text-gray-500 mt-1">Lớp: {profile?.class || 'Chưa cập nhật'}</p>
                <p className="text-xs text-gray-500">Khoa: {profile?.faculty || 'Chưa cập nhật'}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-3">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Thời gian cập nhật</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {application?.updatedAt 
                    ? `Lần cuối: ${new Date(application.updatedAt).toLocaleDateString('vi-VN')}`
                    : 'Chưa có dữ liệu'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-brand-red to-red-700 rounded-2xl p-5 text-white shadow-md">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2">
              <AlertCircle size={18} />
              Lưu ý quan trọng
            </h3>
            <ul className="space-y-2 text-xs text-red-50 opacity-90">
              <li className="flex gap-2">
                <span className="font-bold">•</span>
                Khai trung thực, đầy đủ các mục theo hướng dẫn.
              </li>
              <li className="flex gap-2">
                <span className="font-bold">•</span>
                Các mốc thời gian trong lịch sử bản thân phải liên tục.
              </li>
              <li className="flex gap-2">
                <span className="font-bold">•</span>
                Kiểm tra kỹ thông tin người thân (Lịch sử gia đình).
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sample Modal */}
      {showSample && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-gray-100 rounded-xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-3 bg-white border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900">Mẫu tham khảo (2-KNĐ)</h3>
              <button 
                onClick={() => setShowSample(false)}
                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-200">
              <PrintableCV data={SAMPLE_DATA} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
