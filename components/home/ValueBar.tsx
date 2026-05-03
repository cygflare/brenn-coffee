import { Truck, Clock, Leaf, Award } from 'lucide-react';

const VALUES = [
  { icon: Truck, label: 'Free UK shipping over £30' },
  { icon: Clock, label: 'Roasted to order in 48hr' },
  { icon: Leaf, label: 'Direct trade, ethically sourced' },
  { icon: Award, label: '94+ avg cupping score' },
];

export function ValueBar() {
  return (
    <section className="border-y border-bone-200/8 py-5">
      <div className="container-x grid grid-cols-2 md:grid-cols-4 gap-6">
        {VALUES.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3 text-xs text-bone-200/65">
            <Icon size={16} className="text-ember flex-shrink-0" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
