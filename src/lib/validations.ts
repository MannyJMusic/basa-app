import { z } from "zod"

// Placeholder for validation utilities 

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Registration validation schema
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[\d\s\-\(\)]{10,}$/.test(val), {
      message: "Invalid phone number format",
    }),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type RegisterFormData = z.infer<typeof registerSchema>

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
})

export type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>

// Password reset schema
export const passwordResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type PasswordResetData = z.infer<typeof passwordResetSchema>

// Password change schema
export const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmNewPassword: z
    .string()
    .min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
})

export type PasswordChangeData = z.infer<typeof passwordChangeSchema>

// Profile update schema
export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[\d\s\-\(\)]{10,}$/.test(val), {
      message: "Invalid phone number format",
    }),
})

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>

// Email verification schema
export const emailVerificationSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
})

export type EmailVerificationData = z.infer<typeof emailVerificationSchema>

// Member profile schema
export const memberProfileSchema = z.object({
  businessName: z
    .string()
    .min(1, "Business name is required")
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters"),
  businessType: z
    .string()
    .min(1, "Business type is required"),
  industry: z
    .array(z.string())
    .min(1, "At least one industry must be selected"),
  businessEmail: z
    .string()
    .min(1, "Business email is required")
    .email("Invalid email format"),
  businessPhone: z
    .string()
    .min(1, "Business phone is required")
    .regex(/^\+?[\d\s\-\(\)]{10,}$/, "Invalid phone number format"),
  businessAddress: z
    .string()
    .min(1, "Business address is required"),
  city: z
    .string()
    .min(1, "City is required"),
  state: z
    .string()
    .min(1, "State is required"),
  zipCode: z
    .string()
    .min(1, "ZIP code is required")
    .regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  website: z
    .string()
    .url("Invalid website URL")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  tagline: z
    .string()
    .max(200, "Tagline must be less than 200 characters")
    .optional(),
  specialties: z
    .array(z.string())
    .optional(),
  certifications: z
    .array(z.string())
    .optional(),
  linkedin: z
    .string()
    .url("Invalid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  facebook: z
    .string()
    .url("Invalid Facebook URL")
    .optional()
    .or(z.literal("")),
  instagram: z
    .string()
    .url("Invalid Instagram URL")
    .optional()
    .or(z.literal("")),
  twitter: z
    .string()
    .url("Invalid Twitter URL")
    .optional()
    .or(z.literal("")),
  youtube: z
    .string()
    .url("Invalid YouTube URL")
    .optional()
    .or(z.literal("")),
  showInDirectory: z.boolean().default(true),
  allowContact: z.boolean().default(true),
  showAddress: z.boolean().default(false),
})

export type MemberProfileData = z.infer<typeof memberProfileSchema> 