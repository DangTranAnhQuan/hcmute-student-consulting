import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createBooking } from "../../redux/scheduleSlice";
import { useAuth } from "../../redux/hooks";

export default function BookingForm({ counselor, selectedDate }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    meetingType: "online",
    meetingLink: "",
    location: "",
  });

  const [errors, setErrors] = useState({});
  const { loading } = useSelector((state) => state.schedule);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }
    if (formData.startTime >= formData.endTime) {
      newErrors.endTime = "End time must be after start time";
    }
    if (formData.meetingType === "online" && !formData.meetingLink.trim()) {
      newErrors.meetingLink = "Meeting link is required for online meetings";
    }
    if (formData.meetingType === "in-person" && !formData.location.trim()) {
      newErrors.location = "Location is required for in-person meetings";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const bookingData = {
      counselorId: counselor._id,
      userId: user._id,
      ...formData,
      startTime: new Date(
        `${selectedDate.toISOString().split("T")[0]}T${formData.startTime}`,
      ),
      endTime: new Date(
        `${selectedDate.toISOString().split("T")[0]}T${formData.endTime}`,
      ),
    };

    dispatch(createBooking(bookingData));
    // Reset form
    setFormData({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      meetingType: "online",
      meetingLink: "",
      location: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Booking Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Career Guidance Session"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.title && (
          <p className="text-red-600 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          placeholder="Describe what you'd like to discuss..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Time *
          </label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.startTime && (
            <p className="text-red-600 text-sm mt-1">{errors.startTime}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Time *
          </label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.endTime && (
            <p className="text-red-600 text-sm mt-1">{errors.endTime}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Meeting Type *
        </label>
        <select
          name="meetingType"
          value={formData.meetingType}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="online">Online</option>
          <option value="in-person">In-Person</option>
        </select>
      </div>

      {formData.meetingType === "online" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meeting Link *
          </label>
          <input
            type="url"
            name="meetingLink"
            value={formData.meetingLink}
            onChange={handleChange}
            placeholder="https://zoom.us/... or Google Meet link"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.meetingLink && (
            <p className="text-red-600 text-sm mt-1">{errors.meetingLink}</p>
          )}
        </div>
      )}

      {formData.meetingType === "in-person" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Building and room number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.location && (
            <p className="text-red-600 text-sm mt-1">{errors.location}</p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
      >
        {loading ? "Booking..." : "Confirm Booking"}
      </button>
    </form>
  );
}
