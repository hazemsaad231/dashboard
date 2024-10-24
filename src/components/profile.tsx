

import { useContext } from "react";
import { Context } from "./context";




const Profile = ()=>{

    const{ userData} = useContext(Context)


    return(

<div className="">

<h1 className="font-bold text-md sm:text-md md:text-lg lg:text-lg xl:text-lg mt-4">profile</h1>

<div className="flex flex-col justify-center items-center">

    <img src={userData.image} alt=""  className="w-32 h-32 hidden xl:block lg:block md:block sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-40 lg:h-40 xl:w-40 xl:h-40 rounded-full mb-2 px-2"/>
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-20 mt-10">
        <div><h4 className="text-gray-500">FirstName</h4>
        <div className="font-bold  border border-gray-300 text-center py-2 rounded-lg text-sm sm:text-md md:text-lg lg:text-xl xl:text-xl" id="btn">{userData.firstName}</div></div>
        <div><h4 className="text-gray-500">LastName</h4>
        <div className="font-bold border border-gray-300 text-center py-2 rounded-lg text-sm sm:text-md md:text-lg lg:text-xl xl:text-xl" id="btn">{userData.lastName}</div></div>
        <div><h4 className="text-gray-500">Email</h4>
        <div className="font-bold border border-gray-300 text-center  py-2 rounded-lg text-sm sm:text-md md:text-lg lg:text-xl xl:text-xl" id="btn">{userData.email}</div></div>
        <div><h4 className="text-gray-500">gender</h4>
        <div className="font-bold border border-gray-300 text-center  py-2 rounded-lg text-sm sm:text-md md:text-lg lg:text-xl xl:text-xl" id="btn">{userData.gender}</div></div>
    </div>
    <div className="mt-16"><h4 className="text-gray-500">phone Number</h4>
    <div className="font-bold border border-gray-300 text-center px-20 py-2 rounded-lg text-sm sm:text-md md:text-lg lg:text-xl xl:text-xl" id="btn">{userData.exp}</div></div>
</div>

</div>

    )
}

export default Profile;