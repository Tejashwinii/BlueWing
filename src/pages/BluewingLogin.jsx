import AuthPage from "../components/AuthPage";
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import "../styles/BlueWingLogin.css";

function BlueWingLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Admin credentials check
    if (email === 'admin@gmail.com' && password === 'admin@BlueWing') {
      login({ email, firstName: 'Admin', role: 'admin' });
      navigate('/admin-dashboard');
      return;
    }

    // Check registered users in localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      login({ email, firstName: user.firstName, role: 'user' });
      navigate('/');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <AuthPage>
      <div className="bw-page">
      <h1 className="bw-title">Log in to BlueWing</h1>
      <p className="bw-subtitle">
        Earn points every time you fly with us and our partners.
        Redeem them for exclusive travel rewards.
      </p>

      <div className="bw-card">
        {/* LEFT SECTION */}
        <div className="bw-left">
          <h2 className="bw-section-title">Login</h2>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email or BlueWing member number"
              className="bw-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="bw-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Link to="/forgot-password" className="bw-link">
              Forgot your password?
            </Link>

            <div className="bw-checkbox">
              <input type="checkbox" defaultChecked />
              <span>Keep me logged in on this device</span>
            </div>

            {error && <p style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{error}</p>}

            <button type="submit" className="bw-login-btn">Log in</button>
          </form>
        </div>

        {/* RIGHT SECTION */}
        <div className="bw-right">
          <h2 className="bw-section-title">
            Not a BlueWing member yet?
          </h2>
          <p>
            Register now to make the most of every mile with{" "}
            <strong>BlueWing Rewards</strong>
          </p>

          <Link to="/registration" className="bw-join-btn">
            Join now
          </Link>
        </div>
      </div>
      </div>
    </AuthPage>
  );
}

export default BlueWingLogin;