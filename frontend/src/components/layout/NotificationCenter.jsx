import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markRead, markAllNotificationsRead as markAllReadAction } from '../../store/slices/communicationSlice';
import { Bell, Check, Trash2, X } from 'lucide-react';

const NotificationCenter = () => {
    const dispatch = useDispatch();
    const { notifications } = useSelector((state) => state.communication);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Poll for notifications every minute (simulating real-time)
        dispatch(fetchNotifications());
        const interval = setInterval(() => {
            dispatch(fetchNotifications());
        }, 60000);
        return () => clearInterval(interval);
    }, [dispatch]);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkWithRead = async (id, e) => {
        e.stopPropagation();
        await dispatch(markRead(id));
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Notifications"
            >
                <Bell className="h-6 w-6" />
                {notifications.unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white ring-2 ring-white">
                        {notifications.unreadCount > 9 ? '9+' : notifications.unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden transform origin-top-right transition-all">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        {notifications.unreadCount > 0 && (
                            <button
                                onClick={() => dispatch(markAllReadAction())} // Need to implement this thunk properly if not exists
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.loading && notifications.data.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                        ) : notifications.data.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {notifications.data.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 pr-2">
                                                <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-2">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            {!notification.is_read && (
                                                <button
                                                    onClick={(e) => handleMarkWithRead(notification.id, e)}
                                                    className="text-blue-500 hover:text-blue-700 p-1"
                                                    title="Mark as read"
                                                >
                                                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-3">
                                    <Bell className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
