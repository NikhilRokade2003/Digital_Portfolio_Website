import React, { useState, useEffect, useCallback, useRef } from 'react';
import { notificationAPI, authAPI } from '../../services/api';
import Navigation from '../components/Navigation';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);
  const navigate = useNavigate();

  // Initialize Vanta.js NET effect
  useEffect(() => {
    if (vantaRef.current && window.VANTA) {
      vantaEffect.current = window.VANTA.NET({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x3b82f6,
        backgroundColor: 0x0f172a,
        points: 15.00,
        maxDistance: 25.00,
        spacing: 18.00
      });
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }
    };
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await notificationAPI.my();
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        setIsAuthenticated(false);
      } else {
        setError('Failed to load notifications. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAuthAndFetchData = useCallback(async () => {
    try {
      const isAuth = await authAPI.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        await fetchNotifications();
      } else {
        setError('Please log in to view your notifications.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setError('Authentication error. Please try logging in again.');
      setLoading(false);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    checkAuthAndFetchData();
  }, [checkAuthAndFetchData]);

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev =>
        prev.map(notif => notif.id === id ? { ...notif, isRead: true } : notif)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'AccessRequest': '🔑',
      'AccessGranted': '✅',
      'AccessDenied': '❌',
      'PortfolioView': '👁️',
      'SystemAlert': '🚨',
      'NewMessage': '💬',
      'Default': '🔔'
    };
    return icons[type] || icons.Default;
  };

  const getNotificationColor = (type) => {
    const colors = {
      'AccessRequest': 'from-blue-500 to-cyan-500',
      'AccessGranted': 'from-green-500 to-emerald-500',
      'AccessDenied': 'from-red-500 to-pink-500',
      'PortfolioView': 'from-purple-500 to-violet-500',
      'SystemAlert': 'from-orange-500 to-red-500',
      'NewMessage': 'from-indigo-500 to-blue-500',
      'Default': 'from-gray-500 to-gray-600'
    };
    return colors[type] || colors.Default;
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread': return !notif.isRead;
      case 'read': return notif.isRead;
      case 'access': return typeof notif.type === 'string' && notif.type.includes('Access');
      case 'views': return notif.type === 'PortfolioView';
      default: return true;
    }
  });

  const filters = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: notifications.filter(n => !n.isRead).length },
    { id: 'read', label: 'Read', count: notifications.filter(n => n.isRead).length },
    { id: 'access', label: 'Access Requests', count: notifications.filter(n => typeof n.type === 'string' && n.type.includes('Access')).length },
    { id: 'views', label: 'Portfolio Views', count: notifications.filter(n => n.type === 'PortfolioView').length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden" ref={vantaRef}>
        <Navigation />
        {/* Enhanced Animated Background Elements */}
        <div className="absolute inset-0 z-1 pointer-events-none">
          <div className="live-wallpaper-shape live-wallpaper-1 opacity-20"></div>
          <div className="live-wallpaper-shape live-wallpaper-2 opacity-15"></div>
          <div className="live-wallpaper-shape live-wallpaper-3 opacity-20"></div>
          <div className="floating-particles opacity-30">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="particle"></div>
            ))}
          </div>
          <div className="aurora opacity-25"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto py-8 px-4 main-content">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-2 border-primary-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" ref={vantaRef}>
      <Navigation />
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 z-1 pointer-events-none">
        <div className="live-wallpaper-shape live-wallpaper-1 opacity-20"></div>
        <div className="live-wallpaper-shape live-wallpaper-2 opacity-15"></div>
        <div className="live-wallpaper-shape live-wallpaper-3 opacity-20"></div>
        <div className="floating-particles opacity-30">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
        <div className="aurora opacity-25"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto py-8 px-4 main-content">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Notification Center</h1>
            <p className="text-white/70">Stay updated with your portfolio activity</p>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={markAllAsRead}
              className="glass-button hover-lift"
            >
              <span className="mr-2">✓</span>
              Mark All Read
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="glass-card p-6 mb-8 border-l-4 border-red-500">
            <div className="flex items-center space-x-3">
              <span className="text-red-400 text-xl">⚠️</span>
              <div>
                <p className="text-red-300 font-medium">Error</p>
                <p className="text-white/80">{error}</p>
                {!isAuthenticated && (
                  <button
                    onClick={() => navigate('/login')}
                    className="mt-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Go to Login
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="glass-card p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-2 border-primary-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white/70">Loading notifications...</p>
          </div>
        )}

        {/* Filters */}
        {!loading && !error && (
        <div className="flex flex-wrap gap-2 mb-8 p-1 glass-card">
          {filters.map((filterItem) => (
            <button
              key={filterItem.id}
              onClick={() => setFilter(filterItem.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                filter === filterItem.id
                  ? 'bg-primary-500 text-white shadow-glow'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{filterItem.label}</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                {filterItem.count}
              </span>
            </button>
          ))}
        </div>
        )}

        {/* Notifications List */}
        {!loading && !error && (
          filteredNotifications.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Notifications</h3>
              <p className="text-white/60">
                {filter === 'all' 
                  ? "You're all caught up! No new notifications."
                  : `No ${filter} notifications found.`
                }
              </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`glass-card p-6 hover-lift cursor-pointer transition-all duration-300 ${
                  !notification.isRead ? 'ring-2 ring-primary-500/30' : ''
                }`}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getNotificationColor(notification.type)} flex items-center justify-center text-white text-xl shadow-glow`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-white/50 text-sm">
                          {formatDate(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <div className="w-3 h-3 bg-primary-500 rounded-full shadow-glow"></div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-white/70 mb-3">
                      {notification.message}
                    </p>
                    
                    {notification.actionUrl && (
                      <div className="flex items-center space-x-2">
                        <button className="px-4 py-2 bg-primary-500/20 text-primary-300 rounded-lg hover:bg-primary-500/30 transition-colors text-sm">
                          View Details
                        </button>
                      </div>
                    )}
                    
                    {notification.type && (
                      <div className="flex items-center mt-3 pt-3 border-t border-white/10">
                        <span className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded-full">
                          {notification.type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
        )}

        {/* Stats */}
        {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="glass-card p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {notifications.length}
            </div>
            <div className="text-white/60">Total Notifications</div>
          </div>
          
          <div className="glass-card p-6 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {notifications.filter(n => n.isRead).length}
            </div>
            <div className="text-white/60">Read</div>
          </div>
          
          <div className="glass-card p-6 text-center">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {notifications.filter(n => !n.isRead).length}
            </div>
            <div className="text-white/60">Unread</div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;