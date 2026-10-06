import React from 'react';
import {
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Radio,
} from 'lucide-react';

interface StatusBadgeProps {
  type?: 'order' | 'stock' | 'log';
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type = 'order',
  status,
  size = 'md',
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[9px] gap-1'
      : 'px-2.5 py-1 text-[10px] gap-1.5';

  if (type === 'order') {
    switch (status) {
      case 'Delivered':
        return (
          <span className={`inline-flex items-center rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
            <PackageCheck className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case 'Shipped':
        return (
          <span className={`inline-flex items-center rounded-full font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 ${sizeClasses}`}>
            <Truck className="w-3 h-3" />
            <span>Shipped</span>
          </span>
        );
      case 'Processing':
        return (
          <span className={`inline-flex items-center rounded-full font-bold bg-brand-50 text-brand-700 border border-brand-200 ${sizeClasses}`}>
            <Clock className="w-3 h-3" />
            <span>Processing</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className={`inline-flex items-center rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
            <AlertTriangle className="w-3 h-3" />
            <span>{status || 'Pending'}</span>
          </span>
        );
    }
  }

  if (type === 'stock') {
    if (status === 'Out of Stock') {
      return (
        <span className={`inline-flex items-center rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <XCircle className="w-3 h-3" />
          <span>Out of Stock</span>
        </span>
      );
    }
    if (status === 'Low Stock' || status === 'Reorder Alert') {
      return (
        <span className={`inline-flex items-center rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse ${sizeClasses}`}>
          <AlertTriangle className="w-3 h-3" />
          <span>Reorder Alert</span>
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
        <CheckCircle2 className="w-3 h-3" />
        <span>In Stock</span>
      </span>
    );
  }

  // Log / Action type
  if (status === 'Login Failed' || status === 'Danger') {
    return (
      <span className={`inline-flex items-center rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
        <XCircle className="w-3 h-3" />
        <span>{status}</span>
      </span>
    );
  }
  if (status === 'Login Success' || status === 'Success') {
    return (
      <span className={`inline-flex items-center rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
        <CheckCircle2 className="w-3 h-3" />
        <span>{status}</span>
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center rounded-full font-bold bg-brand-50 text-brand-700 border border-brand-200 ${sizeClasses}`}>
      <Radio className="w-3 h-3 text-brand-600" />
      <span>{status}</span>
    </span>
  );
};
