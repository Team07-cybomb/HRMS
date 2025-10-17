import React, { useState, useEffect, useRef, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, MessageSquare, Share, Bookmark, Pin, Calendar, User, Loader2, AlertCircle, X, Smile, Send } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Enhanced API service functions
const announcementAPI = {
  getEmployeeFeed: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          queryParams.append(key, value);
        }
      });
      
      const response = await fetch(`${API_BASE_URL}/announcements/feed?${queryParams}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Request failed with status: ${response.status}` }));
        throw new Error(errorData.message);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API getEmployeeFeed error:', error);
      throw error;
    }
  },

  toggleLike: async (id, userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/announcements/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to toggle like' }));
        throw new Error(errorData.message);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API toggleLike error:', error);
      throw error;
    }
  },

  addComment: async (id, commentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/announcements/${id}/comment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to add comment' }));
        throw new Error(errorData.message);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API addComment error:', error);
      throw error;
    }
  },

  toggleBookmark: async (id, userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/announcements/${id}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to toggle bookmark' }));
        throw new Error(errorData.message);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API toggleBookmark error:', error);
      throw error;
    }
  },

  togglePin: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/announcements/${id}/pin`, {
        method: 'PATCH'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to toggle pin' }));
        throw new Error(errorData.message);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API togglePin error:', error);
      throw error;
    }
  },

  addCommentReaction: async (announcementId, commentId, emoji, userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/announcements/${announcementId}/comment/${commentId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji, userId })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to add reaction' }));
        throw new Error(errorData.message);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API addCommentReaction error:', error);
      throw error;
    }
  }
};

// Floating Hearts Animation Component
const FloatingHearts = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-red-500 text-xl"
          initial={{ 
            scale: 0, 
            opacity: 1, 
            y: 0, 
            x: Math.random() * 100 - 50 
          }}
          animate={{ 
            scale: [0, 1.2, 0.8],
            opacity: [1, 1, 0],
            y: -120,
            x: Math.random() * 160 - 80
          }}
          transition={{ 
            duration: 1.8,
            delay: i * 0.15,
            ease: "easeOut"
          }}
          style={{
            left: `${Math.random() * 100}%`,
          }}
        >
          ❤️
        </motion.div>
      ))}
    </div>
  );
};

// Emoji Picker Component
const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠'],
    'Gestures': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
    'Objects': ['🔥', '💯', '✨', '🌟', '💫', '⭐', '🎉', '🎊', '🏆', '🥇', '🥈', '🥉', '🎁', '🎈', '🎀', '🎗️', '🎭', '🎨', '🎪', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '🎯', '🎳', '🎮', '🎰']
  };

  return (
    <div className="absolute bottom-full right-0 mb-2 bg-white border rounded-lg shadow-lg z-50 w-80 max-h-96 overflow-hidden">
      <div className="flex justify-between items-center p-3 border-b">
        <h4 className="font-semibold text-sm">Choose an emoji</h4>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="overflow-y-auto max-h-80 p-2">
        {Object.entries(emojiCategories).map(([category, emojis]) => (
          <div key={category} className="mb-4">
            <h5 className="text-xs font-medium text-gray-500 mb-2 uppercase">{category}</h5>
            <div className="grid grid-cols-8 gap-1">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onEmojiSelect(emoji)}
                  className="text-lg hover:bg-gray-100 rounded p-1 transition-colors duration-150 hover:scale-110 transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Comment Dialog Component
const CommentDialog = ({ announcement, isOpen, onClose, onCommentAdded, currentEmployee }) => {
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const emojiButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && 
          !event.target.closest('.emoji-picker') && 
          !event.target.closest('.emoji-button')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !announcement) return;

    setSaving(true);
    try {
      await announcementAPI.addComment(announcement._id, {
        content: comment.trim(),
        author: currentEmployee?.name || currentEmployee?.username || 'Employee',
        timestamp: new Date().toISOString()
      });
      setComment('');
      onCommentAdded();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSaving(false);
    }
  };

  const addEmoji = (emoji) => {
    setComment(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleEmojiReaction = async (commentId, emoji) => {
    if (!announcement || !currentEmployee) return;
    
    try {
      await announcementAPI.addCommentReaction(announcement._id, commentId, emoji, currentEmployee.id);
      onCommentAdded();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Safe access to announcement properties
  const comments = announcement?.comments || [];
  const announcementTitle = announcement?.title || '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Comments ({comments.length})
            {announcementTitle && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                on "{announcementTitle}"
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {comments.map((comment, index) => (
            <motion.div 
              key={comment._id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 p-4 bg-gray-50 rounded-lg border"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                {comment.author?.charAt(0).toUpperCase() || 'E'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-foreground">{comment.author || 'Employee'}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(comment.timestamp)}
                  </span>
                  {comment.edited && (
                    <span className="text-xs text-muted-foreground italic">(edited)</span>
                  )}
                </div>
                <p className="text-sm text-foreground mb-2 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
                
                {/* Comment Reactions */}
                {comment.reactions && comment.reactions.some(r => r.count > 0) && (
                  <div className="flex items-center gap-1 mb-2">
                    {comment.reactions
                      .filter(reaction => reaction.count > 0)
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 3)
                      .map((reaction) => (
                        <button
                          key={reaction.emoji}
                          onClick={() => handleEmojiReaction(comment._id, reaction.emoji)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors duration-200 group"
                        >
                          <span className="text-sm">{reaction.emoji}</span>
                          <span className="text-xs text-muted-foreground font-medium">
                            {reaction.count}
                          </span>
                        </button>
                      ))}
                    
                    {comment.reactions.filter(r => r.count > 0).length > 3 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        +{comment.reactions.filter(r => r.count > 0).length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                {/* Add Reaction Buttons */}
                <div className="flex items-center gap-1">
                  {['👍', '❤️', '😄', '🎉', '🔥', '👏'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiReaction(comment._id, emoji)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 p-1 rounded hover:bg-gray-200"
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const customEmoji = prompt('Enter any emoji:');
                      if (customEmoji && comment._id) {
                        handleEmojiReaction(comment._id, customEmoji);
                      }
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 p-1 rounded hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {comments.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No comments yet</p>
              <p>Be the first to share your thoughts!</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t pt-4 space-y-3">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment... (Press Enter to send, Shift+Enter for new line)"
              className="min-h-[100px] pr-12 resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={!announcement || !currentEmployee}
            />
            <div className="absolute right-2 bottom-2 flex gap-1">
              <button
                ref={emojiButtonRef}
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="emoji-button p-2 text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded transition-colors duration-200"
                disabled={!announcement || !currentEmployee}
              >
                <Smile className="w-4 h-4" />
              </button>
              
              <button
                type="submit"
                disabled={!comment.trim() || saving || !announcement || !currentEmployee}
                className="p-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded hover:bg-blue-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="emoji-picker">
              <EmojiPicker 
                onEmojiSelect={addEmoji}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}

          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>
              {currentEmployee ? `Commenting as ${currentEmployee.name}` : 'Please log in to comment'}
            </span>
            <span>{comment.length}/500</span>
          </div>
        </form>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Mock employee data - Replace this with actual authentication context
const useCurrentEmployee = () => {
  // In a real app, this would come from your authentication context
  const [currentEmployee, setCurrentEmployee] = useState(null);

  useEffect(() => {
    // Simulate fetching employee data
    const employeeData = { 
      id: 'emp123',
      name: ' John Doe',
      email: 'john.doe@company.com',
      department: 'Engineering',
      position: 'Software Developer',
      username: 'johndoe'
    };
    
    // In a real app, you might get this from:
    // - localStorage
    // - Auth context
    // - API call
    // - Session
    setCurrentEmployee(employeeData);
  }, []);

  return currentEmployee;
};

const FeedsTab = () => {
  const currentEmployee = useCurrentEmployee(); // Get current employee data
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ 
    category: 'all', 
    priority: 'all', 
    bookmarked: 'all' 
  });
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [commentDialog, setCommentDialog] = useState({ open: false, announcement: null });
  const [showHearts, setShowHearts] = useState(null);
  const [localStates, setLocalStates] = useState({});

  useEffect(() => {
    fetchAnnouncements();
  }, [filters, retryCount]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Include user ID in filters for bookmark filtering
      const filterParams = {
        ...filters,
        userId: currentEmployee?.id
      };
      
      const data = await announcementAPI.getEmployeeFeed(filterParams);
      
      if (data.success) {
        setAnnouncements(data.announcements || []);
        
        // Initialize local states for optimistic updates with actual employee data
        const initialStates = {};
        data.announcements?.forEach(ann => {
          initialStates[ann._id] = {
            liked: ann.likedBy?.includes(currentEmployee?.id) || false,
            bookmarked: ann.bookmarkedBy?.includes(currentEmployee?.id) || false,
            likes: ann.likes || 0,
            comments: ann.comments || []
          };
        });
        setLocalStates(initialStates);
      } else {
        throw new Error(data.message || 'Failed to load announcements');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError(error.message || 'Failed to load announcements. Please check if the server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (announcementId) => {
    if (!currentEmployee) {
      setError('Please log in to like announcements');
      return;
    }

    try {
      const currentState = localStates[announcementId];
      const newLikedState = !currentState?.liked;
      const newLikesCount = newLikedState ? 
        (currentState?.likes || 0) + 1 : 
        Math.max(0, (currentState?.likes || 0) - 1);

      // Optimistic update
      setLocalStates(prev => ({
        ...prev,
        [announcementId]: {
          ...prev[announcementId],
          liked: newLikedState,
          likes: newLikesCount
        }
      }));
      
      // Show hearts animation
      setShowHearts(announcementId);
      setTimeout(() => setShowHearts(null), 1800);
      
      await announcementAPI.toggleLike(announcementId, currentEmployee.id);
      // Refresh to get actual data from server
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setLocalStates(prev => ({
        ...prev,
        [announcementId]: {
          ...prev[announcementId],
          liked: !prev[announcementId]?.liked,
          likes: prev[announcementId]?.liked ? 
            Math.max(0, (prev[announcementId]?.likes || 0) - 1) : 
            (prev[announcementId]?.likes || 0) + 1
        }
      }));
    }
  };

  const handleBookmark = async (announcementId) => {
    if (!currentEmployee) {
      setError('Please log in to bookmark announcements');
      return;
    }

    try {
      const currentState = localStates[announcementId];
      const newBookmarkedState = !currentState?.bookmarked;
      
      // Optimistic update
      setLocalStates(prev => ({
        ...prev,
        [announcementId]: {
          ...prev[announcementId],
          bookmarked: newBookmarkedState
        }
      }));
      
      await announcementAPI.toggleBookmark(announcementId, currentEmployee.id);
      // Refresh to get actual data from server
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert optimistic update on error
      setLocalStates(prev => ({
        ...prev,
        [announcementId]: {
          ...prev[announcementId],
          bookmarked: !prev[announcementId]?.bookmarked
        }
      }));
    }
  };

  const handlePin = async (announcementId) => {
    try {
      await announcementAPI.togglePin(announcementId);
      await fetchAnnouncements(); // Refresh to get updated data
    } catch (error) {
      console.error('Error toggling pin:', error);
      setError('Failed to toggle pin. Please try again.');
    }
  };

  const handleComment = (announcement) => {
    if (!currentEmployee) {
      setError('Please log in to comment on announcements');
      return;
    }
    setCommentDialog({ open: true, announcement });
  };

  const handleCommentAdded = () => {
    fetchAnnouncements(); // Refresh comments
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAnnouncements();
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({ category: 'all', priority: 'all', bookmarked: 'all' });
  };

  const filteredAnnouncements = announcements.filter(ann => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      ann.title.toLowerCase().includes(searchLower) ||
      ann.content.toLowerCase().includes(searchLower) ||
      ann.author.toLowerCase().includes(searchLower);
    
    // Filter bookmarks if selected
    const matchesBookmark = filters.bookmarked === 'all' || 
      (filters.bookmarked === 'bookmarked' && localStates[ann._id]?.bookmarked);
    
    return matchesSearch && matchesBookmark;
  });

  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800 border-gray-200',
      hr: 'bg-blue-100 text-blue-800 border-blue-200',
      it: 'bg-purple-100 text-purple-800 border-purple-200',
      finance: 'bg-green-100 text-green-800 border-green-200',
      events: 'bg-pink-100 text-pink-800 border-pink-200',
      policy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      emergency: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[category] || colors.general;
  };

  const getPriorityVariant = (priority) => {
    const variants = {
      low: 'outline',
      normal: 'secondary',
      high: 'default',
      urgent: 'destructive'
    };
    return variants[priority] || 'secondary';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const hasActiveFilters = searchTerm || 
    filters.category !== 'all' || 
    filters.priority !== 'all' || 
    filters.bookmarked !== 'all';

  if (error && (error.includes('Server error') || error.includes('backend server'))) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">Server Connection Error</h3>
        <p className="text-muted-foreground mb-4 max-w-md">{error}</p>
        <Button onClick={handleRetry} className="mt-4">
          <Loader2 className="w-4 h-4 mr-2" />
          Retry Connection
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Dialog */}
      <CommentDialog
        announcement={commentDialog.announcement}
        isOpen={commentDialog.open}
        onClose={() => setCommentDialog({ open: false, announcement: null })}
        onCommentAdded={handleCommentAdded}
        currentEmployee={currentEmployee}
      />

      {/* Error Alert */}
      {error && !error.includes('Server error') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setError(null)}
            className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
          >
            Dismiss
          </Button>
        </motion.div>
      )}

      {/* User Info Banner */}
      {currentEmployee && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
              {currentEmployee.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-foreground">Welcome, {currentEmployee.name}</p>
              <p className="text-sm text-muted-foreground">{currentEmployee.department} • {currentEmployee.position}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements by title, content, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </form>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 border rounded-lg bg-background capitalize min-w-32"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="hr">HR</option>
            <option value="it">IT</option>
            <option value="finance">Finance</option>
            <option value="events">Events</option>
            <option value="policy">Policy</option>
            <option value="emergency">Emergency</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="px-3 py-2 border rounded-lg bg-background capitalize min-w-32"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <select
            value={filters.bookmarked}
            onChange={(e) => setFilters(prev => ({ ...prev, bookmarked: e.target.value }))}
            className="px-3 py-2 border rounded-lg bg-background capitalize min-w-32"
          >
            <option value="all">All Announcements</option>
            <option value="bookmarked">Bookmarked Only</option>
          </select>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="px-3 py-2 border-gray-300"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {sortedAnnouncements.length} of {announcements.length} announcements
        </p>
        {filters.bookmarked === 'bookmarked' && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Bookmark className="w-3 h-3 mr-1" />
            Bookmarked
          </Badge>
        )}
      </div>

      {/* Announcements List */}
      <AnimatePresence mode="popLayout">
        {sortedAnnouncements.length > 0 ? (
          <div className="space-y-6">
            {sortedAnnouncements.map((announcement) => (
              <motion.div
                key={announcement._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                {/* Floating Hearts Animation */}
                {showHearts === announcement._id && <FloatingHearts />}
                
                <Card className={`
                  relative transition-all duration-300 hover:shadow-lg border-2
                  ${announcement.isPinned 
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md' 
                    : 'border-transparent hover:border-gray-200'
                  }
                  ${localStates[announcement._id]?.bookmarked ? 'ring-1 ring-blue-200' : ''}
                `}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {announcement.isPinned && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
                              <Pin className="w-3 h-3" />
                              Pinned
                            </Badge>
                          )}
                          <CardTitle className="text-lg break-words">
                            {announcement.title}
                          </CardTitle>
                        </div>
                        {/* Fixed: Replaced CardDescription with div to avoid nesting issues */}
                        <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {announcement.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(announcement.createdAt)}
                          </span>
                          <Badge className={getCategoryColor(announcement.category)}>
                            {announcement.category}
                          </Badge>
                          <Badge variant={getPriorityVariant(announcement.priority)}>
                            {announcement.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Pin/Unpin Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePin(announcement._id)}
                        className="flex items-center gap-1 flex-shrink-0"
                        title={announcement.isPinned ? 'Unpin announcement' : 'Pin announcement'}
                      >
                        <Pin className={`w-4 h-4 transition-colors ${
                          announcement.isPinned ? 'text-blue-600 fill-blue-600' : 'text-gray-400'
                        }`} />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-3">
                    <p className="text-sm whitespace-pre-line break-words">
                      {announcement.content}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="pt-3 flex-col items-stretch">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(announcement._id)}
                          className="flex items-center gap-2 relative"
                          disabled={!currentEmployee}
                        >
                          <Heart className={`w-4 h-4 transition-colors ${
                            localStates[announcement._id]?.liked ? 'fill-red-600 text-red-600' : 'text-gray-600'
                          }`} />
                          <span className="font-medium">
                            {localStates[announcement._id]?.likes || 0}
                          </span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleComment(announcement)}
                          className="flex items-center gap-2"
                          disabled={!currentEmployee}
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="font-medium">
                            {announcement.comments?.length || 0}
                          </span>
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookmark(announcement._id)}
                          className={`flex items-center gap-2 ${
                            localStates[announcement._id]?.bookmarked 
                              ? 'text-blue-600 hover:text-blue-700' 
                              : 'text-gray-600'
                          }`}
                          title={localStates[announcement._id]?.bookmarked ? 'Remove bookmark' : 'Bookmark this announcement'}
                          disabled={!currentEmployee}
                        >
                          <Bookmark className={`w-4 h-4 transition-colors ${
                            localStates[announcement._id]?.bookmarked ? 'fill-blue-600' : ''
                          }`} />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          title="Share announcement"
                        >
                          <Share className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Comments Preview */}
                    {announcement.comments && announcement.comments.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="space-y-3">
                          {announcement.comments.slice(0, 2).map((comment, index) => (
                            <div key={comment._id || index} className="flex gap-3">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium text-white">
                                {comment.author?.charAt(0).toUpperCase() || 'E'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-medium text-foreground">
                                    {comment.author || 'Employee'}
                                  </p>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(comment.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground break-words">
                                  {comment.content}
                                </p>
                                
                                {/* Comment Reactions Preview */}
                                {comment.reactions && comment.reactions.some(r => r.count > 0) && (
                                  <div className="flex items-center gap-1 mt-1">
                                    {comment.reactions
                                      .filter(reaction => reaction.count > 0)
                                      .sort((a, b) => b.count - a.count)
                                      .slice(0, 2)
                                      .map((reaction) => (
                                        <span key={reaction.emoji} className="text-xs bg-white border rounded px-1">
                                          {reaction.emoji} {reaction.count}
                                        </span>
                                      ))}
                                    {comment.reactions.filter(r => r.count > 0).length > 2 && (
                                      <span className="text-xs text-muted-foreground">
                                        +{comment.reactions.filter(r => r.count > 0).length - 2}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          {announcement.comments.length > 2 && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="p-0 h-auto text-blue-600 font-medium"
                              onClick={() => handleComment(announcement)}
                              disabled={!currentEmployee}
                            >
                              View {announcement.comments.length - 2} more comments
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="text-center p-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-muted-foreground text-lg">
                  {hasActiveFilters 
                    ? 'No announcements match your current filters.' 
                    : 'No company announcements at the moment.'
                  }
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedsTab;