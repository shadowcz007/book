import { notification } from 'antd';
import { NotificationInstance } from 'antd/es/notification/interface';

let notificationInstance: NotificationInstance;

notification.init = () => {
  notification.getContainer();
};

export const showNotification = (type: 'success' | 'error', message: string) => {
  notification[type]({
    message: type === 'success' ? '成功' : '错误',
    description: message,
    placement: 'topRight',
  });
};

export default showNotification; 