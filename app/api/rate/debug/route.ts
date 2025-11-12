import { NextResponse } from 'next/server'
import { connectMongo } from '@/lib/mongo'
import RateList from '@/lib/models/RateList'
import Service from '@/lib/models/Service'

export async function GET() {
 try {
 await connectMongo()
 
 // Check RateList collection
 const rateListCount = await RateList.countDocuments()
 const activeRateListCount = await RateList.countDocuments({ isActive: true })
 
 // Check Service collection
 const serviceCount = await Service.countDocuments()
 const activeServiceCount = await Service.countDocuments({ isActive: true })
 
 // Get sample data
 const sampleRateList = await RateList.findOne().lean()
 const sampleService = await Service.findOne().lean()
 
 // Check old rate collection
 const mongoose = await import('mongoose')
 const db = mongoose.default.connection.db
 let oldRateCount = 0
 let sampleOldRate = null
 
 if (db) {
 const collection = db.collection('rate')
 oldRateCount = await collection.countDocuments()
 sampleOldRate = await collection.findOne()
 }
 
 return NextResponse.json({
 success: true,
 data: {
 rateLists: {
 total: rateListCount,
 active: activeRateListCount,
 sample: sampleRateList ? {
 id: sampleRateList._id,
 category: sampleRateList.category,
 testsCount: sampleRateList.tests?.length || 0,
 hasServiceId: !!sampleRateList.service_id
 } : null
 },
 services: {
 total: serviceCount,
 active: activeServiceCount,
 sample: sampleService ? {
 id: sampleService._id,
 name: sampleService.name,
 category: sampleService.category
 } : null
 },
 oldRateCollection: {
 total: oldRateCount,
 sample: sampleOldRate ? {
 id: sampleOldRate._id,
 group: sampleOldRate.group,
 testParameter: sampleOldRate['test_parameter(methods)'],
 rate: sampleOldRate['rates\r'] || sampleOldRate.rates
 } : null
 }
 }
 })
 
 } catch (error) {
 console.error('Debug API error:', error)
 return NextResponse.json({
 success: false,
 error: error instanceof Error ? error.message : String(error)
 }, { status: 500 })
 }
}