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
import ServiceDetails from './components/Services/serviceDetails'
import BlogDetails from './components/Blogs/blogDetails'
import { Toaster } from 'react-hot-toast'


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
        {path: "services/:resource/:id", element:<ServiceDetails/>},
        {path: "blogs/:resource", element: <Blogs/>},
        {path: "blogs/:resource/:id", element:<BlogDetails/>},
        {path: "addUser/:resource", element: <AddUser/>},
        {path: "addUser/:resource/:id", element: <AddUser/>},
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
