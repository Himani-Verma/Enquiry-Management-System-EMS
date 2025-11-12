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

 // Get distinct groups
 const groups = await collection.distinct('group')

 return NextResponse.json({
 success: true,
 groups: groups.filter((g: any) => g && g.trim()).sort()
 })

 } catch (error) {
 console.error('Error fetching rate groups:', error)
 return NextResponse.json(
 { 
 success: false, 
 error: 'Failed to fetch groups',
 details: error instanceof Error ? error.message : String(error)
 },
 { status: 500 }
 )
 }
}
