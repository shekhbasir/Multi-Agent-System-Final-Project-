const EVENT_NAME = "profile:updated";

export const emitProfileUpdate = (user) => {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: user }));
};

export const onProfileUpdate = (callback) => {
  const handler = (e) => callback(e.detail);
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
};
