import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                zIndex: 11000,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                pointerEvents: 'none' // Allow clicking through container
            }}>
                {notifications.map(notification => (
                    <Toast
                        key={notification.id}
                        {...notification}
                        onClose={() => removeNotification(notification.id)}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

const Toast = ({ message, type, duration, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300); // Wait for animation
    };

    let icon, bgColor, borderColor;

    switch (type) {
        case 'success':
            icon = <CheckCircle size={20} color="#34d399" />;
            bgColor = 'rgba(6, 78, 59, 0.9)';
            borderColor = '#059669';
            break;
        case 'error':
            icon = <AlertCircle size={20} color="#f87171" />;
            bgColor = 'rgba(127, 29, 29, 0.9)';
            borderColor = '#dc2626';
            break;
        case 'warning':
            icon = <AlertCircle size={20} color="#fbbf24" />;
            bgColor = 'rgba(120, 53, 15, 0.9)';
            borderColor = '#d97706';
            break;
        default:
            icon = <Info size={20} color="#60a5fa" />;
            bgColor = 'rgba(30, 58, 138, 0.9)';
            borderColor = '#2563eb';
    }

    return (
        <div style={{
            pointerEvents: 'auto',
            background: bgColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '0.75rem',
            padding: '1rem 1.25rem',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            minWidth: '300px',
            maxWidth: '400px',
            backdropFilter: 'blur(10px)',
            animation: isExiting ? 'slideOut 0.3s ease-in forwards' : 'slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
        }}>
            <div style={{ flexShrink: 0 }}>{icon}</div>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4' }}>{message}</p>
            <button
                onClick={handleClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                    marginLeft: 'auto',
                    padding: 0,
                    display: 'flex'
                }}
            >
                <X size={16} />
            </button>
            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(100%); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideOut {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};
