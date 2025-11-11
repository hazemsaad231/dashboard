import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Load from '../Load/load';
import 'react-toastify/dist/ReactToastify.css';
import { CiSearch } from 'react-icons/ci';
import { api } from '../Api/api';
import { DataGrid, GridCellParams } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import toast from 'react-hot-toast';
import { BsFillSendCheckFill } from "react-icons/bs";
import { MdOutlineMailOutline } from "react-icons/md";

export default function Emails() {


  const location = useLocation();
  const navigate = useNavigate();
  const [all, setAll] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  const lastIndex = current * itemsPerPage;
  const startIndex = lastIndex - itemsPerPage;
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  const currentData = data.slice(startIndex, lastIndex);

  const norm = (s = '') =>
    String(s)
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/\s+/g, '')
      .toLowerCase();

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${api}/newsletter-subscribers`);
      const payload = r?.data?.data ?? [];
      setAll(payload);
      setData(payload);
    } catch (err) {
      console.error('fetch services error:', err);
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ... (بقية الـ useEffect بدون تغيير)
    (async () => {
      await fetchData();
      const newItem = (location as any).state?.newItem;
      if (newItem) {
        setAll(prev => (prev.some(it => String(it.id ?? it._id) === String(newItem.id ?? newItem._id)) ? prev : [newItem, ...prev]));
        setData(prev => (prev.some(it => String(it.id ?? it._id) === String(newItem.id ?? newItem._id)) ? prev : [newItem, ...prev]));
        try { window.history.replaceState({}, document.title); } catch {}
      }
    })();
  }, [location.key]);

  const search = (q = '') => {
    const t = q.trim();
    if (!t) return setData(all);
    setData(all.filter(it => norm(it.email ?? '')?.includes(norm(t))));
    setCurrent(1);
  };

  const rows = currentData.map((it, i) => ({
    id: it.id ?? it._id ?? String(startIndex + i + 1),
    email: it.email ?? '-',
    _raw: it,
  }));

  const handleSelectAll = (checked: boolean) => {
    const currentPageIds = currentData.map(it => it.id ?? it._id ?? '');
    if (checked) {
      setCheckedIds(prev => Array.from(new Set([...prev, ...currentPageIds])));
    } else {
    
      setCheckedIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    }
  };

  // تحديد ما إذا كانت جميع الصفوف في الصفحة الحالية محددة
  const isAllChecked = currentData.every(it => checkedIds.includes(it.id ?? it._id ?? ''));

  const columns: any = [
    {
      field: 'checkbox',
      headerName: ( 
        <input
          type="checkbox"
          checked={isAllChecked}
          onChange={(e) => handleSelectAll(e.target.checked)}
          title="تحديد/إلغاء تحديد الكل في هذه الصفحة"
        />
      ),
      width: 60,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: GridCellParams) => {
        const id = params.row.id;
        const isChecked = checkedIds.includes(id);

        return (
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => {
              if (e.target.checked) {
                setCheckedIds([...checkedIds, id]);
              } else {
                setCheckedIds(checkedIds.filter(i => i !== id));
              }
            }}
          />
        );
      }
    },
    {
      field: 'email',
      headerName: 'البريد الإلكتروني',
      flex: 1,
      minWidth: 200, // زيادة العرض قليلاً للتركيز
      headerAlign: 'left',
      align: 'center', // محاذاة لليمين
      disableColumnMenu: true,
      renderCell: (p: any) => (
        <div className="w-full h-full flex items-center justify-start"> {/* تعديل المحاذاة */}
          <span className="font-medium text-base truncate">
            {p.value}
          </span>
        </div>
      ),
    },
    {
      field: 'actions',
      headerName: 'إرسال رسالة',
      width: 150,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (p: any) => (
        <div className="flex justify-center w-full items-center h-full">
          {/* تعديل تصميم زر الإرسال الفردي */}
          <Link to={`/dashboard/sendEmail/${p.id}`} className="p-2 text-slate-700 hover:text-[#DFC96D] hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1 font-medium" title="ارسال رسالة لهذا المشترك">
            <MdOutlineMailOutline size={22} /> إرسال
          </Link>
        </div>
      ),
    },
  ];

  const goToContactWithIds = () => {
    if (checkedIds.length === 0) {
      toast.error("لم يتم تحديد أي مشترك لإرسال رسالة جماعية");
      return;
    }
    navigate("/dashboard/sendEmail", { state: { ids: checkedIds } });
  };

  return (
    <div className="z-0 lg:mr-52 py-16 lg:py-12 px-2 md:px-4 lg:px-8 bg-gradient-to-b from-slate-50 to-slate-100">
      {loading ? (
        <Load />
      ) : (
        <div>
          <div className="flex justify-between items-start md:items-center gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="font-bold text-3xl md:text-4xl lg:text-4xl text-slate-900">النشرة البريدية</h1>
              <p className="text-slate-500 text-sm">عرض جميع المشتركين في النشرة البريدية</p>
            </div>
          </div>

          <Paper className="p-6 mt-8 rounded-2xl shadow-lg border border-gray-200">
            <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
              {/* شريط البحث */}
              <div className="relative w-full md:w-80">
                <CiSearch size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث حسب البريد الإلكتروني..." // تغيير Placeholder
                  onChange={(e) => search(e.target.value)}
                  className="w-full h-12 rounded-lg pl-4 pr-10 bg-slate-50 border border-gray-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                />
              </div>

              {/* أزرار الإرسال */}

              <div className="flex gap-2">
  {isAllChecked ? (
    <>
      {/* إرسال للجميع - بلون مميز */}
                <Link to="/dashboard/sendEmail" className="px-4 py-2 rounded-full bg-[#DFC96D] hover:bg-[#978644] text-white font-semibold transition-colors flex items-center gap-1">
                  <BsFillSendCheckFill size={18} /> إرسال للجميع
                </Link>
      </>
  ):
    (
      <>
      {/* إرسال للمحددين - تفعيل وتعطيل بناءً على التحديد */}
                <button
                  onClick={goToContactWithIds}
                  disabled={checkedIds.length === 0} // تعطيل الزر في حالة عدم التحديد
                  className={`px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-1 ${
                    checkedIds.length > 0
                      ? 'bg-[#DFC96D] hover:bg-[#978644] text-white' // لون نشط
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed' // لون معطل
                  }`}
                >
                  <BsFillSendCheckFill size={18} /> { `ارسال (${checkedIds.length})`}
                </button>

      </>
    )
  }
              

                
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <div className="min-w-[700px]">
                <DataGrid
                  rows={rows}
                  columns={columns}
                  rowHeight={60}
                  hideFooter
                  autoHeight
                  getRowClassName={(params) => checkedIds.includes(params.row.id) ? 'bg-blue-50/70' : ''}
                  sx={{
                    '& .MuiDataGrid-columnHeader': { backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontWeight: 700, color: '#334155' },
                    '& .MuiDataGrid-row': { borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s', '&:hover': { backgroundColor: '#f0f4f8' } },
                    '& .MuiDataGrid-cell': { fontSize: '0.95rem' },
                    '& .MuiDataGrid-scrollbarContent': { width: '100% !important', boxSizing: 'border-box' },
                    '& .MuiDataGrid-virtualScroller': { overflowY: 'auto', willChange: 'transform' }
                  }}
                />
              </div>
            </div>

            {/* التنقل في الصفحات */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-200 mt-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">عدد الصفوف :</label>
                <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrent(1); }} className="border border-gray-300 rounded-lg p-2 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none">
                  {[5, 10, 15, 20].map(num => <option key={num} value={num}>{num}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setCurrent(current > 1 ? current - 1 : current)} disabled={current === 1} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="السابق">
                  <IoIosArrowForward size={20} className="text-slate-600" />
                </button>

                <span className="text-sm text-slate-600 font-medium min-w-[40px] text-center">{current} / {totalPages}</span>

                <button onClick={() => setCurrent(current < totalPages ? current + 1 : current)} disabled={current === totalPages} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="التالي">
                  <IoIosArrowBack size={20} className="text-slate-600" />
                </button>
              </div>
            </div>
          </Paper>
        </div>
      )}
    </div>
  );
}