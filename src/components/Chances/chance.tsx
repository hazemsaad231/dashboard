import { useEffect, useState } from "react"
import axios from "axios"
import Load from "../Load/load"
import "react-toastify/dist/ReactToastify.css"
import { CiSearch } from "react-icons/ci"
import { FaEdit, FaEye } from "react-icons/fa"
import { MdDelete, MdAdd } from "react-icons/md"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import Paper from "@mui/material/Paper"
import { Dialog } from "@headlessui/react"
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io"
import toast from "react-hot-toast"
import { Link } from "react-router-dom"

export default function Chances() {
  const [all, setAll] = useState<any[]>([])
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // view mode: 'all' | 'categories' | 'investors'
  const [viewMode, setViewMode] = useState<"all" | "categories" | "investors">("all")

  // when we open investors for a specific opportunity, store its name (for header) and id
  const [investorsParent, setInvestorsParent] = useState<{ id: string | number; name: string } | null>(null)

  // delete dialog
  const [Id, setId] = useState<string | number | null>(null)
  const [openDelete, setOpenDelete] = useState(false)

  // pagination
  const [current, setCurrent] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)

  const lastIndex = current * itemsPerPage
  const startIndex = lastIndex - itemsPerPage
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage))
  const currentData = data.slice(startIndex, lastIndex)

  // normalize helper
  const norm = (s = "") =>
    String(s).replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/\s+/g, "").toLowerCase()

  // fetch
  const fetchData = async () => {
    setLoading(true)
    try {
      const resp = await axios.get(`https://tadbeer.wj.edu.sa/public/api/invests?type&min_price&max_price&per_page`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const payload = resp?.data?.data ?? []
      setAll(payload)
      setData(payload)
      console.log("fetched services:", payload)
    } catch (err) {
      console.error("fetch invests error:", err)
      toast.error("فشل في جلب البيانات")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      await fetchData()
    })()
  }, [])

  const prepareAllRows = (items: any[]) => {
    return items.map((it: any, i: number) => {
      const cats = Array.isArray(it.categories) ? it.categories : []
      const preparedCats = cats.map((c: any) => ({
        id: c.id ?? null,
        name: c.name ?? "",
        icon_url: c.icon_url ?? c.icon ?? null,
        description: c.description ?? "",
        invest_id: c.invest_id ?? it.id ?? null,
      }))
      const invs = Array.isArray(it.investors) ? it.investors : []
      const preparedInvs = invs.map((inv: any) => ({
        id: inv.id ?? null,
        name: inv.name ?? "",
        notes: inv.notes ?? "",
        number_of_arrows: inv.number_of_arrows ?? 0,
        phone: inv.phone ?? "",
        invest_id: inv.invest_id ?? it.id ?? null,
      }))
      return {
        id: it.id ?? it._id ?? String(i + 1),
        name: it.name ?? it.title ?? "-",
        type: it.type ?? "-",
        price: it.price ?? "-",
        gallery: Array.isArray(it.gallery) && it.gallery.length ? (typeof it.gallery[0] === "string" ? it.gallery[0] : it.gallery[0].photo_url ?? "") : null,
        gallery_all: Array.isArray(it.gallery) ? it.gallery.map((g:any)=> typeof g === "string" ? g : (g.photo_url ?? g.url ?? "") ).filter(Boolean) : [],
        categories: preparedCats,
        investors: preparedInvs,
        _raw: it,
      }
    })
  }

  // flatten categories
  const prepareCategoryRows = (items: any[]) => {
    const rows: any[] = []
    items.forEach((it: any) => {
      const investTitle = it.name ?? it.title ?? ""
      const cats = Array.isArray(it.categories) ? it.categories : []
      cats.forEach((c: any) => {
        rows.push({
          id: `cat-${c.id ?? Math.random().toString(36).slice(2, 9)}`,
          cat_id: c.id ?? null,
          name: c.name ?? "-",
          icon_url: c.icon_url ?? c.icon ?? null,
          description: c.description ?? "",
          invest_id: c.invest_id ?? it.id ?? null,
          invest_title: investTitle,
        })
      })
    })
    return rows
  }

  // flatten investors
  const prepareInvestorRows = (items: any[]) => {
    const rows: any[] = []
    items.forEach((it: any) => {
      const investTitle = it.name ?? it.title ?? ""
      const invs = Array.isArray(it.investors) ? it.investors : []
      invs.forEach((inv: any) => {
        rows.push({
          id: `inv-${inv.id ?? Math.random().toString(36).slice(2, 9)}`,
          inv_id: inv.id ?? null,
          name: inv.name ?? "-",
          notes: inv.notes ?? "",
          phone: inv.phone ?? "",
          number_of_arrows: inv.number_of_arrows ?? 0,
          invest_id: inv.invest_id ?? it.id ?? null,
          invest_title: investTitle,
        })
      })
    })
    return rows
  }

  // ===== new helper: show investors of one opportunity IN THE MAIN TABLE =====
  const showInvestorsOf = (row: any) => {
    if (!row) return
    // set flattened investor rows for this single opportunity
    const invRows = prepareInvestorRows([row])
    setData(invRows)
    setViewMode("investors")
    setInvestorsParent({ id: row.id, name: row.name ?? row.title ?? "الفرصة" })
    setCurrent(1)
  }

  // back to all opportunities
  const backToAll = () => {
    setData(prepareAllRows(all))
    setViewMode("all")
    setInvestorsParent(null)
    setCurrent(1)
  }

  // columns for main grid
  const allColumns: GridColDef[] = [
    {
      field: "name",
      headerName: "الاسم",
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: (p: any) => (
        <div className="flex justify-center items-center h-full w-full">
          <h1 className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors truncate">{p.value}</h1>
        </div>
      ),
    },
    {
      field: "type",
      headerName: "النوع",
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: (p: any) => (
        <div className="flex justify-center items-center h-full w-full">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">{p.value}</span>
        </div>
      ),
    },
    {
      field: "price",
      headerName: "السعر",
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: (p: any) => (
        <div className="flex justify-center items-center h-full w-full">
          <h1 className="font-semibold text-slate-900">{p.value}</h1>
        </div>
      ),
    },
    {
      field: "gallery",
      headerName: "المعرض",
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: (p: any) => (
        <div className="w-full h-full flex items-center justify-center">
          {p.value ? (
            <img
              src={`${p.value}`}
              alt="img"
              className="w-20 h-20 object-cover rounded-lg border-2 border-indigo-200 shadow-md hover:shadow-lg transition-shadow"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-400">
              —
            </div>
          )}
        </div>
      ),
    },

    {
      field: "categories",
      headerName: "التصنيفات",
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      renderCell: (p: any) => (
        <div className="w-full h-full flex items-center justify-center">
          <button
            title="عرض التصنيفات"
            onClick={() => {
              setData(prepareCategoryRows([p.row]))
              setViewMode("categories")
              setInvestorsParent(null)
              setCurrent(1)
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <span className="text-sm font-medium text-white py-1 px-6 bg-indigo-600 rounded-3xl">
              مشاهدة <FaEye size={16} className="text-white m-auto" />
            </span>
          </button>
        </div>
      ),
    },

    // INVESTORS column: now it will replace main table with that opportunity's investors
    {
      field: "investors",
      headerName: "المستثمرين",
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      renderCell: (p: any) => {
        const count = Array.isArray(p.row.investors) ? p.row.investors.length : 0
        return (
          <div className="w-full h-full flex items-center justify-center">
            <button
              title="عرض المستثمرين داخل نفس الجدول"
              onClick={() => showInvestorsOf(p.row)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <span className="text-sm font-medium">مشاهدة</span>
              <span className="text-sm font-medium text-slate-600">{count}</span>
            </button>
          </div>
        )
      },
    },

    {
      field: "actions",
      headerName: "الإجراءات",
      width: 160,
      headerAlign: "center",
      align: "center",
      renderCell: (p: any) => (
        <div className="w-full h-full flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setId(p.id)
              setOpenDelete(true)
            }}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
            title="حذف"
          >
            <MdDelete size={20} className="text-red-600" />
          </button>
          <button
            onClick={() => {
              setId(p.id)
            }}
            className="p-2 rounded-lg hover:bg-indigo-50 transition-colors"
            title="تعديل"
          >
            <FaEdit size={18} className="text-indigo-600" />
          </button>
        </div>
      ),
    },
  ]

  const categoryColumns: GridColDef[] = [
    { field: "cat_id", headerName: "ID", width: 100, headerAlign: "center", align: "center" },
    {
      field: "name",
      headerName: "اسم التصنيف",
      width: 220,
      headerAlign: "center",
      align: "center",
      renderCell: (p: any) => <div className="truncate font-medium text-slate-900">{p.value}</div>,
    },
    {
      field: "icon_url",
      headerName: "أيقونة",
      width: 120,
      headerAlign: "center",
      align: "center",
      renderCell: (p: any) =>
        p.value ? (
          <img src={p.value || "/placeholder.svg"} alt="icon" className="w-12 h-8 object-contain" />
        ) : (
          <div className="text-xs text-slate-400">—</div>
        ),
    },
    {
      field: "description",
      headerName: "الوصف",
      flex: 1,
      minWidth: 260,
      headerAlign: "center",
      align: "center",
      renderCell: (p: any) => (
        <div className="truncate text-slate-600" title={p.value}>
          {p.value || "—"}
        </div>
      ),
    },
  ]

  const investorColumns: GridColDef[] = [
    { field: "inv_id", headerName: "ID", width: 100, headerAlign: "center", align: "center" },
    {
      field: "name",
      headerName: "اسم المستثمر",
      width: 220,
      headerAlign: "center",
      align: "center",
      renderCell: (p: any) => <div className="truncate font-medium text-slate-900">{p.value}</div>,
    },
    {
      field: "phone",
      headerName: "رقم الهاتف",
      width: 200,
      headerAlign: "center",
      align: "center",
      renderCell: (p: any) => <div className="truncate text-slate-700">{p.value}</div>,
    },
    {
      field: "notes",
      headerName: "ملاحظات",
      flex: 1,
      minWidth: 240,
      headerAlign: "center",
      align: "center",
      renderCell: (p: any) => (
        <div className="truncate text-slate-600" title={p.value}>
          {p.value || "—"}
        </div>
      ),
    },
    {
      field: "number_of_arrows",
      headerName: "عدد الأسهم",
      width: 120,
      headerAlign: "center",
      align: "center",
      renderCell: (p: any) => <span className="font-semibold text-indigo-600">{p.value}</span>,
    },

    {
      field: "actions",
      headerName: "الإجراءات",
      headerAlign: "center",
      align: "center",
      renderCell: (p: any) => (
        <div className="w-full h-full flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setId(p.id)
              setOpenDelete(true)
            }}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
            title="حذف"
          >
            <MdDelete size={20} className="text-red-600" />
          </button>
          <button
            onClick={() => {
              setId(p.id)
            }}
            className="p-2 rounded-lg hover:bg-indigo-50 transition-colors"
            title="تعديل"
          >
            <FaEdit size={18} className="text-indigo-600" />
          </button>
        </div>
      ),
    },
  ]

  // search function adapts to current view
  const search = (q = "") => {
    const t = q.trim()
    if (!t) {
      // reset view data according to viewMode (if we were showing investors of one opportunity, keep that state)
      if (viewMode === "all") setData(prepareAllRows(all))
      else if (viewMode === "categories") setData(prepareCategoryRows(all))
      else if (viewMode === "investors") {
        // if investorsParent is set, show only its investors again; otherwise show all investors flattened
        if (investorsParent) {
          const parent = all.find((a) => String(a.id) === String(investorsParent.id))
          setData(parent ? prepareInvestorRows([parent]) : [])
        } else {
          setData(prepareInvestorRows(all))
        }
      }
      setCurrent(1)
      return
    }

    const qn = norm(t)
    if (viewMode === "all") {
      const filtered = all.filter((it: any) => {
        const inName = norm(it.name ?? it.title ?? "").includes(qn)
        const inType = norm(it.type ?? "").includes(qn)
        const inPrice = norm(String(it.price ?? "")).includes(qn)
        const catNames = Array.isArray(it.categories) ? it.categories.map((c: any) => c.name || "").join(" ") : ""
        const invNames = Array.isArray(it.investors) ? it.investors.map((inv: any) => inv.name || "").join(" ") : ""
        return inName || inType || inPrice || norm(catNames).includes(qn) || norm(invNames).includes(qn)
      })
      setData(prepareAllRows(filtered))
    } else if (viewMode === "categories") {
      const rows = prepareCategoryRows(all).filter((r: any) => {
        return (
          norm(r.name).includes(qn) || norm(r.description || "").includes(qn) || norm(r.invest_title || "").includes(qn)
        )
      })
      setData(rows)
    } else if (viewMode === "investors") {
      // If we're in investors view filtered by parent, search only inside those rows.
      if (investorsParent) {
        const parent = all.find((a) => String(a.id) === String(investorsParent.id))
        const rows = parent ? prepareInvestorRows([parent]).filter((r:any) => norm(r.name).includes(qn) || norm(r.notes||'').includes(qn) || norm(r.invest_title||'').includes(qn)) : []
        setData(rows)
      } else {
        const rows = prepareInvestorRows(all).filter((r:any) => norm(r.name).includes(qn) || norm(r.notes||'').includes(qn) || norm(r.invest_title||'').includes(qn))
        setData(rows)
      }
    }
    setCurrent(1)
  }

  // switch view handler
  const switchView = (mode: "all" | "categories" | "investors") => {
    setViewMode(mode)
    setCurrent(1)
    // prepare data accordingly
    if (mode === "all") {
      setData(prepareAllRows(all))
      setInvestorsParent(null)
    } else if (mode === "categories") {
      setData(prepareCategoryRows(all))
      setInvestorsParent(null)
    } else if (mode === "investors") {
      // show all investors flattened
      setData(prepareInvestorRows(all))
      setInvestorsParent(null)
    }
  }

  // initial populate rows in normalized form when all is loaded
  useEffect(() => {
    if (!loading) switchView("all")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  const cancelDelete = () => {
    setId(null)
    setOpenDelete(false)
  }
  const doDelete = async () => {
    if (!Id) return
    try {
      await axios.delete(`https://tadbeer.wj.edu.sa/public/api/invests/${Id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setAll((prev) => prev.filter((it) => String(it.id ?? it._id) !== String(Id)))
   fetchData()
      // refresh current view data
      switchView("all")
      toast.success("تم الحذف بنجاح")
      cancelDelete()
    } catch (err) {
      console.error("delete error:", err)
      toast.error("حدث خطأ أثناء الحذف")
    }
  }

  // choose columns based on view
  const columns = viewMode === "all" ? allColumns : viewMode === "categories" ? categoryColumns : investorColumns

  return (
    <div className="lg:mr-52 min-h-screen py-12 p-8 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {loading ? (
        <Load />
      ) : (
        <>
          {/* header with tabs and search */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">الفرص الاستثمارية</h1>
                <p className="text-sm text-slate-500 mt-1">إدارة وتتبع الفرص والمستثمرين والتصنيفات</p>
                {/* if viewing investors of one opportunity, show breadcrumb + back */}
                {viewMode === "investors" && investorsParent && (
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <button onClick={backToAll} className="px-3 py-1 border rounded hover:bg-slate-50">رجوع للفرص</button>
                    <div className="text-slate-600">عرض مستثمري: <span className="font-medium text-slate-900">{investorsParent.name}</span></div>
                  </div>
                )}
              </div>

              <Link to="/dashboard/addUser/services">
                <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg">
                  <MdAdd size={20} />
                  إضافة فرصة
                </button>
              </Link>
            </div>

            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex gap-2 bg-white border border-slate-100 rounded-md p-1 shadow-sm">
                <button onClick={() => switchView("all")} className={`px-3 py-1 rounded-md text-sm ${viewMode === "all" ? "bg-[#2d2265] text-white" : "text-slate-700 hover:bg-slate-50"}`}>الفرص</button>
                <button onClick={() => switchView("investors")} className={`px-3 py-1 rounded-md text-sm ${viewMode === "investors" ? "bg-[#2d2265] text-white" : "text-slate-700 hover:bg-slate-50"}`}>المستثمرين</button>
                <button onClick={() => switchView("categories")} className={`px-3 py-1 rounded-md text-sm ${viewMode === "categories" ? "bg-[#2d2265] text-white" : "text-slate-700 hover:bg-slate-50"}`}>التصنيفات</button>
              </div>

              <div className="relative max-w-md w-full">
                <CiSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  onChange={(e) => search(e.target.value)}
                  placeholder={
                    viewMode === "all"
                      ? "ابحث عن فرصة أو تصنيف..."
                      : viewMode === "categories"
                        ? "ابحث في التصنيفات..."
                        : "ابحث في المستثمرين..."
                  }
                  className="w-full h-11 pr-12 pl-4 rounded-lg border-2 border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <Paper className="rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[760px]">
                {currentData.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">لا توجد بيانات</h3>
                    <p className="text-slate-500">
                      لم يتم العثور على أي {viewMode === "all" ? "فرص" : viewMode === "categories" ? "تصنيفات" : "مستثمرين"}
                    </p>
                  </div>
                ) : (
                  <DataGrid
                    rows={currentData}
                    columns={columns}
                    rowHeight={viewMode === "all" ? 140 : 80}
                    hideFooter
                    autoHeight
                    sx={{
                      "& .MuiDataGrid-columnHeader": {
                        backgroundColor: "#f8fafc",
                        borderBottom: "2px solid #e2e8f0",
                        fontWeight: 700,
                        color: "#334155",
                        fontSize: "0.875rem",
                      },
                      "& .MuiDataGrid-row": {
                        borderBottom: "1px solid #e2e8f0",
                        "&:hover": { backgroundColor: "#f0f4ff" },
                      },
                    }}
                  />
                )}
              </div>
            </div>

            {currentData.length > 0 && (
              <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-700">عدد الصفوف:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrent(1)
                    }}
                    className="border-2 border-slate-200 rounded-lg p-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  >
                    {[5, 10, 15, 20].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrent(current > 1 ? current - 1 : current)}
                    disabled={current === 1}
                    className="p-2 rounded-lg border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 disabled:opacity-50 transition-all"
                  >
                    <IoIosArrowForward className="text-slate-600" />
                  </button>
                  <div className="text-sm font-medium text-slate-700 min-w-[60px] text-center">
                    {current} / {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrent(current < totalPages ? current + 1 : current)}
                    disabled={current === totalPages}
                    className="p-2 rounded-lg border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 disabled:opacity-50 transition-all"
                  >
                    <IoIosArrowBack className="text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </Paper>

          <Dialog open={openDelete} onClose={cancelDelete} className="relative z-50">
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <MdDelete size={24} className="text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">حذف العنصر</h3>
                </div>
                <p className="text-sm text-slate-600 mb-6">
                  هل أنت متأكد من رغبتك في حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 border-2 border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={doDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    حذف
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </>
      )}
    </div>
  )
}
