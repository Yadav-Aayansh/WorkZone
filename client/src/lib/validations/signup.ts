import { z } from "zod"

// Step 1: User Account Setup Schema
export const userAccountSchema = z.object({
  fullName: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Full name should only contain letters"),
  
  email: z.string()
    .email("Please enter a valid email address")
    .refine(
      (email) => {
        // Discourage free email providers for business use
        const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        const domain = email.split('@')[1];
        return !freeProviders.includes(domain);
      },
      { message: "Please use a business email address" }
    ),
  
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type UserAccountFormData = z.infer<typeof userAccountSchema>

// Step 2: Company Workspace Setup Schema
export const companyWorkspaceSchema = z.object({
  brandName: z.string()
    .min(2, "Brand name must be at least 2 characters")
    .max(50, "Brand name must not exceed 50 characters"),
  
  logo: z.instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true
      return file.size <= 5 * 1024 * 1024 // 5MB
    }, "Logo file size must be less than 5MB")
    .refine((file) => {
      if (!file) return true
      return ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(file.type)
    }, "Logo must be PNG, JPG, JPEG, or SVG"),
  
  tenantId: z.string()
    .min(3, "Tenant ID must be at least 3 characters")
    .max(30, "Tenant ID must not exceed 30 characters")
    .regex(/^[a-z0-9-]+$/, "Tenant ID can only contain lowercase letters, numbers, and hyphens")
    .refine((id) => !id.startsWith('-') && !id.endsWith('-'), "Tenant ID cannot start or end with a hyphen")
})

export type CompanyWorkspaceFormData = z.infer<typeof companyWorkspaceSchema>

// Step 3: Payment/Plan Selection Schema
export const paymentPlanSchema = z.object({
  plan: z.enum(['3-month', '6-month', '12-month'], {
    message: "Please select a plan"
  })
})

export type PaymentPlanFormData = z.infer<typeof paymentPlanSchema>

// Combined signup data
export type SignupData = UserAccountFormData & CompanyWorkspaceFormData & PaymentPlanFormData
