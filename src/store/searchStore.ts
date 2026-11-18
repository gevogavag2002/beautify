import { create } from 'zustand';

import type { Id, NearbyQuery } from '@/types';

export type Radius = 1 | 3 | 5 | 10;
export type Sort = NonNullable<NearbyQuery['sort']>;

type SearchState = {
  typeId: Id | null;
  radius: Radius;
  sort: Sort;
  /** Free-text query typed on Home. */
  q: string;
  set: (patch: Partial<Pick<SearchState, 'typeId' | 'radius' | 'sort' | 'q'>>) => void;
};

// Filters of the Nearby search. Global because Home sets them (type tile, search field,
// "See all") right before switching to the Map tab.
export const useSearchStore = create<SearchState>((set) => ({
  typeId: null,
  radius: 3,
  sort: 'distance',
  q: '',
  set: (patch) => set(patch),
}));
