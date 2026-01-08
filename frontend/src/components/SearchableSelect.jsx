import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

const SearchableSelect = ({
    options = [],
    value,
    onChange,
    placeholder = "Select an option",
    label,
    error,
    icon: Icon,
    displaySelectedValue = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter options
    const filteredOptions = options.filter(option => {
        const label = option.label || option;
        return String(label).toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Get current label
    const selectedOption = options.find(opt => (opt.value || opt) === value);
    const displayLabel = selectedOption
        ? (displaySelectedValue ? (selectedOption.value || selectedOption) : (selectedOption.label || selectedOption))
        : "";

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <div className="space-y-2" ref={dropdownRef}>
            {label && (
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">
                    {label}
                </label>
            )}

            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <Icon className="h-5 w-5 text-gray-400" />
                    </div>
                )}

                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-2xl ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none cursor-pointer flex items-center justify-between group hover:bg-gray-100`}
                >
                    <span className={`font-semibold ${displayLabel ? 'text-black' : 'text-gray-400'}`}>
                        {displayLabel || placeholder}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>

                {isOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden p-2">
                        <div className="relative px-2 pb-2 border-b border-gray-100">
                            <Search className="absolute left-4 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                className="w-full bg-gray-50 rounded-xl py-2 pl-9 pr-4 text-sm outline-none text-gray-800 font-medium placeholder-gray-400 focus:bg-gray-100 transition-colors"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto mt-2 space-y-1 custom-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option, index) => {
                                    const optValue = option.value || option;
                                    const optLabel = option.label || option;
                                    const isSelected = optValue === value;

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => handleSelect(optValue)}
                                            className={`px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer flex items-center justify-between transition-colors ${isSelected
                                                ? 'bg-black text-white'
                                                : 'text-gray-800 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span>{optLabel}</span>
                                            {isSelected && <Check className="w-4 h-4" />}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="px-4 py-3 text-sm text-gray-500 text-center font-medium">
                                    No results found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="text-red-500 text-xs px-1">{error.message || error}</p>}
        </div>
    );
};

export default SearchableSelect;
