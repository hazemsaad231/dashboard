import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Context } from "./context";
import { useContext } from "react";



const Sign = ()=>{


   const{saveDate}=useContext(Context)

  const navigate = useNavigate()


const{register,handleSubmit,formState:{errors}}=useForm();

const onSubmait=async(data:any)=>{

    try {
        const response = await axios.post('https://dummyjson.com/auth/login',data)

        localStorage.setItem('token',response.data.accessToken);
        saveDate()
        setTimeout(()=>{
            navigate('/dashboard')
        },2000)
        toast('login successfully!')
    } catch(error) {
        
        console.log(error)
    }
   
}



    return(

<>
<ToastContainer />
<div className="signIn ">
<div className="login  h-max  bg-white text-center rounded-xl shadow-2xl p-16 w-[80%] sm:w-[80%] md:w-[50%] lg:w-[40%] xl:w-[30%]">

<h1 className="text-xl sm:text-xl md:text-xl lg:text-2xl xl:text-2xl border-l-4 border-orange-300 text-start font-bold p-2 px-6 mb-12 ">User Mangement System</h1>

<h3 className="text-xl font-semibold">SIGN IN</h3>
<p className="text-md text-gray-500 font-extralight">Enter your credentials to access your account</p>

<form onSubmit={handleSubmit(onSubmait)}>
<div className="flex flex-col mt-10">
    <label htmlFor="username" className="text-start text-gray-600 font-normal">username</label>
    <input type="text" placeholder="emilys"
     className="border p-2 px-4 mt-1 rounded-md placeholder-gray-300 shadow-xl outline-none"
     {...register("username",{required:true})}/>
     {errors.username && <p className="text-red-500 text-start">username is required</p>}


    <label htmlFor="pass" className="text-start text-gray-600 font-normal mt-4">password</label>
    <input type="text" placeholder="emilyspass"   className="border p-2 px-4 mt-1  rounded-md placeholder-gray-300 shadow-xl outline-none"
    {...register("password",{required:true})} />
    {errors.password && <p className="text-red-500 text-start">password is required</p>}

<button className="btn text-center text-white p-2 rounded-md mt-8">SIGN IN</button>

    </div>    

    </form>



</div>



  

  

</div>
</>
    )
}

export default Sign;