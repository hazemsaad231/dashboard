import { useEffect, useState, useRef } from "react";

export default function Select({
  categories,
  loading = false,
  selectedIds,
  onChange,
  placeholder = "اختر التصنيفات",
}: {
  categories: { id?: number | null; name: string }[];
  loading?: boolean;
  selectedIds: (number | string)[];
  onChange: (ids: (number | any)[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = (id: number | string) =>
    onChange(selectedIds.includes(id) ? selectedIds.filter((s) => s !== id) : [...selectedIds, id]);

  const label =
    selectedIds.length === 0
      ? placeholder
      : selectedIds.length === 1
      ? categories.find((c) => String(c.id) === String(selectedIds[0]))?.name ?? placeholder
      : `تم اختيار ${selectedIds.length}`;

  return (
    <div ref={ref} className="relative w-full">
      <label className="block font-medium mb-2">التصنيفات</label>

      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full px-3 py-2 bg-white border rounded-lg text-right flex items-center justify-between"
      >
        <div className="text-sm text-right truncate">{label}</div>
        <div className="text-xs text-slate-400">{open ? "▲" : "▼"}</div>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-2 bg-white border rounded shadow-lg">
          <div className="max-h-44 overflow-auto">
            {loading ? (
              <div className="p-3 text-center text-sm text-slate-500">جارٍ التحميل...</div>
            ) : categories.length === 0 ? (
              <div className="p-3 text-center text-sm text-slate-500">لا توجد تصنيفات</div>
            ) : (
              categories.map((c) => (
                <label
                  key={String(c.id ?? c.name)}
                  className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(c.id ?? "")}
                      onChange={() => toggle(c.id ?? "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{c.name}</span>
                  </div>
                </label>
              ))
            )}
          </div>

          <div className="p-2 border-t flex justify-between items-center">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1 border rounded text-sm"
            >
              تم
            </button>
            <div className="text-xs text-slate-500">{selectedIds.length} مختار</div>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500 mt-2">اضغط على الحقل لفتح القائمة</p>
    </div>
  );
}
