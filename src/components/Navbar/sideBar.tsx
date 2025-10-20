// import { useContext } from "react";
// import { Context } from "../Context/context";



const Side = ()=>{
    
    // const{ userData}:any = useContext(Context)




    return(
        <>
        <div className="flex lg:mr-60 p-2 bg-white border-b border-gray-300 items-center justify-center">
        <div className="flex justify-between items-center w-full gap-3 ">
              <div className="flex items-center gap-4"> 
                               {/* <h1 className="font-bold text-lg sm:text-lg md:text-xl lg:text-xl xl:text-2xl">  مرحبا  <span className="text-white">{userData.firstName}</span></h1> */}

              </div>
   
                <a><img src='/logo2.jpeg' alt="logo" className="w-16 h-16 rounded-lg" /></a>
            </div>
        </div>
      
    
        
       
        </>

    )
}

export default Side ;