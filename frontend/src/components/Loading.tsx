export function PizzaCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="w-full aspect-square bg-neutral-200" />
      <div className="p-lg space-y-md">
        <div className="space-y-sm">
          <div className="h-6 bg-neutral-200 rounded w-3/4" />
          <div className="h-4 bg-neutral-200 rounded w-full" />
          <div className="h-4 bg-neutral-200 rounded w-2/3" />
        </div>
        <div className="pt-md border-t border-neutral-200 space-y-md">
          <div className="h-8 bg-neutral-200 rounded w-1/3" />
          <div className="flex gap-md">
            <div className="flex-1 h-10 bg-neutral-200 rounded" />
            <div className="flex-1 h-10 bg-neutral-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PizzaCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
      {Array.from({ length: count }).map((_, i) => (
        <PizzaCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="card p-lg animate-pulse">
      <div className="flex gap-lg">
        <div className="w-24 h-24 bg-neutral-200 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-sm">
          <div className="h-6 bg-neutral-200 rounded w-3/4" />
          <div className="h-4 bg-neutral-200 rounded w-full" />
          <div className="h-4 bg-neutral-200 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex items-center justify-center">
      <svg
        className={`${sizeClasses[size]} animate-spin text-primary-600`}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
        <path
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-lg flex gap-md">
      <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <div>
        <h3 className="font-semibold text-red-900">Error</h3>
        <p className="text-sm text-red-700 mt-sm">{message}</p>
      </div>
    </div>
  );
}

export function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-green-50 border border-green-200 p-lg flex gap-md">
      <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <div>
        <h3 className="font-semibold text-green-900">Success</h3>
        <p className="text-sm text-green-700 mt-sm">{message}</p>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="text-center py-3xl">
      <div className="text-5xl mb-lg">{icon}</div>
      <h3 className="text-xl font-display font-bold mb-md">{title}</h3>
      <p className="text-neutral-600 mb-2xl max-w-sm mx-auto">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
