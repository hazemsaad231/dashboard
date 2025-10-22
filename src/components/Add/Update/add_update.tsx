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

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: { title: "", description: "", image: "", type: resource },
  });

  // جلب بيانات العنصر للتعديل
  useEffect(() => {
    if (!id) return;
    const update =async () => {
      try {
        const { data } = await axios.get(`${api}/services/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const res = data.data;
        setValue("title", res.title);
        setValue("description", res.description);
        setValue("image", res.image);
        setValue("type", resource ?? "");
        console.log('data',data);
      } catch (error) {
        console.error(error);
        toast.error("فشل في جلب بيانات العنصر");
      }
    } 
    update();
  }, [id, resource, setValue]);


// إرسال البيانات (إضافة أو تعديل)

  const onSubmit = async (data: FormValues) => {
        try {
            if (id) {
               
                const response = await axios.put(`${api}/services/${id}`, data,{
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  });
                console.log(response,'updated');
                setTimeout(() => {
                    navigate(`/dashboard/${resource}/${resource}`)
                },1000)
                toast("تحديث العنصر تم بنجاح");
            } else {
                const response = await axios.post(`${api}/services`, data,
                    {headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                );
                console.log(response);
                setTimeout(() => {
                    navigate(`/dashboard/${resource}/${resource}`)
                },1000)
               
                toast("إضافة العنصر تم بنجاح");
            }
        } catch (error) {
            console.error(error);
            toast.error("حدث خطأ أثناء العملية.");
        }
    };



  return (
    <div className="lg:mr-52 min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pt-16 pb-12 p-3">
      <ToastContainer limit={1} />
      <div className="flex justify-center items-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-xl w-full max-w-4xl rounded-2xl p-4"
        >
          {/* العنوان الرئيسي */}
          <h1 className="text-3xl md:text-4xl text-center font-bold mb-6">
            {id ? `تعديل ${resource==='services'?'خدمة':'مقال'}` : `إضافة ${resource==='services'?'خدمة':'مقال'}`}
          </h1>

          {/* حقل رفع الصورة */}
              <div className="mb-4">
                 <label className="block font-semibold mb-2">📷 اختر صورة</label>
                    <input  className="border p-3 w-full rounded-lg" {...register("image", { required: false,pattern:{
                          value:/(\.(jpg|jpeg|png|gif|bmp|webp|svg)$)|(^https?:\/\/[^\s]+)$/i,
                       message: 'Only JPG, JPEG, and PNG files are allowed',
                    } })} placeholder="Enter image" />
                   {errors.image && <span className="text-red-500">{errors.image.message}</span>}                         
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
              className="border p-3 w-full h-[24rem] md:h-60 rounded-lg"
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
