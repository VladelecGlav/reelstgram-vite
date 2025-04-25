import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Утилита для преобразования текста с URL в кликабельные ссылки
const renderTextWithLinks = (text, limit = null, isExpanded = false, handleLinkClick = null) => {
  if (!text) return '';

  // Регулярное выражение для поиска URL
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Разбиваем текст на части: обычный текст и ссылки
  const parts = text.split(urlRegex);

  // Преобразуем части в JSX
  const elements = parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          onClick={(event) => handleLinkClick ? handleLinkClick(part, event) : null}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline hover:text-blue-300"
        >
          {part}
        </a>
      );
    }
    return part;
  });

  // Если есть ограничение длины и текст не раскрыт, обрезаем его
  if (limit && !isExpanded) {
    let currentLength = 0;
    const truncatedElements = [];
    let truncated = false;

    for (const element of elements) {
      if (typeof element === 'string') {
        if (currentLength + element.length <= limit) {
          truncatedElements.push(element);
          currentLength += element.length;
        } else {
          const remainingChars = limit - currentLength;
          truncatedElements.push(element.slice(0, remainingChars));
          truncated = true;
          break;
        }
      } else {
        // Если это ссылка, считаем её длину как длину текста внутри <a>
        const linkText = element.props.children;
        if (currentLength + linkText.length <= limit) {
          truncatedElements.push(element);
          currentLength += linkText.length;
        } else {
          truncated = true;
          break;
        }
      }
    }

    return truncated ? [...truncatedElements, '...'] : truncatedElements;
  }

  return elements;
};

export default function Post({ post, channelId, onLike, navigate }) {
  const videoRef = useRef(null);
  const [loadError, setLoadError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes || 0);
  const [showShareNotification, setShowShareNotification] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    console.log('Post.jsx: Updated likes for post', post.id, 'to', post.likes);
    setLocalLikes(post.likes || 0);
    setComments(post.comments || []);
  }, [post.likes, post.comments]);

  useEffect(() => {
    if (post.type !== 'video') return;

    let observer;
    if (videoRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              console.log('Post.jsx: Video is visible, attempting to play', post.id);
              if (videoRef.current) {
                videoRef.current.play().catch((err) => {
                  console.error('Post.jsx: Error playing video:', err.message);
                });
              }
            } else {
              console.log('Post.jsx: Video is not visible, pausing', post.id);
              if (videoRef.current) {
                videoRef.current.pause();
              }
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current && observer) {
        console.log('Post.jsx: Cleaning up IntersectionObserver for video', post.id);
        observer.unobserve(videoRef.current);
        videoRef.current.pause();
      }
    };
  }, [post.id]);

  const handleError = (e) => {
    console.error(`${post.type === "video" ? "Video" : "Image"} loading error for URL:`, post.url, e);
    setLoadError(true);
  };

  const handleLoaded = () => {
    console.log(`${post.type === "video" ? "Video" : "Image"} loaded successfully for URL:`, post.url);
  };

  const handleLikeClick = () => {
    console.log('Post.jsx: Liking post', post.id, 'in channel', channelId);
    setLocalLikes(localLikes + 1);
    if (onLike) {
      onLike();
    } else {
      console.error('Post.jsx: onLike function is not provided');
    }
  };

  const handleShare = async () => {
    console.log('Post.jsx: Sharing post', post.id);
    const shareUrl = `${window.location.origin}/#/channel/${channelId}/post/${post.id}`;
    const shareData = {
      title: 'Check out this post!',
      text: post.caption,
      url: shareUrl,
    };

    try {
      if (navigator.share && typeof navigator.share === 'function') {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShowShareNotification(true);
        setTimeout(() => setShowShareNotification(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const toggleMute = () => {
    console.log('Post.jsx: Toggling mute for video', post.id);
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const handleCommentSubmit = (e) => {
    console.log('Post.jsx: Submitting comment for post', post.id);
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: comments.length + 1,
      userId: 1,
      phoneNumber: 'Anonymous',
      text: commentText,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [...prev, newComment]);
    setCommentText('');

    // Обновляем comments в localStorage
    const channels = JSON.parse(localStorage.getItem('channels')) || [];
    const updatedChannels = channels.map((ch) =>
      ch.uniqueId === channelId
        ? {
            ...ch,
            posts: ch.posts.map((p) =>
              p.id === post.id ? { ...p, comments: [...(p.comments || []), newComment] } : p
            ),
          }
        : ch
    );
    localStorage.setItem('channels', JSON.stringify(updatedChannels));
  };

  const handleToggleComments = () => {
    console.log('Post.jsx: Toggling comments visibility for post', post.id);
    setShowComments((prev) => !prev);
  };

  const handleUrlButtonClick = (url) => {
    console.log('Post.jsx: URL button clicked, opening:', url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleLinkClick = (url, event) => {
    event.preventDefault();
    const channelLinkRegex = /https:\/\/reelstgram-vite\.vercel\.app\/#\/channel\/([a-zA-Z0-9_-]+)\/post\/([0-9]+)/;
    const match = url.match(channelLinkRegex);
    
    if (match) {
      const channelUniqueId = match[1];
      const postId = match[2];
      console.log('Navigating to channel:', channelUniqueId, 'post:', postId);
      navigate(`/channel/${channelUniqueId}/post/${postId}`);
    } else {
      // Для других ссылок открываем в новой вкладке
      window.open(url, '_blank');
    }
  };

  const relativeUrl = post.url;
  console.log('Post.jsx: Attempting to load media from:', relativeUrl);
  console.log('Post.jsx: Post buttons:', post.buttons);

  const captionLimit = 50;
  const isLongCaption = post.caption.length > captionLimit;
  const displayedCaption = renderTextWithLinks(post.caption, captionLimit, isExpanded, handleLinkClick);

  if (loadError) {
    return (
      <div className="relative h-screen flex items-center justify-center bg-black snap-start">
        <div className="relative h-[100vh] max-h-[1536px] w-auto aspect-[9/16] flex items-start justify-center">
          <div className="absolute inset-0 w-full h-full bg-gray-500 opacity-50 rounded-lg"></div>
          <div className="text-white text-center z-10">
            <p>Failed to load content.</p>
            <p>URL: {post.url}</p>
            <p>Check if the file was uploaded correctly to uploads folder.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen flex items-center justify-center bg-black snap-start">
      <div className="relative h-[100vh] max-h-[1536px] w-auto aspect-[9/16] flex items-start justify-center">
        {post.type === "video" ? (
          <video
            src={relativeUrl}
            className="absolute inset-0 w-full h-full object-cover filter blur-xl rounded-lg z-0"
            loop
            muted={isMuted}
            onError={handleError}
            onLoadedData={handleLoaded}
          />
        ) : (
          <img
            src={relativeUrl}
            className="absolute inset-0 w-full h-full object-cover filter blur-xl rounded-lg z-0"
            onError={handleError}
            onLoad={handleLoaded}
          />
        )}
        {post.type === "video" ? (
          <video
            ref={videoRef}
            src={relativeUrl}
            className="relative w-full h-full object-contain rounded-lg z-0"
            loop
            muted={isMuted}
            onError={handleError}
            onLoadedData={handleLoaded}
          />
        ) : (
          <img
            src={relativeUrl}
            className="relative w-full h-full object-contain rounded-lg z-0"
            onError={handleError}
            onLoad={handleLoaded}
          />
        )}
        <div className="absolute bottom-[15%] left-4 max-w-[70%] text-white text-lg bg-black bg-opacity-50 px-2 py-1 rounded z-20">
          <p className="break-words whitespace-pre-wrap">
            {displayedCaption}
            {isLongCaption && !isExpanded && (
              <button
                onClick={() => {
                  console.log('Post.jsx: Expanding caption for post', post.id);
                  setIsExpanded(true);
                }}
                className="text-blue-400 ml-1 hover:underline"
              >
                ещё
              </button>
            )}
          </p>
        </div>
        {/* URL-кнопки */}
        {post.buttons && post.buttons.length > 0 ? (
          <div className="absolute bottom-[126px] right-[84px] flex flex-row space-x-2 z-20">
            {post.buttons.map((button, index) => (
              <button
                key={index}
                onClick={() => handleUrlButtonClick(button.url)}
                className="bg-blue-500 hover:bg-blue-600 text-white text-[28px] px-6 py-2 rounded"
              >
                {button.text}
              </button>
            ))}
          </div>
        ) : (
          <div className="absolute bottom-[126px] right-[84px] flex flex-row space-x-2 z-20">
            <p className="text-white text-sm">No URL buttons available.</p>
          </div>
        )}
        <div className="absolute right-4 bottom-32 flex flex-col items-center z-20 space-y-2">
          <motion.button
            onClick={handleLikeClick}
            className="text-white text-3xl bg-black bg-opacity-50 p-2 rounded-full"
            whileTap={{ scale: 1.2 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.3 }}
          >
            ❤️
          </motion.button>
          <span className="text-white text-sm">{localLikes}</span>
          <span className="text-white text-sm">👁️ {post.views || 0}</span>
          {post.type === "video" && (
            <motion.button
              onClick={toggleMute}
              className="text-white text-3xl bg-black bg-opacity-50 p-2 rounded-full"
              whileTap={{ scale: 1.2 }}
            >
              {isMuted ? '🔇' : '🔊'}
            </motion.button>
          )}
          <motion.button
            onClick={handleToggleComments}
            className="text-white text-3xl bg-black bg-opacity-50 p-2 rounded-full"
            whileTap={{ scale: 1.2 }}
          >
            💬
          </motion.button>
          <span className="text-white text-sm">{comments.length}</span>
          <motion.button
            onClick={handleShare}
            className="text-white text-3xl bg-black bg-opacity-50 p-2 rounded-full"
            whileTap={{ scale: 1.2 }}
          >
            ✈️
          </motion.button>
        </div>
        <AnimatePresence>
          {showShareNotification && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-16 right-4 bg-green-500 text-white px-3 py-1 rounded z-20"
            >
              Link copied!
            </motion.div>
          )}
        </AnimatePresence>
        {showComments && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 p-4 z-20 max-h-[50%] overflow-y-auto">
            <form onSubmit={handleCommentSubmit} className="flex space-x-2 mb-4">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 p-2 rounded text-black"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Post
              </button>
            </form>
            {comments.length === 0 ? (
              <p className="text-gray-400">No comments yet.</p>
            ) : (
              <div className="space-y-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="text-white">
                    <span className="font-semibold">{comment.phoneNumber}: </span>
                    <span>{comment.text}</span>
                    <p className="text-gray-400 text-sm">{new Date(comment.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}