import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './components/home'
import Users from './components/users'
import AddUser from './components/addUser'
import Profile from './components/profile'
import Master1 from './components/master1'
import Master2 from './components/master2'
import Sign from './components/signIn'



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
      element: <Master2 />,
      errorElement: <h1>Page Not Found</h1>,
      children:[
        {index: true, element: <Home />},
        {path: "home", element: <Home/>},
        {path: "users", element: <Users/>},
        {path: "addUser", element: <AddUser/>},
        {path: "addUser/:id", element: <AddUser/>},
        {path: "profile", element: <Profile/>},

      ]
    },
   
  ])

  return (
    <>
    
  <RouterProvider router={route} ></RouterProvider>
     
    </>
  )
}

export default App
