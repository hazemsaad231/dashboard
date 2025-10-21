

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { api } from "../../Api/api";

type FormValues = {
  title: string;
  discription: string;
  img: string;
};

const Add_Update = () => {
  const { id , resource } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await axios.get(`${api}/${resource}/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        reset({ title: data.title, discription: data.discription, img: data.img });
      } catch (error) {
        console.error(error);
      }
    })();
  }, [id, reset]);

  const onSubmit = async (formData: FormValues) => {
    try {
      if (id) {
        await axios.put(`${api}/${resource}/${id}`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        toast.success("تم التعديل بنجاح");
      } else {
        await axios.post(`${api}/${resource}`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        toast.success("تم الإضافة بنجاح");
      }
      setTimeout(() => navigate(`/dashboard/${resource}/${resource}`), 800);
    } catch (e) {
      console.error(e);
      toast.error("حدث خطأ أثناء العملية");
    }
  };

  return (
    <div className="lg:mr-52 bg-gradient-to-t from-slate-50 to-slate-100 min-h-screen">
      <ToastContainer limit={1} />
      <div className="flex justify-center items-center py-20">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-lg w-[90%] md:w-[80%] xl:w-[70%] mx-auto p-4 rounded-xl"
        >
          <h1 className="text-lg md:text-xl text-center tracking-[2px] text-blue-600 font-bold">
            {id ? `تعديل ` : `اضافة`}
          </h1>

          <div className="grid grid-cols-1 gap-4 mt-4">

            
            <div className="flex flex-col">
              <label>الصورة</label>
              <input
                {...register("img", {
                  required: "رابط الصورة مطلوب",
                pattern: {
  value: /^https?:\/\/.+/i,
  message: "ادخل رابط صالح يبدأ بـ http أو https",
},
                })}
                className="border p-2 mt-1 shadow"
                placeholder="https://example.com/image.jpg"
              />
              {errors.img && <span className="text-red-500">{errors.img.message}</span>}
            </div>

            <div className="flex flex-col">
              <label>العنوان</label>
              <input
                {...register("title", { required: "العنوان مطلوب" })}
                className="border p-2 mt-1 shadow"
                placeholder="Enter title"
              />
              {errors.title && <span className="text-red-500">{errors.title.message}</span>}
            </div>

            <div className="flex flex-col">
              <label>الوصف</label>
              <textarea
                {...register("discription", { required: "النص مطلوب" })}
                className="border mt-1 p-2 h-80 shadow"
                placeholder="Enter text"
              />
              {errors.discription && <span className="text-red-500">{errors.discription.message}</span>}
            </div>

          </div>

          <div className="flex justify-center mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-700 text-white px-16 py-2 rounded-lg"
            >
              {id ? "تعديل" : "اضافة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add_Update;
