import { createContext } from 'react'
import {useState,useEffect} from 'react'
export const Context = createContext<any>(null);

export const ContextProvider = (props:any) => {
const[userData,setUserData]=useState<any>([])
const saveDate =()=>{

    const incoder = localStorage.getItem('admin')
    const admin = incoder;
    setUserData(admin)
    
    
   
   
}
useEffect(()=>{
    if(localStorage.getItem('admin') !== null){
    saveDate()

}},[])

    return(
        <>
        <Context.Provider value={{saveDate,userData}}>{props.children}</Context.Provider>
        </>
    )
}