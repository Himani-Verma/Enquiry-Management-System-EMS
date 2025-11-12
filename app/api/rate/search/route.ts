import { NextRequest, NextResponse } from 'next/server'
import { connectMongo } from '@/lib/mongo'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
 try {
 const searchParams = request.nextUrl.searchParams
 const query = searchParams.get('q') || ''
 const group = searchParams.get('group') || ''
 const limit = parseInt(searchParams.get('limit') || '20')

 if (!query || query.trim().length < 2) {
 return NextResponse.json({
 success: true,
 items: [],
 message: 'Query must be at least 2 characters'
 })
 }

 await connectMongo()
 const db = mongoose.connection.db
 if (!db) {
 throw new Error('Database connection not established')
 }
 const collection = db.collection('rate')

 // Build search filter
 const filter: any = {
 'test_parameter(methods)': { 
 $regex: query.trim(), 
 $options: 'i' 
 }
 }

 // Add group filter if provided
 if (group && group.trim()) {
 filter.group = { 
 $regex: group.trim(), 
 $options: 'i' 
 }
 }

 const items = await collection
 .find(filter)
 .limit(limit)
 .toArray()

 return NextResponse.json({
 success: true,
 items: items.map((item: any) => ({
 _id: item._id,
 id: item.id,
 group: item.group,
 testParameter: item['test_parameter(methods)'],
 rate: item['rates\r'] || item.rates || 0
 })),
 count: items.length
 })

 } catch (error) {
 console.error('Error searching rate collection:', error)
 return NextResponse.json(
 { 
 success: false, 
 error: 'Failed to search rate collection',
 details: error instanceof Error ? error.message : String(error)
 },
 { status: 500 }
 )
 }
}
