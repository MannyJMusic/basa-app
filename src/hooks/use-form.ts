'use client'

import { useForm, UseFormProps, FieldValues, Path, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'

interface UseFormWithValidationProps<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
  schema: z.ZodSchema<T>
  onSubmit: (data: T) => Promise<void> | void
  onError?: (error: any) => void
}

interface UseFormWithValidationReturn<T extends FieldValues> extends UseFormReturn<T> {
  isSubmitting: boolean
  submitError: string | null
  customHandleSubmit: (e?: React.FormEvent) => Promise<void>
}

export function useFormWithValidation<T extends FieldValues>({
  schema,
  onSubmit,
  onError,
  ...formProps
}: UseFormWithValidationProps<T>): UseFormWithValidationReturn<T> {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<T>({
    resolver: zodResolver(schema),
    ...formProps
  })

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const isValid = await form.trigger()
      if (!isValid) {
        setIsSubmitting(false)
        return
      }

      const data = form.getValues()
      await onSubmit(data)
    } catch (error: any) {
      const errorMessage = error?.message || 'An error occurred while submitting the form'
      setSubmitError(errorMessage)
      onError?.(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    ...form,
    isSubmitting,
    submitError,
    customHandleSubmit: handleSubmit
  }
}

// Utility hook for field validation
export function useFieldValidation<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: Path<T>
) {
  const {
    formState: { errors },
    clearErrors,
    setError
  } = form

  const fieldError = errors[fieldName]
  const hasError = !!fieldError

  const clearFieldError = () => {
    clearErrors(fieldName)
  }

  const setFieldError = (message: string) => {
    setError(fieldName, {
      type: 'manual',
      message
    })
  }

  return {
    error: fieldError,
    hasError,
    clearFieldError,
    setFieldError
  }
}

// Hook for form field focus management
export function useFormFocus<T extends FieldValues>(
  form: UseFormReturn<T>
) {
  const { setFocus } = form

  const focusField = (fieldName: Path<T>) => {
    setFocus(fieldName)
  }

  const focusFirstError = () => {
    const { errors } = form.formState
    const firstErrorField = Object.keys(errors)[0] as Path<T>
    if (firstErrorField) {
      setFocus(firstErrorField)
    }
  }

  return {
    focusField,
    focusFirstError
  }
}

// Hook for form reset with confirmation
export function useFormReset<T extends FieldValues>(
  form: UseFormReturn<T>
) {
  const { reset, formState } = form

  const resetForm = (data?: Partial<T>) => {
    reset(data as any)
  }

  const resetFormWithConfirmation = (data?: Partial<T>) => {
    if (formState.isDirty) {
      const confirmed = window.confirm('Are you sure you want to reset the form? All changes will be lost.')
      if (confirmed) {
        reset(data as any)
      }
    } else {
      reset(data as any)
    }
  }

  return {
    resetForm,
    resetFormWithConfirmation
  }
}

// Hook for form auto-save
export function useFormAutoSave<T extends FieldValues>(
  form: UseFormReturn<T>,
  onAutoSave: (data: T) => Promise<void> | void,
  delay: number = 2000
) {
  const { watch, formState } = form
  const [isAutoSaving, setIsAutoSaving] = useState(false)

  // Watch for changes and auto-save
  const watchedValues = watch()

  useEffect(() => {
    if (!formState.isDirty) return

    const timeoutId = setTimeout(async () => {
      setIsAutoSaving(true)
      try {
        await onAutoSave(watchedValues)
      } catch (error) {
        console.error('Auto-save failed:', error)
      } finally {
        setIsAutoSaving(false)
      }
    }, delay)

    return () => clearTimeout(timeoutId)
  }, [watchedValues, formState.isDirty, onAutoSave, delay])

  return {
    isAutoSaving
  }
}

// Hook for form validation on blur
export function useFormBlurValidation<T extends FieldValues>(
  form: UseFormReturn<T>
) {
  const { trigger } = form

  const validateFieldOnBlur = async (fieldName: Path<T>) => {
    await trigger(fieldName)
  }

  const validateAllFieldsOnBlur = async () => {
    await trigger()
  }

  return {
    validateFieldOnBlur,
    validateAllFieldsOnBlur
  }
}

// Hook for form submission with loading states
export function useFormSubmission<T extends FieldValues>(
  form: UseFormReturn<T>,
  onSubmit: (data: T) => Promise<void> | void
) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      const isValid = await form.trigger()
      if (!isValid) {
        setIsSubmitting(false)
        return
      }

      const data = form.getValues()
      await onSubmit(data)
      setSubmitSuccess(true)
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 3000)
    } catch (error: any) {
      const errorMessage = error?.message || 'An error occurred while submitting the form'
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearSubmitError = () => {
    setSubmitError(null)
  }

  const clearSubmitSuccess = () => {
    setSubmitSuccess(false)
  }

  return {
    isSubmitting,
    submitError,
    submitSuccess,
    handleSubmit,
    clearSubmitError,
    clearSubmitSuccess
  }
} 