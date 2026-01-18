import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface AlertProps {
  type: 'error' | 'success';
  message: string;
  onClose?: () => void;
}

export default function Alert({ type, message, onClose }: AlertProps) {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };

  const Icon = type === 'error' ? AlertCircle : CheckCircle2;

  return (
    <div className={`p-4 rounded-lg border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${styles[type]}`}>
      <Icon className="mt-0.5 flex-shrink-0" size={18} />
      <div className="flex-1 text-sm font-medium">
        {message}
      </div>
      {onClose && (
        <button onClick={onClose} className="text-secondary-400 hover:text-secondary-600 transition-colors">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
