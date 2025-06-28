import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addTweet } from '../tweets/tweetSlice'; 

function TweetForm() {
  const [content, setContent] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    dispatch(addTweet({ id: Date.now(), content }));
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        rows="3"
        placeholder="What's happening?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <br />
      <button type="submit">Tweet</button>
    </form>
  );
}

export default TweetForm;
