import type { Pizza } from '../types';

interface PizzaCardProps {
  pizza: Pizza;
  onAddToCart: (pizza: Pizza) => Promise<void>;
  onCustomize: (pizzaId: string) => void;
  isAdding?: boolean;
  showCustomize?: boolean;
}

export default function PizzaCard({
  pizza,
  onAddToCart,
  onCustomize,
  isAdding = false,
  showCustomize = true,
}: PizzaCardProps) {
  const handleAddClick = async () => {
    await onAddToCart(pizza);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 transition-all hover:scale-[1.02] duration-300 shadow-sm hover:shadow-md group">
      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-6 bg-surface-container-low">
        <img
          src={`/${pizza.imageName || 'Pepperoni'}.png`}
          alt={pizza.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            const img = e.currentTarget;
            img.onerror = null;
            img.src = '/Pepperoni.png';
          }}
        />
        {/* Badges */}
        <div className="absolute top-4 right-4 bg-primary text-on-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
          {pizza.priceCents < 1500 ? 'Classic' : 'Premium'}
        </div>
      </div>

      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-xl font-bold text-on-surface font-headline leading-tight">
            {pizza.name}
          </h3>
          <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">
            San Marzano tomatoes, Fresh Basil, Buffalo Mozzarella, Extra Virgin Olive Oil.
          </p>
        </div>
        <span className="text-lg font-black text-primary whitespace-nowrap">
          ${(pizza.priceCents / 100).toFixed(2)}
        </span>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          onClick={handleAddClick}
          disabled={isAdding}
          className="flex-grow bg-surface-container-high text-on-surface py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-primary hover:text-on-primary transition-all duration-200 disabled:opacity-50"
        >
          {isAdding ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">add</span>
              Add to Cart
            </>
          )}
        </button>
        {showCustomize && (
          <button
            onClick={() => onCustomize(pizza._id)}
            className="px-4 bg-surface-container-high text-on-surface rounded-xl hover:bg-primary hover:text-on-primary transition-all duration-200"
            title="Customize"
          >
            <span className="material-symbols-outlined text-sm">tune</span>
          </button>
        )}
      </div>
    </div>
  );
}
