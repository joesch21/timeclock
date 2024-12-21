import React from "react";

const HistoryManager = ({ history }) => {
  return (
    <div>
      {history.length > 0 && (
        <div>
          <h3>Clock History</h3>
          <ul>
            {history.map((record, index) => (
              <li key={index}>
                <strong>{record.action}</strong> at {record.location} on {record.timestamp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HistoryManager;
