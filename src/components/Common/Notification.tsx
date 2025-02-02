import { notification } from 'antd';

export const showNotification = (type: 'success' | 'error', message: string) => {
  notification.open({
    type: type,
    message: type === 'success' ? '成功' : '错误',
    description: message,
    placement: 'topRight',
  });
};

export default showNotification; 