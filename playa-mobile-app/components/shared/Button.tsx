import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
}: ButtonProps) {
  const variantStyles = {
    primary: 'bg-blue-500 active:bg-blue-600',
    secondary: 'bg-gray-200 active:bg-gray-300',
    danger: 'bg-red-500 active:bg-red-600',
  };

  const textStyles = {
    primary: 'text-white',
    secondary: 'text-gray-800',
    danger: 'text-white',
  };

  const disabledStyle = disabled || loading ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      className={`px-6 py-3 rounded-lg items-center justify-center min-h-[44px] ${variantStyles[variant]} ${disabledStyle}`}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#374151' : '#ffffff'} />
      ) : (
        <Text className={`text-base font-semibold ${textStyles[variant]}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
