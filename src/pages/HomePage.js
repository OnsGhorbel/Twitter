import React from 'react';
import Navbar from '../components/Navbar';
import TweetForm from '../components/TweetForm';
import TweetList from '../components/TweetList';

function HomePage() {
  return (
        
    <div style={{ display: 'flex' }}>
      <Navbar />
      <div style={{ marginLeft: '240px', padding: '2rem', width: '100%', background: '#f5f8fa', minHeight: '100vh' }}>
        <div style={{ fontWeight: 700, marginBottom: '2rem', color: '#1da1f2' }}>
          <h2>Welcome to Twitter</h2>
          <p>Share tweets, polls, images, and videos in real-time!</p>
        </div>
        <TweetForm />
        <div style={{ marginTop: '2rem' }}>
          <TweetList />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
