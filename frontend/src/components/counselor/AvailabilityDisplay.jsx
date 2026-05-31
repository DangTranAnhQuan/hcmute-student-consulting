import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";

export default function AvailabilityDisplay({
  counselorId,
  onDateChange,
  availableSlots,
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAvailableSlots = useCallback(async () => {
    try {
      setLoading(true);
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const response = await api.get(
        `/counselors/${counselorId}/available-slots`,
        {
          params: { date: formattedDate },
        },
      );
      setSlots(response.data.slots || []);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, counselorId]);

  useEffect(() => {
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
    onDateChange(newDate);
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate.toISOString().split("T")[0]}
          onChange={handleDateChange}
          min={minDate.toISOString().split("T")[0]}
          max={maxDate.toISOString().split("T")[0]}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Available Time Slots
        </label>

        {loading ? (
          <div className="text-center py-4 text-gray-600">
            Loading available times...
          </div>
        ) : slots.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-700">
            No available slots on this date. Please select another date.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot, index) => (
              <button
                key={index}
                type="button"
                className="px-3 py-2 border border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50 transition text-sm font-medium"
              >
                {new Date(slot).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
