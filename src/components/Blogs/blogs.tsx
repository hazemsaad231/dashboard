import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import Load from '../Load/load';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CiSearch } from 'react-icons/ci';
import { FaEdit, FaEye } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { api } from '../Api/api';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Dialog, DialogPanel } from '@headlessui/react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';


export default function Blogs() {

  const { resource } = useParams();

  const [data, setData] = useState<any[]>([]);
  const [all, setAll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<string | number | null>(null);
  const [open, setOpen] = useState(false);
 const [current, setCurrent] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); 
  const lastIndex = current * itemsPerPage;
  const startIndex = lastIndex - itemsPerPage;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice(startIndex, lastIndex);


  useEffect(() => {
    (async () => {
      try {
        const r = await axios.get(`${api}/${resource}`);
        const arr = Array.isArray(r.data) ? r.data : r.data?.data || [];
        setData(arr);
        setAll(arr);
      } catch (e) {
        console.error(e);
        toast.error('فشل في جلب البيانات');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const norm = (s = '') =>
    String(s).replace(/[أإآا]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/\s+/g, '').toLowerCase();

  // بحث بسيط على العنوان أو المؤلف
  const search = (q = '') => {
    const t = q.trim();
    if (!t) {
      setData(all);
      return;
    }
    setData(all.filter(it => norm(`${it.title||''} ${it.author||''}`).includes(norm(t))));
  };

  const openDelete = (id: any) => { setSel(id); setOpen(true); };
  const closeDelete = () => { setSel(null); setOpen(false); };

  const doDelete = async () => {
    if (!sel) return;
    try {
      await axios.delete(`${api}/${resource}/${sel}`);
      setData(prev => prev.filter(it => String(it.id) !== String(sel) && String(it._id) !== String(sel)));
      toast.success('تم الحذف بنجاح');
      closeDelete();
    } catch (e) {
      console.error(e);
      toast.error('حدث خطأ أثناء الحذف');
    }
  };


  const rows = currentData.map((it, i) => ({ id: it.id ?? it._id ?? i+1, title: it.title ?? '-', img: it.img ?? it.image ?? '' }));

  const columns: any = [
    {
      field: 'img', headerName: 'صورة', width: 120, sortable: false, filterable: false,
      disableColumnMenu: true, headerAlign: 'center', align: 'center',
      renderCell: (p: any) => (
        <div className='flex justify-center items-center h-full w-full' >
          <img src={p.value||'/placeholder.png'} alt={String(p.row.title)} style={{ width:80, height:80, objectFit:'cover', borderRadius:8, border:'1px solid #e5e7eb', padding:2 }} />
        </div>
      )
    },
    {
      field: 'title', headerName: 'العنوان', flex: 1, minWidth: 220,
      headerAlign: 'center', align: 'center', disableColumnMenu: true,
      renderCell: (p: any) => (
        <div className="w-full h-full flex items-center justify-center">
          <Link to={`/dashboard/blogs/${resource}/${p.id}`} className="cursor-pointer font-bold">{p.value}</Link>
        </div>
      )
    },
    {
      field: 'actions', headerName: 'الإجراءات', width: 220, sortable:false, filterable:false,
      disableColumnMenu: true, headerAlign:'center', align:'center',
      renderCell: (p: any) => (
        <div className="flex gap-4 justify-center w-full items-center h-full">
          <MdDelete size={20} className="cursor-pointer" onClick={() => openDelete(p.id)} />
          <Link to={`/dashboard/addUser/blogs/${p.id}`}><FaEdit size={20} /></Link>
          <Link to={`/dashboard/blogs/${resource}/${p.id}`}><FaEye size={20} /></Link>
        </div>
      )
    }
  ];

  if (loading) return <Load />;

  return (
    <div className="lg:mr-60 p-4 bg-gray-100 h-full">
      <ToastContainer limit={1} />
      <div className="flex justify-between items-center p-6">
        <h1 className="font-bold text-2xl">المدونات</h1>
        <Link to="/dashboard/addUser/blogs"><button className="bg-black text-white p-2 rounded">إضافة مدونة</button></Link>
      </div>

      <Paper className="p-4">
        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <input type="text" placeholder="ابحث هنا..." onChange={(e)=>search(e.target.value)} className="w-80 h-10 rounded-xl pl-4 pr-10 bg-gray-100 focus:bg-white border" />
            <CiSearch size={18} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        <div className="w-full h-full mt-4">
          {/* عرض كل الصفوف بدون أي pagination: */}
          <DataGrid
            rows={rows}
            columns={columns}
            rowHeight={100}
            hideFooter 
          />

</div>

        {/* Pagination Controls */}

 <div className="flex justify-end  gap-4 p-2">
<div className="flex text-sm md:text-md">
  <p className="flex items-center gap-2">
    {/* Rows per page:  */}
    <select
      value={itemsPerPage}
      onChange={(e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrent(1); // عشان يرجع لأول صفحة بعد تغيير العدد
      }}
      className="border rounded p-1"
    >
      {[5, 10, 15, 20].map((num) => (
        <option key={num} value={num}>
          {num}
        </option>
      ))}
    </select>
  </p>
</div>



<div>
 <button
                >
                  {startIndex+1}-{lastIndex} of {data.length}
                </button>
</div>
               


<div>
  
              <button
                onClick={() => setCurrent(current < totalPages ? current + 1 : current)}
                disabled={current === totalPages}
              >
                <IoIosArrowForward  size={24}/>
              </button>
              <button
                onClick={() => setCurrent(current > 1 ? current - 1 : current)}
                disabled={current === 1}
              >
                <IoIosArrowBack size={24} />
              </button>
</div>  
            </div>

      </Paper>

      <Dialog open={open} onClose={closeDelete} className="relative z-10">
        <div className="fixed inset-0 flex items-center justify-center">
          <DialogPanel className="w-max max-w-md rounded-lg bg-white px-12 py-4 shadow-lg">
            <p className="text-sm mb-4">هل تريد حذف المدونة؟</p>
            <div className="flex gap-4">
              <button onClick={doDelete} className="px-3 py-1 bg-red-600 text-white rounded">حذف</button>
              <button onClick={closeDelete} className="px-3 py-1 bg-gray-300 rounded">إغلاق</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}