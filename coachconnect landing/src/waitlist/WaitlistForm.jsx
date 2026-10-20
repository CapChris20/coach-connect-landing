// WaitlistForm — signup that becomes a real Coach Connect login, then onboarding.
// Flow: name + email + password + role → create the Auth user in anatrox-auth →
// the same onboarding pages as the app (9 for a client, 7 for a trainer) →
// save the profile the app reads → confirmation.
// After that, signing into the phone app with this email and password opens
// the app. The in-app onboarding is already done.
// Used by: ui/Sections.jsx (JoinNowFooter).

import { useEffect, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { createWaitlistAccount, explainAuthError } from './createWaitlistAccount';
import { lookupTrainerId, saveOnboardingProfile } from './saveOnboardingProfile';

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

// Same page order and titles as OnboardingScreen in the Coach Connect app.
// vocab: optional = the app lets this page through even if it is left blank
// Manipulate here: add or remove a page only if the phone app's step list changes too
const CLIENT_STEPS = [
  {
    title: 'Tell us about yourself',
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
    title: "What's your fitness experience?",
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
    ],
  },
  {
    title: "What's your main goal?",
    fields: [
      {
        key: 'goals',
        kind: 'many',
        label: 'Goals',
        choices: [
          { value: 'lose_fat', label: 'Lose fat' },
          { value: 'build_muscle', label: 'Build muscle' },
          { value: 'maintain_health', label: 'Stay healthy' },
          { value: 'athletic_performance', label: 'Athletic performance' },
          { value: 'improve_mental_health', label: 'Mental health' },
          { value: 'build_habits', label: 'Build habits' },
        ],
      },
    ],
  },
  {
    title: 'What equipment do you have access to?',
    fields: [
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
        key: 'trainingEnvironment',
        kind: 'one',
        label: 'Where do you train?',
        optional: true,
        choices: [
          { value: 'home', label: 'Home' },
          { value: 'gym', label: 'Gym' },
          { value: 'both', label: 'Both' },
        ],
      },
    ],
  },
  {
    title: 'How many days per week can you train?',
    fields: [
      {
        key: 'daysPerWeek',
        kind: 'one',
        label: 'Days per week',
        choices: [
          { value: 1, label: '1' },
          { value: 2, label: '2' },
          { value: 3, label: '3' },
          { value: 4, label: '4' },
          { value: 5, label: '5' },
          { value: 6, label: '6' },
          { value: 7, label: '7' },
        ],
      },
      {
        key: 'preferredWorkoutTime',
        kind: 'one',
        label: 'Preferred time',
        optional: true,
        choices: [
          { value: 'morning', label: 'Morning' },
          { value: 'afternoon', label: 'Afternoon' },
          { value: 'evening', label: 'Evening' },
          { value: 'no_preference', label: 'No preference' },
        ],
      },
    ],
  },
  {
    title: 'Any injuries or limitations?',
    note: 'Optional. Skip anything that does not apply.',
    fields: [
      {
        key: 'injuries',
        kind: 'longtext',
        label: 'Injuries or limitations',
        optional: true,
        placeholder: 'Lower back, knees, a recent strain…',
      },
      {
        key: 'exercisesDislike',
        kind: 'longtext',
        label: 'Exercises you dislike',
        optional: true,
        placeholder: 'Burpees, running, leg press…',
      },
      {
        key: 'supplementsCurrentlyTaking',
        kind: 'text',
        label: 'Supplements',
        optional: true,
        placeholder: 'Creatine, protein…',
      },
    ],
  },
  {
    title: 'Do you have a trainer?',
    note: 'Optional. Paste their invite code, or leave this blank.',
    fields: [
      { key: 'trainerCode', kind: 'text', label: 'Trainer code', optional: true, placeholder: 'ABC-DEF' },
    ],
  },
  {
    title: 'Describe Your Situation',
    note: 'The chips are optional. The story at the bottom is required.',
    fields: [
      {
        key: 'currentStressLevel',
        kind: 'one',
        label: 'Stress',
        optional: true,
        choices: [
          { value: 'low', label: 'Low' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'high', label: 'High' },
        ],
      },
      {
        key: 'sleepQuality',
        kind: 'one',
        label: 'Sleep',
        optional: true,
        choices: [
          { value: 'poor', label: 'Poor' },
          { value: 'fair', label: 'Fair' },
          { value: 'good', label: 'Good' },
        ],
      },
      {
        key: 'energyLevels',
        kind: 'one',
        label: 'Energy',
        optional: true,
        choices: [
          { value: 'low', label: 'Low' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'high', label: 'High' },
        ],
      },
      {
        key: 'hydrationHabits',
        kind: 'one',
        label: 'Water',
        optional: true,
        choices: [
          { value: 'less_than_4', label: 'Under 4 cups' },
          { value: '4_8', label: '4–8 cups' },
          { value: 'more_than_8', label: '8+ cups' },
        ],
      },
      {
        key: 'situationDescription',
        kind: 'longtext',
        label: 'Your situation',
        placeholder: 'At least 50 characters. Routine, what you want to change, and anything a coach should know.',
      },
    ],
  },
  {
    title: 'AI-Powered Features',
    fields: [
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
    title: 'What certifications do you have?',
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
          { value: 'Other', label: 'Other' },
          { value: 'None', label: 'None yet' },
        ],
      },
    ],
  },
  {
    title: 'How long have you been training clients?',
    fields: [
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
    title: 'What are your specialties?',
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
          { value: 'rehabilitation', label: 'Rehab' },
          { value: 'powerlifting', label: 'Powerlifting' },
          { value: 'hiit', label: 'HIIT' },
          { value: 'nutrition', label: 'Nutrition' },
        ],
      },
    ],
  },
  {
    title: 'Describe your training philosophy',
    note: 'Optional.',
    fields: [
      {
        key: 'trainingPhilosophy',
        kind: 'longtext',
        label: 'Philosophy',
        optional: true,
        placeholder: 'How you coach, in a sentence or two.',
      },
    ],
  },
  {
    title: 'Availability & session format',
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
    ],
  },
  {
    title: 'Almost done!',
    fields: [
      { key: 'name', kind: 'text', label: 'Name clients will see', placeholder: 'Your name' },
      { key: 'location', kind: 'text', label: 'City, state', placeholder: 'Detroit, MI' },
      {
        key: 'trainerProfileBio',
        kind: 'longtext',
        label: 'Short bio',
        optional: true,
        placeholder: 'One or two sentences for your marketplace card.',
      },
    ],
  },
  {
    title: 'Your client invite code',
    note: 'Share this so clients can find you. It is saved when you finish.',
    fields: [
      { key: 'inviteCode', kind: 'code', label: 'Invite code' },
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
 * optional and the invite-code display never block Continue.
 * @param {{ key: string, kind: string, optional?: boolean }} field
 * @param {Record<string, unknown>} answers
 * @returns {boolean}
 */
function fieldIsEmpty(field, answers) {
  if (field.optional || field.kind === 'code') return false;
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
 * Trainer invite code in the app's XXX-XXX shape.
 * Same alphabet as saveOnboardingProfile so the last page can show it first.
 * @returns {string}
 */
function makeInviteCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let letters = '';
  for (let index = 0; index < 6; index += 1) {
    const pick = Math.floor(Math.random() * alphabet.length);
    letters += alphabet.charAt(pick);
  }
  return `${letters.slice(0, 3)}-${letters.slice(3)}`;
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
 * One answer the visitor can tap. Days are circles; everything else is a card.
 * @param {{ label: string, selected: boolean, onChoose: () => void, shape?: 'card' | 'day' }} props
 * @returns {JSX.Element}
 */
function ChoicePill({ label, selected, onChoose, shape = 'card' }) {
  const selectedClass = selected ? ' is-selected' : '';
  const shapeClass = shape === 'day' ? 'setup-day' : 'setup-choice';
  return (
    <button type="button" onClick={onChoose} aria-pressed={selected} className={`${shapeClass}${selectedClass}`}>
      {label}
    </button>
  );
}

/**
 * The filled part of the step track. One segment per page.
 * @param {{ stepIndex: number, stepCount: number }} props
 * @returns {JSX.Element}
 */
function SetupProgress({ stepIndex, stepCount }) {
  const segments = [];
  for (let segmentIndex = 0; segmentIndex < stepCount; segmentIndex += 1) {
    let segmentClass = 'setup-seg';
    if (segmentIndex < stepIndex) segmentClass += ' is-done';
    if (segmentIndex === stepIndex) segmentClass += ' is-current';
    segments.push(<span key={segmentIndex} className={segmentClass} />);
  }
  return <div className="setup-progress" aria-hidden="true">{segments}</div>;
}

/**
 * The small heading above a field. Hidden when the page title already asks it.
 * @param {{ field: { label: string, optional?: boolean }, showLabel: boolean }} props
 * @returns {JSX.Element | null}
 */
function FieldLabel({ field, showLabel }) {
  if (!showLabel) return null;
  return (
    <p className="setup-label">
      {field.label}
      {field.optional ? <span className="setup-optional">Optional</span> : null}
    </p>
  );
}

/**
 * How many columns this answer list should use once the card is wide.
 * @param {{ kind: string, choices?: Array<{ value: unknown }> }} field
 * @returns {string}
 */
function choiceRowClass(field) {
  const everyChoiceIsNumber = field.choices.every((choice) => typeof choice.value === 'number');
  if (everyChoiceIsNumber) return 'setup-days';
  if (field.choices.length <= 3) return 'setup-choices is-trio';
  if (field.choices.length === 4) return 'setup-choices is-quad';
  return 'setup-choices';
}

/**
 * Which grid track a field sits on. Short inputs share a row; big questions take the width.
 * @param {{ kind: string, choices?: Array<{ value: unknown }> }} field
 * @param {Array<{ kind: string }>} fieldsOnStep
 * @returns {string}
 */
function fieldFrameClass(field, fieldsOnStep) {
  if (field.kind === 'height') return 'setup-span-2';
  if (field.kind === 'number') return '';
  const longTextCount = fieldsOnStep.filter((item) => item.kind === 'longtext').length;
  if (field.kind === 'longtext' && longTextCount === 3) return '';
  if (field.kind === 'longtext' && longTextCount > 1) return 'setup-span-2';
  const chipGroupCount = fieldsOnStep.filter((item) => item.kind === 'one' || item.kind === 'many').length;
  const isDayPicker = field.choices && field.choices.every((choice) => typeof choice.value === 'number');
  if ((field.kind === 'one' || field.kind === 'many') && chipGroupCount >= 3 && !isDayPicker) {
    return 'setup-span-2';
  }
  return 'setup-span-all';
}

/**
 * One onboarding question.
 * @param {{ field: Record<string, unknown>, answers: Record<string, unknown>, onChange: (key: string, value: unknown) => void, showLabel: boolean, frameClass: string }} props
 * @returns {JSX.Element}
 */
function QuestionField({ field, answers, onChange, showLabel, frameClass }) {
  if (field.kind === 'one' || field.kind === 'many') {
    const isDayPicker = field.choices.every((choice) => typeof choice.value === 'number');
    return (
      <fieldset className={frameClass}>
        <legend className="sr-only">{field.label}</legend>
        <FieldLabel field={field} showLabel={showLabel} />
        <div className={choiceRowClass(field)}>
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
            return (
              <ChoicePill
                key={String(choice.value)}
                label={choice.label}
                selected={selected}
                onChoose={choose}
                shape={isDayPicker ? 'day' : 'card'}
              />
            );
          })}
        </div>
      </fieldset>
    );
  }

  if (field.kind === 'height') {
    const height = answers.height || { feet: '', inches: '' };
    return (
      <div className={frameClass}>
        <FieldLabel field={field} showLabel={showLabel} />
        <div className="setup-pair">
          <input
            inputMode="numeric"
            placeholder="Feet"
            aria-label="Height in feet"
            value={height.feet}
            onChange={(changeEvent) => onChange('height', { ...height, feet: changeEvent.target.value.replace(/[^0-9]/g, '') })}
            className="setup-input"
          />
          <input
            inputMode="numeric"
            placeholder="Inches"
            aria-label="Height in inches"
            value={height.inches}
            onChange={(changeEvent) => onChange('height', { ...height, inches: changeEvent.target.value.replace(/[^0-9]/g, '') })}
            className="setup-input"
          />
        </div>
      </div>
    );
  }

  if (field.kind === 'code') {
    const shownCode = answers.inviteCode || '······';
    return (
      <p className={`setup-code ${frameClass}`} data-testid="waitlist-invite-code">
        {shownCode}
      </p>
    );
  }

  if (field.kind === 'longtext') {
    const writtenText = String(answers[field.key] || '');
    const situationCount = writtenText.trim().length;
    const asksForCount = field.key === 'situationDescription';
    return (
      <label className={frameClass || 'block'}>
        <FieldLabel field={field} showLabel />
        <textarea
          rows={4}
          placeholder={field.placeholder}
          value={writtenText}
          onChange={(changeEvent) => onChange(field.key, changeEvent.target.value)}
          className="setup-area"
        />
        {asksForCount ? (
          <p className={situationCount >= MIN_SITUATION_LENGTH ? 'setup-meter is-met' : 'setup-meter'}>
            {situationCount} / {MIN_SITUATION_LENGTH} characters
          </p>
        ) : null}
      </label>
    );
  }

  const inputValue = answers[field.key] ?? '';
  return (
    <label className={frameClass || 'block'}>
      <FieldLabel field={field} showLabel />
      <input
        type={field.kind === 'number' ? 'number' : 'text'}
        placeholder={field.placeholder}
        value={inputValue}
        onChange={(changeEvent) => onChange(field.key, changeEvent.target.value)}
        className="setup-input"
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
  const shapedAnswers = { ...answers };
  // The typed code is only for the lookup. The API links on trainerId.
  delete shapedAnswers.trainerCode;

  const height = answers.height;
  const feet = height && height.feet !== '' ? Number(height.feet) : null;
  const inches = height && height.inches !== '' ? Number(height.inches) : null;
  if (feet) shapedAnswers.height = { feet, inches: inches || 0 };
  else delete shapedAnswers.height;

  if (answers.weight === '' || answers.weight == null) delete shapedAnswers.weight;
  else shapedAnswers.weight = Number(answers.weight);

  if (answers.age === '' || answers.age == null) delete shapedAnswers.age;
  else shapedAnswers.age = Number(answers.age);

  if (answers.daysPerWeek == null || answers.daysPerWeek === '') delete shapedAnswers.daysPerWeek;
  else shapedAnswers.daysPerWeek = Number(answers.daysPerWeek);

  const goals = Array.isArray(answers.goals) ? answers.goals : [];
  if (goals.length > 0) {
    shapedAnswers.goals = goals;
    shapedAnswers.primaryGoal = goals[0];
  }

  return shapedAnswers;
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

  // The last trainer page displays a code. Make it once, then save that same string.
  useEffect(() => {
    if (phase !== PHASE_ONBOARDING || role !== ROLE_TRAINER) return;
    const showingInvite = currentStep?.fields.some((field) => field.kind === 'code');
    if (!showingInvite) return;
    setAnswers((previous) => {
      if (previous.inviteCode) return previous;
      return { ...previous, inviteCode: makeInviteCode() };
    });
  }, [phase, role, currentStep]);

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
      setAnswers({ name: fullName.trim() });
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

    // 2. A typed trainer code must resolve to a trainer id before we move on.
    //    Blank is allowed — that client simply has no trainer yet.
    const asksForTrainerCode = currentStep.fields.some((field) => field.key === 'trainerCode');
    const typedCode = String(answers.trainerCode || '').trim();
    if (asksForTrainerCode && typedCode) {
      setIsSending(true);
      setErrorMessage('');
      try {
        const trainerId = await lookupTrainerId(typedCode);
        setAnswers((previous) => ({ ...previous, trainerId }));
      } catch (lookupError) {
        setErrorMessage(lookupError.message || 'Could not check that trainer code.');
        setIsSending(false);
        return;
      }
      setIsSending(false);
    }
    if (asksForTrainerCode && !typedCode && answers.trainerId) {
      setAnswers((previous) => {
        const cleared = { ...previous };
        delete cleared.trainerId;
        return cleared;
      });
    }

    // 3. More questions left — just show the next one.
    const isLastStep = stepIndex >= steps.length - 1;
    if (!isLastStep) {
      setErrorMessage('');
      setStepIndex(stepIndex + 1);
      return;
    }

    // 4. Last step: write the profile the app reads, then show the confirmation.
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
        <SetupProgress stepIndex={stepIndex} stepCount={steps.length} />
        <p className="setup-count">Step {stepIndex + 1} of {steps.length}</p>
        <h3 className="setup-title">{currentStep.title}</h3>
        {currentStep.note ? <p className="setup-note">{currentStep.note}</p> : null}
        <div className={currentStep.fields.every((field) => field.kind === 'longtext') ? 'setup-fields is-thirds' : 'setup-fields'}>
          {currentStep.fields.map((field) => {
            const titleAlreadyAsks = currentStep.fields.length === 1
              && (field.kind === 'one' || field.kind === 'many' || field.kind === 'code');
            return (
              <QuestionField
                key={field.key}
                field={field}
                answers={answers}
                onChange={changeAnswer}
                showLabel={!titleAlreadyAsks}
                frameClass={fieldFrameClass(field, currentStep.fields)}
              />
            );
          })}
        </div>
        {errorMessage ? (
          <p className="setup-error" role="alert" data-testid="waitlist-error">{errorMessage}</p>
        ) : null}
        <div className="setup-actions">
          <button type="button" onClick={handleOnboardingBack} disabled={stepIndex === 0 || isSending} className="setup-back">
            Back
          </button>
          <button type="button" onClick={handleOnboardingNext} disabled={isSending} className="cta-primary hero-action hero-action-primary setup-next disabled:cursor-wait disabled:opacity-70" data-testid="waitlist-onboarding-next">
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        <legend className="setup-label">I am joining as</legend>
        <div className="setup-choices is-pair">
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
