/* eslint-disable react/prop-types */

import { motion } from 'framer-motion';
import { User, UserX } from 'lucide-react';

const SeatLayout = ({ seats }) => {
  const seatVariants = {
    available: { backgroundColor: '#34D399', scale: 1 },
    reserved: { backgroundColor: '#F87171', scale: 1 },
    hover: { scale: 1.1 }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Seat Layout</h2>
      <div className="grid grid-cols-7 gap-2">
        {seats.map((seat) => (
          <motion.div
            key={seat._id}
            className={`w-12 h-12 rounded-md flex items-center justify-center text-white text-sm font-bold ${
              seat.status === 'available' ? 'bg-green-400' : 'bg-red-400'
            }`}
            variants={seatVariants}
            initial={seat.status}
            animate={seat.status}
            whileHover="hover"
          >
            {seat.status === 'available' ? (
              <User size={20} />
            ) : (
              <UserX size={20} />
            )}
          </motion.div>
        ))}
      </div>
      <div className="mt-4 flex justify-center space-x-8">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-400 rounded-md flex items-center justify-center mr-2">
            <User size={16} color="white" />
          </div>
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-red-400 rounded-md flex items-center justify-center mr-2">
            <UserX size={16} color="white" />
          </div>
          <span className="text-sm">Reserved</span>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;