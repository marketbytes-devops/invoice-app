import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";

const FormField = ({
  label,
  name,
  register,
  type = "text",
  error,
  placeholder,
  options,
  onChange,
  required,
  readOnly,
  value,
  className,
  isSearchable = false, // New prop to enable search
  ...props
}) => {
  const [dateValue, setDateValue] = useState(value || null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // State for search input

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
  };

  useEffect(() => {
    if (type === "select" && options && value) {
      const matchingOption = options.find((option) => option.value === value);
      setSelectedOption(matchingOption ? matchingOption.label : placeholder || "Select");
    }
  }, [value, options, type, placeholder]);

  const handleSelect = (option) => {
    setSelectedOption(option.label);
    const event = { target: { name, value: option.value } };
    register(name).onChange(event);
    if (onChange) onChange(event);
    setIsOpen(false);
    setSearchTerm(""); // Clear search term on selection
  };

  // Filter options based on search term if searchable
  const filteredOptions = isSearchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  return (
    <div className={`mb-4 ${className || ""}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-4">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {type === "select" ? (
        <div className="relative">
          <div
            className="w-full p-2 border border-gray-400 rounded bg-gray-100 text-gray-800 cursor-pointer flex justify-between items-center focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 mt-4"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span>{selectedOption || placeholder || "Select"}</span>
            <span className="text-gray-600">▼</span>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute z-10 w-full mt-1 bg-white border border-gray-400 rounded shadow-lg max-h-60 overflow-y-auto"
              >
                {isSearchable && (
                  <div className="p-2">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search..."
                      className="w-full p-2 border border-gray-300 rounded text-gray-800 focus:border-indigo-500 focus:outline-none"
                      onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
                    />
                  </div>
                )}
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ backgroundColor: "#f3f4f6" }}
                      className="p-2 cursor-pointer text-gray-800"
                      onClick={() => handleSelect(option)}
                    >
                      {option.label || option}
                    </motion.div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No options found</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : type === "date" || type === "datetime-local" ? (
        <DatePicker
          selected={dateValue}
          onChange={(date) => {
            setDateValue(date);
            const formattedDate = date?.toISOString().split("T")[0];
            if (onChange) onChange(formattedDate);
            register(name).onChange({ target: { name, value: formattedDate } });
          }}
          showTimeSelect={type === "datetime-local"}
          dateFormat={type === "datetime-local" ? "yyyy-MM-dd HH:mm" : "yyyy-MM-dd"}
          placeholderText={placeholder || "Select date"}
          className="w-full p-2 border border-gray-400 rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400"
          required={required}
        />
      ) : type === "radio" ? (
        <div className="flex space-x-4">
          {options.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                {...register(name, { required: required && "This field is required" })}
                value={option.value}
                onChange={onChange}
                className="mr-2"
              />
              {option.label}
            </label>
          ))}
        </div>
      ) : (
        <input
          id={name}
          type={type}
          placeholder={placeholder || `Enter ${label?.toLowerCase() || "value"}`}
          {...register(name, { required: required && "This field is required" })}
          onChange={onChange}
          className="w-full p-2 border border-gray-400 rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
          readOnly={readOnly}
          value={value}
          {...props}
        />
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
    </div>
  );
};

export default FormField;