import { NextResponse } from 'next/server'
import { connectMongo } from '@/lib/mongo'

export async function GET() {
 try {
 await connectMongo()
 
 const mongoose = (await import('mongoose')).default
 const db = mongoose.connection.db
 
 if (!db) {
 throw new Error('Database connection not established')
 }
 
 const collection = db.collection('rate')
 
 // Get basic stats
 const totalRates = await collection.countDocuments()
 
 // Get unique groups count
 const groups = await collection.distinct('group')
 const activeGroups = groups.filter(group => group && group.trim()).length
 
 // Get average rate
 const pipeline = [
 {
 $addFields: {
 rateValue: {
 $toDouble: {
 $ifNull: ['$rates\r', '$rates']
 }
 }
 }
 },
 {
 $match: {
 rateValue: { $gt: 0 }
 }
 },
 {
 $group: {
 _id: null,
 avgRate: { $avg: '$rateValue' }
 }
 }
 ]
 
 const avgResult = await collection.aggregate(pipeline).toArray()
 const avgRate = avgResult.length > 0 ? Math.round(avgResult[0].avgRate) : 0
 
 // Get last updated
 const lastUpdated = await collection.findOne(
 { updatedAt: { $exists: true } },
 { sort: { updatedAt: -1 } }
 )
 
 const lastUpdatedDate = lastUpdated?.updatedAt 
 ? new Date(lastUpdated.updatedAt).toLocaleDateString()
 : 'Never'
 
 return NextResponse.json({
 success: true,
 stats: {
 totalRates,
 activeGroups,
 avgRate,
 lastUpdated: lastUpdatedDate
 }
 })
 
 } catch (error) {
 console.error('Error fetching rate stats:', error)
 
 return NextResponse.json(
 { 
 success: false, 
 error: 'Failed to fetch rate stats',
 details: error instanceof Error ? error.message : String(error)
 },
 { status: 500 }
 )
 }
}