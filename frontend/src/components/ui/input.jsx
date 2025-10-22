import React from 'react';

const Input = ({ className, ...props }) => {
const classes = `
    w-full bg-slate-800/60 border border-slate-600/60 text-white placeholder-slate-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400/50 transition-all duration-300 hover:bg-slate-700/70 hover:border-slate-500/70 shadow-lg focus:shadow-orange-500/20 backdrop-blur-sm
    ${className}
  `;

  return (
    <input className={classes} {...props} />
  );
};

export { Input };
