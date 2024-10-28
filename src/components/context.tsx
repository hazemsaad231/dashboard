import { createContext } from 'react'
import { jwtDecode } from 'jwt-decode'
import {useState,useEffect} from 'react'
export const Context = createContext(null);

export const ContextProvider = (props) => {
const[userData,setUserData]=useState([])
const saveDate =()=>{

    const incoder = localStorage.getItem('token')
    const decoder = jwtDecode(incoder)
    setUserData(decoder)
    console.log(decoder)
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