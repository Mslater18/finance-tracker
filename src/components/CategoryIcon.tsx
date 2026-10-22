import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Home,
  Zap,
  Car,
  ShoppingBag,
  Activity,
  Film,
  Laptop,
  Plane,
  Smile,
  GraduationCap,
  MoreHorizontal,
  Briefcase,
  Code,
  TrendingUp,
  RotateCcw,
  PlusCircle,
  Tag,
} from 'lucide-react';
import { ALL_CATEGORIES } from '../data/categories';

interface CategoryIconProps {
  categoryName?: string;
  iconName?: string;
  color?: string;
  size?: number;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  categoryName,
  iconName,
  color,
  size = 18,
  className = '',
}) => {
  const matched = categoryName
    ? ALL_CATEGORIES.find((c) => c.name.toLowerCase() === categoryName.toLowerCase())
    : null;

  const targetIcon = iconName || matched?.iconName || 'Tag';
  const targetColor = color || matched?.color || '#64748B';

  const renderIcon = () => {
    switch (targetIcon) {
      case 'Utensils':
        return <Utensils size={size} />;
      case 'ShoppingCart':
        return <ShoppingCart size={size} />;
      case 'Home':
        return <Home size={size} />;
      case 'Zap':
        return <Zap size={size} />;
      case 'Car':
        return <Car size={size} />;
      case 'ShoppingBag':
        return <ShoppingBag size={size} />;
      case 'Activity':
        return <Activity size={size} />;
      case 'Film':
        return <Film size={size} />;
      case 'Laptop':
        return <Laptop size={size} />;
      case 'Plane':
        return <Plane size={size} />;
      case 'Smile':
        return <Smile size={size} />;
      case 'GraduationCap':
        return <GraduationCap size={size} />;
      case 'Briefcase':
        return <Briefcase size={size} />;
      case 'Code':
        return <Code size={size} />;
      case 'TrendingUp':
        return <TrendingUp size={size} />;
      case 'RotateCcw':
        return <RotateCcw size={size} />;
      case 'PlusCircle':
        return <PlusCircle size={size} />;
      case 'MoreHorizontal':
        return <MoreHorizontal size={size} />;
      default:
        return <Tag size={size} />;
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg shrink-0 ${className}`}
      style={{
        backgroundColor: `${targetColor}18`,
        color: targetColor,
      }}
    >
      {renderIcon()}
    </div>
  );
};
