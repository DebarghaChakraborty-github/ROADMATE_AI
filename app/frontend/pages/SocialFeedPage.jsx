import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../Layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useRider } from '../context/RiderContext'; // To display current user's info
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ListItem from '../components/ListItem'; // For displaying post details or user info
import { Link } from 'react-router-dom'; // For navigation to other pages

// Helper function to generate a unique ID for posts
const generatePostId = () => `post-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Helper function to format date/time
const formatPostDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date)) return 'Invalid Date';

  const now = new Date();
  const diffMinutes = Math.floor((now - date) / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Dummy data for simulated posts
const initialDummyPosts = [
  {
    id: generatePostId(),
    authorId: 'user123',
    authorName: 'AdventureRider_77',
    authorAvatar: 'https://placehold.co/40x40/FF5733/FFFFFF?text=AR',
    content: "Just completed an epic ride through the Western Ghats! The views were breathtaking. My Himalayan handled the twisties like a dream. #IndiaRides #HimalayanAdventures",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    likes: 45,
    comments: 12,
    shares: 3,
    media: 'https://placehold.co/300x200/3366FF/FFFFFF?text=GhatsView',
    tripRef: { name: 'Western Ghats Odyssey', id: 'trip1' } // Optional reference to a trip
  },
  {
    id: generatePostId(),
    authorId: 'user456',
    authorName: 'CitySlicker_99',
    authorAvatar: 'https://placehold.co/40x40/33FF57/FFFFFF?text=CS',
    content: "Quick spin around the city on my Duke 390. Traffic was a nightmare, but the quick shifter made it bearable! #KTM #UrbanRiding",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    likes: 28,
    comments: 5,
    shares: 1,
    media: null,
    tripRef: null
  },
  {
    id: generatePostId(),
    authorId: 'user789',
    authorName: 'RoyalCruiser',
    authorAvatar: 'https://placehold.co/40x40/FF33CC/FFFFFF?text=RC',
    content: "Planning my next long ride. Thinking about heading to Rajasthan. Any tips for desert riding on a Classic 350? #RoyalEnfield #Rajasthan",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
    likes: 60,
    comments: 25,
    shares: 5,
    media: null,
    tripRef: null
  },
];

const SocialFeedPage = () => {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const { riderProfile, isLoadingRider } = useRider();

  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState(null);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [feedError, setFeedError] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]); // For AI-generated post ideas

  // --- Simulate Fetching Posts ---
  useEffect(() => {
    const fetchFeed = async () => {
      setIsLoadingFeed(true);
      setFeedError(null);
      try {
        // Simulate API call to backend /api/social/feed
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        setPosts(initialDummyPosts); // Load dummy data
      } catch (err) {
        console.error('Failed to fetch social feed:', err);
        setFeedError('Failed to load social feed. Please try again later.');
      } finally {
        setIsLoadingFeed(false);
      }
    };
    fetchFeed();
  }, []);

  // --- Simulate AI Post Suggestions ---
  useEffect(() => {
    if (isAuthenticated && riderProfile.name && !isLoadingRider) {
      const generateSuggestions = async () => {
        // Simulate AI call for post suggestions
        await new Promise(resolve => setTimeout(resolve, 1000));
        const suggestions = [
          `Share your recent ride experience, ${riderProfile.name}!`,
          `Ask for tips on maintaining your ${riderProfile.ridingStyle} bike.`,
          `Post a photo from your favorite riding spot!`,
          `Discuss your thoughts on ${riderProfile.preferredDailyDistance}km daily rides.`,
        ];
        setAiSuggestions(suggestions);
      };
      generateSuggestions();
    }
  }, [isAuthenticated, riderProfile.name, riderProfile.ridingStyle, riderProfile.preferredDailyDistance, isLoadingRider]);


  // --- Handle Creating a New Post ---
  const handleCreatePost = useCallback(async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setPostError('You must be logged in to create a post.');
      return;
    }
    if (!newPostContent.trim()) {
      setPostError('Post content cannot be empty.');
      return;
    }

    setIsPosting(true);
    setPostError(null);

    try {
      // Simulate API call to backend /api/social/posts
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newPost = {
        id: generatePostId(),
        authorId: user.id,
        authorName: user.username || 'Anonymous Rider',
        authorAvatar: `https://placehold.co/40x40/6633FF/FFFFFF?text=${user.username ? user.username[0].toUpperCase() : 'U'}`, // Dynamic avatar
        content: newPostContent.trim(),
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        shares: 0,
        media: null, // For simplicity, no media upload in this simulation
        tripRef: null, // For simplicity, no trip linking in this simulation
      };

      setPosts(prev => [newPost, ...prev]); // Add new post to the top of the feed
      setNewPostContent(''); // Clear input
      console.log('New post created:', newPost);

      // Simulate AI content moderation (a simple check)
      if (newPostContent.toLowerCase().includes('bad word') || newPostContent.length > 500) {
        // In a real app, this would be a backend AI call
        alert('Your post might violate community guidelines or is too long. Please review.'); // Use a Modal instead of alert
      }

    } catch (err) {
      console.error('Error creating post:', err);
      setPostError('Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  }, [isAuthenticated, newPostContent, user]);

  // --- Simulate Post Interactions ---
  const handleLike = useCallback((postId) => {
    if (!isAuthenticated) {
      setPostError('You must be logged in to like posts.');
      return;
    }
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
    console.log(`Post ${postId} liked.`);
  }, [isAuthenticated]);

  const handleComment = useCallback((postId, commentText) => {
    if (!isAuthenticated) {
      setPostError('You must be logged in to comment.');
      return;
    }
    if (!commentText.trim()) {
      setPostError('Comment cannot be empty.');
      return;
    }
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, comments: post.comments + 1 } : post
      )
    );
    console.log(`Comment added to post ${postId}: "${commentText}"`);
    // In a real app, you'd add the comment to a nested array within the post object
  }, [isAuthenticated]);

  const handleShare = useCallback((postId) => {
    if (!isAuthenticated) {
      setPostError('You must be logged in to share posts.');
      return;
    }
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, shares: post.shares + 1 } : post
      )
    );
    alert('Post shared!'); // Replace with a Modal or Toast
  }, [isAuthenticated]);


  // --- Conditional Rendering Logic ---
  const showOverallLoading = isLoadingAuth || isLoadingRider || isLoadingFeed || isPosting;
  const showOverallError = authError || feedError || postError;

  return (
    <MainLayout pageTitle="Rider Social Feed">
      <div className="max-w-xl mx-auto p-4">
        {showOverallLoading && <LoadingSpinner size="lg" className="my-8" />}
        {showOverallError && (
          <ErrorMessage
            message={showOverallError}
            onClose={() => {
              setFeedError(null);
              setPostError(null);
              // Auth error would be cleared via AuthContext's own mechanism or re-login
            }}
          />
        )}

        {!isAuthenticated && !isLoadingAuth && (
          <Card title="Join the Rider Community">
            <p className="text-center text-gray-600 mb-4">
              Log in or sign up to share your ride stories, connect with other riders, and get inspired!
            </p>
            <Link to="/login">
              <Button variant="primary" size="md" className="w-full mb-3">
                Login Now
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="secondary" size="md" className="w-full">
                Create Account
              </Button>
            </Link>
          </Card>
        )}

        {isAuthenticated && !showOverallLoading && !showOverallError && (
          <>
            {/* Create New Post Section */}
            <Card title="Create New Post" className="mb-6">
              <Input
                id="newPostContent"
                name="newPostContent"
                type="text"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind, rider? Share your latest adventure!"
                className="mb-4 h-24 resize-y" // Make it a textarea-like input
                label="New Post"
              />
              <Button
                onClick={handleCreatePost}
                disabled={isPosting || !newPostContent.trim()}
                variant="primary"
                size="md"
                className="w-full"
              >
                {isPosting ? 'Posting...' : 'Post to Feed'}
              </Button>
            </Card>

            {/* AI Post Suggestions (Placeholder for future AI integration) */}
            {aiSuggestions.length > 0 && (
              <Card title="AI Post Ideas for You" className="mb-6 bg-blue-50 border-blue-200">
                <p className="text-sm text-blue-700 mb-3">
                  Our AI thinks you might want to talk about:
                </p>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                  {aiSuggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-blue-600 italic">
                  (These suggestions are based on your rider profile and recent activity.)
                </p>
              </Card>
            )}

            {/* Social Feed Display */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">Latest Posts</h2>
            {posts.length === 0 ? (
              <Card>
                <p className="text-center text-gray-600 py-8">
                  No posts yet. Be the first to share your ride!
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {posts.map(post => (
                  <Card key={post.id} className="p-4">
                    <div className="flex items-center mb-3">
                      <img
                        src={post.authorAvatar}
                        alt={`${post.authorName}'s avatar`}
                        className="w-10 h-10 rounded-full mr-3 border-2 border-blue-400"
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/40x40/CCCCCC/000000?text=${post.authorName ? post.authorName[0].toUpperCase() : 'U'}`; }}
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{post.authorName}</p>
                        <p className="text-xs text-gray-500">{formatPostDate(post.timestamp)}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
                    {post.media && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img
                          src={post.media}
                          alt="Post media"
                          className="w-full h-auto object-cover"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x200/E0E0E0/666666?text=Image+Error'; }}
                        />
                      </div>
                    )}
                    {post.tripRef && (
                        <div className="text-sm text-blue-600 mb-4">
                            <span className="font-medium">Trip Reference:</span>{' '}
                            <Link to={`/rides?id=${post.tripRef.id}`} className="underline">
                                {post.tripRef.name}
                            </Link>
                        </div>
                    )}
                    <div className="flex items-center justify-between text-gray-500 text-sm border-t border-gray-100 pt-3">
                      <div className="flex space-x-4">
                        <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)} className="flex items-center">
                          <span className="mr-1">👍</span> {post.likes} Likes
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleComment(post.id, prompt('Enter your comment:'))} className="flex items-center">
                          <span className="mr-1">💬</span> {post.comments} Comments
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleShare(post.id)} className="flex items-center">
                          <span className="mr-1">🔗</span> {post.shares} Shares
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default SocialFeedPage;
