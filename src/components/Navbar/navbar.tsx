import { useState } from "react"
import { TiThMenu } from "react-icons/ti";
import { FaHouse} from "react-icons/fa6"
import { GrServices } from "react-icons/gr"
import { TbLogs } from "react-icons/tb"
import { BiSolidCategory } from "react-icons/bi";
import { TfiEmail } from "react-icons/tfi";
import { PiReadCvLogoFill } from "react-icons/pi";
import { FaBriefcase } from "react-icons/fa";
import { Link } from "react-router-dom"
import Close from "../Close/close";
const Navbar = () => {
  const [isNavbarVisible, setNavbarVisible] = useState(false)
  const [activeItem, setActiveItem] = useState("home")

  const handleNavClick = (id: string) => {
    setActiveItem(id)
    setNavbarVisible(false)
  }

  const toggleNavbar = () => {
    setNavbarVisible(!isNavbarVisible)
  }

  const navItems = [
    { id: "home", label: "الرئيسية", icon: FaHouse, path: "/dashboard" },
    { id: "services", label: "الخدمات", icon: GrServices, path: "/dashboard/services/services" },
    { id: "blogs", label: "المدونة", icon: TbLogs, path: "/dashboard/blogs/blogs" },
    { id: "chances", label: 'الفرص الاستثمارية', icon: FaBriefcase, path: "/dashboard/chances" },
    { id: "category", label: 'التصنيفات', icon: BiSolidCategory, path: "/dashboard/category" },
    { id: "jops", label: 'المتقدمين للوظائف', icon: PiReadCvLogoFill, path: "/dashboard/jops" },
    { id: "email", label: 'النشره البريدية', icon: TfiEmail, path: "/dashboard/email" },
    // { id: "profile", label: "الملف الشخصي", icon: FaPerson, path: "/dashboard/profile" },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <TiThMenu
        className="absolute top-4 right-4 text-2xl cursor-pointer sm:block md:block lg:hidden xl:hidden  z-10 text-[#41389c] hover:text-[#4220c9] transition-colors duration-200"
        onClick={toggleNavbar}
      />

      {/* Desktop Sidebar */}
      <div className="fixed z-10 min-h-screen w-52 bg-gradient-to-b from-slate-50 to-slate-100 border-l border-slate-200 p-5 text-slate-700 hidden sm:hidden md:hidden lg:block xl:block shadow-md">
        <div className="flex flex-col items-center justify-evenly h-full ">
          <div className="md:mb-12 lg:mb-16 xl:mb-20 mx-auto">
                <div className="w-24 h-24 mb-3 rounded-full bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-full bg-slate-200 flex justify-center items-center">
                <a href="https://tadbeer-nine.vercel.app">
                 <img src='/logo.png' alt="logo" className="w-16 h-16" />
                 </a>
              </div>
                <div className="text-center mt-4">
<h3 className="font-bold text-lg text-slate-800">المسؤول</h3>
            <p className="text-xs text-slate-500 mt-1">مدير النظام</p>
            </div>
            </div>
          
            
          </div>

          <ul className="flex flex-col justify-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-300 ${
                      activeItem === item.id
                        ? "bg-[#42309f] text-white shadow-md scale-105"
                        : "hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-lg font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="absolute bottom-1 left-2 w-full pt-3 border-t border-slate-200">
            <Close />
          </div>

        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 z-10 min-h-screen w-2/3 bg-gradient-to-b from-[#362978] to-[#331d9f]
            text-white h-screen shadow-xl transform transition-transform duration-1000 ease-in-out ${isNavbarVisible ? "translate-x-0" : "-translate-x-full"}
         `
        }
      >
        <div className="flex flex-col h-full p-2">
          <button
            onClick={toggleNavbar}
            className="absolute top-1 right-2 text-white hover:bg-[#332673] p-2 rounded-lg transition-colors duration-200"
          >
            ✖
          </button>

          <div className="text-center mt-8 mb-8">
            <div className="w-28 h-28 mx-auto mb-3 rounded-full bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center">
                <a href="https://tadbeer-nine.vercel.app">
                 <img src='/logo.png' alt="logo" className="w-20 h-20" />
                 </a>
              </div>
            </div>
            <h3 className="text-xl font-bold">المسؤول</h3>
            <p className="text-blue-100 text-sm mt-1">مدير النظام</p>
          </div>

          <ul className="flex flex-col gap-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 ${
                      activeItem === item.id ? "bg-white text-[#241a56] shadow-md" : "hover:bg-[#241a56] text-white"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-lg font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
             <div className="absolute bottom-4 left-2 w-full pt-4 border-t border-slate-200">
            <Close />
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
