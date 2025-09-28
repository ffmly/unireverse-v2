import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  try {
    initializeApp({
      credential: cert(serviceAccount as any),
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

// Interface for authenticated request
export interface AuthenticatedRequest extends NextRequest {
  user?: {
    uid: string;
    email?: string;
    role?: string;
  };
}

// Authentication middleware
export async function authenticateUser(req: NextRequest): Promise<{
  success: boolean;
  user?: { uid: string; email?: string; role?: string };
  error?: string;
}> {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'No authorization token provided'
      };
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return {
        success: false,
        error: 'Invalid authorization token format'
      };
    }

    // Verify the token with Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(token);
    
    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'user'
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Invalid or expired token'
    };
  }
}

// Admin-only middleware
export async function requireAdmin(req: NextRequest): Promise<{
  success: boolean;
  user?: { uid: string; email?: string; role?: string };
  error?: string;
}> {
  const authResult = await authenticateUser(req);
  
  if (!authResult.success) {
    return authResult;
  }

  if (authResult.user?.role !== 'admin') {
    return {
      success: false,
      error: 'Admin access required'
    };
  }

  return authResult;
}

// User or Admin middleware
export async function requireAuth(req: NextRequest): Promise<{
  success: boolean;
  user?: { uid: string; email?: string; role?: string };
  error?: string;
}> {
  return await authenticateUser(req);
}

// Middleware wrapper for API routes
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authResult = await requireAuth(req);
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // Add user to request object
    (req as AuthenticatedRequest).user = authResult.user;
    
    return handler(req as AuthenticatedRequest);
  };
}

// Middleware wrapper for admin-only API routes
export function withAdminAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authResult = await requireAdmin(req);
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 403 }
      );
    }

    // Add user to request object
    (req as AuthenticatedRequest).user = authResult.user;
    
    return handler(req as AuthenticatedRequest);
  };
}

// Helper function to get user from request
export function getUserFromRequest(req: AuthenticatedRequest) {
  return req.user;
}
