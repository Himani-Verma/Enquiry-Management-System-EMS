import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectMongo } from '../mongo';
import User from '../models/User';

export interface AuthenticatedUser {
  userId: string;
  username: string;
  name: string;
  role: string;
}

export interface AuthRequest extends NextRequest {
  user?: AuthenticatedUser;
}

// Verify JWT token
export function verifyToken(token: string): AuthenticatedUser | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here') as any;
    return {
      userId: decoded.userId,
      username: decoded.username,
      name: decoded.name,
      role: decoded.role
    };
  } catch (error) {
    return null;
  }
}

// Extract token from request
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// Authentication middleware
export async function authenticateToken(request: NextRequest): Promise<AuthenticatedUser | null> {
  const token = extractToken(request);
  if (!token) {
    return null;
  }

  const user = verifyToken(token);
  if (!user) {
    return null;
  }

  // Optionally verify user still exists in database
  try {
    await connectMongo();
    const dbUser: any = await User.findById(user.userId).select('-password').lean();
    if (!dbUser || !dbUser.isActive) {
      return null;
    }
  } catch (error) {
    console.error('Database verification error:', error);
    return null;
  }

  return user;
}

// Role-based access control
export function requireRole(allowedRoles: string[]) {
  return (user: AuthenticatedUser | null): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };
}

// Specific role checks
export const requireAdmin = (user: AuthenticatedUser | null): boolean => 
  requireRole(['admin'])(user);

export const requireExecutive = (user: AuthenticatedUser | null): boolean => 
  requireRole(['admin', 'executive', 'sales-executive', 'customer-executive'])(user);

export const requireAdminOrExecutive = (user: AuthenticatedUser | null): boolean => 
  requireRole(['admin', 'executive', 'sales-executive', 'customer-executive'])(user);

export const requireSalesExecutive = (user: AuthenticatedUser | null): boolean => 
  requireRole(['admin', 'sales-executive'])(user);

export const requireCustomerExecutive = (user: AuthenticatedUser | null): boolean => 
  requireRole(['admin', 'customer-executive', 'executive'])(user);

// Create authenticated request handler
export function createAuthenticatedHandler(
  handler: (request: NextRequest, user: AuthenticatedUser, context?: any) => Promise<Response>,
  requiredRole?: (user: AuthenticatedUser | null) => boolean
) {
  return async (request: NextRequest, context?: any): Promise<Response> => {
    try {
      const user = await authenticateToken(request);
      
      if (!user) {
        return new Response(
          JSON.stringify({ success: false, message: 'Authentication required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (requiredRole && !requiredRole(user)) {
        return new Response(
          JSON.stringify({ success: false, message: 'Insufficient permissions' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return await handler(request, user, context);
    } catch (error) {
      console.error('Authentication error:', error);
      return new Response(
        JSON.stringify({ success: false, message: 'Authentication error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}

// Helper function to get user context for role-based filtering
export function getUserContext(user: any) {
  console.log('🔍 getUserContext called with user:', user);
  
  // Provide defaults if user is invalid
  if (!user || !user.role) {
    console.warn('⚠️ Invalid user object, using admin defaults:', user);
    return {
      userId: user?.userId || 'temp',
      userName: user?.name || 'Admin',
      userRole: 'admin',
      isAdmin: true,
      isExecutive: true,
      isSalesExecutive: false,
      isCustomerExecutive: false,
      canAccessAll: true,
      dataFilter: {}
    };
  }
  
  const isAdmin = user.role === 'admin';
  const isExecutive = ['executive', 'sales-executive', 'customer-executive'].includes(user.role);
  const isSalesExecutive = user.role === 'sales-executive';
  const isCustomerExecutive = user.role === 'customer-executive';

  // Get user ID - handle both 'id' and 'userId' fields
  const userId = user.id || user.userId;
  
  console.log('🔍 User ID for filtering:', userId);
  console.log('🔍 User name for filtering:', user.name);
  console.log('🔍 User role:', user.role);
  console.log('🔍 Full user object:', JSON.stringify(user, null, 2));

  // Build data filter based on role
  let dataFilter = {};
  if (!isAdmin) {
    if (isSalesExecutive) {
      // Sales executives can see all visitors in the system
      dataFilter = {};
      console.log('✅ Sales Executive - showing ALL visitors (no filter applied)');
      console.log('🔍 User name:', user.name);
      console.log('🔍 User ID:', userId);
    } else if (isCustomerExecutive) {
      // Customer executives see all visitors in the system (same as sales executives)
      dataFilter = {};
      console.log('✅ Customer Executive - showing ALL visitors (no filter applied)');
      console.log('🔍 User name:', user.name);
      console.log('🔍 User ID:', userId);
    } else {
      // Other executives see visitors assigned to them as agent
      dataFilter = { 
        $or: [
          { assignedAgent: userId },
          { agentName: user.name }
        ]
      };
      console.log('✅ Executive filter applied:', JSON.stringify(dataFilter, null, 2));
    }
  } else {
    console.log('✅ Admin user - no filter applied (can see all visitors)');
  }

  return {
    userId: userId,
    userName: user.name,
    userRole: user.role,
    isAdmin,
    isExecutive,
    isSalesExecutive,
    isCustomerExecutive,
    canAccessAll: isAdmin || isSalesExecutive || isCustomerExecutive, // Sales executives and customer executives can access all visitor data
    dataFilter
  };
}
