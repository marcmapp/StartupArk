// Shared "who's logged in, right now, client-side" reader. Mirrors the
// inline localStorage parsing already duplicated across FollowButton /
// UpdatesFeedPage — centralized here since new engagement features
// (likes, comments) need the same check in multiple new components.
export const isLoggedIn = () => !!localStorage.getItem('token');

export const getCurrentUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return u._id || u.id || null;
  } catch {
    return null;
  }
};
