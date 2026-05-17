import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateFilter, clearFilters } from "../../redux/searchSlice";

const SelectField = ({ label, value, options, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

const FilterSidebar = () => {
  const dispatch = useDispatch();
  const { filters, options } = useSelector((state) => state.search);

  const handleChange = (key) => (value) => {
    dispatch(updateFilter({ key, value }));
  };

  return (
    <aside className="bg-white rounded-xl shadow-md p-4 md:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Bo loc nang cao</h2>
        <button
          type="button"
          onClick={() => dispatch(clearFilters())}
          className="text-sm text-primary hover:text-primary-dark"
        >
          Dat lai
        </button>
      </div>

      <SelectField
        label="Topic"
        value={filters.topic}
        options={options.topics}
        onChange={handleChange("topic")}
      />

      <SelectField
        label="Faculty"
        value={filters.faculty}
        options={options.faculties}
        onChange={handleChange("faculty")}
      />

      <SelectField
        label="Content Type"
        value={filters.contentType}
        options={options.contentTypes}
        onChange={handleChange("contentType")}
      />

      <SelectField
        label="Publish Time"
        value={filters.publishTime}
        options={options.publishTimes}
        onChange={handleChange("publishTime")}
      />

      <SelectField
        label="Popularity"
        value={filters.popularity}
        options={options.popularities}
        onChange={handleChange("popularity")}
      />

      <SelectField
        label="Counseling Format"
        value={filters.counselingFormat}
        options={options.counselingFormats}
        onChange={handleChange("counselingFormat")}
      />

      <SelectField
        label="Appointment Status"
        value={filters.appointmentStatus}
        options={options.appointmentStatuses}
        onChange={handleChange("appointmentStatus")}
      />
    </aside>
  );
};

export default FilterSidebar;

