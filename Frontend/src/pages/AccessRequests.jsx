import React, { useState, useEffect, useCallback, useRef } from 'react';
import { accessRequestAPI, authAPI } from '../../services/api';
import Navigation from '../components/Navigation';
import { useNavigate } from 'react-router-dom';

const AccessRequests = () => {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const [processingId, setProcessingId] = useState(null);
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

  const fetchAccessRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try to fetch both received and sent requests with silent error handling
      const [receivedRes, sentRes] = await Promise.allSettled([
        accessRequestAPI.myReceived(),
        accessRequestAPI.mySent()
      ]);
      
      // Handle received requests result
      if (receivedRes.status === 'fulfilled') {
        setReceivedRequests(receivedRes.value.data || []);
      } else {
        // Silent error handling - no logging
        setReceivedRequests([]);
      }
      
      // Handle sent requests result
      if (sentRes.status === 'fulfilled') {
        setSentRequests(sentRes.value.data || []);
      } else {
        // Silent error handling - no logging
        setSentRequests([]);
      }
      
      // Only show error if both failed
      if (receivedRes.status === 'rejected' && sentRes.status === 'rejected') {
        // Check if it's a server configuration issue (500 errors)
        const is500Error = receivedRes.reason?.response?.status === 500 || 
                           sentRes.reason?.response?.status === 500;
        
        if (is500Error) {
          setError('Access requests feature is currently unavailable. Please check back later.');
        } else {
          setError('Unable to load access requests. Please try again.');
        }
      }
      
    } catch (error) {
      // Silent error handling - no logging to keep console clean
      setError('Access requests feature is currently unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAuthAndFetchData = useCallback(async () => {
    try {
      const isAuth = await authAPI.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        await fetchAccessRequests();
      } else {
        setError('Please log in to view your access requests.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setError('Authentication error. Please try logging in again.');
      setLoading(false);
    }
  }, [fetchAccessRequests]);

  useEffect(() => {
    checkAuthAndFetchData();
  }, [checkAuthAndFetchData]);

  const handleApprove = async (requestId, note = '') => {
    try {
      setProcessingId(requestId);
      await accessRequestAPI.approve(requestId, note);
      
      // Update the request status locally
      setReceivedRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: 'Approved', responseNote: note, respondedAt: new Date().toISOString() }
            : req
        )
      );

      // Show success message
      alert('✅ Access request approved successfully! The user will be notified via email and can now view your portfolio.');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('❌ Failed to approve request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId, note = '') => {
    try {
      setProcessingId(requestId);
      await accessRequestAPI.reject(requestId, note);
      
      // Update the request status locally
      setReceivedRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: 'Rejected', responseNote: note, respondedAt: new Date().toISOString() }
            : req
        )
      );

      // Show success message
      alert('❌ Access request rejected. The user will be notified via email.');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('❌ Failed to reject request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'from-yellow-500 to-orange-500',
      'Approved': 'from-green-500 to-emerald-500',
      'Rejected': 'from-red-500 to-pink-500'
    };
    return colors[status] || 'from-gray-500 to-gray-600';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': '⏳',
      'Approved': '✅',
      'Rejected': '❌'
    };
    return icons[status] || '❓';
  };

  const tabs = [
    { id: 'received', label: 'Received', count: receivedRequests.length, icon: '📥' },
    { id: 'sent', label: 'Sent', count: sentRequests.length, icon: '📤' }
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
        <div className="relative z-10 max-w-6xl mx-auto py-8 px-4 main-content">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-2 border-primary-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  const RequestCard = ({ request, type }) => {
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [note, setNote] = useState('');

    return (
      <div className="glass-card p-6 hover-lift">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {type === 'received' 
                ? request.requester?.fullName?.charAt(0) || 'R'
                : request.portfolio?.user?.fullName?.charAt(0) || 'P'
              }
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                {type === 'received' 
                  ? `Request from ${request.requester?.fullName || 'Unknown'}`
                  : `Request to ${request.portfolio?.user?.fullName || 'Unknown'}`
                }
              </h3>
              <p className="text-white/60 text-sm mb-2">
                Portfolio: <span className="text-white">{request.portfolio?.title}</span>
              </p>
              <p className="text-white/50 text-xs">
                Requested on {formatDate(request.requestedAt)}
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getStatusColor(request.status)} text-white flex items-center space-x-1`}>
            <span>{getStatusIcon(request.status)}</span>
            <span>{request.status}</span>
          </div>
        </div>

        {request.message && (
          <div className="bg-white/5 rounded-lg p-4 mb-4">
            <p className="text-white/80 text-sm">
              <span className="text-white/60">Message: </span>
              {request.message}
            </p>
          </div>
        )}

        {request.responseNote && (
          <div className="bg-white/5 rounded-lg p-4 mb-4">
            <p className="text-white/80 text-sm">
              <span className="text-white/60">Response: </span>
              {request.responseNote}
            </p>
            <p className="text-white/50 text-xs mt-2">
              Responded on {formatDate(request.respondedAt)}
            </p>
          </div>
        )}

        {type === 'sent' && request.status === 'Approved' && (
          <div className="mt-4">
            <button
              onClick={() => navigate(`/portfolio/view/${request.portfolio.id}`)}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>👁️</span>
              <span className="font-semibold">View Portfolio</span>
              <span>🚀</span>
            </button>
            <p className="text-center text-green-300 text-xs mt-2">
              ✨ You now have access to this private portfolio!
            </p>
          </div>
        )}

        {type === 'received' && request.status === 'Pending' && (
          <div className="space-y-3">
            {showNoteInput && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <label className="flex items-center space-x-2 text-white/80 text-sm font-medium mb-2">
                  <span>💬</span>
                  <span>Add a personal note (optional)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a personal message to explain your decision..."
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  rows="3"
                />
                <p className="text-white/50 text-xs mt-2">
                  This note will be included in the email notification to the requester.
                </p>
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to approve access to "${request.portfolio?.title}" for ${request.requester?.fullName}?`)) {
                    handleApprove(request.id, note);
                  }
                }}
                disabled={processingId === request.id}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                {processingId === request.id ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <span>✅</span>
                    <span>Grant Access</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to reject the access request from ${request.requester?.fullName}?`)) {
                    handleReject(request.id, note);
                  }
                }}
                disabled={processingId === request.id}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                {processingId === request.id ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <span>❌</span>
                    <span>Reject Request</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowNoteInput(!showNoteInput)}
                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                title="Add a personal note"
              >
                <span>💬</span>
                <span className="hidden sm:inline">Note</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const currentRequests = activeTab === 'received' ? receivedRequests : sentRequests;
  const pendingCount = currentRequests.filter(r => r.status === 'Pending').length;

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
      
      <div className="relative z-10 max-w-6xl mx-auto py-8 px-4 main-content">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Access Requests</h1>
          <p className="text-white/70">Manage portfolio access requests</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 p-1 bg-white/10 rounded-xl backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-glow'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
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
            <p className="text-white/70">Loading access requests...</p>
          </div>
        )}

        {/* Content - Stats and Requests */}
        {!loading && !error && (
        <>
        {/* Stats */}
        {activeTab === 'received' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass-card p-6 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {receivedRequests.length}
              </div>
              <div className="text-white/60">Total Received</div>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {pendingCount}
              </div>
              <div className="text-white/60">Pending</div>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {receivedRequests.filter(r => r.status === 'Approved').length}
              </div>
              <div className="text-white/60">Approved</div>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="text-2xl font-bold text-red-400 mb-1">
                {receivedRequests.filter(r => r.status === 'Rejected').length}
              </div>
              <div className="text-white/60">Rejected</div>
            </div>
          </div>
        )}

        {/* Requests List */}
        {currentRequests.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <div className="text-6xl mb-4">
              {activeTab === 'received' ? '📥' : '📤'}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No {activeTab} requests
            </h3>
            <p className="text-white/60">
              {activeTab === 'received' 
                ? "You haven't received any access requests yet."
                : "You haven't sent any access requests yet."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {currentRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                type={activeTab}
              />
            ))}
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default AccessRequests;