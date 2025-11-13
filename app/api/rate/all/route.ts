import { NextRequest, NextResponse } from 'next/server'
import { connectMongo } from '@/lib/mongo'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
 try {
 await connectMongo()
 const db = mongoose.connection.db
 if (!db) {
 throw new Error('Database connection not established')
 }
 const collection = db.collection('rate')

 const items = await collection
 .find({})
 .sort({ id: 1 })
 .toArray()

 // Generate sequential IDs for items that don't have them
 let currentId = 1
 const itemsWithIds = items.map((item: any, index: number) => {
 // If item has an id, use it; otherwise assign sequential number
 const itemId = item.id ? parseInt(item.id) : (index + 1)
 if (itemId >= currentId) {
 currentId = itemId + 1
 }
 return {
 _id: item._id.toString(),
 id: itemId,
 group: item.group,
 testParameter: item['test_parameter(methods)'],
 rate: parseFloat(item['rates\r'] || item.rates || 0)
 }
 })

 return NextResponse.json({
 success: true,
 items: itemsWithIds,
 count: itemsWithIds.length
 })

 } catch (error) {
 console.error('Error fetching all rate items:', error)
 return NextResponse.json(
 { 
 success: false, 
 error: 'Failed to fetch rate items',
 details: error instanceof Error ? error.message : String(error)
 },
 { status: 500 }
 )
 }
}
