import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';

export interface FieldConfig {
  label?: string;
  placeholder?: string;
  required?: boolean;
  hidden?: boolean;
}

export interface CustomField {
  id: string;
  section: string;
  label: string;
  type: 'text' | 'textarea' | 'date';
  required: boolean;
  placeholder: string;
}

export interface FormConfig {
  fields: Record<string, FieldConfig>;
  customFields: CustomField[];
  templates: Record<string, string>;
  lists: Record<string, string[]>;
}

export const DEFAULT_CONFIG: FormConfig = {
  fields: {},
  customFields: [],
  templates: {
    selfAssessment: '- Phẩm chất đạo đức, lối sống: Luôn có ý thức tự giác trong học tập và rèn luyện; chấp hành tốt các nội quy, quy định của nhà trường và pháp luật của Nhà nước; có lối sống lành mạnh, giản dị, gần gũi với mọi người.\n- Năng lực công tác: Có tinh thần trách nhiệm cao trong công việc được giao; có khả năng làm việc nhóm tốt; tích cực tham gia các hoạt động phong trào của Đoàn, Hội.\n- Quan hệ quần chúng: Luôn đoàn kết, giúp đỡ bạn bè; có mối quan hệ tốt với thầy cô và mọi người xung quanh.\n- Khuyết điểm: Đôi khi còn chưa sắp xếp thời gian khoa học; kỹ năng thuyết trình trước đám đông còn hạn chế.\n- Phương hướng phấn đấu: Tiếp tục học tập trau dồi kiến thức chuyên môn; rèn luyện bản lĩnh chính trị vững vàng; phấn đấu sớm được đứng vào hàng ngũ của Đảng Cộng sản Việt Nam.',
    personalHistory: 'Từ tháng 09/2012 đến tháng 05/2017: Học tại trường Tiểu học ...\nTừ tháng 09/2017 đến tháng 05/2021: Học tại trường THCS ...\nTừ tháng 09/2021 đến tháng 05/2024: Học tại trường THPT ...\nTừ tháng 09/2024 đến nay: Sinh viên lớp ..., Khoa ..., trường Đại học Kinh tế - ĐHĐN',
    familyHistory: '- Cha: Nguyễn Văn A (Sinh năm 1975, nghề nghiệp: Nông dân, nơi ở hiện nay: ...)\n- Mẹ: Trần Thị B (Sinh năm 1978, nghề nghiệp: Giáo viên, nơi ở hiện nay: ...)\n- Anh trai: Nguyễn Văn C (Sinh năm 2000, nghề nghiệp: Kỹ sư, nơi ở hiện nay: ...)',
    otherInfo: '- Khen thưởng: Đạt danh hiệu Sinh viên 5 tốt cấp Trường năm học 2024-2025; Giải Nhì cuộc thi ...\n- Kỷ luật: Không\n- Đặc điểm lịch sử: Từ nhỏ đến nay luôn chấp hành tốt các chủ trương, đường lối chính sách của Đảng và pháp luật của Nhà nước; không vi phạm pháp luật; không tham gia các tổ chức phản động; lịch sử chính trị gia đình trong sạch.'
  },
  lists: {
    faculties: [
      'Kế toán',
      'Ngân hàng',
      'Luật',
      'Tài chính',
      'Kinh tế',
      'Quản trị kinh doanh',
      'Kinh doanh quốc tế',
      'Du lịch',
      'Lý luận chính trị',
      'Thống kê - Tin học',
      'Thương mại điện tử',
      'Marketing'
    ],
    ethnicities: ['Kinh', 'Tày', 'Thái', 'Mường', 'Khơ Me', 'H\'Mông', 'Nùng', 'Hoa', 'Dao', 'Gia Rai', 'Ê Đê', 'Ba Na', 'Xơ Đăng', 'Sán Chay', 'Cơ Ho', 'Chăm', 'Sán Dìu', 'Hrê', 'Mnông', 'Ra Glai', 'Xtiêng', 'Bru-Vân Kiều', 'Thổ', 'Giáy', 'Cơ Tu', 'Giẻ Triêng', 'Mạ', 'Khơ Mú', 'Co', 'Tà Ôi', 'Chơ Ro', 'Kháng', 'Xinh Mun', 'Hà Nhì', 'Chu Ru', 'Lào', 'La Chí', 'La Ha', 'Phù Lá', 'La Hủ', 'Lự', 'Lô Lô', 'Chứt', 'Mảng', 'Pà Thẻn', 'Cơ Lao', 'Cống', 'Bố Y', 'Si La', 'Pu Péo', 'Rơ Măm', 'Brâu', 'Ơ Đu'],
    religions: ['Không', 'Phật giáo', 'Công giáo', 'Tin lành', 'Cao đài', 'Hòa hảo', 'Hồi giáo', 'Tôn giáo khác']
  }
};

interface FormConfigContextType {
  config: FormConfig;
  updateConfig: (newConfig: Partial<FormConfig>) => Promise<void>;
  loading: boolean;
}

const FormConfigContext = createContext<FormConfigContextType>({
  config: DEFAULT_CONFIG,
  updateConfig: async () => {},
  loading: true
});

export const useFormConfig = () => useContext(FormConfigContext);

export const FormConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<FormConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'formConfig');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setConfig({ ...DEFAULT_CONFIG, ...docSnap.data() } as FormConfig);
      } else {
        // Use DEFAULT_CONFIG in memory if it doesn't exist in Firestore
        setConfig(DEFAULT_CONFIG);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching form config:", error);
      setLoading(false);
      handleFirestoreError(error, OperationType.GET, 'settings/formConfig');
    });

    return () => unsubscribe();
  }, []);

  const updateConfig = async (newConfig: Partial<FormConfig>) => {
    try {
      const docRef = doc(db, 'settings', 'formConfig');
      const updatedConfig = { ...config, ...newConfig };
      await setDoc(docRef, updatedConfig);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/formConfig');
    }
  };

  return (
    <FormConfigContext.Provider value={{ config, updateConfig, loading }}>
      {children}
    </FormConfigContext.Provider>
  );
};
