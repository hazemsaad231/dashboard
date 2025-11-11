import { useForm } from "react-hook-form";
import Box from "@mui/material/Box";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { api } from "../Api/api";
import { useParams, useLocation } from "react-router-dom";
import { AiOutlineMail, AiOutlineEdit } from "react-icons/ai";

type FormValues = {
  subject: string;
  email: string;
  message: string;
  send_to_all_active?: boolean;
};

export default function Contact() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      subject: "",
      email: "",
      message: "",
      send_to_all_active: true,
    },
  });

  const { id } = useParams();
  const location = useLocation();
  const ids: string[] = location.state?.ids || [];

  const onSubmit = async (data: FormValues) => {
    try {
      let res;

      if (id) {
        res = await axios.post(`${api}/newsletter-subscribers/${id}/send-email`, data);
      } else if (ids.length > 0) {
        res = await axios.post(`${api}/newsletter-subscribers/bulk/send-email`, {
          ...data,
          subscriber_ids: ids,
        });
      } else {
        res = await axios.post(`${api}/newsletter-subscribers/bulk/send-email`, {
          ...data,
          send_to_all_active: true,
        });
      }

      if (res?.data?.success) {
        const msg = ids.length > 0 ? `تم الإرسال لـ ${ids.length} مشترك` : "تم الإرسال بنجاح";
        toast.success(msg);
        reset();
      } else {
        toast.error("حصل خطأ أثناء الإرسال");
      }
    } catch (err: any) {
      console.error("send error:", err);
      const serverMsg = err?.response?.data?.message;
      toast.error(serverMsg || "فشل الإرسال — شيك الكونسول");
    }
  };

  return (
    <>
      <Toaster />
      <div id="contact" className="px-2 md:px-4 lg:px-8 py-8">
        <div className="flex flex-col justify-center items-center h-screen gap-6">
       

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            autoComplete="off"
            sx={{ width: "100%", maxWidth: 600 }}
            className="flex flex-col gap-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-200"
          >
               <h2 className="text-2xl font-bold text-center text-slate-900 mb-4">النشرة البريدية</h2>
            {/* الاسم / العنوان */}
            <div className="flex flex-col gap-2 relative">
              <label className="font-semibold text-slate-700 flex items-center gap-2">
                <AiOutlineMail size={20} /> الموضوع
              </label>
              <input
                {...register("subject", { required: "الموضوع مطلوب" })}
                placeholder="أدخل العنوان"
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1">⚠️ {errors.subject.message}</p>
              )}
            </div>

            {/* الرسالة */}
            <div className="flex flex-col gap-2 relative">
              <label className="font-semibold text-slate-700 flex items-center gap-2">
                <AiOutlineEdit size={20} /> الرسالة
              </label>
              <textarea
                {...register("message", {
                  required: "الرسالة مطلوبة",
                  minLength: { value: 5, message: "اكتب رسالة أطول شوية" },
                })}
                placeholder="أدخل الرسالة"
                className="border border-gray-300 p-3 h-48 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition resize-none"
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">⚠️ {errors.message.message}</p>
              )}
            </div>

            {/* زر الإرسال */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#DFC96D] hover:bg-[#967f26cd] text-white py-3 px-6 rounded-full font-semibold transition-colors"
            >
              {isSubmitting ? "ارسال..." : "ارسال"}
            </button>
          </Box>
        </div>
      </div>
    </>
  );
}
