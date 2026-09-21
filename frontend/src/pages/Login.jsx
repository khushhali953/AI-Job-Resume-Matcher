import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    // 1. Check empty fields
    if (!formData.email || !formData.password) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      // 2. Start loading
      setLoading(true);

      // 3. Send login request to backend
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          // Important for HTTP-only cookie
          credentials: "include",

          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        }
      );

      // 4. Convert response to JSON
      const data = await response.json();

      // 5. Check if login failed
      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      // 6. Login successful
      setMessage("Login successful!");

      // 7. Go to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        "Unable to connect to server. Please try again."
      );

    } finally {
      // 8. Stop loading
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">

          <div className="logo-icon">
            M
          </div>

          <div>
            <h2>Matchify</h2>
            <span>AI Career Platform</span>
          </div>

        </div>


        {/* Heading */}
        <div className="login-heading">

          <h1>Welcome back</h1>

          <p>
            Sign in to continue your career journey.
          </p>

        </div>


        {/* Login Form */}
        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div className="form-group">

            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
            />

          </div>


          {/* Password */}
          <div className="form-group">

            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />

          </div>


          {/* Message */}
          {message && (
            <div className="login-message">
              {message}
            </div>
          )}


          {/* Login Button */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Sign In →"}
          </button>

        </form>


        {/* Signup Link */}
        <div className="signup-text">

          Don't have an account?

          <Link to="/signup">
            Create account
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;