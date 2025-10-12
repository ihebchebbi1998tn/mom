// Configuration for sub-pack access timing and restrictions

export interface AccessTimingRule {
  packId: number;
  subPackId: number;
  delayMonths: number;
  message: {
    notStarted: string;
    waiting: string;
  };
}

export const ACCESS_TIMING_RULES: AccessTimingRule[] = [
  {
    packId: 4,
    subPackId: 9,
    delayMonths: 3,
    message: {
      notStarted: "Cette capsule sera déverrouillée 3 mois après votre première visite",
      waiting: "Cette capsule sera déverrouillée dans {days} jours"
    }
  }
];

// localStorage keys
export const STORAGE_KEYS = {
  FIRST_ACCESS_PREFIX: 'pack_first_access_',
};

// Helper to get storage key for a pack
export const getFirstAccessKey = (packId: number) => 
  `${STORAGE_KEYS.FIRST_ACCESS_PREFIX}${packId}`;

// Helper to calculate days remaining
export const calculateDaysRemaining = (firstAccessDate: string, delayMonths: number): number => {
  const firstAccess = new Date(firstAccessDate);
  const unlockDate = new Date(firstAccess);
  unlockDate.setMonth(unlockDate.getMonth() + delayMonths);
  
  const now = new Date();
  const diffTime = unlockDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Helper to check if sub-pack should be locked
export const checkSubPackLock = (
  packId: number, 
  subPackId: number
): { isLocked: boolean; message?: string; daysRemaining?: number } => {
  // Check if user is admin - admins bypass all locks
  const userConnected = localStorage.getItem('userconnected');
  if (userConnected) {
    try {
      const userData = JSON.parse(userConnected);
      if (userData.role === 'admin') {
        return { isLocked: false };
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
  
  const rule = ACCESS_TIMING_RULES.find(
    r => r.packId === packId && r.subPackId === subPackId
  );
  
  if (!rule) {
    return { isLocked: false };
  }
  
  const firstAccessKey = getFirstAccessKey(packId);
  const firstAccessDate = localStorage.getItem(firstAccessKey);
  
  // If no first access recorded yet, sub-pack is locked
  if (!firstAccessDate) {
    return { 
      isLocked: true, 
      message: rule.message.notStarted 
    };
  }
  
  // Calculate days remaining
  const daysRemaining = calculateDaysRemaining(firstAccessDate, rule.delayMonths);
  
  if (daysRemaining > 0) {
    return {
      isLocked: true,
      message: rule.message.waiting.replace('{days}', daysRemaining.toString()),
      daysRemaining
    };
  }
  
  return { isLocked: false };
};

// Helper to record first access
export const recordFirstAccess = (packId: number): void => {
  const firstAccessKey = getFirstAccessKey(packId);
  
  // Only record if not already recorded
  if (!localStorage.getItem(firstAccessKey)) {
    localStorage.setItem(firstAccessKey, new Date().toISOString());
  }
};
