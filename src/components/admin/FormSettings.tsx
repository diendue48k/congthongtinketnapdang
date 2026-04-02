import React, { useState } from 'react';
import { useFormConfig, CustomField, DEFAULT_CONFIG } from '../../contexts/FormConfigContext';
import { Save, Plus, Trash2, RotateCcw, Settings } from 'lucide-react';

export default function FormSettings() {
  const { config, updateConfig, loading } = useFormConfig();
  const [saving, setSaving] = useState(false);
  
  // Local state to edit before saving
  const [templates, setTemplates] = useState(config.templates || {});
  const [fields, setFields] = useState(config.fields || {});
  const [customFields, setCustomFields] = useState<CustomField[]>(config.customFields || []);
  const [lists, setLists] = useState(config.lists || { faculties: [], ethnicities: [], religions: [] });

  if (loading) return <div>Đang tải cấu hình...</div>;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfig({ templates, fields, customFields, lists });
      alert('Lưu cấu hình thành công!');
    } catch (error) {
      console.error(error);
      alert('Lỗi khi lưu cấu hình.');
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateChange = (key: string, value: string) => {
    setTemplates({ ...templates, [key]: value });
  };

  const loadDefaultTemplate = (key: string) => {
    setTemplates({ ...templates, [key]: DEFAULT_CONFIG.templates[key] });
  };

  const loadAllDefaultTemplates = () => {
    if (confirm('Bạn có chắc chắn muốn tải lại tất cả các mẫu mặc định? Nội dung hiện tại sẽ bị ghi đè.')) {
      setTemplates({ ...DEFAULT_CONFIG.templates });
    }
  };

  const handleFieldChange = (fieldId: string, key: string, value: any) => {
    setFields({
      ...fields,
      [fieldId]: {
        ...(fields[fieldId] || {}),
        [key]: value
      }
    });
  };

  const addCustomField = () => {
    const newField: CustomField = {
      id: `custom_${Date.now()}`,
      section: 'basicInfo',
      label: 'Trường mới',
      type: 'text',
      required: false,
      placeholder: ''
    };
    setCustomFields([...customFields, newField]);
  };

  const updateCustomField = (id: string, key: keyof CustomField, value: any) => {
    setCustomFields(customFields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const handleListChange = (key: string, value: string) => {
    const newList = value.split('\n').map(item => item.trim()).filter(item => item !== '');
    setLists({ ...lists, [key]: newList });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Cấu hình nội dung mẫu (Templates)</h3>
          <button
            onClick={loadAllDefaultTemplates}
            className="flex items-center gap-1 text-[10px] font-bold text-brand-red hover:underline"
          >
            <RotateCcw size={12} /> Tải lại tất cả mẫu mặc định
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider">Mẫu Tự nhận xét (Self Assessment)</label>
              <button 
                onClick={() => loadDefaultTemplate('selfAssessment')}
                className="text-[9px] font-bold text-blue-600 hover:underline"
              >
                Sử dụng mẫu mặc định
              </button>
            </div>
            <textarea
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-[10px] focus:ring-brand-red focus:border-brand-red transition-all"
              rows={2}
              value={templates.selfAssessment || ''}
              onChange={(e) => handleTemplateChange('selfAssessment', e.target.value)}
              placeholder="Nhập nội dung mẫu cho phần tự nhận xét..."
            />
            <p className="text-[8px] text-gray-500 mt-0.5">Nội dung này sẽ hiển thị dưới dạng placeholder trong phần tự nhận xét của sinh viên.</p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[9px] font-bold text-gray-700 uppercase tracking-wider">Mẫu Lịch sử bản thân (Personal History)</label>
              <button 
                onClick={() => loadDefaultTemplate('personalHistory')}
                className="text-[8px] font-bold text-blue-600 hover:underline"
              >
                Sử dụng mẫu mặc định
              </button>
            </div>
            <textarea
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-[10px] focus:ring-brand-red focus:border-brand-red transition-all"
              rows={2}
              value={templates.personalHistory || ''}
              onChange={(e) => handleTemplateChange('personalHistory', e.target.value)}
              placeholder="Nhập nội dung mẫu cho phần lịch sử bản thân..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[9px] font-bold text-gray-700 uppercase tracking-wider">Mẫu Lịch sử gia đình (Family History)</label>
              <button 
                onClick={() => loadDefaultTemplate('familyHistory')}
                className="text-[8px] font-bold text-blue-600 hover:underline"
              >
                Sử dụng mẫu mặc định
              </button>
            </div>
            <textarea
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-[10px] focus:ring-brand-red focus:border-brand-red transition-all"
              rows={2}
              value={templates.familyHistory || ''}
              onChange={(e) => handleTemplateChange('familyHistory', e.target.value)}
              placeholder="Nhập nội dung mẫu cho phần lịch sử gia đình..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[9px] font-bold text-gray-700 uppercase tracking-wider">Mẫu Thông tin khác (Khen thưởng, kỷ luật...)</label>
              <button 
                onClick={() => loadDefaultTemplate('otherInfo')}
                className="text-[8px] font-bold text-blue-600 hover:underline"
              >
                Sử dụng mẫu mặc định
              </button>
            </div>
            <textarea
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-[10px] focus:ring-brand-red focus:border-brand-red transition-all"
              rows={2}
              value={templates.otherInfo || ''}
              onChange={(e) => handleTemplateChange('otherInfo', e.target.value)}
              placeholder="Nhập nội dung mẫu cho phần thông tin khác..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-[11px] font-bold text-gray-900 mb-1 uppercase tracking-wider">Cấu hình các trường dữ liệu (Fields)</h3>
        <p className="text-[9px] text-gray-500 mb-2.5">Tùy chỉnh tiêu đề (label), placeholder và trạng thái bắt buộc của các trường có sẵn trên toàn bộ hệ thống.</p>
        
        <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2">
          {/* Example fields to configure, we can expand this list */}
          {[
            // Thông tin cơ bản
            { id: 'basicInfo.fullName', defaultLabel: 'Họ và tên khai sinh', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.aliases', defaultLabel: 'Tên gọi khác', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.studentId', defaultLabel: 'Mã số sinh viên', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.cccd', defaultLabel: 'Số Căn cước công dân', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.dob', defaultLabel: 'Ngày tháng năm sinh', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.gender', defaultLabel: 'Giới tính', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.class', defaultLabel: 'Lớp sinh hoạt', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.faculty', defaultLabel: 'Khoa', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.hometown', defaultLabel: 'Quê quán', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.birthplace', defaultLabel: 'Nơi sinh', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.ethnicity', defaultLabel: 'Dân tộc', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.religion', defaultLabel: 'Tôn giáo', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.nationality', defaultLabel: 'Quốc tịch', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.permanentAddress', defaultLabel: 'Nơi đăng ký hộ khẩu thường trú', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.temporaryAddress', defaultLabel: 'Nơi ở hiện nay', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.zaloPhone', defaultLabel: 'Số điện thoại (Zalo)', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.email', defaultLabel: 'Địa chỉ Email', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.facebookLink', defaultLabel: 'Link Facebook', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.generalEducation', defaultLabel: 'Trình độ giáo dục phổ thông', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.professionalExpertise', defaultLabel: 'Trình độ chuyên môn', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.politicalTheory', defaultLabel: 'Lý luận chính trị', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.foreignLanguage', defaultLabel: 'Ngoại ngữ', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.itSkill', defaultLabel: 'Tin học', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.minorityLanguage', defaultLabel: 'Tiếng dân tộc thiểu số', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.currentOccupation', defaultLabel: 'Nghề nghiệp hiện nay', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.scienceTech', defaultLabel: 'Khoa học công nghệ', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.highestDegree', defaultLabel: 'Học vị cao nhất', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.highestTitle', defaultLabel: 'Học hàm cao nhất', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.youthUnionJoinDate', defaultLabel: 'Ngày vào Đoàn TNCS Hồ Chí Minh', section: 'Thông tin cơ bản' },
            { id: 'basicInfo.youthUnionJoinPlace', defaultLabel: 'Nơi kết nạp vào Đoàn', section: 'Thông tin cơ bản' },
            
            // Kết nạp lại
            { id: 'basicInfo.isReAdmission', defaultLabel: 'Đối với người xin kết nạp lại', section: 'Kết nạp lại' },
            { id: 'basicInfo.firstAdmissionDate', defaultLabel: 'Ngày kết nạp lần 1', section: 'Kết nạp lại' },
            { id: 'basicInfo.firstAdmissionPlace', defaultLabel: 'Nơi kết nạp lần 1', section: 'Kết nạp lại' },
            { id: 'basicInfo.firstOfficialDate', defaultLabel: 'Ngày công nhận chính thức lần 1', section: 'Kết nạp lại' },
            { id: 'basicInfo.firstOfficialPlace', defaultLabel: 'Nơi công nhận chính thức lần 1', section: 'Kết nạp lại' },
            { id: 'basicInfo.firstIntroducer', defaultLabel: 'Người giới thiệu lần 1', section: 'Kết nạp lại' },
            
            // Điều kiện kết nạp
            { id: 'conditions.trainingClasses', defaultLabel: 'Những lớp đào tạo, bồi dưỡng đã qua', section: 'Điều kiện kết nạp' },
            { id: 'conditions.academicScores', defaultLabel: 'Điểm học tập và rèn luyện', section: 'Điều kiện kết nạp' },
            { id: 'conditions.academicTranscriptUrl', defaultLabel: 'Link bảng điểm học tập, rèn luyện', section: 'Điều kiện kết nạp' },
            { id: 'conditions.residenceProof', defaultLabel: 'Minh chứng cư trú tại Đà Nẵng', section: 'Điều kiện kết nạp' },
            
            // Lịch sử bản thân
            { id: 'personalHistory.history', defaultLabel: 'Lịch sử bản thân', section: 'Lịch sử bản thân' },
            
            // Lịch sử gia đình
            { id: 'familyHistory.parents', defaultLabel: 'Hoàn cảnh gia đình (Cha mẹ)', section: 'Lịch sử gia đình' },
            { id: 'familyHistory.siblings', defaultLabel: 'Anh chị em ruột', section: 'Lịch sử gia đình' },
            
            // Thông tin khác
            { id: 'otherInfo.historicalCharacteristics', defaultLabel: 'Đặc điểm lịch sử', section: 'Thông tin khác' },
            { id: 'otherInfo.rewards', defaultLabel: 'Khen thưởng', section: 'Thông tin khác' },
            { id: 'otherInfo.disciplines', defaultLabel: 'Kỷ luật', section: 'Thông tin khác' },
            { id: 'otherInfo.abroadTrips', defaultLabel: 'Đi nước ngoài', section: 'Thông tin khác' },
            
            // Tự nhận xét
            { id: 'selfAssessment.selfAssessment', defaultLabel: 'Nội dung tự nhận xét', section: 'Tự nhận xét' },
          ].map((field) => (
            <div key={field.id} className="border border-gray-100 p-2.5 rounded-lg bg-gray-50/50">
              <div className="flex justify-between items-center mb-1.5">
                <h4 className="font-bold text-gray-700 text-[10px]">Trường: {field.defaultLabel} <span className="text-[8px] font-normal text-gray-400">({field.id})</span></h4>
                <span className="text-[8px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider">{field.section}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Tiêu đề (Label) tùy chỉnh</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 bg-white border border-gray-200 rounded-md text-[10px] focus:ring-brand-red focus:border-brand-red transition-all"
                    value={fields[field.id]?.label || ''}
                    onChange={(e) => handleFieldChange(field.id, 'label', e.target.value)}
                    placeholder={`Mặc định: ${field.defaultLabel}`}
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Nội dung gợi ý (Placeholder)</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 bg-white border border-gray-200 rounded-md text-[10px] focus:ring-brand-red focus:border-brand-red transition-all"
                    value={fields[field.id]?.placeholder || ''}
                    onChange={(e) => handleFieldChange(field.id, 'placeholder', e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-3 md:col-span-2">
                  <label className="flex items-center space-x-1 text-[9px] font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fields[field.id]?.required !== false}
                      onChange={(e) => handleFieldChange(field.id, 'required', e.target.checked)}
                      className="rounded text-brand-red focus:ring-brand-red w-3 h-3"
                    />
                    <span>Bắt buộc nhập</span>
                  </label>
                  <label className="flex items-center space-x-1 text-[9px] font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fields[field.id]?.hidden === true}
                      onChange={(e) => handleFieldChange(field.id, 'hidden', e.target.checked)}
                      className="rounded text-brand-red focus:ring-brand-red w-3 h-3"
                    />
                    <span>Ẩn trường này</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-2.5">
          <div>
            <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Trường dữ liệu bổ sung</h3>
            <p className="text-[9px] text-gray-500 mt-0.5">Thêm các trường mới vào phần Thông tin cơ bản.</p>
          </div>
          <button
            onClick={addCustomField}
            className="flex items-center gap-1 text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors"
          >
            <Plus size={12} /> Thêm trường mới
          </button>
        </div>

        <div className="space-y-2.5">
          {customFields.length === 0 ? (
            <div className="text-center py-3 text-gray-500 border-2 border-dashed border-gray-100 rounded-lg text-[9px] font-medium">
              Chưa có trường bổ sung nào.
            </div>
          ) : (
            customFields.map((field) => (
              <div key={field.id} className="border border-gray-100 p-2.5 rounded-lg bg-gray-50/50 flex gap-2.5 items-start">
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Phần (Section)</label>
                    <select
                      className="w-full px-2 py-1 bg-white border border-gray-200 rounded-md text-[10px] focus:ring-brand-red focus:border-brand-red transition-all"
                      value={field.section}
                      onChange={(e) => updateCustomField(field.id, 'section', e.target.value)}
                    >
                      <option value="basicInfo">Thông tin cơ bản</option>
                      <option value="conditions">Điều kiện kết nạp</option>
                      <option value="personalHistory">Lịch sử bản thân</option>
                      <option value="familyHistory">Lịch sử gia đình</option>
                      <option value="otherInfo">Thông tin khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Tiêu đề (Label)</label>
                    <input
                      type="text"
                      className="w-full px-2 py-1 bg-white border border-gray-200 rounded-md text-[10px] focus:ring-brand-red focus:border-brand-red transition-all"
                      value={field.label}
                      onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Loại dữ liệu</label>
                    <select
                      className="w-full px-2 py-1 bg-white border border-gray-200 rounded-md text-[10px] focus:ring-brand-red focus:border-brand-red transition-all"
                      value={field.type}
                      onChange={(e) => updateCustomField(field.id, 'type', e.target.value)}
                    >
                      <option value="text">Văn bản ngắn</option>
                      <option value="textarea">Văn bản dài</option>
                      <option value="date">Ngày tháng</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Nội dung gợi ý (Placeholder)</label>
                    <input
                      type="text"
                      className="w-full px-2 py-1 bg-white border border-gray-200 rounded-md text-[10px] focus:ring-brand-red focus:border-brand-red transition-all"
                      value={field.placeholder}
                      onChange={(e) => updateCustomField(field.id, 'placeholder', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center pt-0.5 md:col-span-2">
                    <label className="flex items-center space-x-1 text-[9px] font-bold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateCustomField(field.id, 'required', e.target.checked)}
                        className="rounded text-brand-red focus:ring-brand-red w-3 h-3"
                      />
                      <span>Bắt buộc nhập</span>
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => removeCustomField(field.id)}
                  className="text-gray-400 hover:text-brand-red p-1 bg-white border border-gray-200 rounded-md mt-4 transition-all"
                  title="Xóa trường này"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-[11px] font-bold text-gray-900 mb-1 uppercase tracking-wider">Danh sách cấu hình (Dropdown Lists)</h3>
        <p className="text-[9px] text-gray-500 mb-2.5">Cấu hình danh sách các lựa chọn cho các trường dropdown (mỗi dòng một lựa chọn).</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <div>
            <label className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Danh sách Khoa</label>
            <textarea
              className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-[10px] font-mono focus:ring-brand-red focus:border-brand-red transition-all"
              rows={5}
              value={lists.faculties?.join('\n') || ''}
              onChange={(e) => handleListChange('faculties', e.target.value)}
              placeholder="Nhập danh sách khoa, mỗi dòng một tên khoa..."
            />
          </div>
          <div>
            <label className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Danh sách Dân tộc</label>
            <textarea
              className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-[10px] font-mono focus:ring-brand-red focus:border-brand-red transition-all"
              rows={5}
              value={lists.ethnicities?.join('\n') || ''}
              onChange={(e) => handleListChange('ethnicities', e.target.value)}
              placeholder="Nhập danh sách dân tộc, mỗi dòng một dân tộc..."
            />
          </div>
          <div>
            <label className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Danh sách Tôn giáo</label>
            <textarea
              className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-[10px] font-mono focus:ring-brand-red focus:border-brand-red transition-all"
              rows={5}
              value={lists.religions?.join('\n') || ''}
              onChange={(e) => handleListChange('religions', e.target.value)}
              placeholder="Nhập danh sách tôn giáo, mỗi dòng một tôn giáo..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center px-4 py-1.5 bg-brand-red text-white text-[10px] font-bold rounded-md hover:bg-brand-red-dark transition-all shadow-sm shadow-red-100 disabled:opacity-50 group"
        >
          <Settings className="mr-1 w-3 h-3 group-hover:rotate-90 transition-transform duration-500" />
          {saving ? 'Đang lưu cấu hình...' : 'Lưu tất cả thay đổi'}
        </button>
      </div>
    </div>
  );
}
