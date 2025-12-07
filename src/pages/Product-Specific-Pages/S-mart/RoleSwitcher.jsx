// components/RoleSwitcher.jsx
import React from 'react';

const RoleSwitcher = ({ currentRole, onSwitch, loading }) => {
  if (currentRole === 'startup') {
    return (
      <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
        Startup Mode
      </div>
    );
  }

  return (
    <button
      onClick={() => onSwitch('startup')}
      disabled={loading}
      className="mr-12 flex items-center gap-1 sm:gap-2 bg-cyan-600 hover:bg-cyan-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white text-xs sm:text-sm font-medium transition whitespace-nowrap"
    >
      {loading ? (
        <span className="text-xs sm:text-sm">Switching...</span>
      ) : (
        <>
          <span className="hidden xs:inline">Reg as Startup</span>
          <span className="xs:hidden">Reg as Startup</span>
          <box-icon name='rocket' color="#ffffff" size="xs"></box-icon>
        </>
      )}
    </button>
  );
};

export default RoleSwitcher;