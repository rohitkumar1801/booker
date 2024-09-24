/* eslint-disable react/prop-types */
// src/components/ReservationForm.jsx

import { useForm } from 'react-hook-form';

const ReservationForm = ({ onSubmit }) => {
  const { register, handleSubmit } = useForm();
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="number"
        {...register('seatsRequired', { required: true, min: 1, max: 7 })}
        placeholder="Enter seats (1-7)"
        className="border rounded p-2"
      />
      <button type="submit" className="ml-2 bg-blue-500 text-white p-2 rounded">
        Reserve Seats
      </button>
    </form>
  );
};

export default ReservationForm;
