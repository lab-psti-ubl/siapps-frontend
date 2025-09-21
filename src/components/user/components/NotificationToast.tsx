import React from 'react';
import { CheckCircle, AlertTriangle, X, Info, AlertCircle } from 'lucide-react';

interface NotificationState {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface NotificationToastProps {
  notification: NotificationState;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  if (!notification.show) return null;

  const getNotificationConfig = () => {
    switch (notification.type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-500',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700',
          title: 'Berhasil!'
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-gradient-to-r from-red-50 to-rose-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          title: 'Gagal!'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-gradient-to-r from-yellow-50 to-amber-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-500',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700',
          title: 'Peringatan!'
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-gradient-to-r from-blue-50 to-sky-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
          title: 'Informasi'
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-gradient-to-r from-gray-50 to-slate-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-500',
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-700',
          title: 'Notifikasi'
        };
    }
  };

  const config = getNotificationConfig();
  const IconComponent = config.icon;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in max-w-sm">
      <div className={`flex items-start space-x-3 px-6 py-4 rounded-xl shadow-lg border-l-4 backdrop-blur-sm ${config.bgColor} ${config.borderColor}`}>
        <div className="flex-shrink-0">
          <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${config.titleColor}`}>
            {config.title}
          </p>
          <p className={`text-sm mt-1 leading-relaxed ${config.messageColor}`}>
            {notification.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ml-4 p-1 rounded-full hover:bg-white/20 transition-colors ${config.iconColor}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;