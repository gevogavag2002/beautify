import { DEFAULT_LOCATION } from '@/constants/location';

// Single place every screen reads the user's position from. Returns the fixed default
// until device location is added (docs/BACKLOG.md); screens will not change then.
export const useLocation = () => DEFAULT_LOCATION;
