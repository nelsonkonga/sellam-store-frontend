import React from 'react';

export default function PasswordStrengthIndicator({ password }) {
  const getStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, text: '', color: 'bg-gray-200 dark:bg-gray-700', reqMet: 0 };

    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, text: 'Faible', color: 'bg-red-500', reqMet: score };
    if (score <= 4) return { score, text: 'Moyen', color: 'bg-yellow-500', reqMet: score };
    return { score, text: 'Fort', color: 'bg-green-500', reqMet: score };
  };

  const strength = getStrength(password);

  const requirements = [
    { label: 'Au moins 8 caractères', met: password?.length >= 8 },
    { label: 'Une majuscule', met: /[A-Z]/.test(password || '') },
    { label: 'Une minuscule', met: /[a-z]/.test(password || '') },
    { label: 'Un chiffre', met: /[0-9]/.test(password || '') },
    { label: 'Un caractère spécial', met: /[^A-Za-z0-9]/.test(password || '') },
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${(strength.score / 5) * 100}%` }} />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium ${strength.color.replace('bg-', 'text-')}`}>
          {strength.text}
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {strength.reqMet}/5 critères
        </span>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-500 dark:text-gray-400">
        {requirements.map((req, i) => (
          <li key={i} className={`flex items-center gap-1 min-w-0 truncate ${req.met ? 'text-green-500 dark:text-green-400' : ''}`}>
            <span className="shrink-0">{req.met ? '✓' : '○'}</span> <span className="truncate">{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
