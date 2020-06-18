import React from 'react';

function StatusMessage(props) {
  return (
    <div className="fixed-bottom bg-dark text-white" style={{opacity: 0.55}}>
      <span>&nbsp;&nbsp;</span>
      <span>{props.status}</span>
    </div>
  )
}

export default StatusMessage;
