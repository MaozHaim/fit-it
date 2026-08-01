import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import FormField from '../FormField';

function SignInForm({ onSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login({ email, password });
    setLoading(false);
    if (result.success) onSuccess();
    else setError(result.error);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <FormField id="signin-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <FormField id="signin-password" label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
      {error && <p className="auth-error">{error}</p>}
      <div className="auth-submit">
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </div>
    </form>
  );
}

export default SignInForm;
