import { Outlet } from "react-router-dom"
import Navbar from "../Navbar/navbar"
const Master2 = ()=>{

    return (
        <div>

            <div>
          <Navbar />
            </div>

            <div>
            {/* <Side /> */}
            <Outlet />
            </div>
        </div>
    )
}

export default Master2