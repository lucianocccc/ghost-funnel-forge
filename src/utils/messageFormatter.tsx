
import React from 'react';

export const formatMessageContent = (content: string) => {
  const parts = content.split(/\*\*(.*?)\*\*/g);
  
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="text-golden">{part}</strong>;
    }
    
    const textWithBreaks = part.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < part.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
    
    return <span key={index}>{textWithBreaks}</span>;
  });
};
