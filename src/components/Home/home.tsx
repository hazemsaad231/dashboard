import { PieChart, Pie, Cell, ResponsiveContainer as PieResponsiveContainer } from "recharts";
import { Data } from "../Home/data";

const COLORS = ["#D4AF37", "#241a56", "#00C49F", "#FF8042"];
const RADIAN = Math.PI / 180;

const pieData = [
  { name: "بحث Google", value: 420 },
  { name: "زيارات مباشرة", value: 310 },
  { name: "منصات اجتماعية", value: 180 },
  { name: "شركاء ومواقع خارجية", value: 90 },
];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Home() {


  return (
    <>
      <div className=" z-0 lg:mr-52 h-full py-20 p-4 bg-gradient-to-b from-slate-50 to-slate-100">
        <h1 className="text-3xl md:text-4xl  font-bold mb-6 text-foreground">نظرة عامة</h1>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
          {Data.map((item: any, index: number) => (
            <div
              key={index}
              className="bg-card p-6 rounded-md shadow hover:shadow-md transition-shadow bg-white border-l-4"
              style={{ borderColor: "#D4AF37" }}
            >
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <h2 className="text-sm font-medium text-muted-foreground mb-1">{item.title}</h2>
                  <p className="text-2xl font-bold text-card-foreground">{item.count}</p>
                  {item.sub && <p className="text-xs text-slate-400 mt-1">{item.sub}</p>}
                </div>
                <div className="w-12 h-12 rounded-md bg-[#241a56] flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2 text-foreground">مصادر الزيارات</h2>
          <p className="text-sm text-slate-500 mb-4">توضح أبرز قنوات الوصول لموقع الشركة</p>
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
                  innerRadius="45%"
                  dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </PieResponsiveContainer>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {pieData.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span style={{ background: COLORS[i] }} className="w-4 h-4 rounded-sm inline-block" />
                <span className="text-slate-600">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
