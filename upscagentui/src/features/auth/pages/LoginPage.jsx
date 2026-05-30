import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../model/authSlice";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../../../shared/components/Loader";
import ErrorMessage from "../../../shared/components/ErrorMessage";
import "./AuthPage.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/quiz");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {loading && <Loader />}
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Dont have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default LoginPage;