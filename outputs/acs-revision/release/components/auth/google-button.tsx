import { signInWithGoogle } from "@/app/(auth)/actions";

export function GoogleSignInButton() {
  return (
    <form action={signInWithGoogle}>
      <button type="submit" className="auth-google-button">
        <svg viewBox="0 0 48 48" width="19" height="19" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.38 17.74 9.5 24 9.5Z" transform="translate(0 4)" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.97 46.98 31.77 46.98 24.55Z" transform="translate(0 -1)" />
          <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z" transform="translate(0 -1)" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.44-4.88 2.3-8.18 2.3-6.26 0-11.57-3.88-13.46-9.32l-7.98 6.19C6.51 43.22 14.62 48 24 48Z" transform="translate(0 -1)" />
        </svg>
        <span>Continue with Google</span>
      </button>
    </form>
  );
}
