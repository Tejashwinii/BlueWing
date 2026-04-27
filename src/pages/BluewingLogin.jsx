import AuthPage from "../components/AuthPage";
import { Link } from 'react-router-dom';
import "../styles/BlueWingLogin.css";

function BlueWingLogin() {
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

          <input
            type="text"
            placeholder="Email or BlueWing member number"
            className="bw-input"
          />

          <input
            type="password"
            placeholder="Password"
            className="bw-input"
          />
          <Link to="/forgot-password" className="bw-link">
            Forgot your password?
          </Link>

          <div className="bw-checkbox">
            <input type="checkbox" defaultChecked />
            <span>Keep me logged in on this device</span>
          </div>

          <button className="bw-login-btn">Log in</button>
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