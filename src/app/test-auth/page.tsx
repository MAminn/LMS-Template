"use client";

import { useState } from "react";

export default function SimpleLogin() {
  const [email, setEmail] = useState("admin@theacademy.com");
  const [password, setPassword] = useState("admin123");
  const [result, setResult] = useState("");

  const handleLogin = async () => {
    setResult("Testing...");

    try {
      const response = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          csrfToken: "test",
        }),
      });

      const data = await response.text();
      setResult(`Status: ${response.status}, Response: ${data}`);
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  return (
    <div className='p-8'>
      <h1 className='text-2xl mb-4'>Simple Auth Test</h1>

      <div className='space-y-4 max-w-md'>
        <input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='w-full p-2 border rounded'
          placeholder='Email'
        />

        <input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='w-full p-2 border rounded'
          placeholder='Password'
        />

        <button
          onClick={handleLogin}
          className='w-full p-2 bg-blue-500 text-white rounded'>
          Test Login
        </button>

        <div className='mt-4 p-4 bg-gray-100 rounded'>
          <pre>{result}</pre>
        </div>
      </div>
    </div>
  );
}
