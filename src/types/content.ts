// Help and legal texts. They are written and translated on the backend (the web shows the
// same texts on its FAQ and Privacy pages); the app only renders them.
export type FaqItem = { id: string; question: string; answer: string };

export type Faq = {
  client: FaqItem[];
  provider: FaqItem[];
  /** Shown in the "Still have a question?" card; null hides the card. */
  supportEmail: string | null;
};

export type PolicyBlock = { type: 'text' | 'bullet'; text: string };

export type PolicySection = {
  id: string;
  title: string;
  blocks: PolicyBlock[];
  /** True for the section that is followed by the "what we collect" table. */
  table: boolean;
};

export type PolicyDataRow = { data: string; what: string; why: string; who: string };

export type PrivacyPolicy = {
  /** ISO date of the last change; null until the policy is published. */
  updatedAt: string | null;
  summary: string[];
  sections: PolicySection[];
  dataTable: PolicyDataRow[];
};
