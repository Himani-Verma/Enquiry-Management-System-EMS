import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import { getUserContext } from '@/lib/middleware/auth';
import Visitor from '@/lib/models/Visitor';
import { corsHeaders } from '@/lib/cors';

async function getVisitorsManagement(request: NextRequest, user: any) {
  try {
    console.log('🔍 getVisitorsManagement called with user:', JSON.stringify(user, null, 2));
    await connectMongo();
    console.log('✅ MongoDB connected');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const source = searchParams.get('source') || '';

    const pageNum = Math.max(page, 1);
    const limitNum = Math.min(Math.max(limit, 1), 200);

    // Get user context for role-based filtering
    const userContext = getUserContext(user);
    console.log('🔐 User context:', JSON.stringify(userContext, null, 2));
    console.log('🔍 Data filter:', JSON.stringify(userContext.dataFilter, null, 2));
    console.log('🔍 User role:', userContext.userRole);
    console.log('🔍 Can access all:', userContext.canAccessAll);
    console.log('🔍 Is sales executive:', userContext.isSalesExecutive);
    
    // Build base filter from user context
    let filter: any = {};
    
    // Apply role-based filtering - CRITICAL: Sales executives must only see their own visitors
    if (!userContext.canAccessAll && userContext.dataFilter) {
      filter = userContext.dataFilter;
      console.log('✅ Applied role-based filter:', JSON.stringify(filter, null, 2));
    } else {
      console.log('⚠️ No filter applied - user can access all data');
    }
    
    // Add search filters
    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const searchFilter = {
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { organization: searchRegex },
          { region: searchRegex },
          { service: searchRegex },
          { subservice: searchRegex },
          { agentName: searchRegex },
          { salesExecutiveName: searchRegex },
          { customerExecutiveName: searchRegex },
          { status: searchRegex },
          { enquiryDetails: searchRegex },
          { comments: searchRegex },
          { source: searchRegex }
        ]
      };
      
      // Combine role-based filter with search filter
      if (Object.keys(filter).length > 0) {
        filter = { $and: [filter, searchFilter] };
      } else {
        filter = searchFilter;
      }
    }
    
    // Add additional filters
    if (status) {
      if (filter.$and) {
        filter.$and.push({ status });
      } else if (Object.keys(filter).length > 0) {
        filter = { $and: [filter, { status }] };
      } else {
        filter.status = status;
      }
    }
    
    if (source) {
      if (filter.$and) {
        filter.$and.push({ source });
      } else if (Object.keys(filter).length > 0) {
        filter = { $and: [filter, { source }] };
      } else {
        filter.source = source;
      }
    }

    console.log('🔍 Final MongoDB filter:', JSON.stringify(filter, null, 2));

    // Get visitors with pagination
    const [visitors, totalCount] = await Promise.all([
      Visitor.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Visitor.countDocuments(filter)
    ]);

    console.log(`📊 Found ${visitors.length} visitors (total: ${totalCount})`);

    // Transform visitors data for frontend
    const transformedVisitors = visitors.map((v: any) => {
      return {
        _id: v._id.toString(),
        name: v.name || '',
        email: v.email || '',
        phone: v.phone || '',
        organization: v.organization || '',
        region: v.region || '',
        service: v.service || 'General Inquiry',
        subservice: v.subservice || '',
        enquiryDetails: v.enquiryDetails || '',
        source: v.source || 'chatbot',
        createdAt: v.createdAt,
        lastInteractionAt: v.lastInteractionAt,
        isConverted: v.isConverted || false,
        status: v.status || 'enquiry_required',
        agent: v.agent || '',
        agentName: v.agentName || '',
        assignedAgent: v.assignedAgent ? v.assignedAgent.toString() : null,
        salesExecutive: v.salesExecutive ? v.salesExecutive.toString() : null,
        salesExecutiveName: v.salesExecutiveName || '',
        customerExecutive: v.customerExecutive || null,
        customerExecutiveName: v.customerExecutiveName || '',
        comments: v.comments || '',
        amount: v.amount || 0,
        pipelineHistory: v.pipelineHistory || [],
        version: v.version || 1,
        lastModifiedBy: v.lastModifiedBy || '',
        lastModifiedAt: v.lastModifiedAt || v.updatedAt,
        assignmentHistory: v.assignmentHistory || []
      };
    });

    const response = NextResponse.json({
      visitors: transformedVisitors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum)
      },
      userContext: {
        role: userContext.userRole,
        canAccessAll: userContext.canAccessAll
      }
    });
    
    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;

  } catch (error) {
    console.error('❌ Analytics visitors management error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to load visitors management data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Get user from localStorage via headers
export const GET = async (request: NextRequest) => {
  try {
    console.log('📥 GET request received for visitors-management');
    
    // Get user info from request headers (sent by frontend)
    const userHeader = request.headers.get('X-User-Info');
    console.log('📋 X-User-Info header:', userHeader);
    
    // NO DEFAULT USER - Force proper authentication
    let user: any = null;
    
    if (userHeader && userHeader !== 'null' && userHeader !== 'undefined') {
      try {
        const parsedUser = JSON.parse(userHeader);
        // Only use parsed user if it has required fields
        if (parsedUser && parsedUser.role) {
          user = parsedUser;
          console.log('🔐 User from header:', JSON.stringify(user, null, 2));
        }
      } catch (e) {
        console.error('❌ Failed to parse user header:', e);
      }
    }
    
    // If no valid user, return error
    if (!user || !user.role) {
      console.error('❌ No valid user found in request');
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }
    
    console.log('✅ Using user:', JSON.stringify(user, null, 2));
    return await getVisitorsManagement(request, user);
  } catch (error) {
    console.error('❌ Visitors management API error (outer catch):', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({
      success: false,
      message: 'Failed to load visitors management data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};
