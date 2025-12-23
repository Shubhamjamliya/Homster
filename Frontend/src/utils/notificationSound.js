// Notification Sound Utility
// Plays notification sound when new booking request arrives

let audioContext = null;
let notificationSound = null;

// Initialize audio context
const initAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
};

// Create a premium notification sound (Major Chord / Chime)
const createNotificationSound = (type = 'chime') => {
  if (!audioContext) initAudio();

  const primaryGain = audioContext.createGain();
  primaryGain.connect(audioContext.destination);

  const playTone = (freq, type, startTime, duration, vol) => {
    const osc = audioContext.createOscillator();
    const g = audioContext.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(vol, startTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(g);
    g.connect(primaryGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const now = audioContext.currentTime;

  if (type === 'chime') {
    // Richer chime using harmonics (C5, E5, G5)
    playTone(523.25, 'sine', now, 0.6, 0.2); // C5
    playTone(659.25, 'sine', now + 0.05, 0.5, 0.15); // E5
    playTone(783.99, 'sine', now + 0.1, 0.4, 0.1); // G5
  } else if (type === 'beep') {
    playTone(880, 'sine', now, 0.2, 0.2);
  } else if (type === 'ring') {
    // A more urgent "Electronic Ring"
    playTone(660, 'triangle', now, 0.1, 0.15);
    playTone(880, 'triangle', now + 0.1, 0.1, 0.15);
  }

  return primaryGain;
};

// Play notification sound (Premium Chime)
export const playNotificationSound = () => {
  try {
    initAudio();
    createNotificationSound('chime');
    return true;
  } catch (error) {
    console.error('Error playing notification sound:', error);
    return false;
  }
};

// Play single beep for small interactions
export const playSingleBeep = () => {
  try {
    initAudio();
    createNotificationSound('beep');
    return true;
  } catch (error) {
    console.error('Error playing beep:', error);
    return false;
  }
};

// Play urgent ring for booking alerts
export const playAlertRing = () => {
  try {
    initAudio();
    const now = audioContext.currentTime;
    // Double pulse ring
    createNotificationSound('ring');
    setTimeout(() => {
      createNotificationSound('ring');
    }, 300);
    return true;
  } catch (error) {
    return false;
  }
};

// Check if sound is enabled in settings
export const isSoundEnabled = (userType = 'vendor') => {
  let storageKey = 'vendorData';
  if (userType === 'user') storageKey = 'userData';
  else if (userType === 'worker') storageKey = 'workerData';
  else if (userType === 'admin') storageKey = 'adminData';

  const dataString = localStorage.getItem(storageKey);
  if (dataString) {
    try {
      const data = JSON.parse(dataString);
      return data.settings?.soundAlerts !== false; // Default true
    } catch (error) {
      return true;
    }
  }
  return true;
};

export default {
  playNotificationSound,
  playSingleBeep,
  playAlertRing,
  isSoundEnabled
};
