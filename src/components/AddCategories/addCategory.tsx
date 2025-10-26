import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../Api/api";
import toast from "react-hot-toast";

type FormValues = {
  name: string;
  description: string;
  icon: FileList | null; // للرفع لو عايز تغير الأيقونة
  icon_url?: string | null; // للمعاينة لو موجودة من السيرفر
};

const AddUpdateCategory: React.FC = () => {
  const { id } = useParams(); // لو المسار يدينا id للتعديل
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { name: "", description: "", icon: null, icon_url: null },
  });

  // لو تعديل — جلب بيانات التصنيف علشان نعمل prefill ونعرض icon_url
  useEffect(() => {
    if (!id) return;
    const fetchItem = async () => {
      try {
        const resp = await axios.get(`${api}/categories/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const item = resp?.data?.data ?? resp?.data ?? {};
        setValue("name", item.name ?? "");
        setValue("description", item.description ?? "");
        setValue("icon_url", item.icon_url ?? item.icon ?? null);
      } catch (err) {
        console.error(err);
        toast.error("فشل في جلب بيانات التصنيف");
      }
    };
    fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, setValue]);

 
  const iconFiles = watch("icon");
  const iconUrl = watch("icon_url"); 

 

  const onSubmit = async (data: FormValues) => {
    try {
      const fd = new FormData();
      fd.append("name", data.name);
      fd.append("description", data.description ?? "");

      if (data.icon && data.icon.length > 0) {
        fd.append("icon", data.icon[0]);
      } else {
    
        if (data.icon_url) fd.append("icon_url", data.icon_url);
      }

      if (id) {
        // تحديث: method override لو السيرفر مش بيسمح PUT مع multipart
        fd.append("_method", "PUT");
        await axios.post(`${api}/categories/${id}`, fd, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        toast.success("تم تحديث التصنيف بنجاح");
      } else {
        // إنشاء جديد
        await axios.post(`${api}/categories`, fd, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        toast.success("تم إضافة التصنيف بنجاح");
      }

      navigate("/dashboard/category");
    } catch (err: any) {
      console.error(err);
      if (err?.response?.data) {
        const serverMsg = err.response.data.message || JSON.stringify(err.response.data);
        toast.error("خطأ من السيرفر: " + serverMsg);
      } else {
        toast.error("حدث خطأ أثناء العملية.");
      }
    }
  };

  return (
    <div className="lg:mr-48 min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pt-16 pb-12 p-3">
      <div className="flex justify-center items-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-xl w-full max-w-4xl rounded-2xl p-4"
        >
          <h1 className="text-3xl md:text-4xl text-center font-bold mb-6">
            {id ? "تعديل تصنيف" : "إضافة تصنيف"}
          </h1>

          {/* 📷 أيقونة التصنيف */}
          <div className="mb-4">
            <label className="block font-semibold mb-2">📷 أيقونة التصنيف (اختياري)</label>

            <div className="flex items-start gap-4">
              <div className="w-36 h-36 rounded overflow-hidden border flex items-center justify-center bg-white">
                {/* لو المستخدم اختار ملف جديد نعرضه، وإلا نعرض icon_url لو موجود */}
                {iconFiles && iconFiles.length > 0 ? (
                  // @ts-ignore createObjectURL expects Blob
                  <img src={URL.createObjectURL(iconFiles[0])} alt="preview" className="w-full h-full object-cover" />
                ) : iconUrl ? (
                  <img src={iconUrl} alt="icon" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-xs text-slate-400 text-center p-2">معاينة الأيقونة</div>
                )}
              </div>

              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  className="border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  {...register("icon")}
                />
                {/* نخزن icon_url كحقل مخفي لو جاي من السيرفر */}
                <input type="hidden" {...register("icon_url")} />
                <p className="text-xs text-slate-500 mt-2">لو عايز تغيّر الأيقونة اختَر ملف جديد</p>
              </div>
            </div>
          </div>

          {/* 📝 اسم التصنيف */}
          <div className="mb-4">
            <label className="block font-semibold mb-2">📝 اسم التصنيف</label>
            <input
              {...register("name", { required: "اسم التصنيف مطلوب" })}
              placeholder="أدخل اسم التصنيف"
              className="border p-3 w-full rounded-lg"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">⚠️ {errors.name.message as string}</p>
            )}
          </div>

          {/* 📄 الوصف */}
          <div className="mb-4">
            <label className="block font-semibold mb-2">📄 الوصف</label>
            <textarea
              {...register("description", { required: "الوصف مطلوب" })}
              placeholder="أدخل وصف للتصنيف"
              className="border p-3 w-full h-[24rem] md:h-60 rounded-lg"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">⚠️ {errors.description.message as string}</p>
            )}
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? "⏳ جاري المعالجة..." : id ? "✏️ تعديل" : "➕ إضافة"}
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

export default AddUpdateCategory;
