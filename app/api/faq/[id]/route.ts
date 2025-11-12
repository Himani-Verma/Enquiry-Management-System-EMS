import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import { createAuthenticatedHandler, requireAdmin } from '@/lib/middleware/auth';
import Faq from '@/lib/models/Faq';
import mongoose from 'mongoose';

// PUT /api/faq/[id] - Update FAQ
async function updateFaq(request: NextRequest, user: any, context?: { params: Promise<{ id: string }> }) {
  try {
    await connectMongo();
    
    const params = await context?.params;
    const id = params?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid FAQ ID' 
      }, { status: 400 });
    }

    const body = await request.json();
    const { question, answer, category } = body;

    // Validation
    const errors: { field: string; message: string }[] = [];

    if (question !== undefined) {
      if (typeof question !== 'string') {
        errors.push({ field: 'question', message: 'Question must be a string' });
      } else if (question.trim().length < 10) {
        errors.push({ field: 'question', message: 'Question must be at least 10 characters' });
      }
    }

    if (answer !== undefined) {
      if (typeof answer !== 'string') {
        errors.push({ field: 'answer', message: 'Answer must be a string' });
      } else if (answer.trim().length < 20) {
        errors.push({ field: 'answer', message: 'Answer must be at least 20 characters' });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Validation failed',
        errors
      }, { status: 400 });
    }

    // Find and update FAQ
    const updateData: any = {};
    if (question !== undefined) updateData.question = question.trim();
    if (answer !== undefined) updateData.answer = answer.trim();
    if (category !== undefined) updateData.category = category?.trim() || undefined;

    const faq = await Faq.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!faq) {
      return NextResponse.json({ 
        success: false, 
        message: 'FAQ not found' 
      }, { status: 404 });
    }

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
    });

  } catch (error) {
    console.error('❌ FAQ update error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update FAQ',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/faq/[id] - Delete FAQ
async function deleteFaq(request: NextRequest, user: any, context?: { params: Promise<{ id: string }> }) {
  try {
    await connectMongo();
    
    const params = await context?.params;
    const id = params?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid FAQ ID' 
      }, { status: 400 });
    }

    const faq = await Faq.findByIdAndDelete(id);

    if (!faq) {
      return NextResponse.json({ 
        success: false, 
        message: 'FAQ not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ deleted successfully'
    });

  } catch (error) {
    console.error('❌ FAQ deletion error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete FAQ',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const PUT = createAuthenticatedHandler(updateFaq, requireAdmin);
export const DELETE = createAuthenticatedHandler(deleteFaq, requireAdmin);
