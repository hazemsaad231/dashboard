import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';

const AddUser = () => {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({});
    const navigate = useNavigate();
    const { id } = useParams();

    console.log('user id',id)

    useEffect(() => {
        if (id) {
            const Update = async () => {
                try {
                    const res = await axios.get(`https://dummyjson.com/users/${id}`);
                    const user = res.data;
                    setValue("firstname", user.firstName);
                    setValue("lastname", user.lastName);
                    setValue("email", user.email);
                    setValue("age", user.age);
                    setValue("phonenumber", user.phone);
                    setValue("birthdate", user.birthDate);
                } catch (error) {
                    console.log(error);
                }
            };
            Update();
        }
    }, [id, setValue]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onSubmit = async (data:any) => {
        try {
            if (id) {
                const response = await axios.put(`https://dummyjson.com/users/${id}`, data);
                console.log(response,'updated');
                setTimeout(() => {
                    navigate("/dashboard/users")
                },2000)
               
                toast("Update is successful");
            } else {
                const response = await axios.post("https://dummyjson.com/users/add", data);
                console.log(response);
                setTimeout(() => {
                    navigate("/dashboard/users")
                },2000)
               
                toast("Add is successful");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during the operation.");
        }
    };

    return (
        <div>
            <ToastContainer />
            <h1 className="text-md sm:text-md md:text-lg lg:text-lg xl:text-lg mt-4 font-bold">{id ? "Update User" : "Add User"}</h1>
    
            <div className="p-8">
                <form className="mt-24" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 place-items-center">
                        <div className="flex flex-col">
                            <label htmlFor="">First Name</label>
                            <input type="text" placeholder="Enter first name" className="border w-48 sm:w-48 md:w-60 lg:w-max xl:w-max p-2 px-8 shadow" {...register("firstname", { required: true })} />
                            {errors.firstname && <span className="text-red-500">First Name is required</span>}
                        </div>
                        <div className="flex flex-col mt-5">
                            <label htmlFor="">Last Name</label>
                            <input type="text" placeholder="Enter last name" className="border  w-48 sm:w-48 md:w-60 lg:w-max xl:w-max p-2 px-8 shadow" {...register("lastname", { required: true })} />
                            {errors.lastname && <span className="text-red-500">Last Name is required</span>}
                        </div>
                        <div className="flex flex-col mt-5">
                            <label htmlFor="">Email</label>
                            <input type="text" placeholder="Enter your email" className="border  w-48 sm:w-48 md:w-60 lg:w-max xl:w-max p-2 px-8 mb-4 shadow" {...register("email", { required: true, pattern: { value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, message: "Only valid email is allowed" } })} />
                            {errors.email && <span className="text-red-500">Email is required</span>}
                        </div>
                        <div className="flex flex-col mt-5">
                            <label htmlFor="">Age</label>
                            <input type="number" placeholder="Enter your age" className="border  w-48 sm:w-48 md:w-60 lg:w-max xl:w-max p-2 px-8 mb-4 shadow" {...register("age", { required: true })} />
                            {errors.age && <span className="text-red-500">Age is required</span>}
                        </div>
                        <div className="flex flex-col mt-5">
                            <label htmlFor="">Phone Number</label>
                            <input type="text" placeholder="Enter phone number" className="border  w-48 sm:w-48 md:w-60 lg:w-max xl:w-max p-2 px-8 mb-2 shadow" {...register("phonenumber", { required: true })} />
                            {errors.phonenumber && <span className="text-red-500">Phone number is required</span>}
                        </div>
                        <div className="flex flex-col mt-5">
                            <label htmlFor="">Birth Date</label>
                            <input type="text" placeholder="Enter birth date" className="border  w-48 sm:w-48 md:w-60 lg:w-max xl:w-max p-2 px-8 mb-2 shadow" {...register("birthdate", { required: true })} />
                            {errors.birthdate && <span className="text-red-500">Birth Date is required</span>}
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <button className="bg-yellow-500 text-white px-16 py-2 rounded-lg mt-10">{id ? 'Update' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddUser;

