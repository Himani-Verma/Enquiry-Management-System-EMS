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

 return NextResponse.json({
 success: true,
 items: items.map((item: any) => ({
 _id: item._id.toString(),
 id: item.id,
 group: item.group,
 testParameter: item['test_parameter(methods)'],
 rate: parseFloat(item['rates\r'] || item.rates || 0)
 })),
 count: items.length
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
