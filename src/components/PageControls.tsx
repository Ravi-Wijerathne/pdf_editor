import React from 'react';

const PageControls: React.FC = () => {
  return (
    <div className="page-controls">
      <button>Previous Page</button>
      <span>Page 1 of 1</span>
      <button>Next Page</button>
    </div>
  );
};

export default PageControls;