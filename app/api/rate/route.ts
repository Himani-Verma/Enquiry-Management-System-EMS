import { NextRequest, NextResponse } from 'next/server'
import { connectMongo } from '@/lib/mongo'
import mongoose from 'mongoose'

// POST - Create new rate item
export async function POST(request: NextRequest) {
 try {
 await connectMongo()
 const db = mongoose.connection.db
 if (!db) {
 throw new Error('Database connection not established')
 }
 const collection = db.collection('rate')

 const body = await request.json()
 const { id, group, testParameter, rate } = body

 if (!group || !testParameter) {
 return NextResponse.json(
 { success: false, error: 'Group and test parameter are required' },
 { status: 400 }
 )
 }

 const newItem = {
 id: id || Date.now(),
 group: group.trim(),
 'test_parameter(methods)': testParameter.trim(),
 'rates\r': String(rate || 0)
 }

 const result = await collection.insertOne(newItem)

 return NextResponse.json({
 success: true,
 message: 'Rate item created successfully',
 item: {
 _id: result.insertedId.toString(),
 ...newItem
 }
 })

 } catch (error) {
 console.error('Error creating rate item:', error)
 return NextResponse.json(
 { 
 success: false, 
 error: 'Failed to create rate item',
 details: error instanceof Error ? error.message : String(error)
 },
 { status: 500 }
 )
 }
}

// PUT - Update existing rate item
export async function PUT(request: NextRequest) {
 try {
 await connectMongo()
 const db = mongoose.connection.db
 if (!db) {
 throw new Error('Database connection not established')
 }
 const collection = db.collection('rate')

 const body = await request.json()
 const { _id, id, group, testParameter, rate } = body

 if (!_id) {
 return NextResponse.json(
 { success: false, error: '_id is required for update' },
 { status: 400 }
 )
 }

 if (!group || !testParameter) {
 return NextResponse.json(
 { success: false, error: 'Group and test parameter are required' },
 { status: 400 }
 )
 }

 const updateData = {
 id,
 group: group.trim(),
 'test_parameter(methods)': testParameter.trim(),
 'rates\r': String(rate || 0)
 }

 const result = await collection.updateOne(
 { _id: new mongoose.Types.ObjectId(_id) },
 { $set: updateData }
 )

 if (result.matchedCount === 0) {
 return NextResponse.json(
 { success: false, error: 'Rate item not found' },
 { status: 404 }
 )
 }

 return NextResponse.json({
 success: true,
 message: 'Rate item updated successfully'
 })

 } catch (error) {
 console.error('Error updating rate item:', error)
 return NextResponse.json(
 { 
 success: false, 
 error: 'Failed to update rate item',
 details: error instanceof Error ? error.message : String(error)
 },
 { status: 500 }
 )
 }
}
