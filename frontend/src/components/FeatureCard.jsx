import { ShieldCheck, Package, DollarSign, Truck, BarChart3 } from "lucide-react";

const iconMap = {
  auth: ShieldCheck,
  inventory: Package,
  sales: DollarSign,
  supplier: Truck,
  analytics: BarChart3,
};

const FeatureCard = ({ type, title, description }) => {
  const Icon = iconMap[type];

  return (
    <div className="feature-card">
      <Icon size={32} className="card-icon" />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default FeatureCard;
