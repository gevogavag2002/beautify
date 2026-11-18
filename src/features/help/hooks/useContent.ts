import { useQuery } from '@tanstack/react-query';

import { contentApi } from '@/api/contentApi';

export const useFaq = () =>
  useQuery({ queryKey: ['content', 'faq'], queryFn: contentApi.getFaq, staleTime: Infinity });

export const usePrivacy = () =>
  useQuery({
    queryKey: ['content', 'privacy'],
    queryFn: contentApi.getPrivacy,
    staleTime: Infinity,
  });
