import React from 'react';
import { Check, Send } from 'lucide-react';

interface FieldFeedbackProps {
  fieldPath: string;
  feedback?: string;
  onFeedbackChange?: (fieldPath: string, value: string) => void;
  isAdmin: boolean;
}

export default function FieldFeedback({ fieldPath, feedback, onFeedbackChange, isAdmin }: FieldFeedbackProps) {
  const isFixed = feedback?.includes('(Đã sửa)');

  if (isAdmin) {
    return (
      <div className="mt-1 flex gap-2">
        <input
          type="text"
          value={feedback || ''}
          onChange={(e) => onFeedbackChange && onFeedbackChange(fieldPath, e.target.value)}
          placeholder="Nhận xét / Yêu cầu sửa cho trường này..."
          className={`flex-grow px-2 py-1 text-sm border rounded placeholder-yellow-400 focus:outline-none focus:ring-1 ${
            isFixed 
              ? 'border-green-300 bg-green-50 text-green-800 focus:ring-green-500' 
              : 'border-yellow-300 bg-yellow-50 text-yellow-800 focus:ring-yellow-500'
          }`}
        />
        {feedback && (
          <button
            type="button"
            onClick={() => onFeedbackChange && onFeedbackChange(fieldPath, '')}
            className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
            title="Đánh dấu đã hoàn tất và xóa nhận xét"
          >
            <Check size={14} /> Hoàn tất
          </button>
        )}
      </div>
    );
  }

  if (feedback) {
    return (
      <div className={`mt-1 text-sm p-1.5 rounded border flex justify-between items-center ${
        isFixed 
          ? 'text-green-600 bg-green-50 border-green-200' 
          : 'text-red-600 bg-red-50 border-red-200'
      }`}>
        <div>
          <span className="font-semibold">{isFixed ? 'Đã báo sửa:' : 'Yêu cầu sửa:'}</span> {feedback.replace('(Đã sửa)', '').trim()}
        </div>
        {!isFixed && onFeedbackChange && (
          <button
            type="button"
            onClick={() => onFeedbackChange(fieldPath, `${feedback} (Đã sửa)`)}
            className="flex items-center gap-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
          >
            <Send size={12} /> Đã sửa
          </button>
        )}
      </div>
    );
  }

  return null;
}
