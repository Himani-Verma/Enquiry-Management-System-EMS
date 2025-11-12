import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import { createAuthenticatedHandler, requireAdmin } from '@/lib/middleware/auth';
import ExternalLink from '@/lib/models/ExternalLink';

// GET /api/link - Get all external links with search, filter, and pagination
async function getLinks(request: NextRequest, user: any) {
  try {
    await connectMongo();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    let filter: any = {};
    
    // Search functionality on title and description fields
    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }
    
    // Category filtering
    if (category) {
      filter.category = category;
    }

    // Get total count for pagination
    const total = await ExternalLink.countDocuments(filter);

    // Fetch links with pagination
    const links = await ExternalLink.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    return NextResponse.json({
      success: true,
      links: links.map(link => ({
        _id: link._id?.toString(),
        title: link.title,
        url: link.url,
        description: link.description,
        category: link.category,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Link fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch links',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/link - Create new external link
async function createLink(request: NextRequest, user: any) {
  try {
    await connectMongo();
    
    const body = await request.json();
    const { title, url, description, category } = body;

    // Validation
    const errors: { field: string; message: string }[] = [];

    if (!title || typeof title !== 'string') {
      errors.push({ field: 'title', message: 'Title is required' });
    } else if (title.trim().length < 3) {
      errors.push({ field: 'title', message: 'Title must be at least 3 characters' });
    }

    if (!url || typeof url !== 'string') {
      errors.push({ field: 'url', message: 'URL is required' });
    } else {
      // Validate URL format
      try {
        const urlObj = new URL(url.trim());
        if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
          errors.push({ field: 'url', message: 'URL must use HTTP or HTTPS protocol' });
        }
      } catch {
        errors.push({ field: 'url', message: 'Invalid URL format' });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Validation failed',
        errors
      }, { status: 400 });
    }

    // Create link
    const link = new ExternalLink({
      title: title.trim(),
      url: url.trim(),
      description: description?.trim() || undefined,
      category: category?.trim() || undefined
    });

    await link.save();

    return NextResponse.json({
      success: true,
      link: {
        _id: link._id.toString(),
        title: link.title,
        url: link.url,
        description: link.description,
        category: link.category,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Link creation error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create link',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Public GET endpoint (no auth required for reading links)
export async function GET(request: NextRequest) {
  return getLinks(request, null);
}

// Admin-only POST endpoint
export const POST = createAuthenticatedHandler(createLink, requireAdmin);
