'use client';

import { useEffect, useState } from 'react';

const GREETINGS = [
  'Hello',
  '안녕하세요',
  'Hola',
  'Bonjour',
  'Ciao',
  'こんにちは',
  '你好',
  'Olá',
  'Hallo',
  'Aloha',
  'Привет',
  'مرحبا',
  'नमस्ते',
  'Merhaba',
  'Xin chào',
  'สวัสดี',
  'Hej',
  'Cześć',
  'Γεια σου',
  'Salam',
  'Habari',
  'Sawubona',
  'Selamat',
  'Hei',
  'שלום',
];

export default function Hello() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= GREETINGS.length) return;
    const id = setTimeout(() => setStep((s) => s + 1), 600);
    return () => clearTimeout(id);
  }, [step]);

  const idx = step >= GREETINGS.length ? 0 : step;

  return <span style={{ display: 'inline-block' }}>{GREETINGS[idx]}!</span>;
}
