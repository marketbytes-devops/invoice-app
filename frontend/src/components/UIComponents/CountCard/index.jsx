import React from "react";

const CountCard = ({ title, subtitle, count, icon, onClick }) => {
  return (
    <button className="relative flex-1 min-w-[250px] p-4 overflow-hidden bg-white shadow-lg rounded-2xl" onClick={onClick}>
      {icon && <img alt={title} src={icon} className="absolute w-40 h-40 mb-4 -right-20 -bottom-8 opacity-20" />}
      <span className="w-auto text-left space-y-3 relative z-10">
        <p className="mb-2 text-lg font-medium text-gray-800">{title}</p>
        <p className="text-xs font-medium text-gray-400">{subtitle}</p>
        <p className="text-xl font-extrabold text-indigo-500">{count}</p>
      </span>
    </button>
  );
};

export default CountCard;