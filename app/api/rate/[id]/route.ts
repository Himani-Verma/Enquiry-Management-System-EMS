import { NextRequest, NextResponse } from 'next/server'
import { connectMongo } from '@/lib/mongo'
import mongoose from 'mongoose'

// DELETE - Delete rate item
export async function DELETE(
 request: NextRequest,
 { params }: { params: { id: string } }
) {
 try {
 await connectMongo()
 const db = mongoose.connection.db
 if (!db) {
 throw new Error('Database connection not established')
 }
 const collection = db.collection('rate')

 const { id } = params

 if (!id) {
 return NextResponse.json(
 { success: false, error: 'ID is required' },
 { status: 400 }
 )
 }

 const result = await collection.deleteOne({
 _id: new mongoose.Types.ObjectId(id)
 })

 if (result.deletedCount === 0) {
 return NextResponse.json(
 { success: false, error: 'Rate item not found' },
 { status: 404 }
 )
 }

 return NextResponse.json({
 success: true,
 message: 'Rate item deleted successfully'
 })

 } catch (error) {
 console.error('Error deleting rate item:', error)
 return NextResponse.json(
 { 
 success: false, 
 error: 'Failed to delete rate item',
 details: error instanceof Error ? error.message : String(error)
 },
 { status: 500 }
 )
 }
}
