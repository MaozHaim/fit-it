import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import FormField from '../FormField';

function RegisterForm({ onSuccess }) {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const result = await register({ firstName, lastName, email, password });
    setLoading(false);
    if (result.success) onSuccess();
    else setError(result.error);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <FormField id="reg-first-name" label="First Name" value={firstName} onChange={setFirstName} autoComplete="given-name" />
      <FormField id="reg-last-name" label="Last Name" value={lastName} onChange={setLastName} autoComplete="family-name" />
      <FormField id="reg-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <FormField id="reg-password" label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
      <FormField id="reg-confirm-password" label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
      {error && <p className="auth-error">{error}</p>}
      <div className="auth-submit">
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </div>
    </form>
  );
}

export default RegisterForm;
