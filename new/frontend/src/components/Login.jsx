import React, { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(`${API_BASE_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                redirect: "follow"
            });

            if (res.redirected) {
                window.location.href = res.url;
                return;
            }

            const data = await res.json();
            if (!data.success) {
                setError(data.message);
            }
        } catch (err) {
            setError("Something went wrong!");
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "auto", padding: 32 }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ width: "100%", marginBottom: 12, padding: 8 }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ width: "100%", marginBottom: 12, padding: 8 }}
                />
                <button type="submit" style={{ width: "100%", padding: 8 }}>
                    Login
                </button>
                {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
            </form>
            {/* <div style={{ marginTop: 24 }}>
                <b>Demo users:</b>
                <ul>
                    <li>aliqyaan@example.com / 123456</li>
                    <li>reniyas@example.com / 123456</li>
                    <li>dylan@example.com / 123456</li>
                    <li>romeiro@example.com / 123456</li>
                </ul>
            </div> */}
        </div>
    );
};

export default Login;