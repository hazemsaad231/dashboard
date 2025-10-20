import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react'
import{Link} from 'react-router-dom'
import { FaOutdent} from "react-icons/fa6";
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
      <Button
        onClick={open}
        className='text-md sm:text-md md:text-lg lg:text-lg xl:text-xl'
      >
        <FaOutdent size={22} />
      </Button>

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
              Are you sure you want to log out?
              </p>
              <div className='flex gap-2'>
                <Link
                  to="/"
                  className=" bg-red-700 rounded-lg p-1 text-white"
                  onClick={()=>
                    localStorage.removeItem('token')
                  }
                >
                  Log out
                </Link>

                <Link
                  to=""
                  className=" bg-green-700 rounded-lg p-1 text-white"
                  onClick={close}
                >
                  close
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