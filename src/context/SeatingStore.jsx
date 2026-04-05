import React, { createContext, useContext, useState } from 'react';

const SeatingCtx = createContext(null);

export const SeatingProvider = ({ children }) => {
  // Published seating that students can see
  const [publishedSeating, setPublishedSeating] = useState(null);

  const publish = (data) => setPublishedSeating(data);
  const clear    = () => setPublishedSeating(null);

  return (
    <SeatingCtx.Provider value={{ publishedSeating, publish, clear }}>
      {children}
    </SeatingCtx.Provider>
  );
};

export const useSeating = () => useContext(SeatingCtx);
