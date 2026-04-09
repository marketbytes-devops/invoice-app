import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

const PasswordInput = ({
    register,
    name,
    rules,
    error,
    placeholder = "Enter password",
    className = "",
    icon: Icon = Lock,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const toggleVisibility = () => setShowPassword(!showPassword);

    const registration = register ? register(name, rules) : {};

    return (
        <div className={`space-y-2 ${className}`}>
            {props.label && (
                <label className="block text-xs font-semibold text-black uppercase tracking-widest px-1">
                    {props.label}
                </label>
            )}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon className="h-5 w-5 text-black" />
                </div>
                <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full bg-gray-100 border-2 ${error ? "border-red-500" : "border-black"
                        } rounded-2xl pl-12 pr-12 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-black`}
                    placeholder={placeholder}
                    {...registration}
                    {...props}
                />
                <button
                    type="button"
                    onClick={toggleVisibility}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-black hover:text-black transition-colors focus:outline-none"
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>
            {error && <p className="text-red-500 text-xs px-1">{error.message}</p>}
        </div>
    );
};

export default PasswordInput;
