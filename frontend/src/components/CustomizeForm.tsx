import { useState, useEffect, useCallback } from 'react';
import type { CartCustomization } from '../types';

interface CustomizeFormProps {
  pizzaId: string;
  onChange: (id: string, data: CartCustomization) => void;
}

const INGREDIENTS = {
  bases: ['Thin Crust', 'Thick Crust', 'Stuffed Crust', 'Gluten-Free Base', 'Whole Wheat Base'],
  sauces: ['Tomato Sauce', 'BBQ Sauce', 'White Sauce', 'Pesto Sauce', 'Spicy Sauce'],
  cheeses: ['Mozzarella', 'Cheddar', 'Parmesan', 'Goat Cheese', 'Blue Cheese'],
  veggies: [
    'Bell Peppers',
    'Mushrooms',
    'Onions',
    'Tomatoes',
    'Olives',
    'Spinach',
    'Corn',
    'Jalapeños',
    'Pineapple',
  ],
  meat: ['Pepperoni', 'Italian Sausage', 'Ham', 'Bacon', 'Chicken', 'Ground Beef'],
};

export default function CustomizeForm({ pizzaId, onChange }: CustomizeFormProps) {
  const [form, setForm] = useState<CartCustomization>({
    base: 'Thin Crust',
    sauce: 'Tomato Sauce',
    cheese: 'Mozzarella',
    veggies: [],
    meat: [],
  });

  const handleCheckbox = useCallback((type: 'veggies' | 'meat', value: string) => {
    setForm((prev) => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  }, []);

  useEffect(() => {
    onChange(pizzaId, form);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, pizzaId]);

  const Section = ({
    title,
    children,
    icon,
  }: {
    title: string;
    children: React.ReactNode;
    icon?: string;
  }) => (
    <div className="space-y-md">
      <div className="flex items-center gap-md border-b border-neutral-100 pb-sm">
        {icon && <span className="text-xl">{icon}</span>}
        <h3 className="font-display font-bold text-neutral-900">{title}</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-md">{children}</div>
    </div>
  );

  const OptionCard = ({
    label,
    isSelected,
    onClick,
  }: {
    label: string;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center p-md rounded-xl border-2 transition-all duration-base
        ${isSelected
          ? 'border-primary-600 bg-primary-50 text-primary-900 ring-4 ring-primary-100'
          : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
        }
      `}
    >
      <span className="text-sm font-semibold text-center">{label}</span>
      {isSelected && (
        <div className="absolute top-1 right-1 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-[10px] text-white">✓</span>
        </div>
      )}
    </button>
  );

  return (
    <div className="space-y-xl max-h-[60vh] overflow-y-auto px-sm scrollbar-thin">
      {/* Base Section */}
      <Section title="Pick Your Base" icon="🍕">
        {INGREDIENTS.bases.map((base) => (
          <OptionCard
            key={base}
            label={base}
            isSelected={form.base === base}
            onClick={() => setForm({ ...form, base })}
          />
        ))}
      </Section>

      {/* Sauce Section */}
      <Section title="Choose Sauce" icon="🥫">
        {INGREDIENTS.sauces.map((sauce) => (
          <OptionCard
            key={sauce}
            label={sauce}
            isSelected={form.sauce === sauce}
            onClick={() => setForm({ ...form, sauce })}
          />
        ))}
      </Section>

      {/* Cheese Section */}
      <Section title="Add Cheese" icon="🧀">
        {INGREDIENTS.cheeses.map((cheese) => (
          <OptionCard
            key={cheese}
            label={cheese}
            isSelected={form.cheese === cheese}
            onClick={() => setForm({ ...form, cheese })}
          />
        ))}
      </Section>

      {/* Veggies Section */}
      <Section title="Fresh Veggies" icon="🥦">
        {INGREDIENTS.veggies.map((veggie) => (
          <OptionCard
            key={veggie}
            label={veggie}
            isSelected={form.veggies.includes(veggie)}
            onClick={() => handleCheckbox('veggies', veggie)}
          />
        ))}
      </Section>

      {/* Meat Section */}
      <Section title="Select Meat" icon="🥓">
        {INGREDIENTS.meat.map((meat) => (
          <OptionCard
            key={meat}
            label={meat}
            isSelected={form.meat.includes(meat)}
            onClick={() => handleCheckbox('meat', meat)}
          />
        ))}
      </Section>
    </div>
  );
}
