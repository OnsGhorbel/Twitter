import React from 'react';
import { useSelector } from 'react-redux';
import TweetCard from './TweetCard';

function TweetList() {
  const tweets = useSelector((state) => state.tweets.tweets);

  return (
    <div>
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}
    </div>
  );
}

export default TweetList;
