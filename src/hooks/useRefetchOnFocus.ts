import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

// Refetch when the screen comes back into focus (not on the first focus: the query has just
// loaded then). Keeps tab screens fresh after something changed elsewhere.
export const useRefetchOnFocus = (refetch: () => unknown) => {
  const first = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (first.current) {
        first.current = false;
        return;
      }
      refetch();
    }, [refetch]),
  );
};
