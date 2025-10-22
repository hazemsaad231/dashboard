import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../Api/api";
import toast from "react-hot-toast";

type FormValues = {
  title: string;
  description: string;
  image: FileList | null;
  type: string;
};

const Add_Update: React.FC = () => {
  const { id, resource } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { title: "", description: "", image: null, type: resource ?? "" },
  });

  // لو تعديل
  useEffect(() => {
    if (!id) return;
    const fetchItem = async () => {
      try {
        const resp = await axios.get(`${api}/services/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const item = resp.data.data;
        setValue("title", item.title || "");
        setValue("description", item.description || "");
        setValue("type", resource ?? "");
      } catch (err) {
        console.error(err);
        toast.error("فشل في جلب بيانات العنصر");
      }
    };
    fetchItem();
  }, [id, resource, setValue]);

  const onSubmit = async (data: FormValues) => {
    try {
      // نستخدم FormData عشان نقدر نرفع ملف الصورة
      const fd = new FormData();
      fd.append("title", data.title);
      fd.append("description", data.description);
      fd.append("type", data.type || resource || "");
      if (data.image && data.image.length > 0) {
        fd.append("image", data.image[0]);
      }

      if (id) {
        // تحديث
        fd.append("_method", "PUT");
        await axios.post(`${api}/services/${id}`, fd, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        toast.success("تم تحديث العنصر بنجاح");
      } else {
        // إضافة جديد
        await axios.post(`${api}/services`, fd, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log('data',fd,data,resource);
        toast.success("تم إضافة العنصر بنجاح");
      }

      navigate(`/dashboard/${resource}/${resource}`);
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
            {id
              ? `تعديل ${resource === "services" ? "خدمة" : "مقال"}`
              : `إضافة ${resource === "services" ? "خدمة" : "مقال"}`}
          </h1>

          {/* 📷 صورة */}
          <div className="mb-4">
            <label className="block font-semibold mb-2">📷 اختر صورة</label>
            <input
              type="file"
              accept="image/*"
              className="border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              {...register("image")}
            />
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">
                ⚠️ {errors.image.message as string}
              </p>
            )}
          </div>

          {/* 📝 عنوان */}
          <div className="mb-4">
            <label className="block font-semibold mb-2">📝 العنوان</label>
            <input
              {...register("title", { required: "العنوان مطلوب" })}
              placeholder="أدخل العنوان"
              className="border p-3 w-full rounded-lg"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                ⚠️ {errors.title.message}
              </p>
            )}
          </div>

          {/* 📄 وصف */}
          <div className="mb-4">
            <label className="block font-semibold mb-2">📄 الوصف</label>
            <textarea
              {...register("description", { required: "الوصف مطلوب" })}
              placeholder="أدخل الوصف التفصيلي"
              className="border p-3 w-full h-[24rem] md:h-60 rounded-lg"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                ⚠️ {errors.description.message}
              </p>
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

export default Add_Update;
