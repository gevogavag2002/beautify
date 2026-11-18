import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { myProviderApi } from '@/api/myProviderApi';
import { profileApi } from '@/api/profileApi';
import type { Provider } from '@/types';

const KEY = ['me', 'provider'];

/** The signed-in provider's own business record. */
export const useMyProvider = () => useQuery({ queryKey: KEY, queryFn: profileApi.getMyProvider });

// Every mutation of the business returns the full Provider: write it straight into the
// cache, and drop the public copies (search cards, provider page) so clients-side screens
// opened in the same session are fresh too.
const useProviderMutation = <TInput>(fn: (input: TInput) => Promise<Provider>) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (p) => {
      qc.setQueryData(KEY, p);
      qc.invalidateQueries({ queryKey: ['providers'] });
    },
  });
};

export const useUpdateMyProvider = () => useProviderMutation(profileApi.updateMyProvider);
export const useAddService = () => useProviderMutation(myProviderApi.addService);
export const useUpdateService = () => useProviderMutation(myProviderApi.updateService);
export const useRemoveService = () => useProviderMutation(myProviderApi.removeService);
export const useAddPhoto = () => useProviderMutation(myProviderApi.addPhoto);
export const useRemovePhoto = () => useProviderMutation(myProviderApi.removePhoto);
export const useReorderPhotos = () => useProviderMutation(myProviderApi.reorderPhotos);
