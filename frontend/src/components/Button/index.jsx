import React from 'react'


// In this way you can add reusable button

const Button = ({label,className}) => {
  return (
    <button className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ${className}`}>
        {label}
    </button>
  );
};

export default Button
