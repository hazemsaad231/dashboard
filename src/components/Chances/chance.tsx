import  { useEffect, useMemo, useState, useCallback } from "react"
import axios from "axios"
import Load from "../Load/load"
import "react-toastify/dist/ReactToastify.css"
import { CiSearch } from "react-icons/ci"
import { FaEdit, FaEye } from "react-icons/fa"
import { MdDelete } from "react-icons/md"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import Paper from "@mui/material/Paper"
import toast from "react-hot-toast"
import { Link } from "react-router-dom"
import PaginationControls from "../Shared/pagination"
import ConfirmationDialog from "../Shared/ConfirmationDialog"



const norm = (s = "") =>
  String(s)
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, "")
    .toLowerCase()



const prepareAllRows = (items: any[] = []) =>
  items.map((it: any, i: number) => {
    const cats: any[] = Array.isArray(it.categories) ? it.categories : []
    const invs: any[] = Array.isArray(it.investors) ? it.investors : []


    const TypePhoto = Array.isArray(it.gallery) ? it.gallery.find((g: any) => g.type_photo === 'default') : null;


    const gallery = Array.isArray(it.gallery) && TypePhoto ? TypePhoto.photo_url : null

    return {
      id: it.id ?? it._id ?? String(i + 1),
      name: it.name ?? it.title ?? "-",
      type: it.type ?? "-",
      price: it.price ?? "-",
      image: gallery,
      categories: cats.map((c: any) => ({ ...c, invest_id: c.invest_id ?? it.id })),
      investors: invs.map((inv: any) => ({ ...inv, invest_id: inv.invest_id ?? it.id })),
      _raw: it,
    }
  })

const prepareCategoryRows = (items: any[] = []) => {
  const rows: any[] = []
  items.forEach((it: any) => {
    const investTitle = it.name ?? it.title ?? ""
    const cats: any[] = Array.isArray(it.categories) ? it.categories : []
    cats.forEach((c: any) =>
      rows.push({
        id: `cat-${c.id ?? Math.random().toString(36).slice(2, 9)}`,
        cat_id: c.id ?? null,
        name: c.name ?? "-",
        icon_url: c.icon_url ?? c.icon ?? null,
        description: c.description ?? "",
        invest_id: c.invest_id ?? it.id ?? null,
        invest_title: investTitle,
      })
    )
  })
  return rows
}

const prepareInvestorRows = (items: any[] = []) => {
  const rows: any[] = []
  items.forEach((it: any) => {
    const investTitle = it.name ?? it.title ?? ""
    const invs: any[] = Array.isArray(it.investors) ? it.investors : []
    invs.forEach((inv: any) =>
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
    )
  })
  return rows
}

// ----------------- reusable cell renderers -----------------
const CellCenterText = ({ value }: { value: any }) => (
  <div className="flex justify-center items-center h-full w-full">
    <h1 className="font-semibold text-slate-900 truncate">{value}</h1>
  </div>
)

const CellBadge = ({ value }: { value: any }) => (
  <div className="flex justify-center items-center h-full w-full">
    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">{value}</span>
  </div>
)

const CellImage = ({ value, row }: { value: string; row: any }) => (
  <div className="flex justify-center items-center h-full w-full">
    <img
      src={value}
      alt={row?.title ?? row?.name}
      className="w-20 h-20 object-cover rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
    />
  </div>
)

// small action buttons used in multiple places
const ViewButton = ({ onClick }: { onClick: () => void }) => (
  <button
    title="مشاهدة"
    onClick={onClick}
    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
  >
    <span className="text-sm font-medium text-indigo-600 py-1 px-6 bg-indigo-100 rounded-3xl">مشاهدة <FaEye size={16} className="text-indigo-600 m-auto" /></span>
  </button>
)

const ActionsCell = ({ onDelete, id }: { onDelete: (id: any) => void; id: any }) => (
  <div className="w-full h-full flex items-center justify-center gap-2">
    <button onClick={() => onDelete(id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors" title="حذف">
      <MdDelete size={20} className="text-red-700" />
    </button>
    <Link to={`/dashboard/addChance/${String(id).replace(/^inv-|^cat-/, "")}`} className="p-2 text-[#DFC96D] hover:bg-blue-50 rounded-lg transition-colors" title="تعديل">
      <FaEdit size={20} />
    </Link>
  </div>
)

// ----------------- main component -----------------
export default function Chances() {
  const [all, setAll] = useState<any[]>([])
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const [viewMode, setViewMode] = useState<"all" | "categories" | "investors">("all")
  const [investorsParent, setInvestorsParent] = useState<{ id: string | number; name: string } | null>(null)

  // delete dialog
  const [Id, setId] = useState<string | number | null>(null)
  const [openDelete, setOpenDelete] = useState(false)

  const [current, setCurrent] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)

  // pagination derived
  const lastIndex = current * itemsPerPage
  const startIndex = lastIndex - itemsPerPage
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage))
  const currentData = data.slice(startIndex, lastIndex)

  // fetch
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const resp = await axios.get(
        `https://tadbeer.wj.edu.sa/public/api/invests?type&min_price&max_price&per_page`
      )
      const payload = resp?.data?.data ?? []
      setAll(payload)
      setData(prepareAllRows(payload))
    } catch (err) {
      console.error("fetch invests error:", err)
      toast.error("فشل في جلب البيانات")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const switchView = useCallback(
    (mode: "all" | "categories" | "investors") => {
      setViewMode(mode)
      setCurrent(1)
      if (mode === "all") {
        setData(prepareAllRows(all))
        setInvestorsParent(null)
      } else if (mode === "categories") {
        setData(prepareCategoryRows(all))
        setInvestorsParent(null)
      } else {
        setData(prepareInvestorRows(all))
        setInvestorsParent(null)
      }
    },
    [all]
  )

  useEffect(() => {
    if (!loading) switchView("all")
  }, [loading, switchView])

  // delete helpers
  const cancelDelete = () => {
    setId(null)
    setOpenDelete(false)
  }

  const doDelete = async (realId: string | number) => {

    try {
      await axios.delete(`https://tadbeer.wj.edu.sa/public/api/invests/${realId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })

      setAll((prevAll) => {
        const newAll = prevAll.filter((it) => String(it.id ?? it._id) !== String(realId))
        // refresh view
        if (viewMode === "all") setData(prepareAllRows(newAll))
        else if (viewMode === "categories") setData(prepareCategoryRows(newAll))
        else if (viewMode === "investors") setData(investorsParent ? prepareInvestorRows(newAll.filter(a => String(a.id) === String(investorsParent.id))) : prepareInvestorRows(newAll))
        return newAll
      })

      setCurrent(1)
      toast.success("تم الحذف بنجاح", { id: 'delete' })
      cancelDelete()
    } catch (err) {
      console.error("delete error:", err)
      // toast.error("حدث خطأ أثناء الحذف", { id: 'fail' })
    }
  }

  const handleConfirmDelete = async () => {
    if (!Id) return
    if (String(Id).startsWith("inv-")) {
      const realId = String(Id).replace("inv-", "")
      try {
        await axios.delete(`https://tadbeer.wj.edu.sa/public/api/investors/${realId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        setAll((prevAll) => {
          const newAll = prevAll.map((invest) => ({
            ...invest,
            investors: invest.investors?.filter((inv: any) => String(inv.id) !== realId) ?? [],
          }))
          setData(investorsParent ? prepareInvestorRows(newAll.filter(a => String(a.id) === String(investorsParent.id))) : prepareInvestorRows(newAll))
          return newAll
        })
        toast.success("تم حذف المستثمر بنجاح", { id: "delete" })
        cancelDelete()
      } catch (err) {
        console.error("delete investor error:", err)
        toast.error("حدث خطأ أثناء حذف المستثمر")
      }
    } else if (String(Id).startsWith("cat-")) {
      doDelete(String(Id).replace("cat-", ""))
    } else {
      doDelete(Id)
    }
  }

  // search
  const search = (q = "") => {
    const t = q.trim()
    if (!t) {
      if (viewMode === "all") setData(prepareAllRows(all))
      else if (viewMode === "investors") setData(investorsParent ? prepareInvestorRows([all.find(a => String(a.id) === String(investorsParent.id)) || {}]) : prepareInvestorRows(all))
      else setData(prepareCategoryRows(all))
      setCurrent(1)
      return
    }

    const qn = norm(t)
    if (viewMode === "all") {
      const filtered = all.filter((it) => {
        const inName = norm(it.name ?? it.title ?? "").includes(qn)
        const inType = norm(it.type ?? "").includes(qn)
        const inPrice = norm(String(it.price ?? "")).includes(qn)
        const catNames = Array.isArray(it.categories) ? it.categories.map((c: { name: any }) => c.name || "").join(" ") : ""
        const invNames = Array.isArray(it.investors) ? it.investors.map((inv: { name: any }) => inv.name || "").join(" ") : ""
        return inName || inType || inPrice || norm(catNames).includes(qn) || norm(invNames).includes(qn)
      })
      setData(prepareAllRows(filtered))
    } else if (viewMode === "categories") {
      const rows = prepareCategoryRows(all).filter((r) => norm(r.name).includes(qn) || norm(r.description || "").includes(qn) || norm(r.invest_title || "").includes(qn))
      setData(rows)
    } else {
      const rows = prepareInvestorRows(all).filter((r) => norm(r.name).includes(qn) || norm(r.notes || "").includes(qn) || norm(r.invest_title || "").includes(qn))
      setData(rows)
    }
    setCurrent(1)
  }

  const showInvestorsOf = (row: any) => {
    if (!row) return
    const invRows = prepareInvestorRows([row])
    setData(invRows)
    setViewMode("investors")
    setInvestorsParent({ id: row.id, name: row.name ?? row.title ?? "الفرصة" })
    setCurrent(1)
  }

  // ----------------- columns (useMemo to avoid recreation) -----------------
  const onDeleteClick = (id: any) => {
    setId(id)
    setOpenDelete(true)
  }

  const allColumns: GridColDef[] = useMemo(
    () => [
      { field: "name", flex: 1, headerName: "الاسم", headerAlign: "center", align: "center", sortable: false, filterable: false, disableColumnMenu: true, renderCell: (p: any) => <CellCenterText value={p.value} /> },
      { field: "type", flex: 1, headerName: "النوع", headerAlign: "center", align: "center", sortable: false, filterable: false, disableColumnMenu: true, renderCell: (p: any) => <CellBadge value={p.value} /> },
      { field: "price", flex: 1, headerName: "السعر", headerAlign: "center", align: "center", sortable: false, filterable: false, disableColumnMenu: true, renderCell: (p: any) => <CellCenterText value={p.value} /> },
      { field: "image", headerName: "صورة", width: 120, sortable: false, filterable: false, disableColumnMenu: true, headerAlign: "center", align: "center",
         renderCell: (p: any) => <CellImage value={p.value} row={p.row} /> },
      { field: "categories", headerName: "التصنيفات", headerAlign: "center", align: "center", disableColumnMenu: true, sortable: false, filterable: false, renderCell: (p: any) => <div className="w-full h-full flex items-center justify-center"><ViewButton onClick={() => { setData(prepareCategoryRows([p.row])); setViewMode("categories"); setInvestorsParent(null); setCurrent(1); }} /></div> },
      { field: "investors", headerName: "المستثمرين", headerAlign: "center", sortable: false, filterable: false, align: "center", disableColumnMenu: true, renderCell: (p: any) => <div className="w-full h-full flex items-center justify-center"><ViewButton onClick={() => showInvestorsOf(p.row)} /></div> },
      { field: "actions", headerName: "الإجراءات", width: 120, headerAlign: "center", align: "center", sortable: false, filterable: false, disableColumnMenu: true, renderCell: (p: any) => <ActionsCell onDelete={onDeleteClick} id={p.id} /> },
    ],
    []
  )

  const categoryColumns: GridColDef[] = useMemo(
    () => [ 
      { field: "name", headerName: "اسم التصنيف", width: 220, headerAlign: "center", align: "center", sortable: false, filterable: false, disableColumnMenu: true, renderCell: (p: any) => <div className="truncate font-medium text-slate-900">{p.value}</div> },
      { field: "icon_url", headerName: "أيقونة", width: 120, headerAlign: "center", align: "center", sortable: false, filterable: false, disableColumnMenu: true, renderCell: (p: any) => <div className="w-full h-full flex items-center justify-center">{p.value ? <img src={p.value || "/placeholder.svg"} alt="icon" className="w-12 h-8 object-contain" /> : <div className="text-xs text-slate-400">—</div>}</div> },
      { field: "description", headerName: "الوصف", flex: 1, minWidth: 340, headerAlign: "center", align: "left", sortable: false, filterable: false, disableColumnMenu: true, renderCell: (p: any) => {
          const val = p.value || "—"
          return (
            <div className="w-full">
              <div className="whitespace-normal text-center break-words text-slate-600" style={{ maxHeight: 96, overflow: "auto", paddingRight: 8, lineHeight: 1.4, fontSize: 14 }} title={val}
                dangerouslySetInnerHTML={{ __html: val || "" }}>
</div>
              <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("openFullDescription", { detail: { text: val } })) }} className="mt-1 text-xs px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">عرض كامل</button>
            </div>
          )
        }
      }
    ],
    []
  )

  const investorColumns: GridColDef[] = useMemo(
    () => [
      { field: "name", headerName: "اسم المستثمر", width: 220, headerAlign: "center", align: "center", sortable: false, filterable: false, disableColumnMenu: true, renderCell: (p: any) => <div className="truncate font-medium text-slate-900">{p.value}</div> },
      { field: "phone", headerName: "رقم الهاتف", width: 200, headerAlign: "center", align: "center", sortable: false, filterable: false, disableColumnMenu: true, renderCell: (p: any) => <div className="truncate text-slate-700">{p.value}</div> },
      { field: "number_of_arrows", headerName: "عدد الأسهم", width: 120, headerAlign: "center", align: "center", sortable: false, filterable: false, disableColumnMenu: true, renderCell: (p: any) => <span className="font-semibold text-indigo-600">{p.value}</span> },
      { field: "notes", headerName: "الملاحظات", flex: 1, minWidth: 340, headerAlign: "center", align: "left", sortable: false, filterable: false, disableColumnMenu: true, renderCell: (p: any) => {
          const val = p.value || "—"
          return (
            <div className="w-full">
              <div className="whitespace-normal text-center break-words text-slate-600" style={{ maxHeight: 96, overflow: "auto", paddingRight: 8, lineHeight: 1.4, fontSize: 14 }} title={val}>{val}</div>
              <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("openFullDescription", { detail: { text: val } })) }} className="mt-1 text-xs px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">عرض كامل</button>
            </div>
          )
        }
      },
      { field: "actions", headerName: "الإجراءات", headerAlign: "center", align: "center", sortable: false, filterable: false, disableColumnMenu: true, renderCell: (p: any) => (
          <div className="w-full h-full flex items-center justify-center gap-2">
            <button onClick={() => { setId(p.id); setOpenDelete(true) }} className="p-2 rounded-lg hover:bg-red-50 transition-colors" title="حذف"><MdDelete size={20} className="text-red-600" /></button>
          </div>
        ) }
    ],
    []
  )

  const columns = viewMode === "all" ? allColumns : viewMode === "categories" ? categoryColumns : investorColumns

  return (
    <div className="z-0 lg:mr-52 h-screen px-2 md:px-4 lg:px-8 py-16 lg:py-12 bg-gradient-to-b from-slate-50 to-slate-100">
      {loading ? (
        <Load />
      ) : (
        <>
          <div className="mb-8">
            <div className="flex justify-between items-start md:items-center gap-6 mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">الفرص الاستثمارية</h1>
                <p className="text-sm text-slate-500 mt-1">إدارة وتتبع الفرص والمستثمرين والتصنيفات</p>
              </div>

              <Link to="/dashboard/addChance" 
               className="bg-[#2d2265] hover:rounded-2xl hover:bg-[#241a56] transition-all duration-500  text-white px-2 py-2 md:py-2.5 rounded-lg font-medium text-center">
                + إضافة فرصة</Link>
            </div>

          </div>

          <Paper className="rounded-2xl shadow-lg border border-slate-200 overflow-hidden mt-8 p-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                            <div className="relative w-full md:w-auto">
                              <CiSearch size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input type="text" placeholder="ابحث عن فرصة..." onChange={(e) => search(e.target.value)} className="w-full md:w-80 h-11 rounded-lg pl-4 pr-10 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                            </div>
                            {/* 👈 المكان الجديد لزر الرجوع (يظهر فقط في الجداول الفرعية) */}
                            {viewMode !== "all" && (
                                <button
                                    onClick={() => switchView("all")}
                                    className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center gap-1"
                                    title="العودة إلى الفرص الاستثمارية"
                                >
                                    {/* يمكنك استخدام أي أيقونة للرجوع، سأستخدم FaEye كعنصر مرئي */}
                                    <FaEye size={18} className="rotate-180" /> 
                                    العودة للفرص الرئيسية
                                </button>
                            )}
                          </div>
            <div className="w-full overflow-x-auto">
              <div className="min-w-[1000px]">
                {currentData.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-2">لا توجد بيانات</h3>
                    {viewMode !== "all" && (
                      <button onClick={() => switchView("all")} className="bg-[#2d2265] text-white px-2 py-2.5 rounded-lg font-medium transition-all">عوده</button>)}
                  </div>
                ) : (
                  <DataGrid rows={currentData} columns={columns} rowHeight={viewMode === "all" ? 140 : 80} hideFooter autoHeight 
                  sx={{ "& .MuiDataGrid-columnHeader": { backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", fontWeight: 700,
                     color: "#334155", fontSize: "0.875rem" },
                   "& .MuiDataGrid-row": { borderBottom: "1px solid #e2e8f0", "&:hover": { backgroundColor: "#f0f4ff" } } }} />
                )}
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
            open={openDelete}
            onClose={cancelDelete}
            onConfirm={handleConfirmDelete}
            title="حذف"
            confirmButtonText="حذف"
            description="هل انت متاكد من رغبتك في حذف هذه البيانات؟"
          />

        </>
      )}
    </div>
  )
}


