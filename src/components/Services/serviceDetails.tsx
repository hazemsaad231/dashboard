import { Link, useParams, useNavigate } from "react-router-dom"
import axios from "axios";
import { api } from '../Api/api';
import { useEffect, useState } from "react";
import Load from '../Load/load';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { ToastContainer, toast } from 'react-toastify';
import { Dialog, DialogPanel } from "@headlessui/react";
const ServiceDetails = () => {
    const { id } = useParams();
    const [data, setData] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<any>(null);
  const navigate = useNavigate();
  
    const [isOpen, setIsOpen] = useState(false);

   const open = (Id: any) => {
    setIsOpen(true);
    setUserId(Id);
  };

    const close = () => {
    setIsOpen(false);
  };
 
      const getData = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${api}/services`,{
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          setData(response.data.data);
        } catch (err) {
          console.error(err);
          setError('فشل في جلب بيانات الخدمة');
        } finally {
          setLoading(false);
        }
      };
    
   

     const Delete = async () => {
        try {
          await axios.delete(`${api}/services/${userId}`,{
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          toast.success('تم الحذف بنجاح');
          if (String(userId) === String(id)) {
            close();
            navigate('/dashboard/services');
            return;
          }
          getData();
        } catch (errors) {
          console.log(errors);
          toast.error('حدث خطأ أثناء الحذف');
        }
      };


 useEffect(() => {
      getData();
    }, [id]);


  const item = data?.find((i: any) => String(i.id) === id);

    if (loading) return <div className="lg:mr-60 p-4"><Load /></div>;

    if (error) return <div className="lg:mr-60 p-4 text-red-600">{error}</div>;

  if (!data) return <div className="lg:mr-60 p-4">لا توجد خدمة</div>;

  if (!item) return <div className="lg:mr-60 p-4">الخدمة غير موجودة أو تم حذفها</div>;

  const parts = typeof item.description === 'string' ? item.description.split('*') : [];

    return (
        <>
        <ToastContainer/>
        <div className="lg:mr-60 p-8">
                  <div className="relative flex flex-col gap-4">
                        <img
                          src={item.img}
                          alt={item.title || "الخدمات - صورة"}
                          className="w-full object-fill h-96"
                        />
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#262163]">{item.title}</h1>
                <div className="text-xl text-gray-500 w-full h-full p-2">
                   {parts.length > 0 && <p className="font-extrabold">{parts[0]}</p>}
              {parts.length > 1 && (
                <ul className="list-disc mt-3 space-y-2 pl-6">
                  {parts.slice(1).map((part: string, i: number) => (
                    <p key={i} className="font-semibold text-lg">{part.trim()}</p>
                  ))}
                </ul>
              )}
                <div className="flex gap-6 text-green-700 cursor-pointer p-5">
                          <MdDelete size={24} onClick={() => open(item.id)} />
                          <Link to={`/dashboard/addUser/services/${item.id}`}><FaEdit size={24} /></Link>
                        </div>
              </div>
        </div>


         <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={close}>
                      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                          <DialogPanel className="w-max max-w-md rounded-xl bg-white shadow-lg p-6 backdrop-blur-2xl duration-300 ease-out">
                            <p className="mt-2 text-sm">Are you sure you want to delete this user?</p>
                            <div className="mt-4 flex gap-4">
                              <button
                                className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm font-semibold text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-600"
                                onClick={() => { close(); Delete(); }}
                              >
                                Delete
                              </button>
                              <button
                                className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm font-semibold text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-600"
                                onClick={close}
                              >
                                Close
                              </button>
                            </div>
                          </DialogPanel>
                        </div>
                      </div>
                    </Dialog>
              </div>
              </>
    )
}

export default ServiceDetails


