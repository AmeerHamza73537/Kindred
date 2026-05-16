import { useEffect, useRef, useState } from 'react';

export default function HandoffCodeBox({ length = 4, onComplete }) {
  const [digits, setDigits] = useState(Array(length).fill(''));
  const doneRef = useRef(false);

  useEffect(() => {
    if (!digits.every((d) => d !== '')) {
      doneRef.current = false;
    }
  }, [digits]);

  useEffect(() => {
    const code = digits.join('');
    if (digits.every((d) => d !== '') && code.length === length && !doneRef.current) {
      doneRef.current = true;
      onComplete?.(code);
    }
  }, [digits, length, onComplete]);

  const setAt = (i, v) => {
    const ch = v.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = ch;
    setDigits(next);
    if (ch && i < length - 1) {
      const el = document.getElementById(`code-${i + 1}`);
      el?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-3">
      {digits.map((d, i) => (
        <input
          key={i}
          id={`code-${i}`}
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => setAt(i, e.target.value)}
          className="h-14 w-12 rounded-2xl border-2 border-ink/10 text-center font-serif text-2xl text-ink shadow-inner focus:border-primary focus:outline-none"
        />
      ))}
    </div>
  );
}
