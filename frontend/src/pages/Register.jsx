import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const submit = async (e) => {
    e.preventDefault();
    await register(form);
    nav("/login");
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <br /><br />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <br /><br />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <br /><br />
        <input
          placeholder="Confirm Password"
          type="password"
          value={form.password2}
          onChange={(e) => setForm({ ...form, password2: e.target.value })}
        />
        <br /><br />

        <button>Register</button>
      </form>
    </div>
  );
}
