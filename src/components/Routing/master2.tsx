import { Outlet } from "react-router-dom"
import Navbar from "../Navbar/navbar"
const Master2 = ()=>{

    return (
        <div>

            <div>
          <Navbar />
            </div>

            <div>
            <Outlet />
            </div>
        </div>
    )
}

export default Master2