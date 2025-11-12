

import { Dialog } from '@headlessui/react';
import { MdDelete } from 'react-icons/md';
import React from 'react';

// تحديد الخصائص التي سيستقبلها المكون
interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmButtonText?: string;
  icon?: React.ReactNode; // لاستقبال أيقونة مختلفة إذا لزم الأمر
  iconBgClass?: string; // لتغيير لون خلفية الأيقونة
}

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmButtonText = 'تأكيد', // قيمة افتراضية
  icon = <MdDelete className="h-6 w-6 text-red-600" />, // أيقونة الحذف كقيمة افتراضية
  iconBgClass = 'bg-red-100', // لون خلفية أيقونة الحذف كقيمة افتراضية
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Overlay للخلفية الداكنة */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" aria-hidden="true" />

      {/* الحاوية الرئيسية للحوار */}
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white px-6 py-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="flex items-start gap-4">
            {/* منطقة الأيقونة القابلة للتخصيص */}
            <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${iconBgClass}`}>
              {icon}
            </div>
            
            {/* المحتوى */}
            <div className="flex-1">
              <Dialog.Title as="h3" className="text-lg font-semibold text-slate-900">
                {title}
              </Dialog.Title>
              <p className="mt-2 text-sm text-slate-600">
                {description}
              </p>
            </div>
          </div>
          
          {/* أزرار الإجراءات */}
          <div className="flex gap-3 mt-6 justify-start items-center">
            {/* زر الإلغاء */}
            <button 
              onClick={onClose} 
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              إلغاء
            </button>
            {/* زر التأكيد (الذي سيقوم بالحذف أو الإجراء المطلوب) */}
            <button 
              onClick={onConfirm} 
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-sm"
            >
              {confirmButtonText}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}