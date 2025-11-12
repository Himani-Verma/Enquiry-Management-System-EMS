import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import { createAuthenticatedHandler, requireAdmin } from '@/lib/middleware/auth';
import ExternalLink from '@/lib/models/ExternalLink';
import mongoose from 'mongoose';

// PUT /api/link/[id] - Update external link
async function updateLink(request: NextRequest, user: any, context?: { params: Promise<{ id: string }> }) {
  try {
    await connectMongo();
    
    const params = await context?.params;
    const id = params?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid link ID' 
      }, { status: 400 });
    }

    const body = await request.json();
    const { title, url, description, category } = body;

    // Validation
    const errors: { field: string; message: string }[] = [];

    if (title !== undefined) {
      if (typeof title !== 'string') {
        errors.push({ field: 'title', message: 'Title must be a string' });
      } else if (title.trim().length < 3) {
        errors.push({ field: 'title', message: 'Title must be at least 3 characters' });
      }
    }

    if (url !== undefined) {
      if (typeof url !== 'string') {
        errors.push({ field: 'url', message: 'URL must be a string' });
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
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Validation failed',
        errors
      }, { status: 400 });
    }

    // Find and update link
    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (url !== undefined) updateData.url = url.trim();
    if (description !== undefined) updateData.description = description?.trim() || undefined;
    if (category !== undefined) updateData.category = category?.trim() || undefined;

    const link = await ExternalLink.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!link) {
      return NextResponse.json({ 
        success: false, 
        message: 'Link not found' 
      }, { status: 404 });
    }

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
    });

  } catch (error) {
    console.error('❌ Link update error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update link',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/link/[id] - Delete external link
async function deleteLink(request: NextRequest, user: any, context?: { params: Promise<{ id: string }> }) {
  try {
    await connectMongo();
    
    const params = await context?.params;
    const id = params?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid link ID' 
      }, { status: 400 });
    }

    const link = await ExternalLink.findByIdAndDelete(id);

    if (!link) {
      return NextResponse.json({ 
        success: false, 
        message: 'Link not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Link deleted successfully'
    });

  } catch (error) {
    console.error('❌ Link deletion error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete link',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const PUT = createAuthenticatedHandler(updateLink, requireAdmin);
export const DELETE = createAuthenticatedHandler(deleteLink, requireAdmin);
