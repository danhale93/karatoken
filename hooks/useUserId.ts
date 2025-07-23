import { getAuth } from 'firebase/auth';

export function getCurrentUserId() {
  const auth = getAuth();
  const user = auth.currentUser;
  return user ? user.uid : null;
}
