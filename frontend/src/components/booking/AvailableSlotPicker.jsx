import React from "react";
import { counselorAPI } from "../../services/api";
import {
  defaultPreferredDate,
  formatDuration,
  toDateTimeLocalValue,
} from "../../utils/consultationFormat";

const toDateValue = (value) =>
  (value ? toDateTimeLocalValue(value) : defaultPreferredDate()).slice(0, 10);

const formatTime = (value) =>
  new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export default function AvailableSlotPicker({
  counselorId,
  value,
  onChange,
  variant = "default",
}) {
  const [selectedDate, setSelectedDate] = React.useState(toDateValue(value));
  const [slots, setSlots] = React.useState([]);
  const [bookedSlots, setBookedSlots] = React.useState([]);
  const [slotDuration, setSlotDuration] = React.useState(60);
  const [workRange, setWorkRange] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const compact = variant === "compact";

  React.useEffect(() => {
    if (value) setSelectedDate(toDateValue(value));
  }, [value]);

  React.useEffect(() => {
    if (!counselorId || !selectedDate) return;

    const loadSlots = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await counselorAPI.availableSlots(counselorId, selectedDate);
        setSlots(response.data.slots || []);
        setBookedSlots(response.data.bookedSlots || []);
        setSlotDuration(response.data.slotDuration || 60);
        setWorkRange(
          response.data.workStart && response.data.workEnd
            ? `${response.data.workStart} - ${response.data.workEnd}`
            : null,
        );
      } catch (err) {
        setSlots([]);
        setBookedSlots([]);
        setError(err.response?.data?.message || "Không tải được khung giờ tư vấn");
      } finally {
        setLoading(false);
      }
    };

    loadSlots();
  }, [counselorId, selectedDate]);

  const selectedLocalValue = value ? toDateTimeLocalValue(value) : "";
  const slotGridClass = compact
    ? "grid grid-cols-3 gap-2"
    : "grid grid-cols-3 gap-2 sm:grid-cols-4";

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Ngày tư vấn
        </label>
        <input
          type="date"
          min={defaultPreferredDate().slice(0, 10)}
          value={selectedDate}
          onChange={(event) => {
            setSelectedDate(event.target.value);
            onChange("");
          }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className={`rounded-lg border border-gray-200 bg-white ${compact ? "p-3" : "p-4"}`}>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-semibold text-gray-800">
            Slot trống {formatDuration(slotDuration)}
          </span>
          {workRange && <span className="text-xs text-gray-500">Làm việc: {workRange}</span>}
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Đang tải khung giờ...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-amber-700">
            Không còn slot trống trong ngày này.
          </p>
        ) : (
          <div className={slotGridClass}>
            {slots.map((slot) => {
              const localValue = toDateTimeLocalValue(slot);
              const active = selectedLocalValue === localValue;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onChange(localValue)}
                  className={`rounded-lg border px-2 py-2 text-sm font-semibold ${
                    active
                      ? "border-primary bg-primary text-white"
                      : "border-blue-200 bg-white text-primary hover:bg-blue-50"
                  }`}
                >
                  {formatTime(slot)}
                </button>
              );
            })}
          </div>
        )}

        {bookedSlots.length > 0 && (
          <div className="mt-3 border-t border-gray-200 pt-3">
            <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
              Đã có người đặt
            </p>
            <div className="flex flex-wrap gap-2">
              {bookedSlots.map((slot) => (
                <span
                  key={slot}
                  className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500"
                >
                  {formatTime(slot)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
