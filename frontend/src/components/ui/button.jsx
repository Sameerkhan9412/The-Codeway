
import React from 'react';

export const Button = ({ children, onClick, variant, size, className, ...props }) => {
  const baseClasses = "font-semibold py-2 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";

  const variantClasses = {
    default: "bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 hover:from-orange-600 hover:via-orange-500 hover:to-amber-600 text-white shadow-orange-500/25 hover:shadow-orange-500/40 focus:ring-orange-400",
    outline: "bg-slate-800/60 border border-slate-600/60 text-slate-200 hover:bg-slate-700/70 hover:border-slate-500/70 hover:text-white shadow-slate-500/20 hover:shadow-slate-400/30 focus:ring-slate-400 backdrop-blur-sm",
  };

  const sizeClasses = {
    default: "text-base",
    sm: "text-sm py-1.5 px-3",
    lg: "text-lg py-3 px-6",
  };

  const classes = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.default}
    ${sizeClasses[size] || sizeClasses.default}
    ${className}
  `;

  return (
    <button className={classes} onClick={onClick} {...props}>
      {children}
    </button>
  );
};