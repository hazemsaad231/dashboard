import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams, useLocation } from 'react-router-dom';
import Load from '../Load/load';
import { CiSearch } from 'react-icons/ci';
import { FaEdit} from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { api } from '../Api/api';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import toast from 'react-hot-toast';
import PaginationControls from '../Shared/pagination';
import ConfirmationDialog from '../Shared/ConfirmationDialog';

export default function Services() {


  const { resource } = useParams();
  const location = useLocation();

  // البيانات الأصلية والمرشّحة (للبحث)
  const [all, setAll] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // حذف
  const [Id, setId] = useState<string | number | null>(null);
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
      const r = await axios.get(`${api}/services?per_page=100`);

      const payload = r?.data?.data ?? [];
      const arr = Array.isArray(payload)
        ?
          (resource ? payload.filter((it: any) => String(it.type) === String(resource)) : payload)
        : 
          resource
          ? String(payload.type) === String(resource)
            ? [payload]
            : []
          : [payload];

          console.log('fetched services:', arr);

      setAll(arr);
      setData(arr);
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
  }, [resource, location.key]);

  // بحث بسيط
  const search = (q = '') => {
    const t = q.trim();
    if (!t) return setData(all);
    setData(all.filter(it => norm(it.title ?? '')?.includes(norm(t))));
    setCurrent(1);
  };

  const openDelete = (id: any) => { setId(id); setOpen(true); };
  const closeDelete = () => { setId(null); setOpen(false); };

  // حذف عنصر
  const doDelete = async () => {
    if (!Id) return;
    try {
      await axios.delete(`${api}/${resource}/${Id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAll(prev => prev.filter(it => String(it.id ?? it._id) !== String(Id)));
      setData(prev => prev.filter(it => String(it.id ?? it._id) !== String(Id)));
      toast.success('تم الحذف بنجاح');
      closeDelete();
    } catch (err) {
      console.error('delete error:', err);
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  // صفوف الجدول
  const rows = currentData.map((it, i) => ({
     id: it.id ?? it._id ?? String(i + 1),
     title: it.title ?? '-',
     description: it.description ?? '-',
      image: it.image_url ?? null,
  }));


  const columns: any = [
    {
      field: 'image',
      headerName: 'صورة',
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
      className="w-20 h-20 object-cover rounded-lg"
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
          <Link to={`/services/${resource}/${p.id}`} className="cursor-pointer font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate">
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
          <Link to={`/dashboard/addUser/${resource}/${p.id}`} className="p-2 text-[#DFC96D] hover:bg-blue-50 rounded-lg transition-colors" title="تعديل">
            <FaEdit size={20} />
          </Link>
        
        </div>
      ),
    },
  ];

  return (
    <>

      <div className="z-0 lg:mr-52 py-16 lg:py-12 px-2 md:px-4 lg:px-8 bg-gradient-to-b from-slate-50 to-slate-100">
        {loading ? (
          <Load />
        ) : (
          <>
            <div className="flex justify-between items-start md:items-center">
              <div className="flex flex-col gap-1">
                <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-4xl text-slate-900">الخدمات</h1>
                <p className="text-slate-500 text-sm">إدارة وتنظيم جميع الخدمات المتاحة</p>
              </div>
              <Link to="/dashboard/addUser/services" 
                             className="bg-[#2d2265] hover:rounded-2xl hover:bg-[#241a56] transition-all duration-500  text-white px-2 py-2 md:py-2.5 rounded-lg font-medium text-center">
                        + إضافة خدمة</Link>
            </div>

            <Paper sx={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflowY: 'hidden' }} className="p-4 mt-8">

              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                <div className="relative w-full md:w-auto">
                  <CiSearch size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="ابحث عن خدمة..." onChange={(e) => search(e.target.value)} className="w-full md:w-80 h-10 rounded-lg pl-4 pr-10 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <div className="min-w-[600px]">
                  <DataGrid rows={rows} columns={columns} rowHeight={100} hideFooter autoHeight sx={{ '& .MuiDataGrid-columnHeader': { backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontWeight: 600, color: '#334155' }, '& .MuiDataGrid-row': { borderBottom: '1px solid #e2e8f0', '&:hover': { backgroundColor: '#f8fafc' } }, '& .MuiDataGrid-scrollbarContent': { width: '100% !important', boxSizing: 'border-box' }, '& .MuiDataGrid-virtualScroller': { overflowY: 'auto', willChange: 'transform' } }} />
                </div>
              </div>
              <PaginationControls
                current={current}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                setCurrent={setCurrent}
                setItemsPerPage={setItemsPerPage}
              />
            </Paper>

            <ConfirmationDialog
              open={open}
              onClose={closeDelete}
              onConfirm={doDelete}
              title="حذف الخدمة"
              description="هل أنت متأكد من رغبتك في حذف هذه الخدمة؟"
              confirmButtonText="حذف"
              icon={<MdDelete className="h-6 w-6 text-red-600" />}
              iconBgClass="bg-red-100"
            />
          </>
        )}
      </div>
    </>
  );
}
