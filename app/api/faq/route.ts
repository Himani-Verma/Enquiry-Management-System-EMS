import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import { createAuthenticatedHandler, requireAdmin } from '@/lib/middleware/auth';
import Faq from '@/lib/models/Faq';

// GET /api/faq - Get all FAQs with search, filter, and pagination
async function getFaqs(request: NextRequest, user: any) {
  try {
    await connectMongo();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    let filter: any = {};
    
    // Search functionality - regex on question and answer fields
    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { question: searchRegex },
        { answer: searchRegex }
      ];
    }
    
    // Category filtering
    if (category) {
      filter.category = category;
    }

    // Get total count for pagination
    const total = await Faq.countDocuments(filter);

    // Fetch FAQs with pagination
    const faqs = await Faq.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    return NextResponse.json({
      success: true,
      faqs: faqs.map(faq => ({
        _id: faq._id?.toString(),
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        createdAt: faq.createdAt,
        updatedAt: faq.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ FAQ fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch FAQs',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/faq - Create new FAQ
async function createFaq(request: NextRequest, user: any) {
  try {
    await connectMongo();
    
    const body = await request.json();
    const { question, answer, category } = body;

    // Validation
    const errors: { field: string; message: string }[] = [];

    if (!question || typeof question !== 'string') {
      errors.push({ field: 'question', message: 'Question is required' });
    } else if (question.trim().length < 10) {
      errors.push({ field: 'question', message: 'Question must be at least 10 characters' });
    }

    if (!answer || typeof answer !== 'string') {
      errors.push({ field: 'answer', message: 'Answer is required' });
    } else if (answer.trim().length < 20) {
      errors.push({ field: 'answer', message: 'Answer must be at least 20 characters' });
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Validation failed',
        errors
      }, { status: 400 });
    }

    // Create FAQ
    const faq = new Faq({
      question: question.trim(),
      answer: answer.trim(),
      category: category?.trim() || undefined
    });

    await faq.save();

    return NextResponse.json({
      success: true,
      faq: {
        _id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        createdAt: faq.createdAt,
        updatedAt: faq.updatedAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ FAQ creation error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create FAQ',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Public GET endpoint (no auth required for reading FAQs)
export async function GET(request: NextRequest) {
  return getFaqs(request, null);
}

// Admin-only POST endpoint
export const POST = createAuthenticatedHandler(createFaq, requireAdmin);
