import { useState } from "react"
import { TiThMenu } from "react-icons/ti";
import { FaHouse} from "react-icons/fa6"
import { GrServices } from "react-icons/gr"
import { TbLogs } from "react-icons/tb"
import { RxAvatar } from "react-icons/rx"
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
    // { id: "profile", label: "الملف الشخصي", icon: FaPerson, path: "/dashboard/profile" },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <TiThMenu
        className="absolute top-4 right-4 text-2xl cursor-pointer sm:block md:block lg:hidden xl:hidden  z-50 text-blue-600 hover:text-blue-700 transition-colors duration-200"
        onClick={toggleNavbar}
      />

      {/* Desktop Sidebar */}
      <div className="fixed z-10 min-h-screen w-52 bg-gradient-to-b from-slate-50 to-slate-100 border-l border-slate-200 p-6 text-slate-700 hidden sm:hidden md:hidden lg:block xl:block shadow-lg">
        <div className="flex flex-col items-center h-full">
          <div className="mb-8 text-center">
            <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 p-1 shadow-md">
              <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center">
                <RxAvatar size={80} className="text-blue-600" />
              </div>
            </div>
            <h3 className="font-bold text-lg text-slate-800">المسؤول</h3>
            <p className="text-xs text-slate-500 mt-1">مدير النظام</p>
          </div>

          <ul className="flex flex-col gap-3 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 ${
                      activeItem === item.id
                        ? "bg-blue-600 text-white shadow-md scale-105"
                        : "hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
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

      {/* Mobile Sidebar */}
      <div
        className={`fixed z-50 w-full bg-gradient-to-b from-blue-600 to-blue-700 text-white h-screen shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isNavbarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6">
          <button
            onClick={toggleNavbar}
            className="absolute top-4 right-4 text-white hover:bg-blue-500 p-2 rounded-lg transition-colors duration-200"
          >
            ✖
          </button>

          <div className="text-center mt-12 mb-8">
            <div className="w-28 h-28 mx-auto mb-3 rounded-full bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center">
                <RxAvatar size={100} className="text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold">المسؤول</h3>
            <p className="text-blue-100 text-sm mt-1">مدير النظام</p>
          </div>

          <ul className="flex flex-col gap-2 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 ${
                      activeItem === item.id ? "bg-white text-blue-600 shadow-md" : "hover:bg-blue-500 text-white"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="pt-4 border-t border-blue-500">
            <Close />
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isNavbarVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={toggleNavbar} />
      )}
    </>
  )
}

export default Navbar
