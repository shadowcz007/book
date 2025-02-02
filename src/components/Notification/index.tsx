import { Alert } from 'antd';

interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  visible: boolean;
}

export default function Notification({ type, message, visible }: NotificationProps) {
  if (!visible) return null;

  return (
    <Alert
      message={message}
      type={type}
      showIcon
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1000,
        minWidth: 200,
        maxWidth: 400,
      }}
    />
  );
} 