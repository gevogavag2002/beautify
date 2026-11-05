export type Id = string;

export type Paginated<T> = {
  items: T[];
  meta: { page: number; perPage: number; total: number };
};

export type ApiError = { message: string; errors?: Record<string, string[]> };
