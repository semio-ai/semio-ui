import React from 'react';
import { Button, ButtonProps } from '../button';

interface GoogleSignInButtonProps {
  useGoogleSignIn: () => void;
}

export function GoogleSignInButton({
  useGoogleSignIn,
}: GoogleSignInButtonProps): JSX.Element {
  return (
    <Button
      onClick={useGoogleSignIn}
      className="w-full flex items-center justify-center bg-white text-gray-700 border border-gray-300 rounded-md py-2 px-4 shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
    >
      <svg
        className="w-6 h-6 mr-2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
      >
        <path
          fill="#4285F4"
          d="M47.5 24.5c0-1.7-.1-3.3-.4-4.8H24v9.2h13.4c-.6 3-2.5 5.6-5.2 7.3v6.1h8.4c4.9-4.5 7.7-11.2 7.7-18.8z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.6 0 12.2-2.2 16.2-5.9l-8.4-6.1c-2.2 1.5-5 2.4-7.8 2.4-6 0-11-4-12.8-9.4H3.3v6.2C7.3 44.1 14.9 48 24 48z"
        />
        <path
          fill="#FBBC05"
          d="M11.2 28.8C10.8 27.5 10.5 26.1 10.5 24.5s.3-3 1.7-4.3v-6.2H3.3c-1.7 3.4-2.6 7.2-2.6 11.2s1 7.8 2.6 11.2l7.9-6.2z"
        />
        <path
          fill="#EA4335"
          d="M24 9.5c3.3 0 6.2 1.1 8.5 3.3l6.4-6.4C34.5 2.3 29.9 0 24 0 14.9 0 7.3 4.9 3.3 12.3l7.9 6.2C12.9 12.9 18 9.5 24 9.5z"
        />
      </svg>
      <span>Sign in with Google</span>
    </Button>
  );
}
