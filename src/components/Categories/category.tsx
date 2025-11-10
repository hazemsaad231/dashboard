import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import Load from '../Load/load';
import 'react-toastify/dist/ReactToastify.css';
import { CiSearch } from 'react-icons/ci';
import { FaEdit} from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { api } from '../Api/api';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Dialog } from '@headlessui/react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import toast from 'react-hot-toast';

export default function Category() {
  const location = useLocation();

  // البيانات الأصلية والمرشّحة (للبحث)
  const [all, setAll] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // حذف
  const [sel, setSel] = useState<string | number | null>(null);
  const [open, setOpen] = useState(false);

  // ترقيم الصفحات
  const [current, setCurrent] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const lastIndex = current * itemsPerPage;
  const startIndex = lastIndex - itemsPerPage;
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  const currentData = data.slice(startIndex, lastIndex);

  // تحويل الحروف العربية لأشكال قياسية للتطابق بالبحث
  const norm = (s = '') =>
    String(s)
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/\s+/g, '')
      .toLowerCase();

  // جلب البيانات
  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${api}/categories`);

      const payload = r?.data?.data ?? [];
      setAll(payload);
      setData(payload);

      console.log('fetched services:', payload);
    } catch (err) {
      console.error('fetch services error:', err);
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  // بحث بسيط
  const search = (q = '') => {
    const t = q.trim();
    if (!t) return setData(all);
    setData(all.filter(it => norm(it.name ?? '')?.includes(norm(t))));
    setCurrent(1);
  };

  const openDelete = (id: any) => { setSel(id); setOpen(true); };
  const closeDelete = () => { setSel(null); setOpen(false); };

  // حذف عنصر
  const doDelete = async () => {
    if (!sel) return;
    try {
      await axios.delete(`${api}/categories/${sel}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAll(prev => prev.filter(it => String(it.id ?? it._id) !== String(sel)));
      setData(prev => prev.filter(it => String(it.id ?? it._id) !== String(sel)));
      toast.success('تم الحذف بنجاح')
      closeDelete();
    } catch (err) {
      console.error('delete error:', err);
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

    // صفوف الجدول
  const rows = currentData.map((it, i) => ({
     id: it.id ?? it._id ?? String(i + 1),
     title: it.name ?? '-',
     description: it.description ?? '-',
    icon: it.icon_url ?? null,
  }));
console.log('rows:', currentData.map((it, i) => ({
     id: it.id ?? it._id ?? String(i + 1),
     title: it.title ?? '-',
     description: it.description ?? '-',
      icon: it.icon_url ?? null,
  })));

  const columns: any = [
    {
      field: 'icon',
      headerName: 'ايقونه',
      width: 120,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (p: any) => (
        <div className="flex justify-center items-center h-full w-full">
          <img
            src={`${p.value}`}
            alt={p.row.title}
            className="w-20 h-20 rounded-lg object-contain"
          />
        </div>
      ),
    },
    {
      field: 'title',
      headerName: 'العنوان',
      flex: 1,
      minWidth: 220,
      headerAlign: 'center',
      align: 'center',
      disableColumnMenu: true,
      renderCell: (p: any) => (
        <div className="w-full h-full flex items-center justify-center">
          <Link to={`/services/${p.id}`} className="cursor-pointer font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate">
            {p.value}
          </Link>
        </div>
      ),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 220,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (p: any) => (
        <div className="flex gap-3 justify-center w-full items-center h-full">
                  <button onClick={() => openDelete(p.id)} className="p-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                    <MdDelete size={20} />
                  </button>
                  <Link to={`/dashboard/addCategory/${p.id}`} className="p-2 text-[#DFC96D] hover:bg-blue-50 rounded-lg transition-colors" title="تعديل">
                    <FaEdit size={20} />
                  </Link>
                
                </div>
      ),
    },
  ];

  return (
    <>

      <div className="z-0 lg:mr-52  py-16 px-2 md:px-4 lg:px-8 bg-gradient-to-b from-slate-50 to-slate-100">
        {loading ? (
          <Load />
        ) : (
          <div>
            <div className="flex justify-between items-start md:items-center gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl text-slate-900">التصنيفات</h1>
                <p className="text-slate-500 text-sm">إدارة وتنظيم جميع التصنيفات المتاحة</p>
              </div>
              <Link to="/dashboard/addCategory">
                <button className="bg-[#2d2265] text-white px-2 py-2.5 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md">+ إضافة تصنيف</button>
              </Link>
            </div>

            <Paper sx={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflowY: 'hidden' }} className="p-4 mt-8">

              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                <div className="relative w-full md:w-auto">
                  <CiSearch size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="بحث ..." onChange={(e) => search(e.target.value)} className="w-full md:w-80 h-11 rounded-lg pl-4 pr-10 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <div className="min-w-[600px]">
                  <DataGrid rows={rows} columns={columns} rowHeight={100} hideFooter autoHeight sx={{ '& .MuiDataGrid-columnHeader': { backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontWeight: 600, color: '#334155' }, '& .MuiDataGrid-row': { borderBottom: '1px solid #e2e8f0', '&:hover': { backgroundColor: '#f8fafc' } }, '& .MuiDataGrid-scrollbarContent': { width: '100% !important', boxSizing: 'border-box' }, '& .MuiDataGrid-virtualScroller': { overflowY: 'auto', willChange: 'transform' } }} />
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-200">
                {/* <div>
                  <p className="text-sm text-slate-600">عرض {Math.min(lastIndex, data.length)} من أصل {data.length} خدمة</p>
                </div> */}

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">عدد الصفوف :</label>
                    <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrent(1); }} className="border border-slate-200 rounded-lg p-2 text-sm bg-white hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none">
                      {[5, 10, 15, 20].map(num => <option key={num} value={num}>{num}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrent(current > 1 ? current - 1 : current)} disabled={current === 1} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="السابق">
                      <IoIosArrowForward size={20} className="text-slate-600" />
                    </button>

                    <span className="text-sm text-slate-600 font-medium min-w-[40px] text-center">{current} / {totalPages}</span>

                    <button onClick={() => setCurrent(current < totalPages ? current + 1 : current)} disabled={current === totalPages} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="التالي">
                      <IoIosArrowBack size={20} className="text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
            </Paper>

    <Dialog open={open} onClose={closeDelete} className="relative z-50">
              <div className="fixed inset-0 z-50 w-72 md:w-screen m-auto overflow-y-auto flex items-center justify-center">
                <Dialog.Panel className="w-max rounded-xl bg-white px-6 py-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                      <MdDelete className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">حذف المدونة</h3>
                      <p className="mt-2 text-sm text-slate-600">هل أنت متأكد من رغبتك في حذف هذه المدونة ؟</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6 justify-start items-center">
                    <button onClick={closeDelete} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors">إلغاء</button>
                    <button onClick={doDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-sm">حذف</button>
                  </div>
                </Dialog.Panel>
              </div>
            </Dialog>

          </div>
        )}
      </div>
    </>
  );
}
