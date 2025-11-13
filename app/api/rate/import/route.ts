import { NextRequest, NextResponse } from 'next/server'
import { connectMongo } from '@/lib/mongo'
import * as XLSX from 'xlsx'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
 try {
 await connectMongo()
 const mongoose = (await import('mongoose')).default
 const db = mongoose.connection.db
 
 if (!db) {
 throw new Error('Database connection not established')
 }
 
 const collection = db.collection('rate')
 
 // Get form data from request
 const formData = await request.formData()
 const file = formData.get('file') as File
 
 if (!file) {
 return NextResponse.json(
 { success: false, error: 'No file provided' },
 { status: 400 }
 )
 }
 
 // Validate file type
 if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
 return NextResponse.json(
 { success: false, error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)' },
 { status: 400 }
 )
 }
 
 // Convert file to buffer
 const arrayBuffer = await file.arrayBuffer()
 const buffer = Buffer.from(arrayBuffer)
 
 // Read Excel file
 const workbook = XLSX.read(buffer, { type: 'buffer' })
 const sheetName = workbook.SheetNames[0]
 const worksheet = workbook.Sheets[sheetName]
 
 // Convert to JSON
 const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
 
 if (jsonData.length < 2) {
 return NextResponse.json(
 { success: false, error: 'Excel file must contain at least a header row and one data row' },
 { status: 400 }
 )
 }
 
 // Extract headers and validate
 const headers = jsonData[0] as string[]
 const requiredHeaders = ['Serial No', 'Group', 'Test Parameter (Methods)', 'Rate (₹)']
 
 console.log('📊 Excel headers found:', headers)
 console.log('📊 Required headers:', requiredHeaders)
 
 const headerMap: Record<string, number> = {}
 
 // More flexible header matching
 const findHeaderIndex = (targetHeader: string): number => {
 const normalizedTarget = targetHeader.toLowerCase().replace(/[()₹\s]/g, '')
 
 return headers.findIndex(h => {
 if (!h) return false
 const normalizedHeader = h.toString().toLowerCase().replace(/[()₹\s]/g, '')
 
 // Try exact match first
 if (normalizedHeader === normalizedTarget) return true
 
 // Try partial matches for common variations
 if (targetHeader.includes('Serial No')) {
 return normalizedHeader.includes('serialno') || 
 normalizedHeader.includes('serial') ||
 normalizedHeader.includes('srno') ||
 normalizedHeader.includes('sno')
 }
 
 if (targetHeader.includes('Test Parameter')) {
 return normalizedHeader.includes('testparameter') || 
 normalizedHeader.includes('parameter') ||
 normalizedHeader.includes('methods')
 }
 
 if (targetHeader.includes('Rate')) {
 return normalizedHeader.includes('rate')
 }
 
 if (targetHeader.includes('Group')) {
 return normalizedHeader.includes('group')
 }
 
 return false
 })
 }
 
 requiredHeaders.forEach(header => {
 const index = findHeaderIndex(header)
 if (index === -1) {
 console.log('Available headers:', headers)
 console.log('Looking for:', header)
 throw new Error(`Required column "${header}" not found in Excel file. Available columns: ${headers.join(', ')}`)
 }
 headerMap[header] = index
 })
 
 // Process data rows - all rows will be treated as new inserts with auto-generated sequential IDs
 const dataRows = jsonData.slice(1) as any[][]
 const inserts: any[] = []
 const errors: string[] = []
 
 for (let i = 0; i < dataRows.length; i++) {
 const row = dataRows[i]
 const rowNumber = i + 2 // Excel row number (1-based + header)
 
 try {
 // Skip empty rows
 if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
 continue
 }
 
 const serialNo = row[headerMap['Serial No']]
 const group = row[headerMap['Group']]?.toString().trim()
 const testParameter = row[headerMap['Test Parameter (Methods)']]?.toString().trim()
 const rateValue = row[headerMap['Rate (₹)']]
 
 // Validate Serial No
 if (!serialNo || serialNo === '') {
 errors.push(`Row ${rowNumber}: Serial No is required`)
 continue
 }
 
 const id = parseInt(serialNo.toString())
 if (isNaN(id) || id <= 0) {
 errors.push(`Row ${rowNumber}: Invalid Serial No "${serialNo}"`)
 continue
 }
 
 // Validate required fields
 if (!group) {
 errors.push(`Row ${rowNumber}: Group is required`)
 continue
 }
 
 if (!testParameter) {
 errors.push(`Row ${rowNumber}: Test Parameter is required`)
 continue
 }
 
 // Parse and validate rate
 let rate = 0
 if (rateValue !== null && rateValue !== undefined && rateValue !== '') {
 rate = parseFloat(rateValue.toString())
 if (isNaN(rate) || rate < 0) {
 errors.push(`Row ${rowNumber}: Invalid rate value "${rateValue}"`)
 continue
 }
 }
 
 // Use Serial No from Excel as the ID
 inserts.push({
 id: id.toString(),
 group: group,
 'test_parameter(methods)': testParameter,
 'rates\r': rate.toString(),
 createdAt: new Date(),
 updatedAt: new Date()
 })
 
 } catch (error) {
 errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`)
 }
 }
 
 // If there are validation errors, return them
 if (errors.length > 0) {
 return NextResponse.json(
 { 
 success: false, 
 error: 'Validation errors found',
 details: errors
 },
 { status: 400 }
 )
 }
 
 // Check if there's anything to insert
 if (inserts.length === 0) {
 return NextResponse.json(
 { 
 success: false, 
 error: 'No valid data rows found to import'
 },
 { status: 400 }
 )
 }
 
 // Perform database operations - insert all rows as new entries
 let insertedCount = 0
 
 // Process inserts
 const result = await collection.insertMany(inserts)
 insertedCount = result.insertedCount
 
 return NextResponse.json({
 success: true,
 message: 'Rate list imported successfully',
 summary: {
 totalProcessed: inserts.length,
 inserted: insertedCount,
 errors: errors.length
 }
 })
 
 } catch (error) {
 console.error('Error importing rate data from Excel:', error)
 
 return NextResponse.json(
 { 
 success: false, 
 error: 'Failed to import rate data',
 details: error instanceof Error ? error.message : String(error)
 },
 { status: 500 }
 )
 }
}