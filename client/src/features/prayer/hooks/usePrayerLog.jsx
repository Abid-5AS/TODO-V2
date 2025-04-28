// This file is now just re-exporting the hook from the context
import { usePrayerLog } from '../contexts/PrayerLogContext';
export { usePrayerLog };

// For backward compatibility if any component is using the standalone version
export default usePrayerLog; 