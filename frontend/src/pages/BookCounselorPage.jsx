import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import BookingForm from "../components/booking/BookingForm";
import CounselorProfile from "../components/counselor/CounselorProfile";
import AvailabilityDisplay from "../components/counselor/AvailabilityDisplay";
import { getCounselorById } from "../redux/scheduleSlice";

export default function BookCounselorPage() {
  const { counselorId } = useParams();
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);

  const { counselors, loading, error } = useSelector((state) => state.schedule);
  const counselor = counselors.find((c) => c._id === counselorId);

  useEffect(() => {
    if (counselorId) {
      dispatch(getCounselorById(counselorId));
    }
  }, [counselorId, dispatch]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Fetch available slots for the selected date
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error) return <div className="text-red-600 p-4">Error: {error}</div>;
  if (!counselor) return <div className="p-4">Counselor not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Counselor Profile Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <CounselorProfile counselor={counselor} />
          </div>

          {/* Booking Form Section */}
          <div className="space-y-6">
            {/* Availability Display */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Select Date & Time</h2>
              <AvailabilityDisplay
                counselorId={counselorId}
                onDateChange={handleDateChange}
                availableSlots={availableSlots}
              />
            </div>

            {/* Booking Form */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Complete Your Booking</h2>
              <BookingForm counselor={counselor} selectedDate={selectedDate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
