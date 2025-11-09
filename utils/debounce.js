// utils/debounce.js
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// In your Login component
const debouncedLogin = debounce(async (email, password) => {
  try {
    await login(email, password);
  } catch (error) {
    // error handling
  }
}, 1000); // Wait 1 second between attempts