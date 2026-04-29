import React from "react";
import GoogleLoginButton from "../components/GoogleLoginButton";

export default function Login() {
  return (
    <div style={{ padding: 40 }}>
      <h2>Login</h2>

      <p>Use your Google account to sign in:</p>

      <GoogleLoginButton />
    </div>
  );
}
