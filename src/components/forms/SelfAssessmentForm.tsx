import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import FieldFeedback from '../FieldFeedback';
import { useFormConfig } from '../../contexts/FormConfigContext';

interface SelfAssessmentFormProps {
  initialData: any;
  onSave: (data: any, isSubmit?: boolean, stayOnStep?: boolean) => void;
  onDataChange?: (data: any) => void;
  onBack: () => void;
  saving: boolean;
  isAdmin?: boolean;
  fieldFeedback?: Record<string, string>;
  onFeedbackChange?: (fieldPath: string, value: string) => void;
}

export default function SelfAssessmentForm({ initialData, onSave, onDataChange, onBack, saving, isAdmin = false, fieldFeedback = {}, onFeedbackChange }: SelfAssessmentFormProps) {
  const { config } = useFormConfig();
  const { register, trigger, setValue, watch, formState: { errors } } = useForm({
    mode: 'onChange',
    defaultValues: initialData || {}
  });

  const watchedData = watch();
  const lastDataRef = React.useRef(JSON.stringify(watchedData));

  useEffect(() => {
    const currentDataStr = JSON.stringify(watchedData);
    if (onDataChange && currentDataStr !== lastDataRef.current) {
      lastDataRef.current = currentDataStr;
      onDataChange(watchedData);
    }
  }, [watchedData, onDataChange]);

  useEffect(() => {
    if (!initialData?.selfAssessment && config.templates?.selfAssessment) {
      setValue('selfAssessment', config.templates.selfAssessment);
    }
  }, [config.templates?.selfAssessment, initialData?.selfAssessment, setValue]);

  return (
    <form className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Tự nhận xét</h3>
        <p className="text-sm text-gray-600 mb-4">
          Người khai tự nhận xét về ưu, khuyết điểm, phẩm chất chính trị, đạo đức lối sống, năng lực công tác và quan hệ quần chúng.
        </p>
        <div>
          <textarea
            {...register('selfAssessment', { required: 'Bắt buộc nhập' })}
            rows={8}
            placeholder={config.templates?.selfAssessment || "Tôi tự nhận thấy bản thân có những ưu điểm..."}
            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-brand-red focus:border-brand-red ${errors?.selfAssessment ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors?.selfAssessment && (
            <p className="text-red-500 text-xs mt-1">{errors.selfAssessment.message as string}</p>
          )}
          <FieldFeedback fieldPath="selfAssessment.selfAssessment" feedback={fieldFeedback['selfAssessment.selfAssessment']} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Cam đoan và ký tên</h3>
        
        <div className="text-center mb-8">
          <p className="font-medium text-gray-800 italic">
            "Tôi cam đoan đã khai đầy đủ, rõ ràng, trung thực và chịu trách nhiệm trước Đảng về những nội dung đã khai trong lý lịch"
          </p>
        </div>

        <div className="flex justify-end">
          <div className="text-center w-64">
            <p className="text-sm text-gray-600 mb-2">Ngày ...... tháng ...... năm .........</p>
            <p className="font-bold text-gray-900 mb-16">NGƯỜI KHAI</p>
            <p className="text-sm text-gray-500 italic">(Ký, ghi rõ họ tên)</p>
          </div>
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
            onClick={async (e) => {
              e.preventDefault();
              await trigger();
              onSave(watch(), false, true);
            }}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              await trigger();
              onSave(watch(), true, false);
            }}
            disabled={saving}
            className="bg-brand-red text-white px-6 py-2 rounded-md hover:bg-brand-red-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Hoàn thành & Nộp hồ sơ'}
          </button>
        </div>
      </div>
    </form>
  );
}
