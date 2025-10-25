import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../Api/api";

type Category = {
  id?: number | null;
  name: string;
  icon_url?: string | null;
  description?: string;
  invest_id?: number | null;
};

type FormValues = {
  title: string;
  type: string;
  price?: number | "";
  categories: Category[];
};

const Add_Update_Chance: React.FC = () => {

  const { id} = useParams();
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      type: "",
      price: "",
      categories: [],
    },
  });

  const { fields: catFields, append: appendCat, remove: removeCat, replace: replaceCats } = useFieldArray({
    control,
    name: "categories",
  });

  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [removedGallery, setRemovedGallery] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewNewImages, setPreviewNewImages] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const resp = await axios.get(`${api}/invests/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const item = resp.data.data ?? resp.data;
        setValue("title", item.title ?? item.name ?? "");
        setValue("type", item.type ?? "");
        setValue("price", item.price ?? "");


        const cats = Array.isArray(item.categories)
          ? item.categories.map((c: any) => ({
              id: c.id ?? null,
              name: c.name ?? "",
              icon_url: c.icon_url ?? c.icon ?? null,
              description: c.description ?? "",
              invest_id: (c.pivot && c.pivot.invest_id) ?? item.id ?? null,
            }))
          : [];
        replaceCats(cats);

        const galleryUrls =
          Array.isArray(item.gallery) && item.gallery.length
            ? item.gallery.map((g: any) => (typeof g === "string" ? g : g.photo_url ?? ""))
            : [];
        setExistingGallery(galleryUrls);
      } catch (err) {
        console.error("fetch item error:", err);
        toast.error("فشل في جلب بيانات العنصر");
      }
    })();
  }, [id]);

  useEffect(() => {
    return () => {
      previewNewImages.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previewNewImages]);

  const onPickNewImages = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setNewImages((prev) => [...prev, ...arr]);
    const newPreviews = arr.map((f) => URL.createObjectURL(f));
    setPreviewNewImages((prev) => [...prev, ...newPreviews]);
  };

  const removeExistingGalleryUrl = (url: string) => {
    setExistingGallery((prev) => prev.filter((u) => u !== url));
    setRemovedGallery((prev) => [...prev, url]);
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewNewImages((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed);
      return copy;
    });
  };

  const addBlankCategory = () =>
    appendCat({ id: null, name: "", icon_url: null, description: "", invest_id: id ? Number(id) : null });

  const createNewCategoriesAndReturnIds = async (newCats: Array<{ name: string; description?: string; icon_url?: string | null }>) => {
    const token = localStorage.getItem("token");
    if (!newCats || newCats.length === 0) return [];
    try {
      const resp = await axios.post(
        `${api}/categories/bulk`,
        { categories: newCats },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const created = resp?.data?.data ?? resp?.data;
      if (Array.isArray(created)) return created.map((c: any) => c.id).filter(Boolean);
      if (Array.isArray(created.data)) return created.data.map((c: any) => c.id).filter(Boolean);
      if (created && Array.isArray(created.categories)) return created.categories.map((c: any) => c.id).filter(Boolean);
    } catch (err) {
      console.warn("Bulk create categories failed or not available, falling back to single creates.", err);
    }

    const resultIds: number[] = [];
    for (const c of newCats) {
      try {
        const respSingle = await axios.post(
          `${api}/categories`,
          { name: c.name, description: c.description ?? null, icon_url: c.icon_url ?? null },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const created = respSingle?.data?.data ?? respSingle?.data;
        if (created && created.id) resultIds.push(created.id);
        else if (created && created.data && created.data.id) resultIds.push(created.data.id);
      } catch (err) {
        console.error("Failed to create category (fallback):", c, err);
      }
    }
    return resultIds;
  };

  const onSubmit = async (values: FormValues) => {
    try {
      console.log("===== form values before submit =====");
      console.log(values);

      const token = localStorage.getItem("token");

      const newCatsPayload = (values.categories || []).filter((c) => !c.id).map((c) => ({
        name: c.name,
        description: c.description ?? "",
        icon_url: c.icon_url ?? null,
      }));
      const existingIds = (values.categories || []).filter((c) => c.id).map((c) => Number(c.id));

      console.log("newCatsPayload:", newCatsPayload);
      console.log("existingIds:", existingIds);

      const newIds = await createNewCategoriesAndReturnIds(newCatsPayload);
      console.log("newIds returned:", newIds);

      if (newIds.length > 0) {
        const currentCats = getValues("categories") || [];
        let nextNewIndex = 0;
        const updatedCats = currentCats.map((c: Category) => {
          if (c.id) return c;
          const assignedId = newIds[nextNewIndex++];
          return { ...c, id: assignedId ?? null, invest_id: id ? Number(id) : null };
        });
        replaceCats(updatedCats);
      }

      const allCategoryIds = [...existingIds, ...newIds];
      console.log("allCategoryIds to send with invest:", allCategoryIds);

      const fd = new FormData();
      fd.append("name", values.title ?? "");
      fd.append("type", values.type ?? "");
      fd.append("price", String(values.price ?? ""));

      allCategoryIds.forEach((cid) => fd.append("category_ids[]", String(cid)));

      newImages.forEach((file) => fd.append("gallery[]", file));

      if (removedGallery.length > 0) fd.append("remove_gallery", JSON.stringify(removedGallery));

      console.log("---- FormData entries before sending invest ----");
      for (const pair of fd.entries()) {
        console.log(pair[0], pair[1]);
      }
      console.log("------------------------------------------------");

      const url = id ? `${api}/invests/${id}` : `${api}/invests`;
      if (id) fd.append("_method", "PUT");

      const resp = await axios.post(url, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const returned = resp?.data?.data ?? resp?.data;
      console.log("===== invest returned =====", returned);
      toast.success(id ? "تم تحديث العنصر بنجاح" : "تم إضافة العنصر بنجاح");
      navigate("/dashboard/chances");

      if (returned) {
        const galleryUrls = Array.isArray(returned.gallery)
          ? returned.gallery.map((g: any) => (typeof g === "string" ? g : g.photo_url ?? g.url ?? ""))
          : [];
        setExistingGallery(galleryUrls);

        const cats = Array.isArray(returned.categories)
          ? returned.categories.map((c: any) => ({
              id: c.id ?? null,
              name: c.name ?? "",
              description: c.description ?? "",
              icon_url: c.icon_url ?? c.icon ?? null,
              invest_id: (c.pivot && c.pivot.invest_id) ?? returned.id ?? null,
            }))
          : [];
        replaceCats(cats);
      }
    } catch (err: any) {
      console.error("submit error:", err);
      const serverMsg = err?.response?.data?.message || JSON.stringify(err?.response?.data);
      toast.error("حدث خطأ: " + serverMsg);
    }
  };

  return (
    <div className="lg:mr-48 min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pt-16 pb-12 p-3">
      <div className="flex justify-center items-start">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-xl w-full max-w-4xl rounded-2xl p-6 space-y-6">
          <h1 className="text-2xl font-bold text-center">{id ? "تعديل فرصة" : "إضافة فرصة"}</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium mb-1">اسم الفرصة</label>
              <input {...register("title", { required: "العنوان مطلوب" })} className="w-full border p-3 rounded-lg" />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block font-medium mb-1">النوع</label>
              <input {...register("type")} className="w-full border p-3 rounded-lg" />
            </div>

            <div>
              <label className="block font-medium mb-1">السعر</label>
              <input type="number" {...register("price")} className="w-full border p-3 rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-2">الصور (المعرض)</label>
            <div className="flex gap-4 items-start">
              <div>
                <input type="file" accept="image/*" multiple onChange={(e) => onPickNewImages(e.target.files)} />
                <p className="text-xs text-slate-500 mt-1">مسموح رفع أكثر من صورة، الأولى هتظهر بالجدول.</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                {existingGallery.map((url) => (
                  <div key={url} className="relative w-28 h-20 rounded overflow-hidden border">
                    <img src={url} alt="existing" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeExistingGalleryUrl(url)} className="absolute top-1 right-1 bg-white/80 rounded p-1 text-red-600">✖</button>
                  </div>
                ))}

                {previewNewImages.map((u, i) => (
                  <div key={u} className="relative w-28 h-20 rounded overflow-hidden border">
                    <img src={u} alt={`new-${i}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 bg-white/80 rounded p-1 text-red-600">✖</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium">التصنيفات</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={addBlankCategory} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm">+ إضافة تصنيف يدوي</button>
              </div>
            </div>

            <div className="space-y-3">
              {catFields.length === 0 && <div className="text-sm text-slate-500">لا توجد تصنيفات مضافة</div>}
              {catFields.map((field, idx) => (
                <div key={field.id} className="border rounded-lg p-3 grid grid-cols-1 gap-4">
                  <div className="md:col-span-1">
                    <input
                      placeholder="اسم التصنيف"
                      {...register(`categories.${idx}.name` as const, { required: "اسم التصنيف مطلوب" })}
                      className="w-full border p-2 rounded"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <input placeholder="رابط الأيقونة (اختياري)" {...register(`categories.${idx}.icon_url` as const)} className="w-full border p-2 rounded" />
                  </div>
                  <div className="md:col-span-2">
                    <textarea placeholder="وصف" {...register(`categories.${idx}.description` as const)} className="w-full h-60 border p-2 rounded" />
                  </div>
                  <div className="md:col-span-1 flex gap-2">
                    <button type="button" onClick={() => removeCat(idx)} className="px-3 py-1 bg-red-500 text-white rounded-lg">حذف</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-60">
              {isSubmitting ? "⏳ جاري..." : id ? "✏️ تعديل" : "➕ إضافة"}
            </button>
            <button type="button" onClick={() => { reset(); navigate(-1); }} className="bg-gray-300 px-6 py-2 rounded-lg">← رجوع</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add_Update_Chance;
