import { Card, CardBody } from './Card';

interface Customization {
  base: string;
  sauce: string;
  cheese: string;
  veggies?: string[];
  meat?: string[];
}

interface CartItemProps {
  id: string;
  name: string;
  imageName: string;
  priceCents: number;
  quantity: number;
  customization: Customization;
  onRemove: () => void;
  onQuantityChange?: (quantity: number) => void;
}

export default function CartItem({
  name,
  imageName,
  priceCents,
  quantity,
  customization,
  onRemove,
}: CartItemProps) {
  const itemTotal = priceCents * quantity;

  return (
    <Card className="overflow-hidden">
      <CardBody className="flex gap-lg">
        {/* Image */}
        <div className="flex-shrink-0">
          <img
            src={`/${imageName}.png`}
            alt={name}
            className="w-24 h-24 object-cover rounded-lg bg-neutral-100"
            onError={(e) => {
              const img = e.currentTarget;
              img.onerror = null;
              img.src = '/Pepperoni.png';
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-display font-bold text-lg text-neutral-900">{name}</h3>
            <p className="font-bold text-primary-600">${(itemTotal / 100).toFixed(2)}</p>
          </div>

          {/* Customization Details */}
          <div className="mt-md flex flex-wrap gap-xs">
            <span className="badge badge-primary">{customization.base}</span>
            <span className="badge badge-primary">{customization.sauce}</span>
            <span className="badge badge-primary">{customization.cheese}</span>
            {customization.veggies?.map((v) => (
              <span key={v} className="badge bg-green-50 text-green-700 border border-green-100">
                {v}
              </span>
            ))}
            {customization.meat?.map((m) => (
              <span key={m} className="badge bg-red-50 text-red-700 border border-red-100">
                {m}
              </span>
            ))}
          </div>

          {/* Price Info */}
          <div className="mt-lg flex items-center justify-between">
            <p className="text-sm text-neutral-500 italic">
              Quantity: {quantity}
            </p>

            <button
              onClick={onRemove}
              className="text-sm font-medium text-neutral-400 hover:text-red-500 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
