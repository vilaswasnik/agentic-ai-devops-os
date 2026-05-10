// Shared Authentication Helper for all pages
// Import this in every page that requires authentication

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Get auth headers for API calls
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

// Check if user is authenticated
function isAuthenticated() {
  return !!getAuthToken();
}

// Get user info
function getUserInfo() {
  return {
    username: localStorage.getItem('username'),
    role: localStorage.getItem('userRole')
  };
}

// Logout function
function logout() {
  // Call logout endpoint
  fetch('/api/logoff', {
    method: 'POST',
    headers: getAuthHeaders()
  }).catch(err => console.error('Logout error:', err));
  
  // Clear localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('username');
  
  // Redirect to login
  window.location.href = '/login.html';
}

// Check authentication on page load (for protected pages)
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

// Handle 401/403 responses globally
function handleAuthError(response) {
  if (response.status === 401 || response.status === 403) {
    console.warn('Authentication failed, redirecting to login');
    logout();
    return true;
  }
  return false;
}

// Enhanced fetch with automatic token inclusion
async function authenticatedFetch(url, options = {}) {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // Auto-logout on auth errors
  if (handleAuthError(response)) {
    throw new Error('Authentication failed');
  }
  
  return response;
}

// Display user info in header
function displayUserInfo(elementId = 'user-info') {
  const userInfo = getUserInfo();
  const element = document.getElementById(elementId);
  
  if (element && userInfo.username) {
    element.innerHTML = `
      <span class="user-badge">
        <span class="user-icon">👤</span>
        <span class="user-name">${userInfo.username}</span>
        <span class="user-role">${userInfo.role}</span>
        <button onclick="logout()" class="logout-btn" title="Logout">⏻</button>
      </span>
    `;
  }
}

// Initialize auth on page load (call this at the end of your page)
function initAuth(requireLogin = false) {
  if (requireLogin && !requireAuth()) {
    return false;
  }
  
  // Display user info if authenticated
  if (isAuthenticated()) {
    displayUserInfo();
  }
  
  return true;
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getAuthToken,
    getAuthHeaders,
    isAuthenticated,
    getUserInfo,
    logout,
    requireAuth,
    handleAuthError,
    authenticatedFetch,
    displayUserInfo,
    initAuth
  };
}
