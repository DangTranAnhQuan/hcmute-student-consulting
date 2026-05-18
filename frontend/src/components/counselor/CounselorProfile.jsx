import React from "react";

export default function CounselorProfile({ counselor }) {
  const renderRating = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-lg ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
          >
            ★
          </span>
        ))}
        <span className="text-sm text-gray-600 ml-2">
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="text-center pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold mb-2">{counselor.fullName}</h1>
        <p className="text-gray-600 mb-3">Professional Counselor</p>
        <div className="flex justify-center">
          {renderRating(counselor.rating || 0)}
        </div>
      </div>

      {/* Expertise */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Areas of Expertise</h3>
        <div className="flex flex-wrap gap-2">
          {counselor.expertise && counselor.expertise.length > 0 ? (
            counselor.expertise.map((exp, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {exp}
              </span>
            ))
          ) : (
            <p className="text-gray-600 text-sm">No expertise specified</p>
          )}
        </div>
      </div>

      {/* Bio */}
      {counselor.bio && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">About</h3>
          <p className="text-gray-600 leading-relaxed">{counselor.bio}</p>
        </div>
      )}

      {/* Rate Info */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Hourly Rate</h3>
        <p className="text-xl font-bold text-green-600">
          ${counselor.hourlyRate || 0}
          <span className="text-gray-600 text-sm font-normal"> / hour</span>
        </p>
      </div>

      {/* Stats */}
      <div className="bg-gray-50 rounded p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Stats</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {counselor.totalBookings || 0}
            </p>
            <p className="text-sm text-gray-600">Total Bookings</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {counselor.isActive ? "Active" : "Inactive"}
            </p>
            <p className="text-sm text-gray-600">Status</p>
          </div>
        </div>
      </div>

      {/* Booking Info */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          Booking Information
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Select your preferred date and time</li>
          <li>✓ Choose between online or in-person meeting</li>
          <li>✓ Complete your booking details</li>
          <li>✓ Receive confirmation email with details</li>
        </ul>
      </div>
    </div>
  );
}
