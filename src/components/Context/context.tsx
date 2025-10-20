import { createContext } from 'react'
import { jwtDecode } from 'jwt-decode'
import {useState,useEffect} from 'react'
export const Context = createContext<any>(null);

export const ContextProvider = (props:any) => {
const[userData,setUserData]=useState<any>([])
const saveDate =()=>{

    if(localStorage.getItem('token') !== null){
        const incoder = localStorage.getItem('token')
        if(incoder){
            const decoder = jwtDecode(incoder)
            setUserData(decoder)
        }
    
       
    }else{
        console.log('no token')
    }
    
    
   
   
}
useEffect(()=>{
    if(localStorage.getItem('token')){
    saveDate()

}},[])

    return(
        <>
        <Context.Provider value={{saveDate,userData}}>{props.children}</Context.Provider>
        </>
    )
}