import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Context } from "../Context/context";
import { useContext } from "react";




const Sign = ()=>{


   const{saveDate}:any=useContext(Context) 

  const navigate = useNavigate()


const{register,handleSubmit,formState:{errors}}=useForm();

const onSubmait=async(data:any)=>{

    try {
        const response = await axios.post('https://dummyjson.com/auth/login',data)
        
        console.log('token',response.data)
        localStorage.setItem('token',response.data.accessToken);
        localStorage.setItem('id',response.data.id);
        console.log('id',response.data.id)
        saveDate()
        setTimeout(()=>{
            navigate('/dashboard')
        },2000)
        toast('تم تسجيل الدخول بنجاح')
    } catch(error) {
        toast.error('خطأ في تسجيل الدخول')
        console.log(error)
    }
   
}


    return(

<>
<ToastContainer limit={1} />
<div className="flex justify-center items-center h-screen bg-[#dfc96d]">
<div className="h-max bg-white text-start rounded-xl shadow-xl p-16 w-[80%] sm:w-[80%] md:w-[50%] lg:w-[40%] xl:w-[30%]">
<div className="flex flex-col justify-center items-center">

    <img
    src="/logo2.jpeg"
    alt="logo"
    className="w-40 h-40 mb-8"

    />

<h3 className="text-xl font-semibold">تسجيل الدخول</h3>
<p className="text-md text-gray-500 font-extralight">من فضلك قم بتسجيل الدخول</p>
</div>
<form onSubmit={handleSubmit(onSubmait)}>
<div className="flex flex-col mt-10">
    <label htmlFor="username" className="text-start text-gray-600 font-normal">اسم المستخدم</label>
    <input type="text" placeholder="emilys"
     className="border p-2 px-4 mt-1 rounded-md placeholder-gray-300 shadow outline-none"
     {...register("username",{required:true})}/>
     {errors.username && <p className="text-red-500 text-start">اسم المستخدم مطلوب</p>}


    <label htmlFor="pass" className="text-start text-gray-600 font-normal mt-4">كلمة المرور</label>
    <input type="text" placeholder="emilyspass"   className="border p-2 px-4 mt-1  rounded-md placeholder-gray-300 shadow outline-none"
    {...register("password",{required:true})} />
    {errors.password && <p className="text-red-500 text-start">كلمة المرور مطلوب</p>}

<button className="bg-[#dfc96d] hover:bg-[#8e7615] w-full text-center text-white p-2 rounded-md mt-8">تسجيل الدخول</button>

    </div>    

    </form>



</div>



  

  

</div>
</>
    )
}

export default Sign;