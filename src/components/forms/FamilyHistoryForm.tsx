import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical, Eye, EyeOff } from 'lucide-react';
import FieldFeedback from '../FieldFeedback';
import { useFormConfig } from '../../contexts/FormConfigContext';

interface FamilyHistoryFormProps {
  initialData: any;
  onSave: (data: any, isSubmit?: boolean, stayOnStep?: boolean) => void;
  onDataChange?: (data: any) => void;
  onBack: () => void;
  saving: boolean;
  isAdmin?: boolean;
  fieldFeedback?: Record<string, string>;
  onFeedbackChange?: (fieldPath: string, value: string) => void;
}

const RELATIONS = [
  'Ông nội', 'Bà nội', 'Ông ngoại', 'Bà ngoại', 
  'Cha ruột', 'Mẹ ruột', 'Anh ruột', 'Chị ruột', 'Em ruột',
  'Vợ', 'Chồng', 'Con trai', 'Con gái',
  'Cha vợ', 'Mẹ vợ', 'Anh vợ', 'Chị vợ', 'Em vợ',
  'Cha chồng', 'Mẹ chồng', 'Anh chồng', 'Chị chồng', 'Em chồng',
  'Ông nội vợ/chồng', 'Bà nội vợ/chồng', 'Ông ngoại vợ/chồng', 'Bà ngoại vợ/chồng',
  'Ông nội kế', 'Bà nội kế', 'Ông ngoại kế', 'Bà ngoại kế', 'Cha kế', 'Mẹ kế'
];

const SAMPLES: Record<string, any> = {
  'Ông nội': {
    title: '1. Ông nội ruột',
    fullName: 'LÊ VĨNH A',
    birthYear: '1949',
    religion: 'Không',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    hometown: 'Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).',
    birthplace: 'Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).',
    permanentAddress: 'đội 3, thôn Đức Xá, xã Vĩnh Thủy, tỉnh Quảng Trị.',
    job: 'Nông dân',
    isPartyMember: true,
    history: [
      { timeRange: '1949 – 1954', description: 'còn nhỏ ở với gia đình ở địa phương tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1954 – 1964', description: 'Đi học văn hóa ở trường làng tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1964 – 1975', description: 'ở với bố mẹ làm nông và tham gia dân quân ở địa phương phục vụ kháng chiến chống mỹ tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1975', description: 'Lập gia đình tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1975 - 1979', description: 'Làm nông và sinh sống tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1979 – 1982', description: 'Đi bộ đội tại xã Đồng Đăng, tỉnh Lạng Sơn (trước đây là trấn Đồng Đăng, huyện Cao Lộc tỉnh Lạng Sơn.)' },
      { timeRange: '1982 – nay', description: 'Làm nông và sinh sống tại đội 3, thôn Đức Xá, xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là đội 3, thôn Đức Xá, xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị.)' },
    ],
    rewards: 'Được chủ tịch nước Trần Đức Lương tặng thưởng: Huy chương kháng chiến chống mỹ hạng nhất.',
    politicalAttitude: 'Luôn chấp hành tốt mọi chủ trương, đường lối, chính sách của Đảng và pháp luật của Nhà nước.'
  },
  'Bà nội': {
    title: '2. Bà nội ruột',
    fullName: 'PHAN THỊ B',
    birthYear: '1953',
    religion: 'Không',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    hometown: 'Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).',
    birthplace: 'Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).',
    permanentAddress: 'Đội 3, thôn Đức Xá, xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị',
    job: 'Nông dân',
    history: [
      { timeRange: '1953 – 1959', description: 'còn nhỏ ở với gia đình ở địa phương tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1959 – 1967', description: 'Đi học cấp 1 ở trường làng tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1967 – 1970', description: 'đi K8 sơ tán ra tỉnh Thái Bình.' },
      { timeRange: '1970 – 1975', description: 'Trở về địa phương, sau đó tham gia dân quân ở địa phương phục vụ kháng chiến chống Mỹ tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1975', description: 'Lập gia đình tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1975 - nay', description: 'làm nông và sinh sống tại đội 3, thôn Đức Xá, xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị (nay là Đội 3, thôn Đức Xá, xã Vĩnh Thủy, tỉnh Quảng Trị)' },
    ],
    rewards: 'Được chủ tịch nước Trần Đức Lương tặng thưởng: Huy chương kháng chiến chống mỹ hạng nhất.',
    politicalAttitude: 'Luôn chấp hành tốt mọi chủ trương, đường lối, chính sách của Đảng và pháp luật của Nhà nước.'
  },
  'Ông ngoại': {
    title: '3. Ông ngoại ruột',
    fullName: 'NGUYỄN VĂN F',
    birthYear: '1935',
    deathYear: '2021',
    religion: 'Không',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    hometown: 'Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).',
    birthplace: 'Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).',
    isPartyMember: true,
    history: [
      { timeRange: '1935 – 1941', description: 'còn nhỏ ở với gia đình tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1941 - 1945', description: 'học cấp 1 tại trường làng ở Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1945 - 1948', description: 'học cấp 2 tại trường làng ở Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1948 – 1957', description: 'Tham gia vào ban thường vụ nông hội Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1957 – 1958', description: 'Hội đồng nhân dân kế toán Hợp tác xã sơ cấp tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1958 – 1962', description: 'Tham gia vào ban Thường vụ Đoàn Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1962 – 1975', description: 'Phó bí thư Đoàn Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1975', description: 'Lập gia đình tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1975 - 1985', description: 'Bí thư chi bộ, trưởng ban kiểm soát hợp tác xã tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1985 – 1990', description: 'Chủ tịch Ủy ban Mặt trận Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1990 – 2021', description: 'Nghỉ hưu ở nhà tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '2021', description: 'Mất do lâm bệnh nặng, tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
    ]
  },
  'Bà ngoại': {
    title: '4. Bà ngoại ruột',
    fullName: 'NGUYỄN THỊ H',
    birthYear: '1935',
    deathYear: '2007',
    religion: 'Không',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    hometown: 'xã Vĩnh Linh, tỉnh Quảng Trị. ( Trước đây là xã Vĩnh Chấp, huyện Vĩnh Linh, tỉnh Quảng Trị.)',
    birthplace: 'xã Vĩnh Chấp, huyện Vĩnh Linh, tỉnh Quảng Trị (Nay là xã Vĩnh Linh, tỉnh Quảng Trị)',
    history: [
      { timeRange: '1935 – 1941', description: 'Còn nhỏ ở với gia đình ở địa phương tại xã Vĩnh Linh, tỉnh Quảng Trị. (Trước đây là xã Vĩnh Chấp, huyện Vĩnh Linh, tỉnh Quảng Trị.)' },
      { timeRange: '1941 - 1952', description: 'học chữ tại trường làng ở xã Vĩnh Linh, tỉnh Quảng Trị. (Trước đây là xã Vĩnh Chấp, huyện Vĩnh Linh, tỉnh Quảng Trị.)' },
      { timeRange: '1952 - 1975', description: 'Tham gia lao động sản xuất và tham gia lực lượng dân quân du kích của xã Vĩnh Linh, tỉnh Quảng Trị. (Trước đây là xã Vĩnh Chấp, huyện Vĩnh Linh, tỉnh Quảng Trị.)' },
      { timeRange: '1975', description: 'Lập gia đình tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1975 – 2007', description: 'Ở nhà làm nông tại xã Vĩnh Thủy, huyện Vĩnh Thủy, huyện Vĩnh Linh, Quảng Trị. (Nay là xã Vĩnh Linh, tỉnh Quảng Trị)' },
      { timeRange: 'Năm 2007', description: 'Mất do lâm bệnh nặng, tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
    ]
  },
  'Cha ruột': {
    title: '5. Cha ruột',
    fullName: 'LÊ VĨNH M',
    birthYear: '1977',
    religion: 'Không',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    cccd: '0492123456789',
    job: 'Nông dân',
    hometown: 'Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).',
    birthplace: 'Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).',
    permanentAddress: 'Đội 2, thôn Đức Xá, Xã Vĩnh Thủy, tỉnh Quảng Trị.',
    isPartyMember: true,
    partyDetails: 'kết nạp Đảng ngày 18/9/2000 tại Chi bộ thôn Đức Xá, Đảng bộ xã Vĩnh Thủy, tỉnh Quảng Trị. Hiện đang sinh hoạt Đảng tại Chi bộ thôn Đức Xá, Đảng bộ xã Vĩnh Thủy, tỉnh Quảng Trị. Hồ sơ Đảng lưu tại Ban xây dựng Đảng, Đảng ủy xã Vĩnh Thủy, tỉnh Quảng Trị.',
    history: [
      { timeRange: '1977 – 1986', description: 'sống với cha mẹ tại xã Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1986 - 1991', description: 'Đi học cấp 1 ở trường làng tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1991 - 1997', description: 'phụ giúp gia đình tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1997 – 1999', description: 'Đi bộ đội phòng không ở phường Hòa Minh, quận Liên Chiểu, thành phố Đà Nẵng(Nay là Phường Hòa Khánh, Thành phố Đà Nẵng)' },
      { timeRange: '1999', description: 'Lập gia đình tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: 'Năm 1999 – nay', description: 'Sinh sống và làm nông tại Đội 2, thôn Đức Xá, Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
    ],
    politicalAttitude: 'Luôn chấp hành tốt mọi chủ trương, đường lối, chính sách của Đảng và pháp luật của Nhà nước.'
  },
  'Mẹ ruột': {
    title: '6. Mẹ ruột',
    fullName: 'NGUYỄN THỊ F',
    birthYear: '1976',
    religion: 'Không',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    cccd: '0492123456789',
    job: 'Nông dân',
    hometown: 'Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).',
    birthplace: 'Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).',
    permanentAddress: 'Đội 2, thôn Đức Xá, Xã Vĩnh Thủy, tỉnh Quảng Trị.',
    history: [
      { timeRange: '1976 – 1982', description: 'Sống với cha mẹ tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1982 - 1987', description: 'đi học cấp 1 tại trường làng ở Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1987 - 1999', description: 'phụ giúp gia đình tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '1999', description: 'Lập gia đình tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: 'Năm 1999 – nay', description: 'Sinh sống và làm nông tại Đội 2, thôn Đức Xá, Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
    ],
    politicalAttitude: 'Luôn chấp hành tốt mọi chủ trương, đường lối, chính sách của Đảng và pháp luật của Nhà nước.'
  },
  'Em ruột': {
    title: '7. Em ruột',
    fullName: 'LÊ VĂN V',
    birthYear: '2004',
    religion: 'Không',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    cccd: '0492123456789',
    job: 'Sinh viên',
    hometown: 'Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).',
    birthplace: 'Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).',
    permanentAddress: '15X Ngũ Hành Sơn, Tổ 61, phường Mỹ An, quận Sơn Trà, thành phố Đà Nẵng',
    isPartyMember: true,
    partyDetails: 'kết nạp Đảng ngày 26/7/2023 tại Chi bộ Sinh viên thuộc Đảng bộ Trường Đại học Kinh tế - Đại học Đà Nẵng. Hiện đang sinh hoạt Đảng tại Chi bộ Sinh viên thuộc Đảng bộ Trường Đại học Kinh tế. Hồ sơ Đảng lưu tại Đảng ủy ủy ban nhân dân thành phố Đà Nẵng.',
    history: [
      { timeRange: '2004 – 2010', description: 'Còn nhỏ sống với cha mẹ tại Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '2010 – 2015', description: 'Học tại trường tiểu học Vĩnh Thủy, Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '2015 – 2019', description: 'Học tại Trường trung học cơ sở Chu Văn An, Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '2019 – 2022', description: 'Học tại trường Trung học cơ sở và trung học phổ thông Bến Hải, Xã Vĩnh Thủy, tỉnh Quảng Trị. (Trước đây là Xã Vĩnh Thủy, huyện Vĩnh Linh, tỉnh Quảng Trị).' },
      { timeRange: '2022 – nay', description: 'Học Đại học tại trường Đại học công nghệ thông tin và truyền thông Việt Hàn, phường Ngũ Hành Sơn, thành phố Đà Nẵng.' },
    ],
    politicalAttitude: 'Luôn chấp hành tốt mọi chủ trương, đường lối, chính sách của Đảng và pháp luật của Nhà nước.'
  }
};

export default function FamilyHistoryForm({ initialData, onSave, onDataChange, onBack, saving, isAdmin = false, fieldFeedback = {}, onFeedbackChange }: FamilyHistoryFormProps) {
  const { config } = useFormConfig();
  const ethnicities = config.lists?.ethnicities || [];
  const religions = config.lists?.religions || [];

  const getFieldConfig = (id: string, defaultLabel: string, defaultRequired = true) => {
    const field = config.fields?.[id];
    return {
      label: field?.label || defaultLabel,
      required: field?.required !== undefined ? field.required : defaultRequired,
      placeholder: field?.placeholder || '',
      hidden: field?.hidden || false
    };
  };

  const relationConfig = getFieldConfig('familyHistory.relation', 'Quan hệ');
  const fullNameConfig = getFieldConfig('familyHistory.fullName', 'Họ và tên');
  const birthYearConfig = getFieldConfig('familyHistory.birthYear', 'Năm sinh');
  const deathYearConfig = getFieldConfig('familyHistory.deathYear', 'Năm mất (nếu có)', false);
  const hometownConfig = getFieldConfig('familyHistory.hometown', 'Quê quán');
  const birthplaceConfig = getFieldConfig('familyHistory.birthplace', 'Nơi sinh');
  const permanentAddressConfig = getFieldConfig('familyHistory.permanentAddress', 'Chỗ ở hiện nay');
  const religionConfig = getFieldConfig('familyHistory.religion', 'Tôn giáo');
  const ethnicityConfig = getFieldConfig('familyHistory.ethnicity', 'Dân tộc');
  const nationalityConfig = getFieldConfig('familyHistory.nationality', 'Quốc tịch');
  const jobConfig = getFieldConfig('familyHistory.job', 'Nghề nghiệp', false);
  const cccdConfig = getFieldConfig('familyHistory.cccd', 'Số CCCD', false);
  const isPartyMemberConfig = getFieldConfig('familyHistory.isPartyMember', 'Là Đảng viên ĐCSVN', false);
  const partyDetailsConfig = getFieldConfig('familyHistory.partyDetails', 'Thông tin Đảng viên', false);
  const historyConfig = getFieldConfig('familyHistory.history', 'Quá trình công tác, sinh sống');
  const rewardsConfig = getFieldConfig('familyHistory.rewards', 'Khen thưởng', false);
  const politicalAttitudeConfig = getFieldConfig('familyHistory.politicalAttitude', 'Thái độ chính trị');

  const { register, control, trigger, watch, formState: { errors } } = useForm<any>({
    mode: 'onChange',
    defaultValues: {
      familyMembers: initialData?.length > 0 ? initialData : [
        { 
          relation: '', fullName: '', birthYear: '', deathYear: '', 
          hometown: '', birthplace: '', permanentAddress: '', 
          religion: '', ethnicity: '', nationality: 'Việt Nam', job: '', cccd: '',
          isPartyMember: false, partyDetails: '',
          history: [{ timeRange: '', description: '' }],
          rewards: '', politicalAttitude: 'Luôn chấp hành tốt mọi chủ trương, đường lối, policy của Đảng và pháp luật của Nhà nước.'
        }
      ]
    }
  });

  const watchedData = watch();
  const lastDataRef = React.useRef(JSON.stringify(watchedData.familyMembers));

  React.useEffect(() => {
    const currentDataStr = JSON.stringify(watchedData.familyMembers);
    if (onDataChange && currentDataStr !== lastDataRef.current) {
      lastDataRef.current = currentDataStr;
      onDataChange(watchedData.familyMembers);
    }
  }, [watchedData.familyMembers, onDataChange]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "familyMembers"
  });

  const [expandedIndex, setExpandedIndex] = useState<number>(0);
  const [showSample, setShowSample] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [missingList, setMissingList] = useState<string[]>([]);
  const [pendingData, setPendingData] = useState<any>(null);

  const watchMembers = watch("familyMembers");
  const currentRelation = watchMembers[expandedIndex]?.relation;
  
  // Find the best matching sample based on relation
  const getSampleKey = (relation: string) => {
    if (!relation) return 'Cha ruột'; // Default
    if (relation.includes('Ông nội')) return 'Ông nội';
    if (relation.includes('Bà nội')) return 'Bà nội';
    if (relation.includes('Ông ngoại')) return 'Ông ngoại';
    if (relation.includes('Bà ngoại')) return 'Bà ngoại';
    if (relation.includes('Cha') || relation.includes('Bố')) return 'Cha ruột';
    if (relation.includes('Mẹ') || relation.includes('Má')) return 'Mẹ ruột';
    if (relation.includes('Anh') || relation.includes('Chị') || relation.includes('Em')) return 'Em ruột';
    return 'Cha ruột';
  };

  const getTemplateKey = (relation: string) => {
    if (!relation) return 'familyHistory_chaRuot';
    if (relation.includes('Ông nội')) return 'familyHistory_ongNoi';
    if (relation.includes('Bà nội')) return 'familyHistory_baNoi';
    if (relation.includes('Ông ngoại')) return 'familyHistory_ongNgoai';
    if (relation.includes('Bà ngoại')) return 'familyHistory_baNgoai';
    if (relation.includes('Cha') || relation.includes('Bố')) return 'familyHistory_chaRuot';
    if (relation.includes('Mẹ') || relation.includes('Má')) return 'familyHistory_meRuot';
    if (relation.includes('Anh') || relation.includes('Chị') || relation.includes('Em')) return 'familyHistory_emRuot';
    return 'familyHistory_chaRuot';
  };

  const sampleKey = getSampleKey(currentRelation);
  const sampleData = SAMPLES[sampleKey];
  const templateKey = getTemplateKey(currentRelation);
  const templateData = config.templates?.[templateKey];

  const validateAddress = (value: string) => {
    if (!value) return true; // Optional if dead
    const lower = value.toLowerCase();
    const hasLevel1 = lower.includes('tổ') || lower.includes('thôn') || lower.includes('xóm') || lower.includes('đường') || lower.includes('số') || lower.includes('đội');
    const hasLevel2 = lower.includes('xã') || lower.includes('phường') || lower.includes('thị trấn');
    const hasLevel3 = lower.includes('tỉnh') || lower.includes('thành phố');
    
    if (!hasLevel1 || !hasLevel2 || !hasLevel3) {
      return 'Địa chỉ phải có đủ 3 cấp (Tổ/Thôn/Xóm... Xã/Phường... Tỉnh/Thành phố)';
    }
    return true;
  };

  const validateHometown = (value: string) => {
    if (!value.includes('Trước đây là') && !value.includes('trước đây là')) {
      return 'Phải kê khai rõ địa chỉ cũ và mới. VD: Xã A, Tỉnh B (Trước đây là Xã A, Huyện C, Tỉnh B)';
    }
    return true;
  };

  const handleFormSubmit = (data: any, isSubmit = false, stayOnStep = false) => {
    const members = data.familyMembers || [];
    const declaredRelations = members.map((m: any) => m.relation);
    
    const expected = [
      'Ông nội', 'Bà nội', 'Ông ngoại', 'Bà ngoại', 
      'Cha ruột', 'Mẹ ruột'
    ];
    
    const missing = expected.filter(rel => !declaredRelations.includes(rel));
    
    const hasSibling = declaredRelations.some((r: string) => ['Anh ruột', 'Chị ruột', 'Em ruột'].includes(r));
    if (!hasSibling) {
      missing.push('Anh/Chị/Em ruột');
    }

    if (missing.length > 0 && !stayOnStep) {
      setMissingList(missing);
      setPendingData(members);
      setShowWarning(true);
    } else {
      onSave(members, isSubmit, stayOnStep);
    }
  };

  return (
    <form className="space-y-6">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="text-lg font-medium text-gray-900">Lịch sử chính trị của người thân</h3>
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
            onClick={() => {
              append({ 
                relation: '', fullName: '', birthYear: '', deathYear: '', 
                hometown: '', birthplace: '', permanentAddress: '', 
                religion: '', ethnicity: '', nationality: 'Việt Nam', job: '', cccd: '',
                isPartyMember: false, partyDetails: '',
                history: [{ timeRange: '', description: '' }],
                rewards: '', politicalAttitude: 'Luôn chấp hành tốt mọi chủ trương, đường lối, chính sách của Đảng và pháp luật của Nhà nước.'
              });
              setExpandedIndex(fields.length);
            }}
            className="flex items-center gap-1 text-sm text-brand-red hover:text-brand-red-dark bg-red-50 px-3 py-1 rounded-md"
          >
            <Plus size={16} /> Thêm người thân
          </button>
        </div>
      </div>

      {showSample && (
        <div className="bg-gray-50 p-4 rounded-md mb-6 text-sm text-gray-800 border border-gray-200">
          {templateData ? (
            <div className="whitespace-pre-wrap text-gray-700">{templateData}</div>
          ) : sampleData ? (
            <>
              <p className="font-semibold mb-3 text-gray-900">Mẫu kê khai Lịch sử chính trị người thân (Ví dụ: {sampleData.title}):</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-4 font-mono text-xs">
                <div><span className="font-semibold">Họ và tên:</span> {sampleData.fullName}</div>
                <div>
                  <span className="font-semibold">Năm sinh:</span> {sampleData.birthYear}
                  {sampleData.deathYear && <span className="ml-4"><span className="font-semibold">Năm mất:</span> {sampleData.deathYear}</span>}
                </div>
                <div><span className="font-semibold">Tôn giáo:</span> {sampleData.religion}</div>
                <div><span className="font-semibold">Dân tộc:</span> {sampleData.ethnicity}</div>
                <div><span className="font-semibold">Quốc tịch:</span> {sampleData.nationality}</div>
                {sampleData.job && <div><span className="font-semibold">Nghề nghiệp:</span> {sampleData.job}</div>}
                {sampleData.cccd && <div><span className="font-semibold">CCCD:</span> {sampleData.cccd}</div>}
                <div className="md:col-span-2"><span className="font-semibold">Quê quán:</span> {sampleData.hometown}</div>
                <div className="md:col-span-2"><span className="font-semibold">Nơi sinh:</span> {sampleData.birthplace}</div>
                {sampleData.permanentAddress && <div className="md:col-span-2"><span className="font-semibold">Chỗ ở hiện nay:</span> {sampleData.permanentAddress}</div>}
                {sampleData.isPartyMember && <div className="md:col-span-2"><span className="font-semibold">Đảng viên:</span> Là Đảng viên Đảng Cộng sản Việt Nam</div>}
                {sampleData.partyDetails && <div className="md:col-span-2"><span className="font-semibold">Thông tin Đảng viên:</span> {sampleData.partyDetails}</div>}
              </div>
              <p className="font-semibold mb-2 text-gray-900 mt-4">Quá trình công tác, sinh sống:</p>
              <div className="space-y-2 font-mono text-xs pl-2 border-l-2 border-gray-300">
                {sampleData.history.map((h: any, i: number) => (
                  <div key={i} className="grid grid-cols-12 gap-2">
                    <div className="col-span-3 font-semibold">{h.timeRange}</div>
                    <div className="col-span-9">{h.description}</div>
                  </div>
                ))}
              </div>
              {sampleData.rewards && (
                <div className="mt-4 font-mono text-xs">
                  <span className="font-semibold">Khen thưởng:</span> {sampleData.rewards}
                </div>
              )}
              {sampleData.politicalAttitude && (
                <div className="mt-2 font-mono text-xs">
                  <span className="font-semibold">Thái độ chính trị:</span> {sampleData.politicalAttitude}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => {
          const isExpanded = expandedIndex === index;
          const isDead = !!watchMembers[index]?.deathYear;
          const isPartyMember = !!watchMembers[index]?.isPartyMember;

          return (
            <div key={field.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <div 
                className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
              >
                <div className="font-medium text-gray-800">
                  {watchMembers[index]?.relation || 'Người thân'} - {watchMembers[index]?.fullName || 'Chưa nhập tên'}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); remove(index); }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 space-y-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{relationConfig.label} {relationConfig.required && '*'}</label>
                      <select
                        {...register(`familyMembers.${index}.relation` as const, { required: relationConfig.required ? 'Bắt buộc' : false })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red"
                      >
                        <option value="">-- Chọn --</option>
                        {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <FieldFeedback fieldPath={`familyHistory.${index}.relation`} feedback={fieldFeedback[`familyHistory.${index}.relation`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{fullNameConfig.label} {fullNameConfig.required && '*'}</label>
                      <input
                        {...register(`familyMembers.${index}.fullName` as const, { required: fullNameConfig.required ? 'Bắt buộc' : false })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red uppercase"
                        placeholder={fullNameConfig.placeholder}
                      />
                      <FieldFeedback fieldPath={`familyHistory.${index}.fullName`} feedback={fieldFeedback[`familyHistory.${index}.fullName`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{birthYearConfig.label} {birthYearConfig.required && '*'}</label>
                        <input
                          {...register(`familyMembers.${index}.birthYear` as const, { required: birthYearConfig.required ? 'Bắt buộc' : false })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red"
                          placeholder={birthYearConfig.placeholder}
                        />
                        <FieldFeedback fieldPath={`familyHistory.${index}.birthYear`} feedback={fieldFeedback[`familyHistory.${index}.birthYear`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{deathYearConfig.label} {deathYearConfig.required && '*'}</label>
                        <input
                          {...register(`familyMembers.${index}.deathYear` as const, { required: deathYearConfig.required ? 'Bắt buộc' : false })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red"
                          placeholder={deathYearConfig.placeholder}
                        />
                        <FieldFeedback fieldPath={`familyHistory.${index}.deathYear`} feedback={fieldFeedback[`familyHistory.${index}.deathYear`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{hometownConfig.label} {hometownConfig.required && '*'}</label>
                      <input
                        {...register(`familyMembers.${index}.hometown` as const, { 
                          required: hometownConfig.required ? 'Bắt buộc' : false, validate: validateHometown 
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red"
                        placeholder={hometownConfig.placeholder || "Có địa chỉ cũ và mới"}
                      />
                      {errors?.familyMembers?.[index]?.hometown && (
                        <p className="text-red-500 text-xs mt-1">{errors?.familyMembers?.[index]?.hometown?.message as string}</p>
                      )}
                      <FieldFeedback fieldPath={`familyHistory.${index}.hometown`} feedback={fieldFeedback[`familyHistory.${index}.hometown`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{birthplaceConfig.label} {birthplaceConfig.required && '*'}</label>
                      <input
                        {...register(`familyMembers.${index}.birthplace` as const, { 
                          required: birthplaceConfig.required ? 'Bắt buộc' : false, validate: validateHometown 
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red"
                        placeholder={birthplaceConfig.placeholder || "Có địa chỉ cũ và mới"}
                      />
                      {errors?.familyMembers?.[index]?.birthplace && (
                        <p className="text-red-500 text-xs mt-1">{errors?.familyMembers?.[index]?.birthplace?.message as string}</p>
                      )}
                      <FieldFeedback fieldPath={`familyHistory.${index}.birthplace`} feedback={fieldFeedback[`familyHistory.${index}.birthplace`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                    </div>
                  </div>

                  {!isDead && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{permanentAddressConfig.label} {permanentAddressConfig.required && '*'}</label>
                      <input
                        {...register(`familyMembers.${index}.permanentAddress` as const, { 
                          required: permanentAddressConfig.required ? 'Bắt buộc' : false, validate: isDead ? undefined : validateAddress 
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red"
                        placeholder={permanentAddressConfig.placeholder}
                      />
                      {errors?.familyMembers?.[index]?.permanentAddress && (
                        <p className="text-red-500 text-xs mt-1">{errors?.familyMembers?.[index]?.permanentAddress?.message as string}</p>
                      )}
                      <FieldFeedback fieldPath={`familyHistory.${index}.permanentAddress`} feedback={fieldFeedback[`familyHistory.${index}.permanentAddress`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                    </div>
                  )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{religionConfig.label} {religionConfig.required && '*'}</label>
                        <select
                          {...register(`familyMembers.${index}.religion` as const, { required: religionConfig.required ? 'Bắt buộc' : false })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red"
                        >
                          <option value="">-- Chọn --</option>
                          {religions.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <FieldFeedback fieldPath={`familyHistory.${index}.religion`} feedback={fieldFeedback[`familyHistory.${index}.religion`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{ethnicityConfig.label} {ethnicityConfig.required && '*'}</label>
                        <select
                          {...register(`familyMembers.${index}.ethnicity` as const, { required: ethnicityConfig.required ? 'Bắt buộc' : false })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red"
                        >
                          <option value="">-- Chọn --</option>
                          {ethnicities.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                        <FieldFeedback fieldPath={`familyHistory.${index}.ethnicity`} feedback={fieldFeedback[`familyHistory.${index}.ethnicity`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{nationalityConfig.label} {nationalityConfig.required && '*'}</label>
                      <input
                        {...register(`familyMembers.${index}.nationality` as const, { required: nationalityConfig.required ? 'Bắt buộc' : false })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red"
                        placeholder={nationalityConfig.placeholder}
                      />
                      <FieldFeedback fieldPath={`familyHistory.${index}.nationality`} feedback={fieldFeedback[`familyHistory.${index}.nationality`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                    </div>
                    {!isDead && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{jobConfig.label} {jobConfig.required && '*'}</label>
                        <input
                          {...register(`familyMembers.${index}.job` as const, { required: jobConfig.required ? 'Bắt buộc' : false })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red"
                          placeholder={jobConfig.placeholder}
                        />
                        <FieldFeedback fieldPath={`familyHistory.${index}.job`} feedback={fieldFeedback[`familyHistory.${index}.job`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                      </div>
                    )}
                  </div>

                  {!['Ông nội', 'Bà nội', 'Ông ngoại', 'Bà ngoại', 'Ông nội kế', 'Bà nội kế', 'Ông ngoại kế', 'Bà ngoại kế'].includes(watchMembers[index]?.relation) && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">{cccdConfig.label} {cccdConfig.required && '*'}</label>
                          <input
                            {...register(`familyMembers.${index}.cccd` as const, { 
                              required: cccdConfig.required ? 'Bắt buộc' : false,
                              pattern: { value: /^[0-9]{12}$/, message: 'Phải đủ 12 số' }
                            })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red"
                            placeholder={cccdConfig.placeholder}
                          />
                          <FieldFeedback fieldPath={`familyHistory.${index}.cccd`} feedback={fieldFeedback[`familyHistory.${index}.cccd`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">{isPartyMemberConfig.label}</label>
                          <div className="mt-2">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                {...register(`familyMembers.${index}.isPartyMember` as const)}
                                className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
                              />
                              <span className="ml-2 text-sm text-gray-700">Là Đảng viên</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {isPartyMember && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Thông tin Đảng viên *</label>
                          <textarea
                            {...register(`familyMembers.${index}.partyDetails` as const, { required: 'Bắt buộc' })}
                            rows={2}
                            placeholder="Kết nạp ngày... tại Chi bộ... Hiện sinh hoạt tại... Hồ sơ lưu tại..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red"
                          />
                          <FieldFeedback fieldPath={`familyHistory.${index}.partyDetails`} feedback={fieldFeedback[`familyHistory.${index}.partyDetails`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quá trình công tác, sinh sống *</label>
                    <HistoryField control={control} register={register} watch={watch} errors={errors} memberIndex={index} relation={watchMembers[index]?.relation} isAdmin={isAdmin} fieldFeedback={fieldFeedback} onFeedbackChange={onFeedbackChange} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Khen thưởng (nếu có)</label>
                    <input
                      {...register(`familyMembers.${index}.rewards` as const)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red"
                    />
                    <FieldFeedback fieldPath={`familyHistory.${index}.rewards`} feedback={fieldFeedback[`familyHistory.${index}.rewards`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                  </div>

                  {!isDead && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Thái độ chính trị hiện nay *</label>
                      <textarea
                        {...register(`familyMembers.${index}.politicalAttitude` as const, { required: !isDead ? 'Bắt buộc' : false })}
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-red"
                      />
                      <FieldFeedback fieldPath={`familyHistory.${index}.politicalAttitude`} feedback={fieldFeedback[`familyHistory.${index}.politicalAttitude`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

        {/* Render Custom Fields for Family History */}
        {config.customFields && config.customFields.filter(f => f.section === 'familyHistory').length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-md font-medium text-gray-800 mb-4">Thông tin bổ sung (Lịch sử gia đình)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {config.customFields.filter(f => f.section === 'familyHistory').map(field => (
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
                  <FieldFeedback fieldPath={`familyHistory.customFields.${field.id}`} feedback={fieldFeedback[`familyHistory.customFields.${field.id}`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin} />
                </div>
              ))}
            </div>
          </div>
        )}

      <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
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
              handleFormSubmit(watch(), false, false);
            }}
            disabled={saving}
            className="bg-brand-red text-white px-6 py-2 rounded-md hover:bg-brand-red-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu và Tiếp tục'}
          </button>
        </div>
      </div>

      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-red-600 mb-3">Cảnh báo thiếu thông tin</h3>
            <p className="text-gray-700 mb-4 text-sm">
              Bạn chưa kê khai các người thân sau: <br/>
              <strong className="block mt-2 text-base">{missingList.join(', ')}</strong>
            </p>
            <p className="text-gray-700 mb-6 text-sm">
              Bạn có chắc chắn rằng mình không có (hoặc không biết thông tin) những người này không?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setShowWarning(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Quay lại bổ sung
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowWarning(false);
                  onSave(pendingData);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
              >
                Tôi chắc chắn, nộp hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

function HistoryField({ control, register, watch, errors, memberIndex, relation, isAdmin, fieldFeedback, onFeedbackChange }: { control: any, register: any, watch: any, errors: any, memberIndex: number, relation?: string, isAdmin?: boolean, fieldFeedback?: Record<string, string>, onFeedbackChange?: (fieldPath: string, value: string) => void }) {
  const { fields, append, remove, replace, move } = useFieldArray({
    control,
    name: `familyMembers.${memberIndex}.history`
  });

  const [draggedHistoryIndex, setDraggedHistoryIndex] = useState<number | null>(null);

  const historyValues = watch(`familyMembers.${memberIndex}.history`);

  const handleAutoSuggest = () => {
    const rel = relation?.toLowerCase() || '';
    const isGrandparent = rel.includes('ông') || rel.includes('bà');
    const isParent = rel.includes('cha') || rel.includes('mẹ') || rel.includes('bố') || rel.includes('má');
    
    if (isGrandparent) {
      replace([
        { timeRange: '... - ...', description: 'Còn nhỏ ở với gia đình tại...' },
        { timeRange: '... - ...', description: 'Làm ruộng/Làm nghề... tại...' },
        { timeRange: '... - nay', description: 'Già yếu, ở nhà với con cháu tại...' }
      ]);
    } else if (isParent) {
      replace([
        { timeRange: '... - ...', description: 'Còn nhỏ ở với bố mẹ tại...' },
        { timeRange: '... - ...', description: 'Học sinh trường Tiểu học...' },
        { timeRange: '... - ...', description: 'Học sinh trường Trung học cơ sở...' },
        { timeRange: '... - ...', description: 'Học sinh trường Trung học phổ thông...' },
        { timeRange: '... - ...', description: 'Làm nghề... tại...' },
        { timeRange: 'Năm ...', description: 'Lập gia đình tại...' },
        { timeRange: '... - ...', description: 'Làm nghề... tại...' },
        { timeRange: '... - nay', description: 'Làm nghề... Hiện đang cư trú tại...' }
      ]);
    } else {
      replace([
        { timeRange: '... - ...', description: 'Còn nhỏ ở với bố mẹ tại...' },
        { timeRange: '... - ...', description: 'Học sinh trường Tiểu học...' },
        { timeRange: '... - ...', description: 'Học sinh trường Trung học cơ sở...' },
        { timeRange: '... - ...', description: 'Học sinh trường Trung học phổ thông...' },
        { timeRange: '... - nay', description: 'Làm nghề... Hiện đang cư trú tại...' }
      ]);
    }
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

  const validateNoDots = (value: string) => {
    if (value && value.includes('...')) {
      return 'Vui lòng điền thông tin cụ thể, không để trống (...)';
    }
    return true;
  };

  const continuityWarnings = checkContinuity(historyValues || []);

  return (
    <div className="space-y-2 border border-gray-200 p-3 rounded-md bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs text-gray-500">Tóm tắt quá trình từ thời niên thiếu cho đến nay. Ghi rõ địa danh hành chính (cũ và mới nếu có thay đổi).</p>
        <button
          type="button"
          onClick={handleAutoSuggest}
          className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-200"
        >
          Gợi ý hoàn thiện
        </button>
      </div>

      {continuityWarnings.length > 0 && (
        <div className="bg-yellow-50 p-2 rounded-md mb-2 text-xs text-yellow-800 border border-yellow-200">
          <p className="font-semibold mb-1">Cảnh báo mốc thời gian:</p>
          <ul className="list-disc pl-4">
            {continuityWarnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {fields.map((field, idx) => {
        const formatWarning = checkFormat(historyValues?.[idx]?.description);
        return (
        <div 
          key={field.id} 
          draggable
          onDragStart={() => setDraggedHistoryIndex(idx)}
          onDragEnter={(e) => e.preventDefault()}
          onDragOver={(e) => {
            e.preventDefault();
            if (draggedHistoryIndex !== null && draggedHistoryIndex !== idx) {
              move(draggedHistoryIndex, idx);
              setDraggedHistoryIndex(idx);
            }
          }}
          onDragEnd={() => setDraggedHistoryIndex(null)}
          className={`flex flex-col gap-1 p-2 -mx-2 rounded transition-colors ${draggedHistoryIndex === idx ? 'bg-gray-200 opacity-50' : 'hover:bg-gray-100'}`}
        >
          <div className="flex gap-2 items-start">
            <div className="flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1">
              <GripVertical size={16} />
            </div>
            <div className="w-1/4 flex flex-col gap-1">
              <input
                {...register(`familyMembers.${memberIndex}.history.${idx}.timeRange` as const, { 
                  required: 'Bắt buộc nhập',
                  validate: validateNoDots
                })}
                placeholder="VD: 1949 - 1954"
                className={`w-full px-2 py-1 text-sm border rounded focus:ring-brand-red ${errors?.familyMembers?.[memberIndex]?.history?.[idx]?.timeRange ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors?.familyMembers?.[memberIndex]?.history?.[idx]?.timeRange && (
                <span className="text-red-500 text-[10px] leading-tight">{errors.familyMembers[memberIndex].history[idx].timeRange.message}</span>
              )}
            </div>
            <div className="flex-grow flex flex-col gap-1">
              <input
                {...register(`familyMembers.${memberIndex}.history.${idx}.description` as const, { 
                  required: 'Bắt buộc nhập',
                  validate: validateNoDots
                })}
                placeholder="Còn nhỏ ở với gia đình tại..."
                className={`w-full px-2 py-1 text-sm border rounded focus:ring-brand-red ${errors?.familyMembers?.[memberIndex]?.history?.[idx]?.description ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors?.familyMembers?.[memberIndex]?.history?.[idx]?.description && (
                <span className="text-red-500 text-[10px] leading-tight">{errors.familyMembers[memberIndex].history[idx].description.message}</span>
              )}
              {formatWarning && (
                <p className="text-yellow-600 text-xs italic">{formatWarning}</p>
              )}
            </div>
            <button type="button" onClick={() => remove(idx)} className="text-red-500 hover:text-red-700 px-1 h-fit mt-1">
              <Trash2 size={16} />
            </button>
          </div>
          <FieldFeedback fieldPath={`familyHistory.${memberIndex}.history.${idx}`} feedback={fieldFeedback?.[`familyHistory.${memberIndex}.history.${idx}`]} onFeedbackChange={onFeedbackChange} isAdmin={isAdmin || false} />
        </div>
      )})}
      <button
        type="button"
        onClick={() => append({ timeRange: '', description: '' })}
        className="text-xs text-brand-red hover:underline mt-1"
      >
        + Thêm giai đoạn
      </button>
    </div>
  );
}
