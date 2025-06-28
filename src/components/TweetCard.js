import React from 'react';

function TweetCard({ tweet }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
      {tweet.content}
    </div>
  );
}

export default TweetCard;
