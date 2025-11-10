

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import Load from '../Load/load';
import 'react-toastify/dist/ReactToastify.css';
import { CiSearch } from 'react-icons/ci';
import { api } from '../Api/api';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import toast from 'react-hot-toast';
import { BsFillSendCheckFill } from "react-icons/bs";

export default function Emails() {
  const location = useLocation();
  const [all, setAll] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [current, setCurrent] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // const [selectionModel, setSelectionModel] = useState<(string | number| null)[]>([]);

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

  const columns: any = [
    {
      field: 'email',
      headerName: 'البريد الإلكتروني',
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
      headerName: 'ارسال',
      width: 220,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (p: any) => (
        <div className="flex gap-3 justify-center w-full items-center h-full">
          <Link to={`/dashboard/sendEmail/${p.id}`} className="p-2 text-[#DFC96D] hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2" title="ارسال">
            <BsFillSendCheckFill size={20} /> إرسال
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="z-0 lg:mr-52 py-16 px-2 md:px-4 lg:px-8 bg-gradient-to-b from-slate-50 to-slate-100">
      {loading ? (
        <Load />
      ) : (
        <div>
          <div className="flex justify-between items-start md:items-center gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl text-slate-900">النشرة البريدية</h1>
              <p className="text-slate-500 text-sm">عرض جميع المشتركين في النشرة البريدية</p>
            </div>
          </div>

          <Paper className="p-6 mt-8 rounded-2xl shadow-lg border border-gray-200">
            {/* بحث */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
              <div className="relative w-full md:w-80">
                <CiSearch size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث ..."
                  onChange={(e) => search(e.target.value)}
                  className="w-full h-12 rounded-lg pl-4 pr-10 bg-slate-50 border border-gray-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                />
              </div>

              <Link to="/dashboard/sendEmail" className="px-4 py-2 rounded-full bg-[#DFC96D] hover:bg-[#978644] text-white font-semibold transition-colors">
                إرسال للجميع
              </Link>
            </div>

            {/* الجدول */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-[600px]">
                <DataGrid
                  rows={rows}
                  columns={columns}
                  rowHeight={70}
                  hideFooter
                  checkboxSelection
                //   selectionModel={selectionModel}
                //   onSelectionModelChange={(newSelection: any) => {
                //     setSelectionModel(Array.isArray(newSelection) ? newSelection : [newSelection]);
                //   }}
                  autoHeight
                  sx={{
                    '& .MuiDataGrid-columnHeader': { backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontWeight: 600, color: '#334155' },
                    '& .MuiDataGrid-row': { borderBottom: '1px solid #e2e8f0', '&:hover': { backgroundColor: '#f0f4f8' } },
                    '& .MuiDataGrid-scrollbarContent': { width: '100% !important', boxSizing: 'border-box' },
                    '& .MuiDataGrid-virtualScroller': { overflowY: 'auto', willChange: 'transform' }
                  }}
                />
              
              </div>
            </div>

            {/* pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-200">
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

