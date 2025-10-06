import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface IconButtonProps extends React.HTMLAttributes<HTMLElement> {
  to?: string;
  ariaLabel?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({ to, ariaLabel, children, className = '', ...props }) => {
  // ensure pointer events and stacking to avoid overlays intercepting clicks
  const base = `p-1 h-8 w-8 rounded-full shadow-lg bg-purple-600 text-white hover:bg-purple-700 inline-flex items-center justify-center transition-transform transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-300/50 pointer-events-auto relative z-20 ${className}`;
  const navigate = useNavigate();

  if (to) {
    // Extract any provided onClick so we can forward it, then ensure navigation occurs
    const { onClick, ...rest } = props as any;

    const handleClick = (e: React.MouseEvent) => {
      try {
        if (typeof onClick === 'function') onClick(e);
      } catch (err) {
        // ignore errors from user-provided handlers
      }
      // prevent default anchor behavior and navigate programmatically to ensure navigation
      try {
        // log click for debugging regardless of environment; remove after verification
        // eslint-disable-next-line no-console
        console.log('[IconButton] link click:', { to });
      } catch (err) {
        // ignore logging errors
      }
      e.preventDefault();
      navigate(to);
    };

    return (
      <Link to={to} aria-label={ariaLabel} className={base} onClick={handleClick} {...rest}>
        <span className="pointer-events-none flex items-center justify-center">{children}</span>
      </Link>
    );
  }

  return (
    <button type="button" aria-label={ariaLabel} className={base} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      <span className="pointer-events-none flex items-center justify-center">{children}</span>
    </button>
  );
};

export default IconButton;
