import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import { createAuthenticatedHandler, requireAdmin } from '@/lib/middleware/auth';
import Article from '@/lib/models/Article';

// GET /api/article - Get all articles with search, filter, and pagination
async function getArticles(request: NextRequest, user: any) {
  try {
    await connectMongo();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const tags = searchParams.get('tags') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    let filter: any = {};
    
    // Search functionality using text index on title and content
    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { title: searchRegex },
        { content: searchRegex }
      ];
    }
    
    // Tag filtering
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      if (tagArray.length > 0) {
        filter.tags = { $in: tagArray };
      }
    }

    // Get total count for pagination
    const total = await Article.countDocuments(filter);

    // Fetch articles with pagination
    const articles = await Article.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    return NextResponse.json({
      success: true,
      articles: articles.map(article => ({
        _id: article._id?.toString(),
        title: article.title,
        content: article.content,
        contentPreview: article.content.substring(0, 200) + (article.content.length > 200 ? '...' : ''),
        author: article.author,
        tags: article.tags,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Article fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch articles',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/article - Create new article
async function createArticle(request: NextRequest, user: any) {
  try {
    await connectMongo();
    
    const body = await request.json();
    const { title, content, author, tags } = body;

    // Validation
    const errors: { field: string; message: string }[] = [];

    if (!title || typeof title !== 'string') {
      errors.push({ field: 'title', message: 'Title is required' });
    } else if (title.trim().length < 5) {
      errors.push({ field: 'title', message: 'Title must be at least 5 characters' });
    }

    if (!content || typeof content !== 'string') {
      errors.push({ field: 'content', message: 'Content is required' });
    } else if (content.trim().length < 50) {
      errors.push({ field: 'content', message: 'Content must be at least 50 characters' });
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Validation failed',
        errors
      }, { status: 400 });
    }

    // Create article
    const article = new Article({
      title: title.trim(),
      content: content.trim(),
      author: author?.trim() || user.name || 'Unknown',
      tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()).filter((t: string) => t) : []
    });

    await article.save();

    return NextResponse.json({
      success: true,
      article: {
        _id: article._id.toString(),
        title: article.title,
        content: article.content,
        author: article.author,
        tags: article.tags,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Article creation error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create article',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Public GET endpoint (no auth required for reading articles)
export async function GET(request: NextRequest) {
  return getArticles(request, null);
}

// Admin-only POST endpoint
export const POST = createAuthenticatedHandler(createArticle, requireAdmin);
