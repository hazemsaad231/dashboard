

// src/components/PaginationControls/PaginationControls.jsx

import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';




// يتم تمرير الخصائص التي يحتاجها المكون للعمل

interface PaginationControlsProps {
    current: number;
    totalPages: number;
    itemsPerPage: number;
    setCurrent: (page: number) => void;
    setItemsPerPage: (items: number) => void;
}

export default function PaginationControls({
  current,             // رقم الصفحة الحالية
  totalPages,          // العدد الإجمالي للصفحات
  itemsPerPage,        // عدد العناصر في كل صفحة
  setCurrent,          // دالة لتغيير رقم الصفحة
  setItemsPerPage      // دالة لتغيير عدد العناصر لكل صفحة
}: PaginationControlsProps) {

  // قائمة بخيارات عدد الصفوف
  const rowsOptions = [5, 10, 15, 20];

  return (
    <div className="flex justify-between items-center gap-2 pt-4 border-t border-slate-200 mt-4">
      
      {/* التحكم في عدد الصفوف */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-600">عدد الصفوف :</label>
        <select 
          value={itemsPerPage} 
          onChange={(e) => { 
            // 1. تغيير عدد العناصر في الصفحة
            setItemsPerPage(Number(e.target.value)); 
            // 2. العودة إلى الصفحة الأولى عند تغيير العدد
            setCurrent(1); 
          }} 
          className="border border-gray-300 rounded-lg p-2 text-sm bg-white focus:border-blue-500 transition-all outline-none"
        >
          {rowsOptions.map(num => <option key={num} value={num}>{num}</option>)}
        </select>
      </div>

      {/* أزرار التنقل */}
      <div className="flex items-center gap-2">
        {/* زر السابق */}
        <button 
          onClick={() => setCurrent(current - 1)} 
          disabled={current === 1} 
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
          title="السابق"
        >
          <IoIosArrowForward size={20} className="text-slate-600" />
        </button>

        {/* عرض رقم الصفحة */}
        <span className="text-sm text-slate-600 font-medium min-w-[40px] text-center">
          {current} / {totalPages}
        </span>

        {/* زر التالي */}
        <button 
          onClick={() => setCurrent(current + 1)} 
          disabled={current === totalPages} 
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
          title="التالي"
        >
          <IoIosArrowBack size={20} className="text-slate-600" />
        </button>
      </div>
    </div>
  );
}