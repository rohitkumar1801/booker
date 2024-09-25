/* eslint-disable react/prop-types */

import { motion } from 'framer-motion';
import { User, UserX } from 'lucide-react';

const SeatLayout = ({ seats }) => {
  const seatVariants = {
    
    hover: { scale: 1.05 }
  };

  return (
    <div className="mt-8">
      <h2 className="text-center text-2xl font-bold text-gray-400 mb-4">Seat Layout</h2>
      <div className="grid grid-cols-7 gap-2">
        {seats.map((seat) => (
          <motion.div
            key={seat._id}
            className={`w-14 h-14 rounded-md flex flex-col items-center justify-center text-white text-xs font-bold ${
              seat.status === 'available' ? 'bg-green-600' : 'bg-red-500'
            }`}
            variants={seatVariants}
            initial={seat.status}
            animate={seat.status}
            whileHover="hover"
          >
            {seat.status === 'available' ? (
              <User size={20} color="white"  />
            ) : (
              <UserX size={20} color="white"  />
            )}
            <span className="mt-1">{seat.number}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 flex justify-center space-x-8">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-600 rounded-md flex flex-col items-center justify-center mr-2">
            <User size={16} color="white" />
            
          </div>
          <span className="text-sm font-bold text-gray-500">Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-red-500 rounded-md flex flex-col items-center justify-center mr-2">
            <UserX size={16} color="white" />
            
          </div>
          <span className="text-sm font-bold text-gray-500">Reserved</span>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;