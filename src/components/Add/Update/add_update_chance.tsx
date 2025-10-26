import React, { useEffect, useState} from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../Api/api";
import Select from "./select";

type Category = {
  id?: number | null;
  name: string;
  icon_url?: string | null;
  description?: string;
};

type FormValues = {
  title: string;
  type: string;
  price?: number | "";
  // حذفنا categories array من الفورم لأننا هنستخدم select خارجي
};

const Add_Update_Chance: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      type: "",
      price: "",
    },
  });

  // حالات الصور/معاينات
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [removedGallery, setRemovedGallery] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewNewImages, setPreviewNewImages] = useState<string[]>([]);

  // قائمة التصنيفات اللي هتتبنى في select
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  // اللي المستخدم اختاره (مصفوفة أرقام)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  // جلب تفاصيل العنصر (لو تعديل)
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

        const galleryUrls =
          Array.isArray(item.gallery) && item.gallery.length
            ? item.gallery.map((g: any) => (typeof g === "string" ? g : g.photo_url ?? ""))
            : [];
        setExistingGallery(galleryUrls);

        // لو السيرفر رجّع التصنيفات مع العنصر، نفّض الـ selectedCategoryIds على أساسها
        const catsIds =
          Array.isArray(item.categories) && item.categories.length
            ? item.categories.map((c: any) => Number(c.id ?? c._id)).filter(Boolean)
            : [];
        setSelectedCategoryIds(catsIds);
      } catch (err) {
        console.error("fetch item error:", err);
        toast.error("فشل في جلب بيانات العنصر");
      }
    })();
  }, [id, setValue]);

  // جلب كل التصنيفات لعرضها في select
  const fetchAllCategories = async () => {
    setLoadingCategories(true);
    try {
      const r = await axios.get(`${api}/categories`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const payload: any[] = r?.data?.data ?? r?.data ?? [];
      const cats = payload.map((c: any) => ({
        id: c.id ?? c._id ?? null,
        name: c.name ?? c.title ?? "",
        description: c.description ?? "",
        icon_url: c.icon_url ?? c.icon ?? null,
      }));
      setAllCategories(cats);
    } catch (err) {
      console.error("fetch categories error:", err);
      toast.error("فشل في جلب التصنيفات");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchAllCategories();
  }, []);

  // تنظيف معاينات URL عند الخروج
  useEffect(() => {
    return () => {
      previewNewImages.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previewNewImages]);

  // اختيار صور جديدة (مع prevent duplicates لو ظهر لازم)
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



  const appendCategoryIdsToFormData = (fd: FormData) => {
    selectedCategoryIds.forEach((cid) => fd.append("category_ids[]", String(cid)));
  };

  const onSubmit = async (values: FormValues) => {
    try {
      console.log("===== form values before submit =====");
      console.log(values);
      console.log("selectedCategoryIds:", selectedCategoryIds);

      const token = localStorage.getItem("token");

      const fd = new FormData();
      fd.append("name", values.title ?? "");
      fd.append("type", values.type ?? "");
      fd.append("price", String(values.price ?? ""));

      // append categories chosen from select
      appendCategoryIdsToFormData(fd);

      // append new images
      newImages.forEach((file) => fd.append("images[]", file));

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

        // لو السيرفر رجّع تصنيفات، حدث selectedCategoryIds بناءً على الـ returned
        const catsIds =
          Array.isArray(returned.categories) && returned.categories.length
            ? returned.categories.map((c: any) => Number(c.id ?? c._id)).filter(Boolean)
            : [];
        setSelectedCategoryIds(catsIds);
      }
    } catch (err: any) {
      console.error("submit error:", err);
      const serverMsg = err?.response?.data?.message || JSON.stringify(err?.response?.data);
      toast.error("حدث خطأ: " + serverMsg);
    }
  };

  return (
    <div className="lg:mr-52 min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pt-16 pb-12 p-3">
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

          
<Select
  categories={allCategories}
  loading={loadingCategories}
  selectedIds={selectedCategoryIds}
  onChange={(ids) => setSelectedCategoryIds(ids)}
  placeholder="اختر التصنيفات "
/>

          {/* ------------------------------------------------------------------------------- */}

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
