// src/App.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import SeatGrid from './components/SeatGrid';
import ReservationForm from './components/ReservationForm';

const App = () => {
  const [seats, setSeats] = useState([]);

  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async () => {
    const response = await axios.get('http://localhost:5000/seats');
    setSeats(response.data);
  };

  const handleReservation = async (data) => {
    const { seatsRequired } = data;
    const response = await axios.post('http://localhost:5000/reserve', { seatsRequired });
    if (response.data.success) {
      fetchSeats(); // Refresh seat status after reservation
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Train Seat Reservation</h1>
      <ReservationForm onSubmit={handleReservation} />
      <SeatGrid seats={seats} handleSeatClick={(id) => console.log('Seat clicked', id)} />
    </div>
  );
};

export default App;
