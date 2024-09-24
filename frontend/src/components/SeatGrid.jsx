/* eslint-disable react/prop-types */
// src/components/SeatGrid.jsx

import { motion } from 'framer-motion';
import { Armchair } from 'lucide-react';


const SeatGrid = ({ seats, handleSeatClick }) => (
  <div className="grid grid-cols-7 gap-2">
    {seats.map((seat) => (
      <motion.div
        key={seat._id}
        className={`seat ${seat.status === 'reserved' ? 'bg-red-400' : 'bg-green-400'}`}
        onClick={() => handleSeatClick(seat._id)}
        whileHover={{ scale: 1.1 }}
      >
        <Armchair size={32} />
        <span>{seat.number}</span>
      </motion.div>
    ))}
  </div>
);

export default SeatGrid;
