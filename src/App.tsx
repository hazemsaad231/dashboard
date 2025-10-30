import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './components/Home/home'
import Services from './components/Services/services'
import AddUser from './components/Add/Update/add_update'
import Profile from './components/Profile/profile'
import Master1 from './components/Routing/master1'
import Master2 from './components/Routing/master2'
import Sign from './components/login/login'
import PrivateRoute from './components/Routing/protuct'
import Blogs from './components/Blogs/blogs'
import { Toaster } from 'react-hot-toast'
import Chances from './components/Chances/chance'
import Add_Update_Chance from './components/Add/Update/add_update_chance'
import Category from './components/Categories/category'
import  AddCategory  from './components/AddCategories/addCategory'
import Jops from './components/jops/jops'


function App() {

  const route = createBrowserRouter([
    {

      path:'/',
      element:<Master1/>,
      children:[
        {index: true, element: <Sign/>},
        {path: "signIn", element: <Sign/>},
      ]
    },
    
    {
      path: "dashboard",
     element:<PrivateRoute><Master2/></PrivateRoute>,
      errorElement: <h1>Page Not Found</h1>,
      children:[
        {index: true, element: <Home/>},
        {path: "home", element: <Home/>},
        {path: "services/:resource", element: <Services/>},
        {path: "blogs/:resource", element: <Blogs/>},
        {path: "chances", element: <Chances/>},
        {path: "jops", element: <Jops/>},
        {path: "category", element: <Category/>},
        {path: "addUser/:resource", element: <AddUser/>},
        {path: "addUser/:resource/:id", element: <AddUser/>},
        {path: "addChance", element: <Add_Update_Chance/>},
        {path: "addChance/:id", element: <Add_Update_Chance/>},
         {path: "addCategory", element: <AddCategory/>},
        {path: "addCategory/:id", element: <AddCategory/>},
        {path: "profile", element: <Profile/>},

      ]
    },
   
  ])

  return (
    <>
  <Toaster position="top-center" reverseOrder={false} />
  <RouterProvider router={route} ></RouterProvider>
     
    </>
  )
}

export default App
