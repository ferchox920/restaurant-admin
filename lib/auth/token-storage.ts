const ACCESS_TOKEN_KEY = "restaurant_admin_access_token";
const ACCESS_TOKEN_EVENT = "restaurant-admin-access-token-change";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getAccessToken() {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  window.dispatchEvent(new Event(ACCESS_TOKEN_EVENT));
}

export function clearAccessToken() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.dispatchEvent(new Event(ACCESS_TOKEN_EVENT));
}

export function subscribeToAccessToken(onStoreChange: () => void) {
  if (!canUseStorage()) {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== ACCESS_TOKEN_KEY) {
      return;
    }

    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(ACCESS_TOKEN_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(ACCESS_TOKEN_EVENT, onStoreChange);
  };
}
