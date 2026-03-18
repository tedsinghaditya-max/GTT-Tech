import { useState } from "react";

const initialLoginForm = {
  email: "admin@fleetflow.com",
  password: "Admin@123"
};

const initialSignupForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: ""
};

export function LoginPage({ onLogin, onSignup }) {
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [signupForm, setSignupForm] = useState(initialSignupForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "login") {
        await onLogin(loginForm);
      } else {
        await onSignup({
          ...signupForm,
          confirmPassword: signupForm.password
        });
        setSuccess("Account created successfully. You are now signed in.");
        setSignupForm(initialSignupForm);
      }
    } catch (authError) {
      setError(authError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setSuccess("");
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div>
          <p className="eyebrow">Easy Fleet / Aasan Fleet</p>
          <h1>Bus ka daily kaam simple rakho.</h1>
          <p className="lead">
            Ek screen mein bus, diesel aur profit dekho.
          </p>

          <div className="auth-benefits">
            <div className="benefit-card">
              <strong>Safe Login</strong>
              <p>Secure access for staff and admin.</p>
            </div>
            <div className="benefit-card">
              <strong>Quick Signup</strong>
              <p>Naya user jaldi add karo.</p>
            </div>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="auth-toggle">
            <button
              className={mode === "login" ? "toggle-chip toggle-chip-active" : "toggle-chip"}
              onClick={() => switchMode("login")}
              type="button"
            >
              Login / Enter
            </button>
            <button
              className={mode === "signup" ? "toggle-chip toggle-chip-active" : "toggle-chip"}
              onClick={() => switchMode("signup")}
              type="button"
            >
              Signup / New
            </button>
          </div>

          {mode === "signup" ? (
            <>
              <label>
                Name / Naam
                <input
                  type="text"
                  value={signupForm.name}
                  onChange={(event) =>
                    setSignupForm((current) => ({
                      ...current,
                      name: event.target.value
                    }))
                  }
                  placeholder="Operations Manager"
                />
              </label>

              <label>
                Email / Mail
                <input
                  type="email"
                  value={signupForm.email}
                  onChange={(event) =>
                    setSignupForm((current) => ({
                      ...current,
                      email: event.target.value
                    }))
                  }
                  placeholder="name@company.com"
                />
              </label>

              <label>
                Password / Code
                <input
                  type="password"
                  value={signupForm.password}
                  onChange={(event) =>
                    setSignupForm((current) => ({
                      ...current,
                      password: event.target.value
                    }))
                  }
                  placeholder="Min 8 chars"
                />
              </label>
            </>
          ) : (
            <>
              <label>
                Email / Mail
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      email: event.target.value
                    }))
                  }
                  placeholder="admin@fleetflow.com"
                />
              </label>

              <label>
                Password / Code
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      password: event.target.value
                    }))
                  }
                  placeholder="Enter your password"
                />
              </label>
            </>
          )}

          {error ? <p className="error-text">{error}</p> : null}
          {success ? <p className="success-text">{success}</p> : null}

          <button className="primary-button" disabled={submitting} type="submit">
            {submitting
              ? mode === "login"
                ? "Login..."
                : "Creating..."
              : mode === "login"
                ? "Login / Enter"
                : "Create / Banao"}
          </button>

          <p className="auth-helper">
            {mode === "login"
              ? "Admin se login karo ya naya user banao."
              : "Strong password rakho."}
          </p>
        </form>
      </div>
    </div>
  );
}
