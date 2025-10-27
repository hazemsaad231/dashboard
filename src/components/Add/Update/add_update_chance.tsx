import React, { useEffect, useState } from "react";
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

  // --- الصور ---
  const [existingGallery, setExistingGallery] = useState<{ id: number | string ; url: string}[]>([]);
  const [removedGallery, setRemovedGallery] = useState<(number | string)[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewNewImages, setPreviewNewImages] = useState<string[]>([]);
console.log('removedGallery',removedGallery)
console.log('existingGallery',existingGallery)
  // --- التصنيفات ---
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  // جلب بيانات العنصر للتعديل
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

        // تحويل الصور القديمة
        const galleryItems =
          Array.isArray(item.gallery) && item.gallery.length
            ? item.gallery.map((g: any) => ({ id: g.id, url: g.photo_url ?? g.url ?? "" }))
            : [];
        setExistingGallery(galleryItems);

        // التصنيفات
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

  // جلب كل التصنيفات
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

  // تنظيف preview URLs
  useEffect(() => {
    return () => {
      previewNewImages.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previewNewImages]);

  // رفع صور جديدة
  const onPickNewImages = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setNewImages((prev) => [...prev, ...arr]);
    const newPreviews = arr.map((f) => URL.createObjectURL(f));
    setPreviewNewImages((prev) => [...prev, ...newPreviews]);
  };

  // حذف صورة قديمة
  const removeExistingGalleryUrl = (imageId: number | string) => {
    setExistingGallery((prev) => prev.filter((x) => x.id !== imageId));
    setRemovedGallery((prev) => (prev.includes(imageId) ? prev : [...prev, imageId]));
  };

  // حذف صورة جديدة
  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewNewImages((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed);
      return copy;
    });
  };

  // إضافة التصنيفات لـ FormData
  const appendCategoryIdsToFormData = (fd: FormData) => {
    selectedCategoryIds.forEach((cid) => fd.append("category_ids[]", String(cid)));
  };





 // ارسال الفورم
  const onSubmit = async (values: FormValues) => {
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("name", values.title ?? "");
      fd.append("type", values.type ?? "");
      fd.append("price", String(values.price ?? ""));

      appendCategoryIdsToFormData(fd);

      // الصور الجديدة
      newImages.forEach((file) => fd.append("images[]", file));

      // الصور الممسوحة
      if (removedGallery.length > 0) fd.append("removed_gallery", JSON.stringify(removedGallery));

    console.log(removedGallery);


      const url = id ? `${api}/invests/${id}` : `${api}/invests`;
      if (id) fd.append("_method", "PUT");

      const resp = await axios.post(url, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const returned = resp?.data?.data ?? resp?.data;
      console.log("returned", returned);
      toast.success(id ? "تم تحديث العنصر بنجاح" : "تم إضافة العنصر بنجاح");
    

      // تحديث المعرض بعد الحفظ
      if (returned) {
        const galleryUrls = Array.isArray(returned.gallery)
          ? returned.gallery.map((g: any) => ({ id: g.id, url: g.photo_url ?? g.url ?? "" }))
          : [];
        setExistingGallery(galleryUrls);

        const catsIds =
          Array.isArray(returned.categories) && returned.categories.length
            ? returned.categories.map((c: any) => Number(c.id ?? c._id)).filter(Boolean)
            : [];
        setSelectedCategoryIds(catsIds);

          navigate("/dashboard/chances");
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
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-xl w-full max-w-4xl rounded-2xl p-6 space-y-6"
        >
          <h1 className="text-2xl font-bold text-center">{id ? "تعديل فرصة" : "إضافة فرصة"}</h1>

          {/* بيانات الفرصة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium mb-1">اسم الفرصة</label>
              <input
                {...register("title", { required: "العنوان مطلوب" })}
                className="w-full border p-3 rounded-lg"
              />
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

          {/* المعرض */}
          <div>
            <label className="block font-medium mb-2">الصور (المعرض)</label>
            <div className="flex flex-col gap-4 items-start">
              <div>
                <input type="file" accept="image/*" multiple onChange={(e) => onPickNewImages(e.target.files)} />
                <p className="text-xs text-slate-500 mt-1">
                  مسموح رفع أكثر من صورة، الأولى هتظهر بالجدول.
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {existingGallery.map((g) => (
                  <div key={g.id} className="relative w-20 h-20 rounded overflow-hidden border">
                    <img src={g.url} alt="existing" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingGalleryUrl(g.id)}
                      className="absolute top-1 right-1 bg-white/80 rounded p-1 text-red-600"
                    >
                      ✖
                    </button>
                  </div>
                ))}

                {previewNewImages.map((u, i) => (
                  <div key={u} className="relative w-28 h-20 rounded overflow-hidden border">
                    <img src={u} alt={`new-${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute top-1 right-1 bg-white/80 rounded p-1 text-red-600"
                    >
                      ✖
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* التصنيفات */}
          <Select
            categories={allCategories}
            loading={loadingCategories}
            selectedIds={selectedCategoryIds}
            onChange={(ids) => setSelectedCategoryIds(ids)}
            placeholder="اختر التصنيفات "
          />

          {/* أزرار */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-60"
            >
              {isSubmitting ? "⏳ جاري..." : id ? "✏️ تعديل" : "➕ إضافة"}
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                navigate(-1);
              }}
              className="bg-gray-300 px-6 py-2 rounded-lg"
            >
              ← رجوع
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add_Update_Chance;
