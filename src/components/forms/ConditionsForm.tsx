import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import FieldFeedback from '../FieldFeedback';
import { useFormConfig } from '../../contexts/FormConfigContext';

interface ConditionsFormProps {
  initialData: any;
  basicInfo?: any;
  onSave: (data: any, isSubmit?: boolean, stayOnStep?: boolean) => void;
  onDataChange?: (data: any) => void;
  onBack: () => void;
  saving: boolean;
  isAdmin?: boolean;
  fieldFeedback?: Record<string, string>;
  onFeedbackChange?: (fieldPath: string, value: string) => void;
}

export default function ConditionsForm({ initialData, basicInfo, onSave, onDataChange, onBack, saving, isAdmin = false, fieldFeedback = {}, onFeedbackChange }: ConditionsFormProps) {
  const { config } = useFormConfig();
  const { register, control, trigger, formState: { errors: formErrors }, watch } = useForm<any>({
    mode: 'onChange',
    defaultValues: {
      hasPartyAwarenessClass: initialData?.hasPartyAwarenessClass ?? true,
      trainingClasses: initialData?.trainingClasses?.length > 0 ? initialData.trainingClasses : (
        initialData?.partyAwarenessClass ? [{
          name: 'Lớp bồi dưỡng nhận thức về Đảng',
          schoolName: initialData.partyAwarenessClass.schoolName || '',
          startDate: initialData.partyAwarenessClass.startDate || '',
          endDate: initialData.partyAwarenessClass.endDate || '',
          type: 'Tập trung',
          certificate: 'Giấy chứng nhận',
          certificateUrl: initialData.partyAwarenessClass.certificateUrl || ''
        }] : [{
          name: 'Lớp bồi dưỡng nhận thức về Đảng',
          schoolName: '',
          startDate: '',
          endDate: '',
          type: 'Tập trung',
          certificate: 'Giấy chứng nhận',
          certificateUrl: ''
        }]
      ),
      academicScores: initialData?.academicScores?.length > 0 ? initialData.academicScores : [
        { semester: '', academicScore: '', trainingScore: '' },
        { semester: '', academicScore: '', trainingScore: '' }
      ],
      academicTranscriptUrl: initialData?.academicTranscriptUrl || '',
      certificates: initialData?.certificates?.length > 0 ? initialData.certificates : [
        { monthYear: '', name: '', issuer: '', fileUrl: '' },
        { monthYear: '', name: '', issuer: '', fileUrl: '' }
      ],
      residenceProof: initialData?.residenceProof || {
        type: '',
        fileUrl: ''
      }
    }
  });

  const watchedData = watch();
  const lastDataRef = React.useRef(JSON.stringify(watchedData));

  React.useEffect(() => {
    const currentDataStr = JSON.stringify(watchedData);
    if (onDataChange && currentDataStr !== lastDataRef.current) {
      lastDataRef.current = currentDataStr;
      onDataChange(watchedData);
    }
  }, [watchedData, onDataChange]);

  const errors = formErrors as any;

  const residenceProof = watch('residenceProof');
  const hasPartyAwarenessClass = watch('hasPartyAwarenessClass');

  const { fields: scoreFields, move: moveScore } = useFieldArray({
    control,
    name: "academicScores"
  });

  const { fields: certFields, append: appendCert, remove: removeCert, move: moveCert } = useFieldArray({
    control,
    name: "certificates"
  });

  const { fields: trainingFields, append: appendTraining, remove: removeTraining } = useFieldArray({
    control,
    name: "trainingClasses"
  });

  const [draggedScoreIndex, setDraggedScoreIndex] = useState<number | null>(null);
  const [draggedCertIndex, setDraggedCertIndex] = useState<number | null>(null);

  const extractCurrentProvince = (address: string) => {
    if (!address) return '(Chưa nhập)';
    const currentPart = address.split('(')[0].trim();
    const parts = currentPart.split(',');
    return parts[parts.length - 1].trim();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '(Chưa nhập)';
    const [year, month, day] = dateString.split('-');
    if (year && month && day) return `${day}/${month}/${year}`;
    return dateString;
  };

  const getFieldConfig = (fieldId: string, defaultLabel: string) => {
    const fieldConfig = config.fields[fieldId];
    return {
      label: fieldConfig?.label || defaultLabel,
      placeholder: fieldConfig?.placeholder || '',
      required: fieldConfig?.required !== false,
      hidden: fieldConfig?.hidden === true,
    };
  };

  const trainingClassesConfig = getFieldConfig('conditions.trainingClasses', 'Những lớp đào tạo, bồi dưỡng đã qua');
  const academicScoresConfig = getFieldConfig('conditions.academicScores', 'Điểm học tập và rèn luyện');

  return (
    <form className="space-y-8">
      {!trainingClassesConfig.hidden && (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">{trainingClassesConfig.label}</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bạn đã học lớp bồi dưỡng nhận thức về Đảng chưa?</label>
          <div className="flex gap-6">
            <label className="flex items-center">
              <input 
                type="radio" 
                {...register('hasPartyAwarenessClass')} 
                value="true"
                className="mr-2 text-brand-red focus:ring-brand-red" 
              /> 
              Đã học
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                {...register('hasPartyAwarenessClass')} 
                value="false"
                className="mr-2 text-brand-red focus:ring-brand-red" 
              /> 
              Chưa học (Đăng ký học)
            </label>
          </div>
        </div>

        {String(hasPartyAwarenessClass) === 'true' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700">Danh sách các lớp đào tạo, bồi dưỡng</h4>
              <button
                type="button"
                onClick={() => appendTraining({ name: '', schoolName: '', startDate: '', endDate: '', type: '', certificate: '', certificateUrl: '' })}
                className="flex items-center gap-1 text-sm text-brand-red hover:text-brand-red-dark bg-red-50 px-3 py-1 rounded-md"
              >
                <Plus size={16} /> Thêm lớp
              </button>
            </div>
            {trainingFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md border border-gray-200 relative">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeTraining(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ngành học hoặc tên lớp học *</label>
                  <input
                    {...register(`trainingClasses.${index}.name` as const, { required: 'Bắt buộc' })}
                    placeholder="Lớp bồi dưỡng nhận thức về Đảng..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red focus:border-brand-red"
                  />
                  <FieldFeedback fieldPath={`conditions.trainingClasses.${index}.name`} feedback={fieldFeedback[`conditions.trainingClasses.${index}.name`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tên trường, cấp phụ trách *</label>
                  <input
                    {...register(`trainingClasses.${index}.schoolName` as const, { required: 'Bắt buộc' })}
                    placeholder="Trường Đại học..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red focus:border-brand-red"
                  />
                  <FieldFeedback fieldPath={`conditions.trainingClasses.${index}.schoolName`} feedback={fieldFeedback[`conditions.trainingClasses.${index}.schoolName`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Học từ ngày *</label>
                  <input
                    type="date"
                    {...register(`trainingClasses.${index}.startDate` as const, { required: 'Bắt buộc' })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red focus:border-brand-red"
                  />
                  <FieldFeedback fieldPath={`conditions.trainingClasses.${index}.startDate`} feedback={fieldFeedback[`conditions.trainingClasses.${index}.startDate`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Học đến ngày *</label>
                  <input
                    type="date"
                    {...register(`trainingClasses.${index}.endDate` as const, { required: 'Bắt buộc' })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red focus:border-brand-red"
                  />
                  <FieldFeedback fieldPath={`conditions.trainingClasses.${index}.endDate`} feedback={fieldFeedback[`conditions.trainingClasses.${index}.endDate`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hình thức học *</label>
                  <input
                    {...register(`trainingClasses.${index}.type` as const, { required: 'Bắt buộc' })}
                    placeholder="Tập trung, không tập trung..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red focus:border-brand-red"
                  />
                  <FieldFeedback fieldPath={`conditions.trainingClasses.${index}.type`} feedback={fieldFeedback[`conditions.trainingClasses.${index}.type`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Văn bằng, chứng chỉ, trình độ gì *</label>
                  <input
                    {...register(`trainingClasses.${index}.certificate` as const, { required: 'Bắt buộc' })}
                    placeholder="Giấy chứng nhận..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red focus:border-brand-red"
                  />
                  <FieldFeedback fieldPath={`conditions.trainingClasses.${index}.certificate`} feedback={fieldFeedback[`conditions.trainingClasses.${index}.certificate`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                </div>
                <div className="md:col-span-2 mt-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Link minh chứng (Google Drive) *</label>
                  <input
                    type="url"
                    {...register(`trainingClasses.${index}.certificateUrl` as const, { required: 'Bắt buộc nhập link minh chứng' })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red focus:border-brand-red"
                    placeholder="https://drive.google.com/file/d/..."
                  />
                  {errors.trainingClasses?.[index]?.certificateUrl && <p className="text-red-500 text-xs mt-1">{errors.trainingClasses[index].certificateUrl.message as string}</p>}
                  <FieldFeedback fieldPath={`conditions.trainingClasses.${index}.certificateUrl`} feedback={fieldFeedback[`conditions.trainingClasses.${index}.certificateUrl`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Thông tin đăng ký học Lớp bồi dưỡng nhận thức về Đảng</h4>
            <p className="text-sm text-blue-800 mb-4">Các thông tin sau sẽ được lấy từ hồ sơ Thông tin cơ bản của bạn để đăng ký:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div><span className="font-medium text-gray-600">Họ và tên:</span> <span className="font-semibold">{basicInfo?.fullName || '(Chưa nhập)'}</span></div>
              <div><span className="font-medium text-gray-600">Ngày sinh:</span> <span className="font-semibold">{formatDate(basicInfo?.dob)}</span></div>
              <div><span className="font-medium text-gray-600">Lớp:</span> <span className="font-semibold">{basicInfo?.class || '(Chưa nhập)'}</span></div>
              <div><span className="font-medium text-gray-600">Khoa:</span> <span className="font-semibold">{basicInfo?.faculty || '(Chưa nhập)'}</span></div>
              <div><span className="font-medium text-gray-600">MSSV:</span> <span className="font-semibold">{basicInfo?.studentId || '(Chưa nhập)'}</span></div>
              <div><span className="font-medium text-gray-600">Số CCCD:</span> <span className="font-semibold">{basicInfo?.cccd || '(Chưa nhập)'}</span></div>
              <div><span className="font-medium text-gray-600">Email:</span> <span className="font-semibold">{basicInfo?.email || '(Chưa nhập)'}</span></div>
              <div><span className="font-medium text-gray-600">SĐT (Zalo):</span> <span className="font-semibold">{basicInfo?.zaloPhone || '(Chưa nhập)'}</span></div>
              <div><span className="font-medium text-gray-600">Quê quán:</span> <span className="font-semibold">{extractCurrentProvince(basicInfo?.hometown)}</span></div>
              <div><span className="font-medium text-gray-600">Nơi sinh:</span> <span className="font-semibold">{extractCurrentProvince(basicInfo?.birthplace)}</span></div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-sm text-blue-800 font-medium">Bạn có muốn điều chỉnh thông tin nào ở trên không?</p>
              <p className="text-xs text-blue-600 mt-1">Nếu có, vui lòng quay lại bước "Thông tin cơ bản" để cập nhật.</p>
            </div>
          </div>
        )}
      </div>
      )}

      {!academicScoresConfig.hidden && (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">{academicScoresConfig.label}</h3>
        <p className="text-sm text-gray-500 mb-4">Kê khai theo bảng 2 kỳ gần nhất, liên tiếp nhau.</p>
        
        <div className="space-y-4">
          {scoreFields.map((field, index) => (
            <div 
              key={field.id} 
              draggable
              onDragStart={() => setDraggedScoreIndex(index)}
              onDragEnter={(e) => e.preventDefault()}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggedScoreIndex !== null && draggedScoreIndex !== index) {
                  moveScore(draggedScoreIndex, index);
                  setDraggedScoreIndex(index);
                }
              }}
              onDragEnd={() => setDraggedScoreIndex(null)}
              className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-md border transition-colors ${draggedScoreIndex === index ? 'bg-gray-100 border-gray-400 opacity-50' : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="md:col-span-1 flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                <GripVertical size={20} />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Kỳ - Năm học *</label>
                <input
                  {...register(`academicScores.${index}.semester` as const, { required: 'Bắt buộc' })}
                  placeholder="Kỳ 1 - Năm học 2024-2025"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red focus:border-brand-red"
                />
                <FieldFeedback fieldPath={`conditions.academicScores.${index}.semester`} feedback={fieldFeedback[`conditions.academicScores.${index}.semester`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
              </div>
              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Điểm học tập *</label>
                <input
                  type="number"
                  step="0.01"
                  {...register(`academicScores.${index}.academicScore` as const, { required: 'Bắt buộc', min: 0, max: 4 })}
                  placeholder="Hệ 4.0"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red focus:border-brand-red"
                />
                <FieldFeedback fieldPath={`conditions.academicScores.${index}.academicScore`} feedback={fieldFeedback[`conditions.academicScores.${index}.academicScore`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
              </div>
              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Điểm rèn luyện *</label>
                <input
                  type="number"
                  {...register(`academicScores.${index}.trainingScore` as const, { required: 'Bắt buộc', min: 0, max: 100 })}
                  placeholder="Thang 100"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red focus:border-brand-red"
                />
                <FieldFeedback fieldPath={`conditions.academicScores.${index}.trainingScore`} feedback={fieldFeedback[`conditions.academicScores.${index}.trainingScore`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
          <label className="block text-xs font-medium text-gray-700 mb-1">Link Bảng điểm học tập, rèn luyện (Google Drive) *</label>
          <input
            type="url"
            {...register('academicTranscriptUrl', { required: 'Bắt buộc nhập link bảng điểm' })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red focus:border-brand-red"
            placeholder="https://drive.google.com/file/d/..."
          />
          {errors.academicTranscriptUrl && <p className="text-red-500 text-xs mt-1">{errors.academicTranscriptUrl.message as string}</p>}
          <FieldFeedback fieldPath="conditions.academicTranscriptUrl" feedback={fieldFeedback['conditions.academicTranscriptUrl']} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
        </div>
      </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-medium text-gray-900">Minh chứng tham gia hoạt động</h3>
          <button
            type="button"
            onClick={() => {
              if (certFields.length < 5) {
                appendCert({ monthYear: '', name: '', issuer: '' });
              }
            }}
            disabled={certFields.length >= 5}
            className="flex items-center gap-1 text-sm text-brand-red hover:text-brand-red-dark disabled:opacity-50"
          >
            <Plus size={16} /> Thêm minh chứng
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Kê khai từ 02-05 giấy chứng nhận/giấy khen.</p>
        
        <div className="space-y-4">
          {certFields.map((field, index) => (
            <div 
              key={field.id} 
              draggable
              onDragStart={() => setDraggedCertIndex(index)}
              onDragEnter={(e) => e.preventDefault()}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggedCertIndex !== null && draggedCertIndex !== index) {
                  moveCert(draggedCertIndex, index);
                  setDraggedCertIndex(index);
                }
              }}
              onDragEnd={() => setDraggedCertIndex(null)}
              className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-md border relative transition-colors ${draggedCertIndex === index ? 'bg-gray-100 border-gray-400 opacity-50' : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="md:col-span-1 flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                <GripVertical size={20} />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Tháng/Năm cấp *</label>
                <input
                  type="month"
                  {...register(`certificates.${index}.monthYear` as const, { required: 'Bắt buộc' })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red focus:border-brand-red"
                />
                <FieldFeedback fieldPath={`conditions.certificates.${index}.monthYear`} feedback={fieldFeedback[`conditions.certificates.${index}.monthYear`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
              </div>
              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Tên giấy khen/chứng nhận *</label>
                <input
                  {...register(`certificates.${index}.name` as const, { required: 'Bắt buộc' })}
                  placeholder="Giấy khen Sinh viên 5 tốt"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red focus:border-brand-red"
                />
                <FieldFeedback fieldPath={`conditions.certificates.${index}.name`} feedback={fieldFeedback[`conditions.certificates.${index}.name`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
              </div>
              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Đơn vị ra quyết định *</label>
                <input
                  {...register(`certificates.${index}.issuer` as const, { required: 'Bắt buộc' })}
                  placeholder="Hội Sinh viên Trường..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red focus:border-brand-red"
                />
                <FieldFeedback fieldPath={`conditions.certificates.${index}.issuer`} feedback={fieldFeedback[`conditions.certificates.${index}.issuer`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
              </div>
              <div className="md:col-span-11">
                <label className="block text-xs font-medium text-gray-700 mb-1">Link minh chứng (Google Drive) *</label>
                <input
                  type="url"
                  {...register(`certificates.${index}.fileUrl` as const, { required: 'Bắt buộc nhập link minh chứng' })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red focus:border-brand-red"
                  placeholder="https://drive.google.com/file/d/..."
                />
                {errors?.certificates?.[index]?.fileUrl && <p className="text-red-500 text-xs mt-1">Bắt buộc nhập link minh chứng</p>}
                <FieldFeedback fieldPath={`conditions.certificates.${index}.fileUrl`} feedback={fieldFeedback[`conditions.certificates.${index}.fileUrl`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
              </div>
              <div className="md:col-span-1 flex items-end justify-center pb-1">
                {certFields.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeCert(index)}
                    className="text-red-500 hover:text-red-700 p-2"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {errors.certificates && <p className="text-red-500 text-sm mt-2">Vui lòng điền đầy đủ thông tin các minh chứng.</p>}
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Minh chứng cư trú tại Đà Nẵng</h3>
        <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại hình cư trú *</label>
            <div className="flex gap-6">
              <label className="flex items-center">
                <input 
                  type="radio" 
                  {...register('residenceProof.type', { required: 'Bắt buộc chọn' })} 
                  value="Tạm trú" 
                  className="mr-2 text-brand-red focus:ring-brand-red" 
                /> 
                Tạm trú
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  {...register('residenceProof.type')} 
                  value="Cư trú" 
                  className="mr-2 text-brand-red focus:ring-brand-red" 
                /> 
                Thường trú (Cư trú)
              </label>
            </div>
            {errors.residenceProof?.type && <p className="text-red-500 text-xs mt-1">{errors.residenceProof.type.message as string}</p>}
            <FieldFeedback fieldPath="conditions.residenceProof.type" feedback={fieldFeedback['conditions.residenceProof.type']} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
          </div>

          {residenceProof?.type && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Link minh chứng {residenceProof.type} (Google Drive) *</label>
              <input
                type="url"
                {...register('residenceProof.fileUrl', { required: 'Bắt buộc nhập link minh chứng' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red focus:border-brand-red"
                placeholder="https://drive.google.com/file/d/..."
              />
              {errors.residenceProof?.fileUrl && <p className="text-red-500 text-xs mt-1">{errors.residenceProof.fileUrl.message as string}</p>}
              <FieldFeedback fieldPath="conditions.residenceProof.fileUrl" feedback={fieldFeedback['conditions.residenceProof.fileUrl']} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Quay lại
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={async () => {
              await trigger();
              onSave(watch(), false, false);
            }}
            disabled={saving}
            className="bg-brand-red text-white px-6 py-2 rounded-md hover:bg-brand-red-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu và Tiếp tục'}
          </button>
        </div>
      </div>
    </form>
  );
}
