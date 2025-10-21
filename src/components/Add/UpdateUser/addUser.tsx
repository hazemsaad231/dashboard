import { useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { api } from "../../Api/api";

type FormValues = {
  title: string;
  description: string;
  image: string; 
  type: string;
};

const Add_Update = () => {
  const { id, resource } = useParams();
  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: { title: "", description: "", image: "", type: resource },
  });

  // 🟢 جلب بيانات العنصر إذا كنا في وضع التعديل
  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const { data } = await axios.get(`${api}/${resource}/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        reset({
          title: data.data.title,
          description: data.data.description,
          image: data.data.image,
          type: resource,
        });
      } catch (error) {
        console.error(error);
        toast.error("فشل في جلب بيانات العنصر");
      }
    })();
  }, [id, reset, resource]);

  // 🟢 إرسال البيانات (إضافة أو تعديل)
  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("type", data.type);

    // رفع الصورة كملف
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (fileInput?.files?.[0]) formData.append("image", fileInput.files[0]);

    try {
      if (id) {
        await axios.put(`${api}/services/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("تم التعديل بنجاح");
      } else {
        await axios.post(`${api}/services`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("تم الإضافة بنجاح");
      }
      // بعد الإضافة/التعديل نرجع للصفحة السابقة
      setTimeout(() => navigate(`/dashboard/${resource}/${resource}`), 800);
    } catch (e) {
      console.error(e);
      toast.error("حدث خطأ أثناء العملية");
    }
  };

  return (
    <div className="lg:mr-52 min-h-screen pt-16 pb-12 p-3">
      <ToastContainer limit={1} />
      <div className="flex justify-center items-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-lg w-full max-w-2xl rounded-2xl p-8 border border-slate-100"
        >
          {/* العنوان الرئيسي */}
          <h1 className="text-3xl md:text-4xl text-center font-bold mb-6">
            {id ? `تعديل ${resource==='services'?'خدمة':'مقال'}` : `إضافة ${resource==='services'?'خدمة':'مقال'}`}
          </h1>

          {/* حقل رفع الصورة */}
          <div className="mb-4">
            <label className="block font-semibold mb-2">📷 اختر صورة</label>
            <input type="file" accept="image/*" {...register("image", { required: "الصورة مطلوبة" })} />
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
          </div>

          {/* حقل العنوان */}
          <div className="mb-4">
            <label className="block font-semibold mb-2">📝 العنوان</label>
            <input
              {...register("title", { required: "العنوان مطلوب" })}
              placeholder="أدخل العنوان"
              className="border p-3 w-full rounded-lg"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {/* حقل الوصف */}
          <div className="mb-4">
            <label className="block font-semibold mb-2">📄 الوصف</label>
            <textarea
              {...register("description", { required: "الوصف مطلوب" })}
              placeholder="أدخل الوصف التفصيلي"
              className="border p-3 w-full h-40 rounded-lg"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          {/* أزرار الإرسال والرجوع */}
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
              onClick={() => navigate(-1)}
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
