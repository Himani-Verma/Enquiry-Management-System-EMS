import { NextResponse } from 'next/server'
import { connectMongo } from '@/lib/mongo'
import * as XLSX from 'xlsx'

export async function GET() {
 try {
 await connectMongo()
 
 console.log('🔄 Fetching rate data for export...')
 
 // Use the original rate collection format that you're familiar with
 const mongoose = (await import('mongoose')).default
 const db = mongoose.connection.db
 
 if (!db) {
 throw new Error('Database connection not established')
 }
 
 const collection = db.collection('rate')
 
 // Fetch all rate items
 const items = await collection.find({}).toArray()
 console.log(`📊 Found ${items.length} items in rate collection`)
 
 // Transform data for Excel export - using the original format you expect
 const excelData = items.map((item: any, index: number) => ({
 'ID': item._id?.toString() || '',
 'Serial No': index + 1,
 'Group': item.group || '',
 'Test Parameter (Methods)': item['test_parameter(methods)'] || '',
 'Rate (₹)': parseFloat(item['rates\r'] || item.rates || 0),
 'Created At': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
 'Updated At': item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ''
 }))
 
 console.log(`📊 Generated ${excelData.length} rows for export`)
 return createExcelResponse(excelData)
 
 } catch (error) {
 console.error('❌ Error exporting rate data to Excel:', error)
 
 return NextResponse.json(
 { 
 success: false, 
 error: 'Failed to export rate data',
 details: error instanceof Error ? error.message : String(error)
 },
 { status: 500 }
 )
 }
}

function createExcelResponse(excelData: any[]) {
 
 // Create workbook and worksheet
 const workbook = XLSX.utils.book_new()
 const worksheet = XLSX.utils.json_to_sheet(excelData)
 
 // Set column widths for better readability - matching original format
 const columnWidths = [
 { wch: 25 }, // ID
 { wch: 10 }, // Serial No
 { wch: 20 }, // Group
 { wch: 40 }, // Test Parameter (Methods)
 { wch: 15 }, // Rate (₹)
 { wch: 15 }, // Created At
 { wch: 15 } // Updated At
 ]
 worksheet['!cols'] = columnWidths
 
 // Add worksheet to workbook
 XLSX.utils.book_append_sheet(workbook, worksheet, 'Rate List')
 
 // Generate Excel buffer
 const excelBuffer = XLSX.write(workbook, { 
 type: 'buffer', 
 bookType: 'xlsx' 
 })
 
 // Create filename with current date
 const currentDate = new Date().toISOString().split('T')[0]
 const filename = `rate_list_${currentDate}.xlsx`
 
 // Return Excel file as response
 return new NextResponse(excelBuffer, {
 status: 200,
 headers: {
 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 'Content-Disposition': `attachment; filename="${filename}"`,
 'Content-Length': excelBuffer.length.toString()
 }
 })
}