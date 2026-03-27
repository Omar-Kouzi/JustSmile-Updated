import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle, login, signup } from "../assets/firebase/auth";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  // Save login state only
  const saveLoginState = () => {
    localStorage.setItem("Loggedin", "true");
  };

  // Email/Password Login or Signup
  const handleEmailAuth = async () => {
    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }

      saveLoginState();
      navigate("/");
    } catch (error) {
      console.error("Email auth error:", error.message);
      alert(error.message);
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      saveLoginState();
      navigate("/");
    } catch (error) {
      console.error("Google Sign-In error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="Login-Page">
      <h1 className="Login-Title">{isSignup ? "Sign Up" : "Login"}</h1>
      <div className="Login-Data">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="Login-Input"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="Login-Input"
        />

        <br />
        <button onClick={handleEmailAuth}>
          {isSignup ? "Sign Up" : "Login"}
        </button>

        <button onClick={handleGoogleSignIn} className="Login-Gmail">
          Sign In with Google
        </button>

        <br />

        <p style={{ cursor: "pointer", color:"var(--static)" }} onClick={() => setIsSignup(!isSignup)}>
          {isSignup
            ? "Already have an account? Login"
            : "Don't have an account? Sign Up"}
        </p>
      </div>
    </div>
  );
};

export default Login;
