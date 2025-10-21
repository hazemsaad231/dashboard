
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { api } from "../../Api/api"

type FormValues = {
  title: string
  description: string
  img: string
  type: string
}

const Add_Update = () => {
  const { id, resource } = useParams()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>(
    {
      defaultValues: {
        title: "",
        description: "",
        img: "",
        type: resource,
      },
    }
  )

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const { data } = await axios.get(`${api}/${resource}/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        reset({ 
          title: data.data.title,
          description: data.data.description,
          img: data.data.image,
          type: resource,
           })
           console.log(data)
      } catch (error) {
        console.error(error)
      }
    })()
  }, [id, reset])

  const onSubmit = async (formData: FormValues) => {
    try {
      if (id) {
        await axios.put(`${api}/services/${id}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        console.log(formData)
        toast.success("تم التعديل بنجاح")
      } else {
        await axios.post(`${api}/services`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        console.log(formData)
        toast.success("تم الإضافة بنجاح")
      }
      setTimeout(() => navigate(`/dashboard/${resource}/${resource}`), 800)
    } catch (e) {
      console.error(e)
      toast.error("حدث خطأ أثناء العملية")
    }
  }

  return (
    <div className="lg:mr-52 min-h-screen pt-16 pb-12 p-3">
      <ToastContainer limit={1} />

      <div className="flex justify-center items-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-lg w-full max-w-2xl rounded-2xl p-8 border border-slate-100 transform transition-all duration-300 hover:shadow-3xl"
        >
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl text-center font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent tracking-tight">
              {id ? `تعديل ${resource==='services'?'خدمة':'مقال' }` : `إضافة ${resource==='services'?'خدمة':'مقال' }`}
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 gap-6 mt-8">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                  📷
                </span>
                رابط الصورة
              </label> 
              <input
                {...register("img", {
                  required: "رابط الصورة مطلوب",
                  pattern: {
                    value: /^https?:\/\/.+/i,
                    message: "ادخل رابط صالح يبدأ بـ http أو https",
                  },
                })}
                className="border-2 border-slate-200 p-3 mt-1 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 placeholder-slate-400"
                placeholder="https://example.com/image.jpg"
              />
              {errors.img && (
                <span className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span> {errors.img.message}
                </span>
              )}

            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                  📝
                </span>
                العنوان
              </label>
              <input
                {...register("title", { required: "العنوان مطلوب" })}
                className="border-2 border-slate-200 p-3 mt-1 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 placeholder-slate-400"
                placeholder="أدخل العنوان"
              />
              {errors.title && (
                <span className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span> {errors.title.message}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                  📄
                </span>
                الوصف
              </label>
              <textarea
                {...register("description", { required: "النص مطلوب" })}
                className="border-2 border-slate-200 mt-1 p-3 h-60 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 placeholder-slate-400 resize-none"
                placeholder="أدخل الوصف التفصيلي"
              />
              {errors.description && (
                <span className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span> {errors.description.message}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-10">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white px-12 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <span>{id ? "✏️ تعديل" : "➕ إضافة"}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 md:px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              ← رجوع
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Add_Update
