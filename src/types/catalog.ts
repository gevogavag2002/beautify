import type { Id } from './common';

// Managed by admin on the backend. Never hardcode these in the app.
export type ProviderType = { id: Id; slug: string; name: string };

// A category belongs to one or more provider types; the backend filters by `providerTypeId`.
export type ServiceCategory = {
  id: Id;
  name: string;
  providerTypeIds: Id[];
  services: CatalogService[];
};
export type CatalogService = { id: Id; categoryId: Id; name: string };
