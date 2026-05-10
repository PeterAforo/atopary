import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Mock database
const mockPrisma = {
  property: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
};

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}));

// Import the actual route handler
import { GET } from './route';

describe('/api/properties', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/properties', () => {
    it('should return properties with pagination', async () => {
      const mockProperties = [
        { id: '1', title: 'Test Property 1', price: 100000 },
        { id: '2', title: 'Test Property 2', price: 200000 },
      ];
      
      mockPrisma.property.findMany.mockResolvedValue(mockProperties);
      mockPrisma.property.count.mockResolvedValue(mockProperties.length);

      const request = new NextRequest('http://localhost:3000/api/properties?page=1&limit=10');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.properties).toEqual(mockProperties);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
      expect(data.pagination.total).toBe(mockProperties.length);
    });

    it('should handle search parameters', async () => {
      const mockProperties = [
        { id: '1', title: 'Modern House', address: 'Accra' },
      ];
      
      mockPrisma.property.findMany.mockResolvedValue(mockProperties);

      const request = new NextRequest('http://localhost:3000/api/properties?search=modern&city=Accra');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.properties).toEqual(mockProperties);
    });

    it('should handle type filter', async () => {
      const mockProperties = [
        { id: '1', type: 'HOUSE' },
        { id: '2', type: 'APARTMENT' },
      ];
      
      mockPrisma.property.findMany.mockResolvedValue(mockProperties);

      const request = new NextRequest('http://localhost:3000/api/properties?type=APARTMENT');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.properties).toEqual(mockProperties);
    });

    it('should handle price range filter', async () => {
      const mockProperties = [
        { id: '1', price: 150000 },
        { id: '2', price: 250000 },
      ];
      
      mockPrisma.property.findMany.mockResolvedValue(mockProperties);

      const request = new NextRequest('http://localhost:3000/api/properties?minPrice=100000&maxPrice=300000');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.properties).toEqual(mockProperties);
    });

    it('should return 400 for invalid page parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/properties?page=invalid');
      const response = await GET(request);

      expect(response.status).toBe(400);
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.property.findMany.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/properties');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Internal server error');
    });
  });
});
