import { useEffect, useState } from "react";
import axios from "axios";
import Load from "../Load/load";
import { CiSearch } from "react-icons/ci";
import { MdDelete, MdPictureAsPdf } from "react-icons/md";
import { api } from "../Api/api";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Dialog } from "@headlessui/react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import toast from "react-hot-toast";

export default function Applicants() {
  const [all, setAll] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<string | number | null>(null);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const lastIndex = current * itemsPerPage;
  const startIndex = lastIndex - itemsPerPage;
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  const currentData = data.slice(startIndex, lastIndex);

  const norm = (s = "") =>
    String(s)
      .replace(/[أإآ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/\s+/g, "")
      .toLowerCase();

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${api}/applicants`);
      const payload = r?.data?.data ?? [];
      setAll(payload);
      setData(payload);
    } catch (err) {
      console.error("fetch applicants error:", err);
      toast.error("فشل في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const search = (q = "") => {
    const t = q.trim();
    if (!t) return setData(all);
    setData(all.filter((it) => norm(it.name ?? "").includes(norm(t))));
    setCurrent(1);
  };

//   const openDelete = (id: any) => {
//     setSel(id);
//     setOpen(true);
//   };
  const closeDelete = () => {
    setSel(null);
    setOpen(false);
  };

  const doDelete = async () => {
    if (!sel) return;
    try {
      await axios.delete(`${api}/applicants/${sel}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAll((prev) => prev.filter((it) => String(it.id) !== String(sel)));
      setData((prev) => prev.filter((it) => String(it.id) !== String(sel)));
      toast.success("تم حذف المتقدم بنجاح");
      closeDelete();
    } catch (err) {
      console.error("delete error:", err);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const rows = currentData.map((it, i) => ({
    id: it.id ?? i + 1,
    name: it.name ?? "-",
    email: it.email ?? "-",
    phone: it.phone ?? "-",
    about: it.about ?? "-",
    cv: it.cv_url ?? null,
  }));

  const columns: any = [
    {
      field: "name",
      headerName: "الاسم",
      flex: 1,
      minWidth: 200,
      headerAlign: "center",
      align: "center",
         sortable: false,
      filterable: false,
      disableColumnMenu: true,
    },
    {
      field: "email",
      headerName: "الإيميل",
      flex: 1.3,
      minWidth: 230,
      headerAlign: "center",
      align: "center",
         sortable: false,
      filterable: false,
      disableColumnMenu: true,
    },
    {
      field: "phone",
      headerName: "رقم الهاتف",
      flex: 0.8,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
         sortable: false,
      filterable: false,
      disableColumnMenu: true,
    },
    {
      field: "cv",
      headerName: "السيرة الذاتية",
      flex: 0.8,
      minWidth: 160,
      headerAlign: "center",
      align: "center",
         sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (p: any) => {
        const link =
          p.value && !p.value.startsWith("http")
            ? `${api}/${p.value}`
            : p.value;
        return p.value ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800 transition-colors font-medium"
          >
            <MdPictureAsPdf size={20} />
            عرض
          </a>
        ) : (
          <span className="text-slate-400">لا يوجد</span>
        );
      },
    },
    // {
    //   field: "actions",
    //   headerName: "الإجراءات",
    //   flex: 0.5,
    //   minWidth: 120,
    //   headerAlign: "center",
    //   align: "center",
    //      sortable: false,
    //   filterable: false,
    //   disableColumnMenu: true,
    //   renderCell: (p: any) => (
    //     <button
    //       onClick={() => openDelete(p.id)}
    //       className="p-2 text-red-700 text-center hover:bg-red-50 rounded-lg transition-colors"
    //       title="حذف"
    //     >
    //       <MdDelete size={20} />
    //     </button>
    //   ),
    // },
  ];

  return (
    <div className="z-0 lg:mr-52 py-20 px-3 md:px-6 lg:px-10 bg-gradient-to-b from-slate-50 to-slate-100">
      {loading ? (
        <Load />
      ) : (
        <div>
          {/* العنوان */}
          <div className="flex justify-between items-start md:items-center gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="font-bold text-3xl md:text-4xl text-slate-900">
                المتقدمين
              </h1>
              <p className="text-slate-500 text-sm">
                إدارة ومراجعة المتقدمين للوظائف
              </p>
            </div>
          </div>

          {/* الجدول */}
          <Paper
            sx={{
              backgroundColor: "white",
              borderRadius: "16px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
            }}
            className="p-4 mt-8"
          >
             <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                <div className="relative w-full md:w-auto">
                  <CiSearch size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="بحث ..." onChange={(e) => search(e.target.value)} className="w-full md:w-80 h-11 rounded-lg pl-4 pr-10 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                </div>
              </div>

            {/* جدول البيانات */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-[750px]">
                <DataGrid
                  rows={rows}
                  columns={columns}
                  rowHeight={85}
                  hideFooter
                  autoHeight
                  sx={{
                    "& .MuiDataGrid-columnHeader": {
                      backgroundColor: "#f8fafc",
                      borderBottom: "2px solid #e2e8f0",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "#334155",
                      textAlign: "center",
                    },
                    "& .MuiDataGrid-row": {
                      borderBottom: "1px solid #e2e8f0",
                      "&:hover": {
                        backgroundColor: "#f9fafb",
                      },
                    },
                    "& .MuiDataGrid-cell": {
                      fontSize: "0.9rem",
                      color: "#334155",
                      textAlign: "center",
                      whiteSpace: "normal",
                      lineHeight: "1.4",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "8px",
                    },
                  }}
                />
              </div>
            </div>

            {/* التحكم في الصفحات */}
            <div className="flex justify-between items-center gap-3 pt-4 border-t border-slate-200 mt-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">
                  عدد الصفوف : 
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrent(1);
                  }}
                  className="border border-slate-200 rounded-lg p-2 text-sm bg-white hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                >
                  {[5, 10, 15, 20].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrent(current > 1 ? current - 1 : current)
                  }
                  disabled={current === 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="السابق"
                >
                  <IoIosArrowForward size={20} className="text-slate-600" />
                </button>

                <span className="text-sm text-slate-600 font-medium min-w-[40px] text-center">
                  {current} / {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrent(current < totalPages ? current + 1 : current)
                  }
                  disabled={current === totalPages}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="التالي"
                >
                  <IoIosArrowBack size={20} className="text-slate-600" />
                </button>
              </div>
            </div>
          </Paper>

          {/* نافذة الحذف */}
          <Dialog open={open} onClose={closeDelete} className="relative z-50">
            <div className="fixed inset-0 flex items-center justify-center">
              <Dialog.Panel className="w-max rounded-xl bg-white px-6 py-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <MdDelete className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      حذف المتقدّم
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      هل أنت متأكد أنك تريد حذف هذا المتقدّم؟
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6 justify-start items-center">
                  <button
                    onClick={closeDelete}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={doDelete}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-sm"
                  >
                    حذف
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </div>
      )}
    </div>
  );
}

