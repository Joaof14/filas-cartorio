import React from 'react';


interface ButtonTouchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'priority' | 'success' | 'outline';
  icon?: React.ReactNode;
  children: React.ReactNode;
}


export const ButtonTouch: React.FC<ButtonTouchProps> = ({
  variant = 'primary',
  icon,
  children,
  style,
  ...props
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'priority': return 'var(--color-priority)';
      case 'success': return 'var(--color-success)';
      case 'outline': return 'transparent';
      default: return 'var(--color-primary)';
    }
  };


  const getTextColor = () => {
    return variant === 'outline' ? 'var(--color-primary)' : '#ffffff';
  };


  const getBorder = () => {
    return variant === 'outline' ? '2px solid var(--color-primary)' : 'none';
  };


  return (
    <button
      className="btn-touch"
      style={{
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        border: getBorder(),
        ...style,
      }}
      {...props}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
