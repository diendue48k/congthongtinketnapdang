import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';
import BasicInfoForm from '../components/forms/BasicInfoForm';
import ConditionsForm from '../components/forms/ConditionsForm';
import PersonalHistoryForm from '../components/forms/PersonalHistoryForm';
import FamilyHistoryForm from '../components/forms/FamilyHistoryForm';
import OtherInfoForm from '../components/forms/OtherInfoForm';
import SelfAssessmentForm from '../components/forms/SelfAssessmentForm';
import PrintableCV from '../components/PrintableCV';
import { Eye, X, Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const STEPS = [
  'Thông tin cơ bản',
  'Điều kiện kết nạp',
  'Lịch sử bản thân',
  'Lịch sử gia đình',
  'Thông tin khác',
  'Tự nhận xét'
];

const getFieldLabel = (path: string) => {
  const parts = path.split('.');
  const section = parts[0];

  if (section === 'basicInfo') {
    const labels: Record<string, string> = {
      profilePhotoUrl: 'Link ảnh thẻ',
      studentId: 'Mã số sinh viên',
      cccd: 'Căn cước công dân',
      fullName: 'Họ và tên',
      dob: 'Ngày sinh',
      class: 'Lớp',
      faculty: 'Khoa',
      gender: 'Giới tính',
      ethnicity: 'Dân tộc',
      religion: 'Tôn giáo',
      zaloPhone: 'Số điện thoại Zalo',
      facebookLink: 'Link Facebook',
      email: 'Email',
      permanentAddress: 'Nơi thường trú',
      temporaryAddress: 'Nơi tạm trú',
      hometown: 'Quê quán',
      birthplace: 'Nơi sinh',
      youthUnionJoinDate: 'Ngày vào Đoàn',
      youthUnionJoinPlace: 'Nơi vào Đoàn',
      discipline: 'Kỷ luật'
    };
    return `Thông tin cơ bản - ${labels[parts[1]] || parts[1]}`;
  }

  if (section === 'conditions') {
    if (parts[1] === 'trainingClasses') {
      const fieldLabels: Record<string, string> = {
        name: 'Ngành học hoặc tên lớp học',
        schoolName: 'Tên trường/Lớp tổ chức',
        startDate: 'Học từ ngày',
        endDate: 'Học đến ngày',
        type: 'Hình thức học',
        certificate: 'Văn bằng, chứng chỉ, trình độ gì',
        certificateUrl: 'Link minh chứng'
      };
      return `Điều kiện kết nạp - Lớp đào tạo, bồi dưỡng - ${fieldLabels[parts[3]] || parts[3]}`;
    }
    if (parts[1] === 'academicTranscriptUrl') return 'Điều kiện kết nạp - Link Bảng điểm học tập, rèn luyện';
    if (parts[1] === 'residenceProof') {
      const fieldLabels: Record<string, string> = {
        type: 'Loại hình cư trú',
        fileUrl: 'Link minh chứng cư trú'
      };
      return `Điều kiện kết nạp - Minh chứng cư trú tại Đà Nẵng - ${fieldLabels[parts[2]] || parts[2]}`;
    }
    if (parts[1] === 'academicScores') {
      const fieldLabels: Record<string, string> = {
        semester: 'Kỳ/Năm học',
        academicScore: 'Điểm học tập',
        trainingScore: 'Điểm rèn luyện'
      };
      return `Điều kiện kết nạp - Điểm học tập (Kỳ ${parseInt(parts[2]) + 1}) - ${fieldLabels[parts[3]] || parts[3]}`;
    }
    if (parts[1] === 'certificates') {
      const fieldLabels: Record<string, string> = {
        monthYear: 'Tháng/Năm cấp',
        name: 'Tên giấy khen',
        issuer: 'Đơn vị cấp',
        fileUrl: 'Link minh chứng'
      };
      return `Điều kiện kết nạp - Minh chứng (${parseInt(parts[2]) + 1}) - ${fieldLabels[parts[3]] || parts[3]}`;
    }
  }

  if (section === 'personalHistory') {
    const fieldLabels: Record<string, string> = {
      timeRange: 'Thời gian',
      description: 'Nội dung'
    };
    return `Lịch sử bản thân - Giai đoạn ${parseInt(parts[1]) + 1} - ${fieldLabels[parts[2]] || parts[2]}`;
  }

  if (section === 'familyHistory') {
    if (parts.length === 3) {
      const fieldLabels: Record<string, string> = {
        relation: 'Quan hệ',
        fullName: 'Họ và tên',
        birthYear: 'Năm sinh',
        deathYear: 'Năm mất',
        hometown: 'Quê quán',
        birthplace: 'Nơi sinh',
        permanentAddress: 'Nơi thường trú',
        religion: 'Tôn giáo',
        ethnicity: 'Dân tộc',
        nationality: 'Quốc tịch',
        job: 'Nghề nghiệp',
        cccd: 'CCCD',
        partyDetails: 'Thông tin Đảng viên',
        rewards: 'Khen thưởng',
        politicalAttitude: 'Thái độ chính trị'
      };
      return `Lịch sử gia đình - Người thân ${parseInt(parts[1]) + 1} - ${fieldLabels[parts[2]] || parts[2]}`;
    }
    if (parts.length === 4 && parts[2] === 'history') {
      return `Lịch sử gia đình - Người thân ${parseInt(parts[1]) + 1} - Quá trình công tác (Giai đoạn ${parseInt(parts[3]) + 1})`;
    }
  }

  return path;
};

export default function ApplicationForm() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    basicInfo: {},
    conditions: { academicScores: [], certificates: [] },
    personalHistory: [],
    familyHistory: [],
    otherInfo: {},
    selfAssessment: {},
    fieldFeedback: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [showPreview, setShowPreview] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('preview') === 'true';
  });
  const formRef = React.useRef<any>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!profile) return;
      try {
        if (id) {
          // Fetch specific application for admin
          const docRef = doc(db, 'applications', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setApplicationId(docSnap.id);
            setFormData({ ...formData, ...docSnap.data() });
          }
        } else {
          // Fetch user's application
          const q = query(collection(db, 'applications'), where('userId', '==', profile.uid));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            setApplicationId(doc.id);
            setFormData({ ...formData, ...doc.data() });
          }
        }
      } catch (error) {
        console.error("Error fetching application:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [profile, id]);

  const handleDownloadPDF = async () => {
    const element = document.querySelector('.printable-cv');
    if (!element) return;
    
    setDownloadingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pages = element.querySelectorAll('.pdf-page');
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        const canvas = await html2canvas(page, { 
          scale: 2, 
          useCORS: true,
          logging: false
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }
      
      pdf.save(`LyLich_${formData.basicInfo?.fullName?.replace(/\s+/g, '_') || 'DangVien'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleFeedbackChange = (fieldPath: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      fieldFeedback: {
        ...(prev.fieldFeedback || {}),
        [fieldPath]: value
      }
    }));
  };

  const handleSave = async (stepData: any, isSubmit = false, stayOnStep = false, nextStep?: number) => {
    if (!profile) return;
    setSaving(true);
    
    try {
      const updatedData = { ...formData, ...stepData };
      setFormData(updatedData);

      const appData = {
        userId: id ? formData.userId : profile.uid,
        status: isSubmit ? 'submitted' : (formData.status || 'draft'),
        createdAt: formData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...updatedData
      };

      let docRef;
      if (applicationId) {
        docRef = doc(db, 'applications', applicationId);
      } else {
        docRef = doc(collection(db, 'applications'));
        setApplicationId(docRef.id);
      }

      await setDoc(docRef, appData);
      setLastSaved(new Date().toLocaleTimeString());
      
      // Sync fullName and studentId to users collection if we are on step 0 (Basic Info)
      if (currentStep === 0 && stepData.basicInfo && !id) {
        const userDocRef = doc(db, 'users', profile.uid);
        const profileUpdate: any = {};
        if (stepData.basicInfo.fullName) profileUpdate.fullName = stepData.basicInfo.fullName.toUpperCase();
        if (stepData.basicInfo.studentId) profileUpdate.studentId = stepData.basicInfo.studentId;
        
        if (Object.keys(profileUpdate).length > 0) {
          await setDoc(userDocRef, profileUpdate, { merge: true });
        }
      }
      
      if (isSubmit) {
        navigate('/');
      } else if (typeof nextStep === 'number') {
        setCurrentStep(nextStep);
      } else if (!stayOnStep && currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'applications');
    } finally {
      setSaving(false);
    }
  };

  const navigateToStep = async (index: number) => {
    if (index === currentStep) return;
    
    // If admin, just navigate
    if (profile?.role === 'admin') {
      setCurrentStep(index);
      return;
    }

    // For students, we want to save current step if possible
    // Since we can't easily trigger child form submit from here without complex refs,
    // we'll just allow navigation if they've already moved past this step or if it's the next step.
    // The "Lưu & Tiếp tục" button is the primary way to move forward.
    setCurrentStep(index);
  };

  const handleDataChange = React.useCallback((section: string, data: any) => {
    setFormData((prev: any) => {
      // Deep comparison to prevent unnecessary state updates and loops
      if (JSON.stringify(prev[section]) === JSON.stringify(data)) {
        return prev;
      }
      return {
        ...prev,
        [section]: data
      };
    });
  }, []);

  if (loading) {
    return <div className="text-center py-10">Đang tải biểu mẫu...</div>;
  }

  const fieldFeedbackEntries = Object.entries(formData.fieldFeedback || {}).filter(([_, value]) => value && (value as string).trim() !== '');

  const isStepComplete = (index: number) => {
    switch (index) {
      case 0: // Basic Info
        return !!(formData.basicInfo?.fullName && formData.basicInfo?.studentId && formData.basicInfo?.cccd && formData.basicInfo?.dob);
      case 1: // Conditions
        const hasPartyClass = formData.conditions?.hasPartyAwarenessClass === 'true' || formData.conditions?.hasPartyAwarenessClass === true;
        const partyClassComplete = hasPartyClass ? formData.conditions?.trainingClasses?.length > 0 : true;
        return !!(partyClassComplete && formData.conditions?.academicScores?.length > 0 && formData.conditions?.residenceProof?.fileUrl);
      case 2: // Personal History
        return !!(formData.personalHistory?.history?.length > 0 && formData.personalHistory?.jobHistory?.length > 0);
      case 3: // Family History
        return !!(formData.familyHistory?.length > 0);
      case 4: // Other Info
        return !!(formData.otherInfo?.historicalCharacteristics);
      case 5: // Self Assessment
        return !!(formData.selfAssessment?.qualities && formData.selfAssessment?.shortcomings);
      default:
        return false;
    }
  };

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-8">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tiến trình hồ sơ</h2>
              {saving ? (
                <span className="text-[10px] text-brand-red animate-pulse font-medium">Đang lưu...</span>
              ) : lastSaved && (
                <span className="text-[10px] text-gray-400 font-medium">Đã lưu {lastSaved}</span>
              )}
            </div>
            <nav className="space-y-1.5">
              {STEPS.map((step, index) => {
                const complete = isStepComplete(index);
                return (
                <button
                  key={step}
                  onClick={() => navigateToStep(index)}
                  disabled={index > currentStep && profile?.role !== 'admin'}
                  className={`w-full flex items-center p-3 rounded-xl transition-all text-left group relative
                    ${index === currentStep 
                      ? 'bg-red-50 text-brand-red shadow-sm' 
                      : index < currentStep 
                        ? 'text-gray-700 hover:bg-gray-50' 
                        : 'text-gray-300 cursor-not-allowed opacity-60'}`}
                >
                  {index === currentStep && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-red rounded-r-full"></div>
                  )}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mr-3 shrink-0 transition-colors
                    ${index === currentStep 
                      ? 'bg-brand-red text-white' 
                      : index < currentStep 
                        ? (complete ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600')
                        : 'bg-gray-100 text-gray-400'}`}>
                    {index < currentStep ? (
                      complete ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span title="Chưa hoàn thành">!</span>
                      )
                    ) : index + 1}
                  </div>
                  <span className={`text-sm transition-all ${index === currentStep ? 'font-bold' : 'font-medium'}`}>{step}</span>
                  {index < currentStep && !complete && (
                    <span className="ml-auto text-[10px] text-yellow-600 font-medium bg-yellow-100 px-2 py-0.5 rounded-full">Thiếu TT</span>
                  )}
                </button>
              )})}
            </nav>
            
            <div className="mt-8 pt-6 border-t border-gray-50 px-2">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase mb-2">
                  <span>Hoàn thành</span>
                  <span>{Math.round(((currentStep + 1) / STEPS.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-brand-red h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:w-3/4">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Hồ sơ xin vào Đảng</h1>
              <div className="flex gap-2">
                {(formData.status === 'submitted' || formData.status === 'approved' || profile?.role === 'admin') && (
                  <button
                    onClick={() => setShowPreview(true)}
                    className="text-white bg-blue-600 hover:bg-blue-700 flex items-center text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-all"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Xem trước Lý lịch
                  </button>
                )}
                {profile?.role === 'admin' && (
                  <button 
                    onClick={() => navigate('/')}
                    className="text-gray-600 hover:text-gray-900 flex items-center text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm transition-all"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Quay lại danh sách
                  </button>
                )}
              </div>
            </div>
            
            {(formData.feedback || fieldFeedbackEntries.length > 0) && profile?.role !== 'admin' && (
              <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl shadow-sm">
                <h3 className="text-lg font-medium text-red-800">Nhận xét từ Ban quản trị:</h3>
                {formData.feedback && (
                  <p className="mt-2 text-sm text-red-700 whitespace-pre-wrap">{formData.feedback}</p>
                )}
                {fieldFeedbackEntries.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-red-800">Các mục cần điều chỉnh chi tiết:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      {fieldFeedbackEntries.map(([path, feedback]) => (
                        <li key={path} className="text-sm text-red-700">
                          <span className="font-medium">{getFieldLabel(path)}:</span> {feedback as string}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {profile?.role === 'admin' && (
              <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-yellow-800">Nhận xét / Yêu cầu điều chỉnh:</h3>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
                    <select 
                      className="border border-gray-300 rounded-lg text-sm p-1.5 bg-white focus:ring-2 focus:ring-yellow-500 outline-none"
                      value={formData.status || 'draft'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="draft">Đang soạn</option>
                      <option value="submitted">Chờ duyệt</option>
                      <option value="approved">Đã duyệt</option>
                      <option value="rejected">Yêu cầu sửa</option>
                    </select>
                  </div>
                </div>
                <textarea
                  className="w-full p-3 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                  rows={3}
                  value={formData.feedback || ''}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  placeholder="Nhập nhận xét chung hoặc yêu cầu sinh viên điều chỉnh..."
                />
                {fieldFeedbackEntries.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-yellow-200">
                    <h4 className="text-sm font-semibold text-yellow-800 mb-2">Danh sách các mục đã yêu cầu sửa chi tiết:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {fieldFeedbackEntries.map(([path, feedback]) => (
                        <li key={path} className="text-sm text-yellow-700">
                          <span className="font-medium">{getFieldLabel(path)}:</span> {feedback as string}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => handleSave({ feedback: formData.feedback, status: formData.status, fieldFeedback: formData.fieldFeedback }, false, true)}
                    disabled={saving}
                    className="bg-yellow-600 text-white px-5 py-2.5 rounded-xl hover:bg-yellow-700 transition-all text-sm font-bold shadow-md shadow-yellow-900/10"
                  >
                    {saving ? 'Đang lưu...' : 'Lưu nhận xét & Trạng thái'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-red"></div>
            {currentStep === 0 && (
              <BasicInfoForm 
                initialData={formData.basicInfo} 
                onSave={(data) => handleSave({ basicInfo: data })} 
                onDataChange={(data) => handleDataChange('basicInfo', data)}
                saving={saving}
                isAdmin={profile?.role === 'admin'}
                fieldFeedback={formData.fieldFeedback || {}}
                onFeedbackChange={handleFeedbackChange}
              />
            )}
            {currentStep === 1 && (
              <ConditionsForm 
                initialData={formData.conditions} 
                basicInfo={formData.basicInfo}
                onSave={(data) => handleSave({ conditions: data })} 
                onDataChange={(data) => handleDataChange('conditions', data)}
                onBack={() => setCurrentStep(0)}
                saving={saving}
                isAdmin={profile?.role === 'admin'}
                fieldFeedback={formData.fieldFeedback || {}}
                onFeedbackChange={handleFeedbackChange}
              />
            )}
            {currentStep === 2 && (
              <PersonalHistoryForm 
                initialData={formData.personalHistory} 
                onSave={(data) => handleSave({ personalHistory: data })} 
                onDataChange={(data) => handleDataChange('personalHistory', data)}
                onBack={() => setCurrentStep(1)}
                saving={saving}
                isAdmin={profile?.role === 'admin'}
                fieldFeedback={formData.fieldFeedback || {}}
                onFeedbackChange={handleFeedbackChange}
              />
            )}
            {currentStep === 3 && (
              <FamilyHistoryForm 
                initialData={formData.familyHistory} 
                onSave={(data) => handleSave({ familyHistory: data })} 
                onDataChange={(data) => handleDataChange('familyHistory', data)}
                onBack={() => setCurrentStep(2)}
                saving={saving}
                isAdmin={profile?.role === 'admin'}
                fieldFeedback={formData.fieldFeedback || {}}
                onFeedbackChange={handleFeedbackChange}
              />
            )}
            {currentStep === 4 && (
              <OtherInfoForm 
                initialData={formData.otherInfo} 
                onSave={(data) => handleSave({ otherInfo: data })} 
                onDataChange={(data) => handleDataChange('otherInfo', data)}
                onBack={() => setCurrentStep(3)}
                saving={saving}
                isAdmin={profile?.role === 'admin'}
                fieldFeedback={formData.fieldFeedback || {}}
                onFeedbackChange={handleFeedbackChange}
              />
            )}
            {currentStep === 5 && (
              <SelfAssessmentForm 
                initialData={formData.selfAssessment} 
                onSave={(data) => handleSave({ selfAssessment: data }, true)} 
                onDataChange={(data) => handleDataChange('selfAssessment', data)}
                onBack={() => setCurrentStep(4)}
                saving={saving}
                isAdmin={profile?.role === 'admin'}
                fieldFeedback={formData.fieldFeedback || {}}
                onFeedbackChange={handleFeedbackChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-gray-100 rounded-xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Xem trước Lý lịch (Mẫu 2-KNĐ)</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloadingPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {downloadingPDF ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang tạo PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Tải file PDF
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 md:p-8 bg-gray-200">
              <PrintableCV data={formData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}