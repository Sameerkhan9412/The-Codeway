import React, { createContext, useContext, useState } from 'react';
import { Listbox } from '@headlessui/react';

const SelectContext = createContext(null);

const Select = ({ children, value, onValueChange, ...props }) => {
  const [selected, setSelected] = useState(value);

  const handleChange = (newValue) => {
    setSelected(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <SelectContext.Provider value={{ selected, handleChange }}>
      <Listbox value={selected} onChange={handleChange} {...props}>
        <div className="relative">{children}</div>
      </Listbox>
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ children, className, ...props }) => {
  const { selected } = useContext(SelectContext);
  return (
    <Listbox.Button
      className={`
        w-full bg-slate-800/60 border border-slate-600/60 text-white placeholder-slate-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400/50 transition-all duration-300 text-left hover:bg-slate-700/70 hover:border-slate-500/70 shadow-lg focus:shadow-orange-500/20 backdrop-blur-sm
        ${className}
      `}
      {...props}
    >
      <span className="block truncate">{selected ? children : <SelectValue />}</span>
    </Listbox.Button>
  );
};

const SelectContent = ({ children, className, ...props }) => (
  <Listbox.Options
    className={`
      absolute w-full bg-slate-800/90 border border-slate-600/60 text-white rounded-xl mt-2 z-20 shadow-xl backdrop-blur-md max-h-60 overflow-auto
      ${className}
    `}
    {...props}
  >
    {children}
  </Listbox.Options>
);

const SelectItem = ({ children, value, className, ...props }) => (
  <Listbox.Option
    className={`
      px-4 py-3 hover:bg-slate-700/80 cursor-pointer transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl
      ${className}
    `}
    value={value}
    {...props}
  >
    {({ selected }) => (
      <span className={`block truncate ${selected ? 'font-semibold text-orange-400' : 'font-normal'}`}>
        {children}
      </span>
    )}
  </Listbox.Option>
);

const SelectValue = ({ placeholder }) => {
  const { selected } = useContext(SelectContext);
  return <>{selected || placeholder}</>;
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };