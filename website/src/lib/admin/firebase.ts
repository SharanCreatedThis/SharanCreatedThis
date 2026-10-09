/**
 * Firebase for the private dashboard at /admin — and nothing else on the site.
 *
 * The web config below is public by design (every Firebase web page ships one): it names the project, it grants
 * nothing. Access is decided by Firestore's rules in the Hangly repository (firebase/firestore.rules), which let
 * exactly one verified email address read /stats and nobody read anything else. Sign-in is with Google, so there is
 * no password here to store or leak and no email to send.
 */
import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  type Auth, GoogleAuthProvider, connectAuthEmulator, getAuth, signInWithPopup, signInWithRedirect,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { type Firestore, connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const config = {
  apiKey: "AIzaSyBYOCLnF-Wlgyh-gYn5wPefgKISx0O4wLA",
  authDomain: "hangly-sm.firebaseapp.com",
  projectId: "hangly-sm",
  appId: "1:491003710181:web:51acd33e0a779177c9e20c",
};

let app: FirebaseApp | undefined;

/**
 * Local testing only: `NEXT_PUBLIC_FIREBASE_EMULATORS=1 npm run dev`, with `firebase emulators:start` running in the
 * Hangly repository's firebase folder. Inlined at build time, so a production build — which never sets it — cannot
 * point anywhere but the real project.
 */
export const EMULATED = process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === "1";
let connected = false;

function firebase(): FirebaseApp {
  app ??= getApps()[0] ?? initializeApp(config);
  if (EMULATED && !connected) {
    connected = true;
    connectAuthEmulator(getAuth(app), "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(getFirestore(app), "127.0.0.1", 8080);
  }
  return app;
}

export const auth = (): Auth => getAuth(firebase());
export const db = (): Firestore => getFirestore(firebase());

/**
 * Signs in with Google. No email is sent — the email-link sign-in this replaced landed in spam, and Firebase's hosted
 * link handler refused the link ("The selected page mode is invalid"). A Google account's address is verified, which
 * is what the Firestore rules require. Falls back to a full-page redirect when the browser blocks the popup.
 */
export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    await signInWithPopup(auth(), provider);
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-environment") {
      await signInWithRedirect(auth(), provider);
      return;
    }
    throw error;
  }
}

export const signOut = () => firebaseSignOut(auth());
