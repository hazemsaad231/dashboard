import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../Api/api";
import Select from "./select";


type GalleryItem = {
  id: number | string;
  url: string;
  type: 'image' | 'video' | string; // تحديد الأنواع الممكنة
  type_photo?: 'default' | 'main' | string; // نوع الصورة داخل المعرض
};

type Category = {
    id?: number | null;
    name: string;
    icon_url?: string | null;
    description?: string;
  };
  
  type SocialLink = {
    name: string;
    url: string;
  };
  
  type FormValues = {
    title: string;
    type: string;
    price?: number | "";
    description?: string;
    icon?: string | null;
    site_link?: string;
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
      description: "",
      icon: "",
      site_link: "",
    },
  });

  // --- المعرض الموحد (صور وفيديو قديمة) ---
  const [existingGallery, setExistingGallery] = useState<GalleryItem[]>([]);
  const [removedGallery, setRemovedGallery] = useState<(number | string)[]>([]);

  // --- الإضافات الجديدة ---
  const [newFiles, setNewFiles] = useState<File[]>([]); // ملفات جديدة (صور وفيديو)
  const [previewNewFiles, setPreviewNewFiles] = useState<string[]>([]); // معاينة الملفات الجديدة
  const [fileTypes, setFileTypes] = useState<('image' | 'video')[]>([]); // نوع الملف (image/video)
  const [imageTypes, setImageTypes] = useState<string[]>([]); // نوع الصورة (default/main)
  
  // --- التصنيفات ---
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  // --- روابط السوشيال ميديا ---
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

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
        setValue("description", item.description ?? "");
        setValue("icon", item.icon ?? null);
        setValue("site_link", item.site_link ?? "");

        // تحميل روابط السوشيال
        if (Array.isArray(item.socials) && item.socials.length > 0) {
          setSocialLinks(item.socials.map((s: any) => ({
            name: s.name ?? "",
            url: s.url ?? ""
          })));
        } else {
          setSocialLinks([]);
        }


        // تحويل الصور والفيديو القديمة إلى معرض موحد
        const galleryItems: GalleryItem[] =
          Array.isArray(item.gallery) && item.gallery.length
            ? item.gallery.map((g: any) => ({ 
                id: g.id, 
                url: g.photo_url ?? "", 
                type: g.type_photo === 'video' ? 'video' : 'image', // تحديد نوع الملف
                type_photo: g.type_photo ?? 'default' // نوع الصورة/الفيديو داخل المعرض (default, main)
              }))
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
      previewNewFiles.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previewNewFiles]);

  // رفع ملفات جديدة (صور أو فيديو)
  const onPickNewFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    
    // تقسيم الملفات إلى صور وفيديو لتحديد الـ fileTypes و imageTypes
    const newFileArr: File[] = [];
    const newPreviewArr: string[] = [];
    const newFileTypeArr: ('image' | 'video')[] = [];
    const newImageTypeArr: string[] = [];

    arr.forEach(file => {
        newFileArr.push(file);
        newPreviewArr.push(URL.createObjectURL(file));

        const isVideo = file.type.startsWith('video/');
        newFileTypeArr.push(isVideo ? 'video' : 'image');
        // إذا كان فيديو، نرسل 'video' كنوع للـ type_photo، وإلا نستخدم 'default' كنوع للصورة
        newImageTypeArr.push(isVideo ? 'video' : 'default'); 
    });

    setNewFiles((prev) => [...prev, ...newFileArr]);
    setPreviewNewFiles((prev) => [...prev, ...newPreviewArr]);
    setFileTypes((prev) => [...prev, ...newFileTypeArr]);
    setImageTypes((prev) => [...prev, ...newImageTypeArr]);
  };

  // حذف عنصر من المعرض القديم
  const removeExistingGalleryItem = (itemId: number | string) => {
    setExistingGallery((prev) => prev.filter((x) => x.id !== itemId));
    setRemovedGallery((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]));
  };

  // حذف عنصر جديد
  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setFileTypes((prev) => prev.filter((_, i) => i !== index));
    setImageTypes((prev) => prev.filter((_, i) => i !== index));
    setPreviewNewFiles((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed);
      return copy;
    });
  };

  // تحديث نوع الصورة/الفيديو للعنصر الجديد (نسميها imageType لكنها تحمل نوع الصورة أو 'video')
  const updateNewFileImageType = (index: number, type: string) => {
    const updated = [...imageTypes];
    // نمنع تغيير النوع الأساسي (image/video)
    if (fileTypes[index] === 'video' && type !== 'video') {
        toast.error("لا يمكن تغيير نوع الفيديو");
        return;
    }
    updated[index] = type;
    setImageTypes(updated);
  };

  // إضافة التصنيفات لـ FormData
  const appendCategoryIdsToFormData = (fd: FormData) => {
    selectedCategoryIds.forEach((cid) => fd.append("category_ids[]", String(cid)));
  };

  // إضافة رابط سوشيال جديد
  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { name: "", url: "" }]);
  };

  // حذف رابط سوشيال
  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  // تحديث رابط سوشيال
  const updateSocialLink = (index: number, field: "name" | "url", value: string) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  // ارسال الفورم
  const onSubmit = async (values: FormValues) => {
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("name", values.title ?? "");
      fd.append("type", values.type ?? "");
      fd.append("price", String(values.price ?? ""));
      fd.append("description", values.description ?? "");
      fd.append("site_link", values.site_link ?? "");

      if (values.icon) fd.append("icon", values.icon);

      socialLinks.forEach((social, index) => {
        fd.append(`socials[${index}][name]`, social.name);
        fd.append(`socials[${index}][url]`, social.url);
      });

      appendCategoryIdsToFormData(fd);

      // 🖼️ الملفات الجديدة وأنواعها (صور وفيديو)
      newFiles.forEach((file, index) => {
        fd.append("images[]", file); // نرسل الملف (صورة أو فيديو)

        fd.append("image_types[]", imageTypes[index] || "default");
      });

      // الصور الممسوحة
      if (removedGallery.length > 0) fd.append("removed_gallery", JSON.stringify(removedGallery));

      const url = id ? `${api}/invests/${id}` : `${api}/invests`;
      if (id) fd.append("_method", "PUT");

      const resp = await axios.post(url, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const returned = resp?.data?.data ?? resp?.data;
      toast.success(id ? "تم تحديث العنصر بنجاح" : "تم إضافة العنصر بنجاح", {
        id: "unique-id",
      });

      // تحديث المعرض بعد الحفظ
      if (returned) {
        const galleryUrls: GalleryItem[] = Array.isArray(returned.gallery)
          ? returned.gallery.map((g: any) => ({ 
              id: g.id, 
              url: g.photo_url ?? g.url ?? "", 
              type: g.type_photo === 'video' ? 'video' : 'image', // تحديد نوع الملف
              type_photo: g.type_photo ?? 'default' // نوع الصورة/الفيديو داخل المعرض (default, main)
            }))
          : [];
        setExistingGallery(galleryUrls);

        const catsIds =
          Array.isArray(returned.categories) && returned.categories.length
            ? returned.categories.map((c: any) => Number(c.id ?? c._id)).filter(Boolean)
            : [];
        setSelectedCategoryIds(catsIds);
        
        // مسح الحالات بعد الإرسال الناجح
        setNewFiles([]);
        setFileTypes([]);
        setImageTypes([]);
        previewNewFiles.forEach((u) => URL.revokeObjectURL(u));
        setPreviewNewFiles([]);
        setRemovedGallery([]);
        
        navigate("/dashboard/chances");
      }
    } catch (err: any) {
      console.error("submit error:", err);
      const serverMsg = err?.response?.data?.message || JSON.stringify(err?.response?.data);
      toast.error("حدث خطأ: " + serverMsg, { id: "unique-id" });
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

          {/* 📷 أيقونه */}
          <div className="mb-4">
            <label className="block font-semibold mb-2">📷 اختر ايقونه</label>
            <input
              className="border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              {...register("icon")}
            />
            {errors.icon && <p className="text-red-500 text-sm mt-1">⚠️ {errors.icon.message}</p>}
          </div>

          {/* بيانات الفرصة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">نوع الفرصة</label>
              <input
                {...register("type", { required: "النوع مطلوب" })}
                className="w-full border p-3 rounded-lg"
              />
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">
                  <span>⚠️</span> النوع مطلوب
                </p>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1">سعر الفرصة</label>
              <input
                type="number"
                {...register("price", { required: "السعر مطلوب" })}
                className="w-full border p-3 rounded-lg"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">
                  <span>⚠️</span> السعر مطلوب
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">اسم الشركه </label>
            <input
              {...register("title", { required: "العنوان مطلوب" })}
              className="w-full border p-3 rounded-lg"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                <span>⚠️</span> {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">معلومات عن الشركه</label>
            <textarea
              {...register("description", { required: "النوع مطلوب" })}
              className="w-full border h-40 p-3 rounded-lg"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                <span>⚠️</span> النوع مطلوب
              </p>
            )}
          </div>

          {/* 🔗 رابط الموقع */}
          <div>
            <label className="block font-medium mb-1">🔗 رابط الموقع</label>
            <input
              type="url"
              placeholder="https://example.com"
              {...register("site_link")}
              className="w-full border p-3 rounded-lg"
            />
          </div>

          {/* 📱 روابط السوشيال ميديا */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block font-medium">📱 روابط السوشيال ميديا</label>
              <button
                type="button"
                onClick={addSocialLink}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                ➕ إضافة رابط
              </button>
            </div>

            <div className="space-y-3">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <select
                    value={link.name}
                    onChange={(e) => updateSocialLink(index, "name", e.target.value)}
                    className="border p-3 rounded-lg w-1/3"
                  >
                    <option value="">اختر المنصة</option>
                    <option value="facebook">Facebook</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                  </select>

                  <input
                    type="url"
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                    className="border p-3 rounded-lg flex-1"
                  />

                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* المعرض الموحد (صور وفيديو) */}
          <div className="border-t pt-4">
            <label className="block font-medium mb-2">🖼️ معرض الصور والفيديو</label>
            <div className="flex flex-col gap-4 items-start">
              <div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={(e) => onPickNewFiles(e.target.files)}
                />
                <p className="text-xs text-slate-500 mt-1">
                  يمكنك رفع صور وفيديوهات متعددة.
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {/* 1. العناصر القديمة (صور وفيديو) */}
                {existingGallery.map((g) => (
                  <div key={g.id} className="relative w-28 h-28 rounded overflow-hidden border">
                    
                    {g.type === 'video' ? (
                      <div className="w-full h-full bg-black flex items-center justify-center">
                        <video src={g.url} className="w-full h-full object-cover opacity-70" />
                        <span className="absolute text-white text-4xl font-bold">▶️</span>
                      </div>
                    ) : (
                      <img src={g.url} alt="existing" className="w-full h-full object-cover" />
                    )}

                    {g.type_photo && (
                       <p className={`absolute top-0 left-0 text-white text-xs px-1 ${g.type_photo === 'video' ? 'bg-purple-600' : 'bg-blue-500'}`}>
                         {g.type_photo}
                       </p>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingGalleryItem(g.id)}
                      className="absolute top-1 right-1 bg-white/80 rounded p-1 text-red-600"
                    >
                      ✖
                    </button>
                  </div>
                ))}

                {/* 2. العناصر الجديدة (صور وفيديو) */}
                {previewNewFiles.map((u, i) => (
                  <div key={u} className="relative w-28 h-28 rounded overflow-hidden border flex flex-col">
                    
                    {fileTypes[i] === 'video' ? (
                      <div className="w-full h-20 bg-black flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xl">🎬 فيديو</span>
                      </div>
                    ) : (
                      <img src={u} alt={`new-${i}`} className="w-full h-20 object-cover flex-shrink-0" />
                    )}
                    
                    {/* اختيار النوع - مع تعطيله إذا كان فيديو */}
                    <select
                      value={imageTypes[i] || "default"}
                      onChange={(e) => updateNewFileImageType(i, e.target.value)}
                      disabled={fileTypes[i] === 'video'}
                      className={`bg-slate-100 text-xs text-center border-t w-full p-1 flex-grow ${fileTypes[i] === 'video' ? 'text-purple-600 font-bold' : ''}`}
                    >
                      {fileTypes[i] === 'video' ? (
                          <option value="video">Video</option>
                      ) : (
                          <>
                            <option value="default">Default</option>
                            <option value="main">Main (الرئيسية)</option> 
                          </>
                      )}
                    </select>
                    
                    <button
                      type="button"
                      onClick={() => removeNewFile(i)}
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
              className="bg-[#47369d] hover:bg-[#241a56] text-white px-6 py-2 rounded-lg disabled:opacity-60"
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