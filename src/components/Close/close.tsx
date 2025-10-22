import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react'
import{Link} from 'react-router-dom'
const close = ()=>{
  const [isOpen, setIsOpen] = useState(false)

  function open() {
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
  }

  return (
    <>
       <button
        onClick={open}
        className="w-max m-auto z-50 flex items-center justify-center gap-2 p-3 rounded-lg bg-[#DFC96D] text-white transition-colors duration-200 font-medium text-sm">
            
              تسجيل الخروج
            </button>

      <Dialog open={isOpen}  className="relative z-10" onClose={close}>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center  ml-24 p-4">
            <DialogPanel
              transition
              className="w-max p-5  duration-300 ease-out bg-white  shadow-2xl rounded-lg data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >
              <DialogTitle>
                
              </DialogTitle>
              <p className='text-md font-semibold mb-6'>
                هل أنت متأكد من تسجيل الخروج؟
              </p>
              <div className='flex gap-2'>
                <Link
                  to="/"
                  className=" bg-red-600 rounded-lg p-1 text-white"
                  onClick={()=>
                    localStorage.removeItem('token')
                  }
                >
                  تسجيل الخروج
                </Link>

                <Link
                  to=""
                  className=" bg-blue-600 rounded-lg p-1 text-white"
                  onClick={close}
                >
                  إلغاء
                </Link>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default close