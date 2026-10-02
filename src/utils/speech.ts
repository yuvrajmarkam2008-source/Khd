// Browser Speech Synthesis and Speech Recognition utility

export interface SpeechControl {
  speak: (text: string, language: 'english' | 'hindi' | 'hinglish', onEnd?: () => void) => void;
  stop: () => void;
  isSpeaking: () => boolean;
}

export function cleanTextForSpeech(markdown: string): string {
  // Strip Markdown symbols for natural audio speech
  return markdown
    .replace(/```[\s\S]*?```/g, ' [Code Block Skipped] ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/###/g, '')
    .replace(/##/g, '')
    .replace(/#/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_~`>-]/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .trim();
}

export function speakText(
  text: string,
  language: 'english' | 'hindi' | 'hinglish',
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  window.speechSynthesis.cancel();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return false;

  const utterance = new SpeechSynthesisUtterance(cleaned);

  // Set appropriate language tag
  if (language === 'hindi') {
    utterance.lang = 'hi-IN';
  } else if (language === 'hinglish') {
    utterance.lang = 'en-IN';
  } else {
    utterance.lang = 'en-US';
  }

  utterance.rate = 0.95; // Slightly slower for clear educational comprehension
  utterance.pitch = 1.0;

  // Try to pick a suitable regional voice if available
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    if (language === 'hindi') {
      const hiVoice = voices.find((v) => v.lang.startsWith('hi') || v.name.includes('Hindi'));
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      const enInVoice = voices.find(
        (v) => v.lang.includes('en-IN') || v.lang.includes('en_IN') || v.name.includes('India')
      );
      if (enInVoice) utterance.voice = enInVoice;
    }
  }

  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
