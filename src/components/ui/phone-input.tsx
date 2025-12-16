import * as React from 'react';
import { Input } from '@/components/ui/input';
import { formatPhoneInput, getDigitsOnly } from '@/lib/phone-utils';
import { cn } from '@/lib/utils';

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
  onRawChange?: (digits: string) => void;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value = '', onChange, onRawChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(() => formatPhoneInput(value));

    // Sync display value with external value changes
    React.useEffect(() => {
      if (value) {
        setDisplayValue(formatPhoneInput(value));
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const formatted = formatPhoneInput(input);
      setDisplayValue(formatted);

      // Call onChange with formatted value
      if (onChange) {
        onChange(formatted);
      }

      // Call onRawChange with just digits (useful for form submission)
      if (onRawChange) {
        onRawChange(getDigitsOnly(input));
      }
    };

    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        value={displayValue}
        onChange={handleChange}
        placeholder="(555) 123-4567"
        className={cn(className)}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
