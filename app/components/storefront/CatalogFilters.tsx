'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { startTransition, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { priceRanges, shopSortOptions } from '@/app/lib/constants';
import type { CatalogFilterOptions, CatalogFilters } from '@/app/lib/types';

type CatalogFiltersProps = {
  currentFilters: CatalogFilters;
  filterOptions: CatalogFilterOptions;
};

type FilterField = 'q' | 'brand' | 'gender' | 'category' | 'size' | 'price' | 'sort';

export function CatalogFilters({ currentFilters, filterOptions }: CatalogFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(currentFilters.q ?? '');

  const filterSections = useMemo(
    () => [
      { label: 'Brand', name: 'brand' as const, values: filterOptions.brands },
      { label: 'Gender', name: 'gender' as const, values: filterOptions.genders },
      { label: 'Category', name: 'category' as const, values: filterOptions.categories },
    ],
    [filterOptions.brands, filterOptions.categories, filterOptions.genders]
  );

  const updateFilter = (field: FilterField, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (!value) next.delete(field);
    else next.set(field, value);

    if (field !== 'sort' && !next.get('sort')) {
      next.set('sort', currentFilters.sort || 'featured');
    }

    startTransition(() => {
      router.push(next.toString() ? `${pathname}?${next.toString()}` : pathname);
    });
  };

  const clearAll = () => {
    setSearchInput('');
    startTransition(() => {
      router.push(pathname);
    });
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateFilter('q', searchInput.trim());
  };

  const filtersUi = (
    <div className="space-y-6">
      <form onSubmit={submitSearch} className="premium-card p-5">
        <label className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">
          Search
        </label>
        <div className="mt-3 flex gap-3">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search brand, category, silhouette"
            className="min-w-0 flex-1 rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-ember)]"
          />
          <button
            type="submit"
            className="rounded-full bg-[var(--color-foreground)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white"
          >
            Go
          </button>
        </div>
      </form>

      <div className="premium-card p-5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">
            Sort
          </label>
          <button type="button" onClick={clearAll} className="text-xs uppercase tracking-[0.18em] text-[var(--color-ember)]">
            Reset
          </button>
        </div>
        <select
          value={currentFilters.sort || 'featured'}
          onChange={(event) => updateFilter('sort', event.target.value)}
          className="mt-3 w-full rounded-2xl border border-[var(--color-border)] bg-white/80 px-4 py-3 text-sm outline-none"
        >
          {shopSortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {filterSections.map((section) => (
        <div key={section.name} className="premium-card p-5">
          <label className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">
            {section.label}
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateFilter(section.name, '')}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] ${
                !currentFilters[section.name]
                  ? 'border-[var(--color-foreground)] bg-[var(--color-foreground)] text-white'
                  : 'border-[var(--color-border)] text-[var(--color-muted-foreground)]'
              }`}
            >
              All
            </button>
            {section.values.map((value) => {
              const active = currentFilters[section.name] === value;
              return (
                <button
                  type="button"
                  key={value}
                  onClick={() => updateFilter(section.name, value)}
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition ${
                    active
                      ? 'border-[var(--color-foreground)] bg-[var(--color-foreground)] text-white'
                      : 'border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-ember)]'
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="premium-card p-5">
        <label className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">
          Price
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateFilter('price', '')}
            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] ${
              !currentFilters.price
                ? 'border-[var(--color-foreground)] bg-[var(--color-foreground)] text-white'
                : 'border-[var(--color-border)] text-[var(--color-muted-foreground)]'
            }`}
          >
            All
          </button>
          {priceRanges.map((range) => (
            <button
              type="button"
              key={range.value}
              onClick={() => updateFilter('price', range.value)}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] ${
                currentFilters.price === range.value
                  ? 'border-[var(--color-foreground)] bg-[var(--color-foreground)] text-white'
                  : 'border-[var(--color-border)] text-[var(--color-muted-foreground)]'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="premium-card p-5">
        <label className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">
          Size
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateFilter('size', '')}
            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] ${
              !currentFilters.size
                ? 'border-[var(--color-foreground)] bg-[var(--color-foreground)] text-white'
                : 'border-[var(--color-border)] text-[var(--color-muted-foreground)]'
            }`}
          >
            All
          </button>
          {filterOptions.sizes.map((size) => (
            <button
              type="button"
              key={size}
              onClick={() => updateFilter('size', String(size))}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] ${
                currentFilters.size === String(size)
                  ? 'border-[var(--color-foreground)] bg-[var(--color-foreground)] text-white'
                  : 'border-[var(--color-border)] text-[var(--color-muted-foreground)]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-6 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-full border border-[var(--color-border)] bg-white/80 px-5 py-3 text-xs uppercase tracking-[0.22em] text-[var(--color-foreground)]"
        >
          Open filters
        </button>
      </div>
      <div className="hidden lg:block">{filtersUi}</div>
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 p-4 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="ml-auto h-full w-[min(92vw,24rem)] overflow-y-auto rounded-[2rem] bg-[var(--color-background)] p-4"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-3xl">Filters</h3>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm uppercase tracking-[0.18em]"
                >
                  Close
                </button>
              </div>
              {filtersUi}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
