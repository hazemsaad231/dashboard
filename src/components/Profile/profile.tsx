import { useContext, useEffect, useState } from "react";
import { Context } from "../Context/context";
import { useForm } from "react-hook-form";
import axios from "axios";
import style from "./profile.module.css";
import { toast, ToastContainer } from "react-toastify";
import { api } from "../Api/api";

const Profile = () => {
  const { userData }: any = useContext(Context);
  const Id = localStorage.getItem("id");

  console.log(userData);

  const { register, handleSubmit, setValue } = useForm({});
  const [isEditing, setIsEditing] = useState(false); // الحالة الجديدة للتحكم

  useEffect(() => {
    if (Id) {
      const fetchUser = async () => {
        try {
          const res = await axios.get(`${api}/${Id}`);
          const user = res.data;
          setValue("firstname", user.firstName);
          setValue("lastname", user.lastName);
          setValue("email", user.email);
          setValue("gender", user.gender);
          setValue("phone", user.phone);

        } catch (err) {
          console.log(err);
        }
      };
      fetchUser();
    }
  }, [Id, setValue]);

  const onSubmit = async (data: any) => {
    try {
      const res = await axios.put(`${api}/${Id}`, data);
      console.log("Updated:", res.data);
      toast.success("Profile updated successfully!", { autoClose: 2000 });
      setIsEditing(false); // بعد الحفظ نرجعها قراءة فقط
    } catch (err) {
      console.log(err);
      toast.error("Failed to update profile.", { autoClose: 2000 });
    }
  };

  return (
    <div className="lg:mr-60 min-h-screen bg-gray-100 rounded-xl p-6">
      <ToastContainer/>
      <h1 className="text-xl font-bold mb-6">Personal Information</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <img
          src={userData.image}
          alt="Profile"
          className="w-24 h-24 rounded-full"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className={style.profile}>First Name</h4>
            <input
              type="text"
              className="bg-white w-full lg:w-80 py-2 px-4 rounded"
              {...register("firstname", { required: true })}
              disabled={!isEditing} // هنا التحكم
            />
          </div>

          <div>
            <h4 className={style.profile}>Last Name</h4>
            <input
              type="text"
              className="bg-white w-full lg:w-80 py-2 px-4 rounded"
              {...register("lastname", { required: true })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <h4 className={style.profile}>Email</h4>
            <input
              type="email"
              className="bg-white w-full lg:w-80 py-2 px-4 rounded"
              {...register("email", { required: true })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <h4 className={style.profile}>Gender</h4>
            <input
              type="text"
              className="bg-white w-full lg:w-80 py-2 px-4 rounded"
              {...register("gender")}
              disabled={!isEditing}
            />
          </div>

          <div>
            <h4 className={style.profile}>Phone</h4>
            <input
              type="text"
              className="bg-white w-full lg:w-80 py-2 px-4 rounded"
              {...register("phone")}
              disabled={!isEditing}
            />
          </div>
        </div>
      </form>
         {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="bg-green-700 text-white py-2 px-4 rounded mt-4 w-32"
          >
            Edit
          </button>
        ) : (
          <button
          onClick={handleSubmit(onSubmit)}
            className="bg-green-900 text-white py-2 px-4 rounded mt-4 w-32"
          >
            Save
          </button>
        )}
    </div>
  );
};

export default Profile;
