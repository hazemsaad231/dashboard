import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";






const Sign = ()=>{



  const navigate = useNavigate()


const{register,handleSubmit,formState:{errors}}=useForm();

const onSubmait=async(data:any)=>{

    try {
        const response = await axios.post('https://tadbeer.wj.edu.sa/public/api/admin/login',data)
        console.log('token',response.data.data.token)
        localStorage.setItem('token',response.data.data.token);
        localStorage.setItem('admin',response.data.data.admin);
        toast.success('تم تسجيل الدخول بنجاح',{
            id:'unique-id'
        });
         console.log('id',response.data.data.admin.id)
        localStorage.setItem('id',response.data.data.admin.id);
        navigate('/dashboard');
      
    } catch(error) {
        toast.error('خطأ في تسجيل الدخول',{
            id:'unique-id'
        })
        console.log(error)
    }
   
}


    return(

<>

<div className="flex justify-center items-center h-screen bg-[#dfc96d]">
<div className="bg-white p-6 text-start rounded-xl shadow-xl w-[90%] sm:w-[90%] md:w-[60%] lg:w-[50%] xl:w-[30%]">
<div className="flex flex-col justify-center items-center">
    <img
    src="/logo2.jpeg"
    alt="logo"
    className="w-32 h-32 mb-4"

    />

<h3 className="text-xl font-semibold">تسجيل الدخول</h3>
<p className="text-md text-gray-500 font-extralight">من فضلك قم بتسجيل الدخول</p>
<div className="w-2/3 m-auto h-[2px] bg-[#dfc96d] mt-4"></div>
</div>
<form onSubmit={handleSubmit(onSubmait)}>
   
<div className="flex flex-col mt-10">
    <label htmlFor="email" className="text-start text-gray-600 font-normal">الايميل</label>
    <input type="text" placeholder="admin@example.com"
     className="border p-2 px-4 mt-1 rounded-md  outline-[#dfc96d]"
     {...register("email",{
       required: "الايميل مطلوب",
       pattern: {
         value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
         message: "الايميل غير صحيح"
       }
     })}/>
     {errors.email && <p className="text-red-500 text-start"><span>⚠️</span> الايميل مطلوب</p>}


    <label htmlFor="pass" className="text-start text-gray-600 font-normal mt-4">كلمة المرور</label>
    <input type='password' placeholder="password"   className="border p-2 px-4 mt-1  rounded-md outline-[#dfc96d]"
    {...register("password",{required:true})} />
    {errors.password && <p className="text-red-500 text-start"><span>⚠️</span> كلمة المرور مطلوبه</p>}

<button className="bg-[#dfc96d] hover:bg-[#8e7615] w-full text-center text-white p-2 rounded-md mt-8">تسجيل الدخول</button>

    </div>    

    </form>
</div>


</div>
</>
    )
}

export default Sign;
