'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller, FieldValues, Path, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// Form field props interface
interface FormFieldProps<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio'
  options?: Array<{ value: string; label: string }>
  required?: boolean
  disabled?: boolean
  className?: string
  error?: string
  helperText?: string
  autoComplete?: string
  rows?: number
  min?: number
  max?: number
  step?: number
}

// Enhanced form props interface
interface EnhancedFormProps<T extends FieldValues> {
  schema: z.ZodSchema<T>
  onSubmit: (data: T) => Promise<void> | void
  onError?: (error: any) => void
  defaultValues?: Partial<T>
  children: React.ReactNode
  className?: string
  submitText?: string
  loadingText?: string
  showReset?: boolean
  resetText?: string
  autoSave?: boolean
  autoSaveDelay?: number
  onAutoSave?: (data: T) => Promise<void> | void
}

// Form field component
function FormField<T extends FieldValues>({
  name,
  label,
  placeholder,
  type = 'text',
  options = [],
  required = false,
  disabled = false,
  className,
  error,
  helperText,
  autoComplete,
  rows = 3,
  min,
  max,
  step,
  ...props
}: FormFieldProps<T> & { control: any }) {
  const fieldId = `field-${name}`

  const renderField = (field: any) => {
    const commonProps = {
      id: fieldId,
      placeholder,
      disabled,
      autoComplete,
      className: cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-destructive focus-visible:ring-destructive',
        className
      ),
      ...field,
      ...props
    }

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
            className={cn(commonProps.className, 'min-h-[80px] resize-none')}
          />
        )

      case 'select':
        return (
          <select {...commonProps}>
            <option value="">{placeholder || 'Select an option'}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <input
            {...commonProps}
            type="checkbox"
            className={cn(commonProps.className, 'h-4 w-4')}
          />
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  {...commonProps}
                  type="radio"
                  value={option.value}
                  className="h-4 w-4"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        )

      default:
        return (
          <input
            {...commonProps}
            type={type}
            min={min}
            max={max}
            step={step}
          />
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <Controller
        name={name}
        render={({ field, fieldState }) => (
          <div>
            {renderField(field)}
            <AnimatePresence>
              {(fieldState.error?.message || error) && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm text-destructive mt-1"
                >
                  {fieldState.error?.message || error}
                </motion.p>
              )}
            </AnimatePresence>
            {helperText && !fieldState.error?.message && !error && (
              <p className="text-sm text-muted-foreground mt-1">{helperText}</p>
            )}
          </div>
        )}
      />
    </motion.div>
  )
}

// Enhanced form component
export function EnhancedForm<T extends FieldValues>({
  schema,
  onSubmit,
  onError,
  defaultValues,
  children,
  className,
  submitText = 'Submit',
  loadingText = 'Submitting...',
  showReset = false,
  resetText = 'Reset',
  autoSave = false,
  autoSaveDelay = 2000,
  onAutoSave
}: EnhancedFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode: 'onBlur'
  })

  const { handleSubmit, reset, watch, formState } = form

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !onAutoSave || !formState.isDirty) return

    const timeoutId = setTimeout(async () => {
      setIsAutoSaving(true)
      try {
        const data = form.getValues()
        await onAutoSave(data)
      } catch (error) {
        console.error('Auto-save failed:', error)
      } finally {
        setIsAutoSaving(false)
      }
    }, autoSaveDelay)

    return () => clearTimeout(timeoutId)
  }, [watch(), formState.isDirty, autoSave, onAutoSave, autoSaveDelay, form])

  const onSubmitHandler = async (data: T) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      await onSubmit(data)
      setSubmitSuccess(true)
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 3000)
    } catch (error: any) {
      const errorMessage = error?.message || 'An error occurred while submitting the form'
      setSubmitError(errorMessage)
      onError?.(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onReset = () => {
    if (formState.isDirty) {
      const confirmed = window.confirm('Are you sure you want to reset the form? All changes will be lost.')
      if (confirmed) {
        reset(defaultValues as any)
      }
    } else {
      reset(defaultValues as any)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit(onSubmitHandler as any)}
      className={cn('space-y-6', className)}
    >
      {/* Auto-save indicator */}
      {autoSave && isAutoSaving && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center space-x-2 text-sm text-muted-foreground"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-muted-foreground border-t-primary rounded-full"
          />
          <span>Auto-saving...</span>
        </motion.div>
      )}

      {/* Form fields */}
      <div className="space-y-4">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === FormField) {
            return React.cloneElement(child, { control: form.control } as any)
          }
          return child
        })}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-destructive/10 border border-destructive/20 rounded-md"
          >
            <p className="text-sm text-destructive">{submitError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success message */}
      <AnimatePresence>
        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-green-500/10 border border-green-500/20 rounded-md"
          >
            <p className="text-sm text-green-600">Form submitted successfully!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form actions */}
      <div className="flex items-center space-x-4">
        <motion.button
          type="submit"
          disabled={isSubmitting || formState.isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
              />
              {loadingText}
            </>
          ) : (
            submitText
          )}
        </motion.button>

        {showReset && (
          <motion.button
            type="button"
            onClick={onReset}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            {resetText}
          </motion.button>
        )}
      </div>
    </motion.form>
  )
}

// Export FormField as a named export
export { FormField }

// Export form context for advanced usage
export const FormContext = React.createContext<UseFormReturn<any> | null>(null)

// Hook to use form context
export function useFormContext<T extends FieldValues>(): UseFormReturn<T> {
  const context = React.useContext(FormContext)
  if (!context) {
    throw new Error('useFormContext must be used within a FormContext.Provider')
  }
  return context as UseFormReturn<T>
} 