/**
 * Firebase for the private dashboard at /admin — and nothing else on the site.
 *
 * The web config below is public by design (every Firebase web page ships one): it names the project, it grants
 * nothing. Access is decided by Firestore's rules in the Hangly repository (firebase/firestore.rules), which let
 * exactly one verified email address read /stats and nobody read anything else. Sign-in is Firebase Auth's email
 * link, so there is no password to store or leak.
 */
import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  type Auth, getAuth, isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink, signOut as firebaseSignOut,
} from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";

const config = {
  apiKey: "AIzaSyBYOCLnF-Wlgyh-gYn5wPefgKISx0O4wLA",
  authDomain: "hangly-sm.firebaseapp.com",
  projectId: "hangly-sm",
  appId: "1:491003710181:web:51acd33e0a779177c9e20c",
};

let app: FirebaseApp | undefined;

function firebase(): FirebaseApp {
  app ??= getApps()[0] ?? initializeApp(config);
  return app;
}

export const auth = (): Auth => getAuth(firebase());
export const db = (): Firestore => getFirestore(firebase());

const EMAIL_KEY = "hangly-admin-email";

/** Emails a sign-in link that returns to this page. */
export async function sendLink(email: string): Promise<void> {
  await sendSignInLinkToEmail(auth(), email, { url: `${window.location.origin}/admin/`, handleCodeInApp: true });
  window.localStorage.setItem(EMAIL_KEY, email);
}

/** Completes a sign-in when this page was opened from the emailed link. Returns whether it did. */
export async function completeLinkSignIn(askEmail: () => string | null): Promise<boolean> {
  const href = window.location.href;
  if (!isSignInWithEmailLink(auth(), href)) return false;
  // Opened on another device or browser than the one that asked: the address has to be typed again.
  const email = window.localStorage.getItem(EMAIL_KEY) ?? askEmail();
  if (!email) return false;
  await signInWithEmailLink(auth(), email, href);
  window.localStorage.removeItem(EMAIL_KEY);
  window.history.replaceState(null, "", "/admin/");
  return true;
}

export const signOut = () => firebaseSignOut(auth());
