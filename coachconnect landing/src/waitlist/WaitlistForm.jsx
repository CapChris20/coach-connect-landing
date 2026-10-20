// WaitlistForm — signup that becomes a real Coach Connect login, then onboarding.
// Flow: name + email + password + role → create the Auth user in anatrox-auth →
// a few setup questions → save the same profile the app reads → confirmation.
// After that, signing into the phone app with this email and password opens
// the app. The in-app onboarding is already done.
// Used by: ui/Sections.jsx (JoinNowFooter).

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { createWaitlistAccount, explainAuthError } from './createWaitlistAccount';
import { saveOnboardingProfile } from './saveOnboardingProfile';

// ===== NAMED CONSTANTS =====

const PHASE_ACCOUNT = 'account';
const PHASE_ONBOARDING = 'onboarding';
const PHASE_DONE = 'done';

const ROLE_CLIENT = 'client';
const ROLE_TRAINER = 'trainer';

// Minimum the app itself enforces on situation text and passwords.
const MIN_PASSWORD_LENGTH = 6;
const MIN_SITUATION_LENGTH = 50;
const MAX_SITUATION_LENGTH = 1000;

const INPUT_CLASS = 'w-full rounded-full border border-white/15 bg-white/5 px-5 py-3.5 font-mono text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-pink/60 focus:ring-2 focus:ring-pink/30';

const CLIENT_STEPS = [
  {
    title: 'About you',
    fields: [
      { key: 'weight', kind: 'number', label: 'Weight (lbs)', placeholder: '165' },
      { key: 'age', kind: 'number', label: 'Age', placeholder: '28' },
      { key: 'height', kind: 'height', label: 'Height' },
      {
        key: 'gender',
        kind: 'one',
        label: 'Gender',
        choices: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
          { value: 'prefer_not_to_say', label: 'Prefer not to say' },
        ],
      },
    ],
  },
  {
    title: 'How you train',
    fields: [
      {
        key: 'fitnessLevel',
        kind: 'one',
        label: 'Experience',
        choices: [
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' },
        ],
      },
      {
        key: 'goals',
        kind: 'many',
        label: 'Goals',
        choices: [
          { value: 'lose_fat', label: 'Lose fat' },
          { value: 'build_muscle', label: 'Build muscle' },
          { value: 'maintain_health', label: 'Stay healthy' },
          { value: 'athletic_performance', label: 'Performance' },
          { value: 'build_habits', label: 'Build habits' },
        ],
      },
      {
        key: 'equipmentAccess',
        kind: 'many',
        label: 'Equipment',
        choices: [
          { value: 'full_gym', label: 'Full gym' },
          { value: 'dumbbells', label: 'Dumbbells' },
          { value: 'resistance_bands', label: 'Bands' },
          { value: 'pull_up_bar', label: 'Pull-up bar' },
          { value: 'bodyweight', label: 'Bodyweight' },
        ],
      },
      {
        key: 'daysPerWeek',
        kind: 'one',
        label: 'Days per week',
        choices: [
          { value: 3, label: '3' },
          { value: 4, label: '4' },
          { value: 5, label: '5' },
          { value: 6, label: '6' },
        ],
      },
    ],
  },
  {
    title: 'Your situation',
    fields: [
      {
        key: 'situationDescription',
        kind: 'longtext',
        label: 'What do you want coaching to change?',
        placeholder: 'A few sentences — at least 50 characters. The app stores this on your profile.',
      },
      {
        key: 'aiEnabled',
        kind: 'one',
        label: 'AI Coach',
        choices: [
          { value: true, label: 'Turn AI on' },
          { value: false, label: 'Leave AI off' },
        ],
      },
    ],
  },
];

const TRAINER_STEPS = [
  {
    title: 'Your credentials',
    fields: [
      {
        key: 'certifications',
        kind: 'many',
        label: 'Certifications',
        choices: [
          { value: 'NASM-CPT', label: 'NASM-CPT' },
          { value: 'ACE', label: 'ACE' },
          { value: 'ISSA', label: 'ISSA' },
          { value: 'ACSM', label: 'ACSM' },
          { value: 'NSCA-CPT', label: 'NSCA-CPT' },
          { value: 'None', label: 'None yet' },
        ],
      },
      {
        key: 'yearsExperience',
        kind: 'one',
        label: 'Years coaching',
        choices: [
          { value: 'less_than_1', label: 'Under 1' },
          { value: '1_2', label: '1–2' },
          { value: '3_5', label: '3–5' },
          { value: '6_10', label: '6–10' },
          { value: '10_plus', label: '10+' },
        ],
      },
    ],
  },
  {
    title: 'What you coach',
    fields: [
      {
        key: 'specialties',
        kind: 'many',
        label: 'Specialties',
        choices: [
          { value: 'strength', label: 'Strength' },
          { value: 'weight_loss', label: 'Weight loss' },
          { value: 'bodybuilding', label: 'Bodybuilding' },
          { value: 'athletic', label: 'Athletic' },
          { value: 'powerlifting', label: 'Powerlifting' },
          { value: 'hiit', label: 'HIIT' },
          { value: 'nutrition', label: 'Nutrition' },
        ],
      },
      {
        key: 'trainingPhilosophy',
        kind: 'longtext',
        label: 'Training philosophy (optional)',
        placeholder: 'How you coach, in a sentence or two.',
      },
    ],
  },
  {
    title: 'How clients book you',
    fields: [
      {
        key: 'trainerAvailabilityStatus',
        kind: 'one',
        label: 'Availability',
        choices: [
          { value: 'available', label: 'Available now' },
          { value: 'waitlist', label: 'Waitlist' },
        ],
      },
      {
        key: 'sessionType',
        kind: 'one',
        label: 'Sessions',
        choices: [
          { value: 'Remote', label: 'Remote' },
          { value: 'In-person', label: 'In-person' },
          { value: 'Both', label: 'Both' },
        ],
      },
      { key: 'location', kind: 'text', label: 'City, state', placeholder: 'Detroit, MI' },
    ],
  },
];

// ===== HELPERS =====

/**
 * Steps for the role they picked. Field values match the phone app's onboarding.
 * @param {string} role
 * @returns {Array<{ title: string, fields: Array<Record<string, unknown>> }>}
 */
function stepsForRole(role) {
  if (role === ROLE_TRAINER) return TRAINER_STEPS;
  return CLIENT_STEPS;
}

/**
 * Why this account form cannot be submitted yet. Empty string means it can.
 * @param {{ fullName: string, emailAddress: string, password: string, confirmPassword: string }} account
 * @returns {string}
 */
function accountProblem(account) {
  if (!account.fullName.trim()) return 'Add your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.emailAddress.trim())) {
    return 'That email does not look right. Check it and try again.';
  }
  if (account.password.length < MIN_PASSWORD_LENGTH) {
    return 'Use a password of at least 6 characters. That is what the app requires.';
  }
  if (account.password !== account.confirmPassword) return 'Those passwords do not match.';
  return '';
}

/**
 * Why this onboarding step cannot advance. Empty string means it can.
 * @param {{ fields: Array<{ key: string, kind: string }> }} step
 * @param {Record<string, unknown>} answers
 * @returns {string}
 */
function stepProblem(step, answers) {
  const missing = step.fields.find((field) => fieldIsEmpty(field, answers));
  if (!missing) {
    const situation = String(answers.situationDescription || '');
    const asksForSituation = step.fields.some((field) => field.key === 'situationDescription');
    if (asksForSituation && situation.trim().length < MIN_SITUATION_LENGTH) {
      return 'Write at least 50 characters about your situation. The app requires that.';
    }
    if (asksForSituation && situation.trim().length > MAX_SITUATION_LENGTH) {
      return 'Keep the situation under 1000 characters.';
    }
    return '';
  }
  return `Choose or fill in ${missing.label.toLowerCase()}.`;
}

/**
 * A required field the visitor has not answered yet.
 * Philosophy is the one optional long text.
 * @param {{ key: string, kind: string }} field
 * @param {Record<string, unknown>} answers
 * @returns {boolean}
 */
function fieldIsEmpty(field, answers) {
  if (field.key === 'trainingPhilosophy') return false;
  if (field.kind === 'height') {
    const height = answers.height;
    return !height || !height.feet || height.inches === '' || height.inches == null;
  }
  if (field.kind === 'many') {
    const picked = answers[field.key];
    return !Array.isArray(picked) || picked.length === 0;
  }
  const value = answers[field.key];
  if (field.kind === 'one' && (value === true || value === false)) return false;
  if (value === 0) return false;
  return value === undefined || value === null || String(value).trim() === '';
}

/**
 * Toggle one value inside a multi-select list.
 * @param {unknown[]} current
 * @param {unknown} value
 * @returns {unknown[]}
 */
function toggleListValue(current, value) {
  const list = Array.isArray(current) ? current : [];
  if (list.includes(value)) return list.filter((item) => item !== value);
  return [...list, value];
}

/**
 * Pill button used for role, single choice, and multi choice.
 * @param {{ label: string, selected: boolean, onChoose: () => void }} props
 * @returns {JSX.Element}
 */
function ChoicePill({ label, selected, onChoose }) {
  const selectedClass = selected
    ? 'border-pink/70 bg-pink/20 text-white'
    : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30';
  return (
    <button type="button" onClick={onChoose} className={`rounded-full border px-4 py-2 text-left text-sm transition-colors ${selectedClass}`}>
      {label}
    </button>
  );
}

/**
 * One onboarding question.
 * @param {{ field: Record<string, unknown>, answers: Record<string, unknown>, onChange: (key: string, value: unknown) => void }} props
 * @returns {JSX.Element}
 */
function QuestionField({ field, answers, onChange }) {
  if (field.kind === 'one' || field.kind === 'many') {
    return (
      <fieldset className="text-left">
        <legend className="mb-2 text-xs uppercase tracking-wide text-white/45">{field.label}</legend>
        <div className="flex flex-wrap gap-2">
          {field.choices.map((choice) => {
            const current = answers[field.key];
            const selected = field.kind === 'many'
              ? Array.isArray(current) && current.includes(choice.value)
              : current === choice.value;
            const choose = () => {
              if (field.kind === 'many') {
                onChange(field.key, toggleListValue(current, choice.value));
                return;
              }
              onChange(field.key, choice.value);
            };
            return <ChoicePill key={String(choice.value)} label={choice.label} selected={selected} onChoose={choose} />;
          })}
        </div>
      </fieldset>
    );
  }

  if (field.kind === 'height') {
    const height = answers.height || { feet: '', inches: '' };
    return (
      <div className="text-left">
        <p className="mb-2 text-xs uppercase tracking-wide text-white/45">{field.label}</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            inputMode="numeric"
            placeholder="Feet"
            value={height.feet}
            onChange={(changeEvent) => onChange('height', { ...height, feet: changeEvent.target.value.replace(/[^0-9]/g, '') })}
            className={INPUT_CLASS}
          />
          <input
            inputMode="numeric"
            placeholder="Inches"
            value={height.inches}
            onChange={(changeEvent) => onChange('height', { ...height, inches: changeEvent.target.value.replace(/[^0-9]/g, '') })}
            className={INPUT_CLASS}
          />
        </div>
      </div>
    );
  }

  if (field.kind === 'longtext') {
    return (
      <label className="block text-left text-xs uppercase tracking-wide text-white/45">
        {field.label}
        <textarea
          rows={4}
          placeholder={field.placeholder}
          value={answers[field.key] || ''}
          onChange={(changeEvent) => onChange(field.key, changeEvent.target.value)}
          className="mt-2 w-full rounded-3xl border border-white/15 bg-white/5 px-5 py-3.5 font-mono text-sm normal-case tracking-normal text-white placeholder-white/35 outline-none transition-colors focus:border-pink/60 focus:ring-2 focus:ring-pink/30"
        />
      </label>
    );
  }

  const inputValue = answers[field.key] ?? '';
  return (
    <label className="block text-left text-xs uppercase tracking-wide text-white/45">
      {field.label}
      <input
        type={field.kind === 'number' ? 'number' : 'text'}
        placeholder={field.placeholder}
        value={inputValue}
        onChange={(changeEvent) => onChange(field.key, changeEvent.target.value)}
        className={`${INPUT_CLASS} mt-2 normal-case tracking-normal`}
      />
    </label>
  );
}

/**
 * Shape the answers the way the app stores them (numbers, height object, goals).
 * @param {Record<string, unknown>} answers
 * @returns {Record<string, unknown>}
 */
function answersForFirestore(answers) {
  const height = answers.height;
  const feet = height && height.feet !== '' ? Number(height.feet) : null;
  const inches = height && height.inches !== '' ? Number(height.inches) : null;
  const goals = Array.isArray(answers.goals) ? answers.goals : [];
  const weight = answers.weight === '' || answers.weight == null ? null : Number(answers.weight);
  const age = answers.age === '' || answers.age == null ? null : Number(answers.age);
  const daysPerWeek = answers.daysPerWeek == null ? null : Number(answers.daysPerWeek);

  return {
    ...answers,
    weight,
    age,
    daysPerWeek,
    height: feet ? { feet, inches: inches || 0 } : null,
    goals,
    primaryGoal: goals[0] || null,
    trainingEnvironment: answers.trainingEnvironment || null,
    injuries: answers.injuries || '',
  };
}

// ===== MAIN FUNCTION =====

/**
 * Waitlist signup that creates the app login and finishes onboarding.
 * @returns {JSX.Element}
 */
export function WaitlistForm() {
  const [phase, setPhase] = useState(PHASE_ACCOUNT);
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(ROLE_CLIENT);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const steps = stepsForRole(role);
  const currentStep = steps[stepIndex];

  /**
   * Write one onboarding answer without losing the others.
   * @param {string} key
   * @param {unknown} value
   */
  const changeAnswer = (key, value) => {
    setAnswers((previous) => ({ ...previous, [key]: value }));
  };

  /**
   * Create the Auth user, then open the first setup question.
   * @param {Event} submitEvent
   * @returns {Promise<void>}
   */
  const handleAccountSubmit = async (submitEvent) => {
    // 1. Stay on the page, and ignore a second click while Firebase is working.
    submitEvent.preventDefault();
    if (isSending) return;

    // 2. Check name, email, and password before any account is created.
    const problem = accountProblem({ fullName, emailAddress, password, confirmPassword });
    if (problem) {
      setErrorMessage(problem);
      return;
    }

    // 3. Create the login in anatrox-auth. The browser stays signed in for setup.
    setIsSending(true);
    setErrorMessage('');
    try {
      await createWaitlistAccount({
        fullName: fullName.trim(),
        emailAddress: emailAddress.trim(),
        password,
        role,
      });
      setStepIndex(0);
      setPhase(PHASE_ONBOARDING);
    } catch (authError) {
      setErrorMessage(explainAuthError(authError));
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Advance one setup step, or save the profile on the last step.
   * @returns {Promise<void>}
   */
  const handleOnboardingNext = async () => {
    // 1. Block the step until its required answers are in.
    if (isSending) return;
    const problem = stepProblem(currentStep, answers);
    if (problem) {
      setErrorMessage(problem);
      return;
    }

    // 2. More questions left — just show the next one.
    const isLastStep = stepIndex >= steps.length - 1;
    if (!isLastStep) {
      setErrorMessage('');
      setStepIndex(stepIndex + 1);
      return;
    }

    // 3. Last step: write the profile the app reads, then show the confirmation.
    setIsSending(true);
    setErrorMessage('');
    try {
      await saveOnboardingProfile({
        role,
        fullName: fullName.trim(),
        answers: answersForFirestore(answers),
      });
      setPhase(PHASE_DONE);
    } catch (saveError) {
      setErrorMessage(saveError.message || 'Could not save setup. Try again.');
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Go back one setup question. The account already exists, so we do not return
   * to the password form.
   */
  const handleOnboardingBack = () => {
    if (stepIndex === 0) return;
    setErrorMessage('');
    setStepIndex(stepIndex - 1);
  };

  if (phase === PHASE_DONE) {
    return (
      <div className="flex items-start justify-center gap-3 text-left" data-testid="waitlist-success">
        <span className="cc-icon-disc mt-0.5 h-10 w-10 shrink-0" style={{ '--card-accent': '#10B981', '--grad-to': '#06B6D4' }}>
          <Check size={18} strokeWidth={2.6} />
        </span>
        <p className="leading-relaxed text-white/80">
          You&apos;re set up. Open the Coach Connect app and sign in with <span className="text-white">{emailAddress.trim()}</span> and
          the password you just chose. Onboarding is already saved, so the app opens straight in.
        </p>
      </div>
    );
  }

  if (phase === PHASE_ONBOARDING) {
    return (
      <div className="text-left" data-testid="waitlist-onboarding">
        <p className="font-pixel text-[0.55rem] uppercase text-pink">
          Setup {stepIndex + 1} of {steps.length}
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-white">{currentStep.title}</h3>
        <div className="mt-5 flex flex-col gap-5">
          {currentStep.fields.map((field) => (
            <QuestionField key={field.key} field={field} answers={answers} onChange={changeAnswer} />
          ))}
        </div>
        {errorMessage ? (
          <p className="mt-4 text-sm text-pink" role="alert" data-testid="waitlist-error">{errorMessage}</p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button type="button" onClick={handleOnboardingBack} disabled={stepIndex === 0 || isSending} className="cta-ghost hero-action disabled:opacity-40">
            Back
          </button>
          <button type="button" onClick={handleOnboardingNext} disabled={isSending} className="cta-primary hero-action hero-action-primary disabled:cursor-wait disabled:opacity-70" data-testid="waitlist-onboarding-next">
            {isSending ? 'Saving…' : stepIndex >= steps.length - 1 ? 'Finish setup' : 'Continue'}
            {!isSending && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleAccountSubmit} noValidate data-testid="waitlist-form" className="text-left">
      <p className="mb-4 text-sm leading-relaxed text-white/60">
        This is your Coach Connect login. After a short setup you can sign into the app with the same email and password.
      </p>
      <div className="flex flex-col gap-3">
        <label className="sr-only" htmlFor="waitlist-name">Full name</label>
        <input id="waitlist-name" autoComplete="name" placeholder="Your name" value={fullName} onChange={(changeEvent) => setFullName(changeEvent.target.value)} className={INPUT_CLASS} data-testid="waitlist-name" />
        <label className="sr-only" htmlFor="waitlist-email">Email address</label>
        <input id="waitlist-email" type="email" autoComplete="email" placeholder="you@example.com" value={emailAddress} onChange={(changeEvent) => setEmailAddress(changeEvent.target.value)} className={INPUT_CLASS} data-testid="waitlist-email" />
        <label className="sr-only" htmlFor="waitlist-password">Password</label>
        <input id="waitlist-password" type="password" autoComplete="new-password" placeholder="Password (6+ characters)" value={password} onChange={(changeEvent) => setPassword(changeEvent.target.value)} className={INPUT_CLASS} data-testid="waitlist-password" />
        <label className="sr-only" htmlFor="waitlist-password-confirm">Confirm password</label>
        <input id="waitlist-password-confirm" type="password" autoComplete="new-password" placeholder="Confirm password" value={confirmPassword} onChange={(changeEvent) => setConfirmPassword(changeEvent.target.value)} className={INPUT_CLASS} data-testid="waitlist-password-confirm" />
      </div>

      <fieldset className="mt-4">
        <legend className="mb-2 text-xs uppercase tracking-wide text-white/45">I am joining as</legend>
        <div className="flex flex-wrap gap-2">
          <ChoicePill label="A client" selected={role === ROLE_CLIENT} onChoose={() => setRole(ROLE_CLIENT)} />
          <ChoicePill label="A trainer" selected={role === ROLE_TRAINER} onChoose={() => setRole(ROLE_TRAINER)} />
        </div>
      </fieldset>

      {errorMessage ? (
        <p className="mt-3 text-sm text-pink" role="alert" data-testid="waitlist-error">{errorMessage}</p>
      ) : null}

      <button type="submit" disabled={isSending} className="cta-primary hero-action hero-action-primary mt-5 w-full justify-center disabled:cursor-wait disabled:opacity-70" data-testid="waitlist-submit">
        {isSending ? 'Creating your login…' : 'Create my login'}
        {!isSending && <ArrowRight size={16} />}
      </button>
    </form>
  );
}
