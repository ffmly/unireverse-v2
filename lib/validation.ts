import { z } from 'zod';

// Validation schemas for different data types
export const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  studentId: z.string().min(1, 'Student ID is required'),
  role: z.enum(['user', 'admin']).optional().default('user'),
});

export const bookingSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  stadiumId: z.string().min(1, 'Stadium ID is required'),
  timeSlotId: z.string().min(1, 'Time slot ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
});

export const friendlyMatchSchema = z.object({
  hostId: z.string().min(1, 'Host ID is required'),
  stadiumId: z.string().min(1, 'Stadium ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  team1: z.string().min(1, 'Team 1 name is required'),
  team2: z.string().optional(),
  sportId: z.string().min(1, 'Sport ID is required'),
  maxPlayers: z.number().min(2, 'Maximum players must be at least 2').max(50, 'Maximum players cannot exceed 50'),
  currentPlayers: z.number().min(1, 'Current players must be at least 1').optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'any']).optional(),
  isPublic: z.boolean().optional(),
});

export const stadiumSchema = z.object({
  name: z.string().min(1, 'Stadium name is required'),
  location: z.string().min(1, 'Location is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  facilities: z.array(z.string()).optional(),
});

export const timeSlotSchema = z.object({
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  duration: z.number().min(30, 'Duration must be at least 30 minutes'),
  isActive: z.boolean().optional().default(true),
});

// Validation middleware function
export function validateData<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
    try {
      const validatedData = schema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        };
      }
      return {
        success: false,
        errors: ['Invalid data format']
      };
    }
  };
}

// Sanitization functions
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]);
    }
  }
  return sanitized;
}
