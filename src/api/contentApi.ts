import { apiV1 } from '@/services/axiosInstance';
import type { Faq, PrivacyPolicy } from '@/types';

export const contentApi = {
  getFaq: async () => {
    const { data } = await apiV1.get<Faq>('/content/faq');
    return data;
  },
  getPrivacy: async () => {
    const { data } = await apiV1.get<PrivacyPolicy>('/content/privacy');
    return data;
  },
};
