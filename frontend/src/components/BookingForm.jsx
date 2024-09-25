/* eslint-disable react/prop-types */
import  { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Loader } from 'lucide-react';

const BookingForm = ({ onBooking, isLoading }) => {
  const [numSeats, setNumSeats] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onBooking(numSeats);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="numSeats" className="block text-center text-lg font-medium text-gray-700 mb-6">
          Select Number of Seats
        </label>
        <div className="flex flex-wrap justify-center gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <motion.button
              key={num}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNumSeats(num)}
              className={`py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                numSeats === num
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {num}
            </motion.button>
          ))}
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={isLoading}
        className="w-full max-w-xs mx-auto flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader className="animate-spin mr-2" size={20} />
        ) : (
          <Users className="mr-2" size={20} />
        )}
        Book {numSeats} Seat{numSeats > 1 ? 's' : ''}
      </motion.button>
    </form>
  );
};

export default BookingForm;