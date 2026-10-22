'use client'

interface FormSectionProps {
  title?: string
  children: React.ReactNode
  columns?: 1 | 2 | 3
}

export default function FormSection({ title, children, columns = 2 }: FormSectionProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  }[columns]

  return (
    <div className="bg-white border border-[#C7C2AB] p-4 sm:p-6 font-montserrat">
      {title && (
        <h3 className="text-sm sm:text-base font-bold text-[#283106] mb-4">{title}</h3>
      )}
      <div className={`grid ${gridClass} gap-4 sm:gap-6`}>
        {children}
      </div>
    </div>
  )
}

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}

export function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs sm:text-sm font-semibold text-[#283106]">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
  error?: string
}

export function FormInput({ label, required, error, ...props }: FormInputProps) {
  return (
    <FormField label={label} required={required} error={error}>
      <input
        {...props}
        className="px-3 py-2 text-xs sm:text-sm border border-[#C7C2AB] rounded bg-white text-[#283106] placeholder-[#B0A89A] focus:outline-none focus:border-[#777E5C]"
      />
    </FormField>
  )
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  required?: boolean
  error?: string
  options: { value: string; label: string }[]
}

export function FormSelect({ label, required, error, options, ...props }: FormSelectProps) {
  return (
    <FormField label={label} required={required} error={error}>
      <select
        {...props}
        className="px-3 py-2 text-xs sm:text-sm border border-[#C7C2AB] rounded bg-white text-[#283106] focus:outline-none focus:border-[#777E5C]"
      >
        <option value="">Selecione uma opção</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  )
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  required?: boolean
  error?: string
}

export function FormTextarea({ label, required, error, ...props }: FormTextareaProps) {
  return (
    <FormField label={label} required={required} error={error}>
      <textarea
        {...props}
        className="px-3 py-2 text-xs sm:text-sm border border-[#C7C2AB] rounded bg-white text-[#283106] placeholder-[#B0A89A] focus:outline-none focus:border-[#777E5C] resize-none"
      />
    </FormField>
  )
}
