// Home.js
import { motion } from 'framer-motion';
import { FaUsers, FaUserPlus, FaUserCircle } from 'react-icons/fa';

const Home = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 1 }}
      className="flex flex-col items-center justify-center h-full mt-20 text-center"
    >
      <motion.h1
        initial={{ y: -200 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="text-xl sm:text-xl md:text-2xl lg:text-3xl xl:text-5xl flex flex-wrap font-extrabold text-purple-700 mb-4 mx-12"
      >
        Welcome to the Dashboard
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="text-sm sm:text-md md:text-lg lg:text-lg xl:text-lg text-gray-700 mb-8 text-center max-w-md mx-16"
      >
        This is the home page where you can manage users, add new ones, and view profiles.
      </motion.p>

      {/* New Features Section */}
      <div className=" p-6 rounded-lg  mb-8 max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Our Features</h2>
        <ul className="list-disc list-inside">
          <li className="flex items-center mb-2 font-serif text-md sm:text-md md:text-lg lg:text-lg xl:text-xl m-2"><FaUsers className="mr-2 text-blue-500" /> Easy User Manage</li>
          <li className="flex items-center mb-2 font-serif text-md sm:text-md md:text-lg lg:text-lg xl:text-xl m-2"><FaUserPlus className="mr-2 text-green-500 font-semibold" /> Quick User Addition</li>
          <li className="flex items-center mb-2 font-serif text-md sm:text-md md:text-lg lg:text-lg xl:text-xl m-2"><FaUserCircle className="mr-2 text-purple-500" /> Profile Customization</li>
        </ul>
      </div>
     
    </motion.div>
  );
};

export default Home;
