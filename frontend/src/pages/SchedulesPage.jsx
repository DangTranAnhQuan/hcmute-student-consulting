import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserBookings, cancelBooking } from "../redux/scheduleSlice";
import { useAuth } from "../redux/hooks";

export default function SchedulesPage() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const { bookings, loading, error } = useSelector((state) => state.schedule);

  useEffect(() => {
    if (user?._id) {
      dispatch(getUserBookings(user._id));
    }
  }, [user, dispatch]);

  const handleCancel = async (bookingId, reason) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      dispatch(cancelBooking({ bookingId, reason }));
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "upcoming") {
      return (
        new Date(booking.startTime) > new Date() &&
        booking.status !== "cancelled"
      );
    }
    if (filter === "past") {
      return new Date(booking.startTime) < new Date();
    }
    return true;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(a.startTime) - new Date(b.startTime);
    }
    return 0;
  });

  const getStatusBadge = (status) => {
    const statusStyles = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusStyles[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Schedules</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="all">All Bookings</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="date">Date</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading your bookings...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
            {error}
          </div>
        ) : sortedBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">
              No bookings found. Start by booking a counselor!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {booking.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{booking.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Counselor:</span>
                        <p className="text-gray-600">
                          {booking.counselorId?.fullName}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>
                        <p className="text-gray-600">
                          {new Date(booking.startTime).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Time:</span>
                        <p className="text-gray-600">
                          {new Date(booking.startTime).toLocaleTimeString()} -{" "}
                          {new Date(booking.endTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>
                        <p className="text-gray-600 capitalize">
                          {booking.meetingType}
                        </p>
                      </div>
                    </div>

                    {booking.meetingType === "online" &&
                      booking.meetingLink && (
                        <div className="mt-4">
                          <a
                            href={booking.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Join Meeting
                          </a>
                        </div>
                      )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(booking.status)}`}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>

                    {booking.status !== "cancelled" &&
                      new Date(booking.startTime) > new Date() && (
                        <button
                          onClick={() =>
                            handleCancel(
                              booking._id,
                              "User requested cancellation",
                            )
                          }
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
