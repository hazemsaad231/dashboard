import { PieChart, Pie, Cell, ResponsiveContainer as PieResponsiveContainer } from "recharts"
import { Data } from "./data"
import { useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { toast, ToastContainer } from "react-toastify"

const pieData = [
  { name: "المجموعة أ", value: 400 },
  { name: "المجموعة ب", value: 300 },
  { name: "المجموعة ج", value: 300 },
  { name: "المجموعة د", value: 200 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) / 2
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={14}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}



export default function Home() {


    const location = useLocation();
      const navigate = useNavigate();
  
      useEffect(() => {
          if (location.state?.message) {
              toast.success(location.state.message, { autoClose: 2000 }); // عرض الرسالة
              // تفريغ الحالة بعد عرض التوست
              navigate(location.pathname, { replace: true }); 
          }
      }, [location.state, navigate]);
      
  return (
    <>
    <ToastContainer />
    <div dir="rtl" className="min-h-screen bg-background p-4 pt-16 lg:mr-52">
      <h1 className="text-3xl font-bold mb-6 text-foreground">الصفحة الرئيسية</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Data.map((item: any, index: number) => (
          <div
            key={index}
            className="bg-card p-6 rounded-md shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="text-right">
                <h2 className="text-sm font-medium text-muted-foreground mb-1">{item.title}</h2>
                <p className="text-2xl font-bold text-card-foreground">{item.count}</p>
              </div>
              <item.icon className="w-10 h-10 text-primary" />
            </div>
          </div>
        ))}
      </div>

        <div className="grid grid-cols-1 gap-4">
        {/* Pie Chart */}
        <div className="bg-card p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">العملاء حسب المصدر</h2>
          <div className="h-[25rem]">
            <PieResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius="90%"
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </PieResponsiveContainer>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}
