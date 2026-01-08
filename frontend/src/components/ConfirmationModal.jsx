import React from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertTriangle, AlertOctagon, Info, Trash2 } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    onConfirm,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    showButtons = true,
}) => {
    React.useEffect(() => {
        if (isOpen && !showButtons) {
            const timer = setTimeout(() => {
                onClose();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, showButtons, onClose]);

    if (!isOpen) return null;

    const typeConfig = {
        success: {
            icon: CheckCircle,
            iconColor: 'text-green-600',
            iconBg: 'bg-green-50',
            buttonBg: 'bg-green-600 hover:bg-green-700',
        },
        danger: {
            icon: AlertOctagon,
            iconColor: 'text-red-600',
            iconBg: 'bg-red-50',
            buttonBg: 'bg-red-600 hover:bg-red-700',
        },
        warning: {
            icon: AlertTriangle,
            iconColor: 'text-amber-600',
            iconBg: 'bg-amber-50',
            buttonBg: 'bg-amber-600 hover:bg-amber-700',
        },
        info: {
            icon: Info,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-50',
            buttonBg: 'bg-blue-600 hover:bg-blue-700',
        },
    };

    const config = typeConfig[type] || typeConfig.info;
    const Icon = config.icon;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-start">
                    {/* Icon Circle */}
                    <div className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center mb-4`}>
                        <Icon className={`w-6 h-6 ${config.iconColor}`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        {message}
                    </p>

                    {/* Buttons (Optional) */}
                    {showButtons && (
                        <div className="flex gap-3 w-full justify-end">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-gray-200/50 transition-all flex items-center gap-2 ${config.buttonBg}`}
                            >
                                {type === 'danger' && <Trash2 className="w-4 h-4" />}
                                {confirmText}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmationModal;
