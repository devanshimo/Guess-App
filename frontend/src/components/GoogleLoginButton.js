import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import client from "../api/client";
import { useAuth } from "../auth/AuthProvider";

export default function GoogleLoginButton() {
  const { setUser } = useAuth();

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        try {
          const id_token = credentialResponse.credential;

          const res = await client.post("/users/google/", {
            id_token,
          });

          const { access, refresh } = res.data;

          localStorage.setItem("access", access);
          localStorage.setItem("refresh", refresh);

          setUser({ ok: true });

          window.location.href = "/stocks";
        } catch (error) {
          console.error("Google auth failed", error);
          alert("Google login failed");
        }
      }}
      onError={() => {
        console.log("Login Failed");
      }}
    />
  );
}
