import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Mail, Calendar } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationDisplay = () => {
  const { notifications, removeNotification } = useNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <Bell className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <Bell className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <Mail className="w-5 h-5 text-blue-400" />;
      case 'report':
        return <Calendar className="w-5 h-5 text-purple-400" />;
      case 'reminder':
        return <Bell className="w-5 h-5 text-orange-400" />;
      default:
        return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'info':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'report':
        return 'border-purple-500/30 bg-purple-500/10';
      case 'reminder':
        return 'border-orange-500/30 bg-orange-500/10';
      default:
        return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className={`flex items-start p-4 rounded-lg border backdrop-blur-sm ${getNotificationColor(notification.type)} max-w-sm`}
          >
            <div className="mr-3 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white text-sm">
                {notification.title}
              </h4>
              <p className="text-gray-300 text-sm mt-1">
                {notification.message}
              </p>
              {notification.timestamp && (
                <p className="text-gray-400 text-xs mt-2">
                  {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDisplay;