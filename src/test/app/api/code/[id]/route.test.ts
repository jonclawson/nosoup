/** @jest-environment node */

import { GET } from '@/app/api/code/[id]/route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    field: {
      findUnique: jest.fn(),
    },
  },
}));

describe('/api/code/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the code value when field exists', async () => {
    const mockCode = { id: '1', type: 'code', value: '<p>Hello World</p>' };
    (prisma.field.findUnique as jest.Mock).mockResolvedValue(mockCode);

    const request = new NextRequest('http://localhost:3000/api/code/1');
    const params = Promise.resolve({ id: '1' });
    const response = await GET(request, { params });

    expect(prisma.field.findUnique).toHaveBeenCalledWith({
      where: { id: '1', type: 'code' },
    });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('<p>Hello World</p>');
    expect(response.headers.get('Content-Type')).toBe('text/html');
    expect(response.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(response.headers.get('Content-Security-Policy')).toBe("frame-ancestors 'self'");
  });

  it('should return empty string when field does not exist', async () => {
    (prisma.field.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/code/2');
    const params = Promise.resolve({ id: '2' });
    const response = await GET(request, { params });

    expect(prisma.field.findUnique).toHaveBeenCalledWith({
      where: { id: '2', type: 'code' },
    });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('');
    expect(response.headers.get('Content-Type')).toBe('text/html');
  });

  it('should return 500 on database error', async () => {
    (prisma.field.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/code/3');
    const params = Promise.resolve({ id: '3' });
    const response = await GET(request, { params });

    expect(prisma.field.findUnique).toHaveBeenCalledWith({
      where: { id: '3', type: 'code' },
    });
    expect(response.status).toBe(500);
    expect(await response.text()).toBe('Internal Server Error');
  });
});
