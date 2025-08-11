import React from 'react';
import { CirclesWithBar } from 'react-loader-spinner';

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
    <CirclesWithBar
  height="100"
  width="100"
  color="#079607"
  outerCircleColor="#079607"
  innerCircleColor="#079607"
  barColor="#000000"
  ariaLabel="circles-with-bar-loading"
  wrapperStyle={{}}
  wrapperClass=""
  visible={true}
  />

    </div>
  );
};

export default Loader;
