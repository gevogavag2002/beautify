import type { Id } from './common';

// Managed by admin on the backend. Never hardcode these in the app.
export type ProviderType = { id: Id; slug: string; name: string };

export type ServiceCategory = { id: Id; name: string; services: CatalogService[] };
export type CatalogService = { id: Id; categoryId: Id; name: string };
