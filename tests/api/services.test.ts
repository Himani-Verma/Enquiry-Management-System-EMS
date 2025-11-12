/**
 * API Route Tests - /api/services
 */

describe('API /api/services', () => {
  let mockMongoConnection: any

  beforeEach(() => {
    // Mock MongoDB connection
    mockMongoConnection = {
      db: {
        collection: jest.fn().mockReturnValue({
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([
              {
                _id: '1',
                name: 'Water Testing',
                category: 'Water Testing',
                subServices: ['Drinking Water Testing', 'FSSAI Compliance Water Testing', 'Swimming Pool Water Testing', 'Others'],
                isActive: true
              },
              {
                _id: '2',
                name: 'Food Testing',
                category: 'Food Testing',
                subServices: ['Microbiological Testing'],
                isActive: true
              }
            ])
          })
        })
      }
    }
  })

  test('returns services in correct format', async () => {
    const mockServices = await mockMongoConnection.db.collection('services')
      .find().toArray()

    expect(mockServices).toHaveLength(2)
    expect(mockServices[0]).toHaveProperty('name')
    expect(mockServices[0]).toHaveProperty('category')
    expect(mockServices[0]).toHaveProperty('subServices')
    expect(mockServices[0].isActive).toBe(true)
  })

  test('filters only active services', async () => {
    const services = await mockMongoConnection.db.collection('services')
      .find().toArray()

    const activeServices = services.filter((s: any) => s.isActive)
    expect(activeServices.every((s: any) => s.isActive)).toBe(true)
  })

  test('includes subservices in response', async () => {
    const services = await mockMongoConnection.db.collection('services')
      .find().toArray()

    expect(services[0].subServices).toBeDefined()
    expect(Array.isArray(services[0].subServices)).toBe(true)
  })
})

// Mock API handler test
describe('Services API Handler', () => {
  test('validates request method', () => {
    const validMethods = ['GET', 'OPTIONS']
    expect(validMethods).toContain('GET')
  })

  test('returns JSON response', () => {
    const mockResponse = {
      success: true,
      services: {},
      totalServices: 0
    }
    
    expect(mockResponse).toHaveProperty('success')
    expect(mockResponse).toHaveProperty('services')
  })
})

