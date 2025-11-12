import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import { createAuthenticatedHandler, requireAdmin } from '@/lib/middleware/auth';
import Article from '@/lib/models/Article';
import mongoose from 'mongoose';

// PUT /api/article/[id] - Update article
async function updateArticle(request: NextRequest, user: any, context?: { params: Promise<{ id: string }> }) {
  try {
    await connectMongo();
    
    const params = await context?.params;
    const id = params?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid article ID' 
      }, { status: 400 });
    }

    const body = await request.json();
    const { title, content, author, tags } = body;

    // Validation
    const errors: { field: string; message: string }[] = [];

    if (title !== undefined) {
      if (typeof title !== 'string') {
        errors.push({ field: 'title', message: 'Title must be a string' });
      } else if (title.trim().length < 5) {
        errors.push({ field: 'title', message: 'Title must be at least 5 characters' });
      }
    }

    if (content !== undefined) {
      if (typeof content !== 'string') {
        errors.push({ field: 'content', message: 'Content must be a string' });
      } else if (content.trim().length < 50) {
        errors.push({ field: 'content', message: 'Content must be at least 50 characters' });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Validation failed',
        errors
      }, { status: 400 });
    }

    // Find and update article
    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (author !== undefined) updateData.author = author?.trim() || undefined;
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags.map((t: string) => t.trim()).filter((t: string) => t) : [];
    }

    const article = await Article.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!article) {
      return NextResponse.json({ 
        success: false, 
        message: 'Article not found' 
      }, { status: 404 });
    }

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
    });

  } catch (error) {
    console.error('❌ Article update error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update article',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/article/[id] - Delete article
async function deleteArticle(request: NextRequest, user: any, context?: { params: Promise<{ id: string }> }) {
  try {
    await connectMongo();
    
    const params = await context?.params;
    const id = params?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid article ID' 
      }, { status: 400 });
    }

    const article = await Article.findByIdAndDelete(id);

    if (!article) {
      return NextResponse.json({ 
        success: false, 
        message: 'Article not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error) {
    console.error('❌ Article deletion error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete article',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const PUT = createAuthenticatedHandler(updateArticle, requireAdmin);
export const DELETE = createAuthenticatedHandler(deleteArticle, requireAdmin);
