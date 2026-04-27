import Navbar from './Navbar';
import '../styles/AuthPage.css';

function AuthPage({ children }) {
  return (
    <>
      <Navbar hideLogin />
      <main className="auth-page">{children}</main>
    </>
  );
}

export default AuthPage;
