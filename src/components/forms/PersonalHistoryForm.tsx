import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import FieldFeedback from '../FieldFeedback';
import { useFormConfig } from '../../contexts/FormConfigContext';

interface PersonalHistoryFormProps {
  initialData: any;
  onSave: (data: any, isSubmit?: boolean, stayOnStep?: boolean) => void;
  onDataChange?: (data: any) => void;
  onBack: () => void;
  saving: boolean;
  isAdmin?: boolean;
  fieldFeedback?: Record<string, string>;
  onFeedbackChange?: (fieldPath: string, value: string) => void;
}

export default function PersonalHistoryForm({ initialData, onSave, onDataChange, onBack, saving, isAdmin = false, fieldFeedback = {}, onFeedbackChange }: PersonalHistoryFormProps) {
  const { config } = useFormConfig();
  // Handle migration from old array format to new object format
  const defaultHistory = Array.isArray(initialData) ? initialData : (initialData?.history?.length > 0 ? initialData.history : [
    { timeRange: '', description: '' }
  ]);
  const defaultJobHistory = initialData?.jobHistory?.length > 0 ? initialData.jobHistory : [
    { startDate: '', endDate: '', description: '', position: '' }
  ];
  const defaultCurrentResidence = Array.isArray(initialData) ? '' : (initialData?.currentResidence || '');

  const { register, control, trigger, formState: { errors }, watch } = useForm<any>({
    mode: 'onChange',
    defaultValues: {
      history: defaultHistory,
      jobHistory: defaultJobHistory,
      currentResidence: defaultCurrentResidence
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

  const historyValues = watch('history');
  const jobHistoryValues = watch('jobHistory');

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "history"
  });

  const { fields: jobFields, append: appendJob, remove: removeJob } = useFieldArray({
    control,
    name: "jobHistory"
  });

  const handleAutoSuggest = () => {
    replace([
      { timeRange: '... - ...', description: 'Còn nhỏ ở với bố mẹ tại...' },
      { timeRange: '... - ...', description: 'Học sinh trường Tiểu học...' },
      { timeRange: '... - ...', description: 'Học sinh trường Trung học cơ sở...' },
      { timeRange: '... - ...', description: 'Học sinh trường Trung học phổ thông...' },
      { timeRange: '... - nay', description: 'Sinh viên trường Đại học...' }
    ]);
  };

  const validateNoDots = (value: string) => {
    if (value && value.includes('...')) {
      return 'Vui lòng điền thông tin cụ thể, không để trống (...)';
    }
    return true;
  };

  const validateDescription = (value: string) => {
    return validateNoDots(value); 
  };

  const checkContinuity = (history: any[]) => {
    const warnings: string[] = [];
    for (let i = 0; i < history.length - 1; i++) {
      const currentEnd = history[i]?.timeRange?.split('-')[1]?.trim();
      const nextStart = history[i + 1]?.timeRange?.split('-')[0]?.trim();
      if (currentEnd && nextStart && currentEnd !== nextStart && currentEnd !== 'nay' && currentEnd !== '...' && nextStart !== '...') {
        warnings.push(`Giai đoạn ${i + 1} và ${i + 2} có vẻ không liên tục (${currentEnd} -> ${nextStart}).`);
      }
    }
    return warnings;
  };

  const checkJobContinuity = (jobHistory: any[]) => {
    const warnings: string[] = [];
    for (let i = 0; i < jobHistory.length - 1; i++) {
      const currentEnd = jobHistory[i]?.endDate?.trim();
      const nextStart = jobHistory[i + 1]?.startDate?.trim();
      if (currentEnd && nextStart && currentEnd !== nextStart && currentEnd !== 'nay' && currentEnd !== '...' && nextStart !== '...') {
        warnings.push(`Công việc ${i + 1} và ${i + 2} có vẻ không liên tục (${currentEnd} -> ${nextStart}).`);
      }
    }
    return warnings;
  };

  const checkFormat = (desc: string) => {
    if (!desc) return null;
    if (desc.includes('...') || desc.length < 10) return null;
    const hasOldLocation = desc.includes('Trước đây là') || desc.includes('trước đây là');
    const hasLocationKeywords = desc.toLowerCase().includes('tại') || desc.toLowerCase().includes('xã') || desc.toLowerCase().includes('phường') || desc.toLowerCase().includes('tỉnh');
    if (hasLocationKeywords && !hasOldLocation) {
      return 'Lưu ý: Nếu có thay đổi địa danh hành chính, vui lòng ghi rõ (Trước đây là...) theo ví dụ.';
    }
    return null;
  };

  const continuityWarnings = checkContinuity(historyValues || []);
  const jobContinuityWarnings = checkJobContinuity(jobHistoryValues || []);
  const [showSample, setShowSample] = useState(false);

  return (
    <form className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-medium text-gray-900">Lịch sử chính trị của bản thân</h3>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowSample(!showSample)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 px-3 py-1 rounded-md"
            >
              {showSample ? <><EyeOff size={16} /> Ẩn mẫu</> : <><Eye size={16} /> Xem mẫu</>}
            </button>
            <button
              type="button"
              onClick={handleAutoSuggest}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-md"
            >
              Gợi ý hoàn thiện
            </button>
            <button
              type="button"
              onClick={() => append({ timeRange: '', description: '' })}
              className="flex items-center gap-1 text-sm text-brand-red hover:text-brand-red-dark bg-red-50 px-3 py-1 rounded-md"
            >
              <Plus size={16} /> Thêm giai đoạn
            </button>
          </div>
        </div>
        
        {showSample && (
          <div className="bg-gray-50 p-4 rounded-md mb-6 text-sm text-gray-800 border border-gray-200">
            <p className="font-semibold mb-2 text-gray-900">Mẫu kê khai Lịch sử chính trị bản thân:</p>
            {config.templates?.personalHistory ? (
              <div className="whitespace-pre-wrap font-mono text-xs text-gray-700">
                {config.templates.personalHistory}
              </div>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                <div className="grid grid-cols-12 gap-2"><div className="col-span-3 font-semibold">1994 - 2000</div><div className="col-span-9">Còn nhỏ, sinh sống cùng bố mẹ tại Xã Vĩnh Thủy, Huyện Vĩnh Linh, tỉnh Quảng Trị.</div></div>
                <div className="grid grid-cols-12 gap-2"><div className="col-span-3 font-semibold">2000 - 2005</div><div className="col-span-9">Học sinh trường Tiểu học Vĩnh Thủy, Huyện Vĩnh Linh, tỉnh Quảng Trị.</div></div>
                <div className="grid grid-cols-12 gap-2"><div className="col-span-3 font-semibold">2005 - 2009</div><div className="col-span-9">Học sinh trường THCS Vĩnh Thủy, Huyện Vĩnh Linh, tỉnh Quảng Trị.</div></div>
                <div className="grid grid-cols-12 gap-2"><div className="col-span-3 font-semibold">2009 - 2012</div><div className="col-span-9">Học sinh trường THPT Vĩnh Linh, Huyện Vĩnh Linh, tỉnh Quảng Trị.</div></div>
                <div className="grid grid-cols-12 gap-2"><div className="col-span-3 font-semibold">2012 - 2016</div><div className="col-span-9">Sinh viên trường Đại học Bách Khoa Hà Nội, Quận Hai Bà Trưng, TP. Hà Nội.</div></div>
                <div className="grid grid-cols-12 gap-2"><div className="col-span-3 font-semibold">2016 - nay</div><div className="col-span-9">Làm kỹ sư phần mềm tại Công ty ABC, Quận Cầu Giấy, TP. Hà Nội.</div></div>
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-md mb-6 text-sm text-blue-800 border border-blue-200">
          <p className="font-semibold mb-2">Hướng dẫn kê khai:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tóm tắt quá trình từ thời niên thiếu cho đến nay. Các mốc thời gian phải liên tục.</li>
            <li>Ghi rõ địa danh hành chính (cũ và mới nếu có thay đổi).</li>
            <li>Ví dụ: <strong>1994 – 2000</strong>: Còn nhỏ, sinh sống cùng bố mẹ tại Xã Vĩnh Thủy, tỉnh Quảng Trị (Trước đây là Xã Vĩnh Thủy, Huyện Vĩnh Linh, tỉnh Quảng Trị).</li>
          </ul>
        </div>

        {continuityWarnings.length > 0 && (
          <div className="bg-yellow-50 p-3 rounded-md mb-4 text-sm text-yellow-800 border border-yellow-200">
            <p className="font-semibold mb-1">Cảnh báo mốc thời gian:</p>
            <ul className="list-disc pl-5">
              {continuityWarnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          {fields.map((field, index) => {
            const formatWarning = checkFormat(historyValues?.[index]?.description);
            return (
            <div key={field.id} className="flex gap-4 items-start">
              <div className="w-1/4">
                <input
                  {...register(`history.${index}.timeRange` as const, { 
                    required: 'Bắt buộc',
                    validate: validateNoDots
                  })}
                  placeholder="VD: 1994 - 2000"
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-brand-red focus:border-brand-red ${errors?.history?.[index]?.timeRange ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors?.history?.[index]?.timeRange && (
                  <p className="text-red-500 text-xs mt-1">{errors.history[index]?.timeRange?.message || 'Bắt buộc'}</p>
                )}
                <FieldFeedback fieldPath={`personalHistory.history.${index}.timeRange`} feedback={fieldFeedback[`personalHistory.history.${index}.timeRange`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
              </div>
              <div className="w-3/4 flex gap-2">
                <div className="flex-grow">
                  <textarea
                    {...register(`history.${index}.description` as const, { 
                      required: 'Bắt buộc',
                      validate: validateDescription
                    })}
                    rows={2}
                    placeholder="Còn nhỏ, sinh sống cùng bố mẹ tại..."
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-brand-red focus:border-brand-red ${errors?.history?.[index]?.description ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formatWarning && (
                    <p className="text-yellow-600 text-xs mt-1 italic">{formatWarning}</p>
                  )}
                  {errors?.history?.[index]?.description && (
                    <p className="text-red-500 text-xs mt-1">{errors.history[index]?.description?.message || 'Bắt buộc'}</p>
                  )}
                  <FieldFeedback fieldPath={`personalHistory.history.${index}.description`} feedback={fieldFeedback[`personalHistory.history.${index}.description`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                </div>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-700 p-2 h-fit"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          )})}
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Hiện đang cư trú/tạm trú tại *</label>
          <p className="text-xs text-gray-500 mb-2">Ghi rõ địa chỉ hiện tại bạn đang sinh sống (Tổ/Thôn/Xóm... Xã/Phường... Tỉnh/Thành phố)</p>
          <input
            {...register('currentResidence', { 
              required: 'Bắt buộc nhập',
              validate: validateNoDots
            })}
            placeholder="VD: Số nhà 123, đường ABC, phường XYZ, quận 1, TP. HCM"
            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-brand-red focus:border-brand-red ${errors?.currentResidence ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors?.currentResidence && (
            <p className="text-red-500 text-xs mt-1">{errors.currentResidence.message as string}</p>
          )}
          <FieldFeedback fieldPath="personalHistory.currentResidence" feedback={fieldFeedback['personalHistory.currentResidence']} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-medium text-gray-900">Những công việc, chức vụ đã qua</h3>
          <button
            type="button"
            onClick={() => appendJob({ startDate: '', endDate: '', description: '', position: '' })}
            className="flex items-center gap-1 text-sm text-brand-red hover:text-brand-red-dark bg-red-50 px-3 py-1 rounded-md"
          >
            <Plus size={16} /> Thêm công việc
          </button>
        </div>

        <div className="bg-blue-50 p-4 rounded-md mb-6 text-sm text-blue-800 border border-blue-200">
          <p className="font-semibold mb-2">Hướng dẫn kê khai:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Khai dạng bảng (Từ tháng/năm đến tháng/năm; Làm việc gì, ở đâu; Chức vụ) đảm bảo tính liên tục theo tháng.</li>
            <li>Ví dụ: <strong>09/2023 – nay</strong>: Sinh viên lớp 48K22.3, Khoa Thương mại điện tử, Trường Đại học Kinh tế, Đại học Đà Nẵng. Chức vụ: Sinh viên.</li>
          </ul>
        </div>

        {jobContinuityWarnings.length > 0 && (
          <div className="bg-yellow-50 p-3 rounded-md mb-4 text-sm text-yellow-800 border border-yellow-200">
            <p className="font-semibold mb-1">Cảnh báo mốc thời gian công việc:</p>
            <ul className="list-disc pl-5">
              {jobContinuityWarnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          {jobFields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-start border border-gray-200 p-4 rounded-md bg-gray-50">
              <div className="w-1/4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Từ tháng/năm *</label>
                  <input
                    {...register(`jobHistory.${index}.startDate` as const, { required: 'Bắt buộc' })}
                    placeholder="VD: 09/2023"
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-brand-red focus:border-brand-red ${errors?.jobHistory?.[index]?.startDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors?.jobHistory?.[index]?.startDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.jobHistory[index]?.startDate?.message || 'Bắt buộc'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Đến tháng/năm *</label>
                  <input
                    {...register(`jobHistory.${index}.endDate` as const, { required: 'Bắt buộc' })}
                    placeholder="VD: nay"
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-brand-red focus:border-brand-red ${errors?.jobHistory?.[index]?.endDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors?.jobHistory?.[index]?.endDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.jobHistory[index]?.endDate?.message || 'Bắt buộc'}</p>
                  )}
                </div>
              </div>
              
              <div className="w-3/4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Làm việc gì, ở đâu *</label>
                  <textarea
                    {...register(`jobHistory.${index}.description` as const, { required: 'Bắt buộc' })}
                    rows={2}
                    placeholder="Sinh viên lớp 48K22.3, Khoa Thương mại điện tử, Trường Đại học Kinh tế..."
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-brand-red focus:border-brand-red ${errors?.jobHistory?.[index]?.description ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors?.jobHistory?.[index]?.description && (
                    <p className="text-red-500 text-xs mt-1">{errors.jobHistory[index]?.description?.message || 'Bắt buộc'}</p>
                  )}
                </div>
                <div className="flex gap-2 items-start">
                  <div className="flex-grow">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Chức vụ *</label>
                    <input
                      {...register(`jobHistory.${index}.position` as const, { required: 'Bắt buộc' })}
                      placeholder="VD: Sinh viên, Lớp trưởng, Bí thư..."
                      className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-brand-red focus:border-brand-red ${errors?.jobHistory?.[index]?.position ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors?.jobHistory?.[index]?.position && (
                      <p className="text-red-500 text-xs mt-1">{errors.jobHistory[index]?.position?.message || 'Bắt buộc'}</p>
                    )}
                  </div>
                  {jobFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeJob(index)}
                      className="text-red-500 hover:text-red-700 p-2 h-fit mt-5"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Render Custom Fields for Personal History */}
      {config.customFields && config.customFields.filter(f => f.section === 'personalHistory').length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-800 mb-4">Thông tin bổ sung (Lịch sử bản thân)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {config.customFields.filter(f => f.section === 'personalHistory').map(field => (
              <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && '*'}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    {...register(`customFields.${field.id}`, { required: field.required ? 'Bắt buộc nhập' : false })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-red focus:border-brand-red"
                    placeholder={field.placeholder}
                    rows={3}
                  />
                ) : (
                  <input
                    type={field.type}
                    {...register(`customFields.${field.id}`, { required: field.required ? 'Bắt buộc nhập' : false })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-red focus:border-brand-red"
                    placeholder={field.placeholder}
                  />
                )}
                {errors.customFields?.[field.id] && <p className="text-red-500 text-xs mt-1">{errors.customFields[field.id]?.message as string}</p>}
                <FieldFeedback fieldPath={`personalHistory.customFields.${field.id}`} feedback={fieldFeedback[`personalHistory.customFields.${field.id}`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
              </div>
            ))}
          </div>
        </div>
      )}

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
