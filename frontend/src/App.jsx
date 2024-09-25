import  { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Train, Github, RotateCw } from 'lucide-react';
import axios from 'axios';
import SeatLayout from './components/SeatLayout';
import BookingForm from './components/BookingForm';

const App = () => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/seats');
      setSeats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching seats:', error);
      toast.error('Failed to fetch seats. Please try again.');
      setLoading(false);
    }
  };

  const handleBooking = async (numSeats) => {
    setBookingLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/reserve', { seatsRequired: numSeats });
      if (response.data.success) {
        toast.success(`Successfully booked ${numSeats} seat(s)!`);
        fetchSeats(); // Refresh seat data
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error booking seats:', error);
      toast.error('Failed to book seats. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReset = async () => {
    setResetLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/reset');
      if (response.data.success) {
        toast.success('All seats have been reset.');
        fetchSeats(); // Refresh seat data
      } else {
        toast.error('Failed to reset seats.');
      }
    } catch (error) {
      console.error('Error resetting seats:', error);
      toast.error('Failed to reset seats. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-cyan-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Train size={24} />
            <h1 className="text-xl font-bold">TrainSeat Booker</h1>
          </div>
          <a href="https://github.com/yourusername/train-booking-app" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-gray-200">
            <Github size={20} />
            <span>View on GitHub</span>
          </a>
        </div>
      </header>

      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-2xl mx-auto">
          <div className="bg-gray-200 p-4 text-center">
            <h2 className="text-2xl font-bold text-gray-800">Train 12345 - Coach A</h2>
            <p className="text-gray-600">Total Seats: 80</p>
          </div>
          
          <div className="p-8">
            <div className="flex justify-end mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                disabled={resetLoading}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-300 flex items-center"
              >
                {resetLoading ? (
                  <RotateCw className="animate-spin mr-2" size={18} />
                ) : (
                  <RotateCw className="mr-2" size={18} />
                )}
                Reset All Seats
              </motion.button>
            </div>

            <BookingForm onBooking={handleBooking} isLoading={bookingLoading} />
            
            {loading ? (
              <div className="mt-8 text-center">Loading seats...</div>
            ) : (
              <SeatLayout seats={seats} />
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 TrainSeat Booker. All rights reserved.</p>
        </div>
      </footer>
      
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default App;