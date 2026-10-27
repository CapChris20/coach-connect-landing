// WaitlistForm.jsx — the founding signup. Creates a real Coach Connect login
// (Firebase, same project as the app) so the person can sign straight into the
// TestFlight beta. Flow: pick a side → name, email, password → account created
// → success message with what to do next.
// Firebase is loaded only when someone submits, so pages stay light.
import { useState } from 'react';
import { TESTFLIGHT_URL } from '../data/content';
import { AppleIcon, CheckIcon } from '../components/Icons';

const ROLES = [
  { id: 'trainer', label: 'I coach' },
  { id: 'client', label: 'I train' },
];

// Manipulate here: Firebase's own minimum is 6.
const MIN_PASSWORD_LENGTH = 6;

/**
 * Check the form before anything leaves the browser.
 * @param {{ fullName: string, emailAddress: string, password: string }} fields
 * @returns {string} an error sentence, or '' when the form is fine
 */
function findFormProblem(fields) {
  if (!fields.fullName.trim()) return 'Add your name so the app can greet you.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.emailAddress.trim())) return 'That email does not look right. Check it and try again.';
  if (fields.password.length < MIN_PASSWORD_LENGTH) return `Use a password of at least ${MIN_PASSWORD_LENGTH} characters.`;
  return '';
}

/**
 * @param {{ defaultRole?: 'trainer' | 'client' }} props
 * @returns {JSX.Element}
 */
export function WaitlistForm({ defaultRole = 'trainer' }) {
  const [role, setRole] = useState(defaultRole);
  const [fields, setFields] = useState({ fullName: '', emailAddress: '', password: '' });
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const updateField = (event) => setFields((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    // 1. Validate locally first.
    event.preventDefault();
    const problem = findFormProblem(fields);
    if (problem) {
      setErrorMessage(problem);
      return;
    }

    // 2. Load Firebase now (not on page load) and create the login.
    setErrorMessage('');
    setStatus('saving');
    try {
      const { hasFirebaseWebConfig } = await import('./firebaseClient');
      if (!hasFirebaseWebConfig()) throw Object.assign(new Error('config'), { code: 'site/not-configured' });
      const { createWaitlistAccount, explainAuthError } = await import('./createWaitlistAccount');
      try {
        await createWaitlistAccount({ fullName: fields.fullName.trim(), emailAddress: fields.emailAddress.trim(), password: fields.password });
      } catch (authError) {
        throw Object.assign(new Error(explainAuthError(authError)), { code: 'site/explained' });
      }
      setStatus('done');
    } catch (saveError) {
      // 3. Say what went wrong in words the visitor can act on.
      setStatus('idle');
      if (saveError.code === 'site/explained') setErrorMessage(saveError.message);
      else if (saveError.code === 'site/not-configured') setErrorMessage('Sign-up is not connected on this preview yet. Grab the TestFlight beta below in the meantime.');
      else setErrorMessage('We could not create your login just now. Try again in a minute.');
    }
  };

  if (status === 'done') {
    return (
      <div className="waitlist-done" role="status">
        <span className="waitlist-done-icon">
          <CheckIcon />
        </span>
        <h3 className="h-card">You are on the list.</h3>
        <p className="body">
          Your Coach Connect login is ready. We will email {fields.emailAddress.trim()} when doors open. Want in now? Install the
          beta and sign in with the same email and password.
        </p>
        <a className="btn btn-secondary" href={TESTFLIGHT_URL} target="_blank" rel="noreferrer">
          <AppleIcon />
          Get the iOS beta
        </a>
      </div>
    );
  }

  return (
    <form className="waitlist-form" onSubmit={submit} noValidate>
      <fieldset className="role-toggle">
        <legend className="mono">I am joining as</legend>
        <div className="role-toggle-options">
          {ROLES.map((roleOption) => (
            <label key={roleOption.id} className="role-toggle-option">
              <input type="radio" name="role" value={roleOption.id} checked={role === roleOption.id} onChange={() => setRole(roleOption.id)} />
              <span>{roleOption.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="waitlist-name">Full name</label>
        <input id="waitlist-name" name="fullName" autoComplete="name" value={fields.fullName} onChange={updateField} />
      </div>
      <div className="field">
        <label htmlFor="waitlist-email">Email</label>
        <input id="waitlist-email" name="emailAddress" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" value={fields.emailAddress} onChange={updateField} />
      </div>
      <div className="field">
        <label htmlFor="waitlist-password">Password for the app</label>
        <input id="waitlist-password" name="password" type="password" autoComplete="new-password" aria-describedby="waitlist-password-hint" value={fields.password} onChange={updateField} />
        <p id="waitlist-password-hint" className="field-hint">At least 6 characters. You will use it to sign in to the app.</p>
      </div>

      <p className="form-error" role="alert">
        {errorMessage}
      </p>

      <button type="submit" className="btn btn-primary waitlist-submit" disabled={status === 'saving'}>
        {status === 'saving' ? 'Creating your login' : role === 'trainer' ? 'Join as a founding trainer' : 'Join the waitlist'}
      </button>
      <p className="field-hint">One email when we open. Free for clients. Trainers start with a 3-day free trial.</p>
    </form>
  );
}
