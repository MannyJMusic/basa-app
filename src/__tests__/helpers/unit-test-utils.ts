/**
 * Unit test utilities - no Testcontainers dependencies
 * For integration tests, use the helpers in integration/helpers/
 */

export class UnitTestUtils {
  /**
   * Generate random test data with timestamps
   */
  static generateRandomData() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return {
      email: `test-${timestamp}-${random}@example.com`,
      businessName: `Test Business ${timestamp}-${random}`,
      eventTitle: `Test Event ${timestamp}-${random}`,
      resourceTitle: `Test Resource ${timestamp}-${random}`,
      firstName: `Test${timestamp}`,
      lastName: `User${timestamp}`,
      phone: `+1${timestamp.toString().slice(-10)}`,
      address: `${timestamp} Test St`,
      city: 'Test City',
      state: 'CA',
      zipCode: '12345',
    };
  }

  /**
   * Wait for a condition to be met
   */
  static async waitFor(
    condition: () => boolean,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Mock environment variables and return a restore function
   */
  static mockEnv(vars: Record<string, string>) {
    const original: Record<string, string | undefined> = {};
    
    // Store original values and set new ones
    Object.entries(vars).forEach(([key, value]) => {
      original[key] = process.env[key];
      process.env[key] = value;
    });
    
    // Return restore function
    return () => {
      Object.entries(original).forEach(([key, value]) => {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      });
    };
  }

  /**
   * Create a mock request object for API testing
   */
  static createMockRequest(data: any = {}) {
    // Use a full URL for NextRequest compatibility
    let url = data.url && data.url.startsWith('http')
      ? data.url
      : `http://localhost${data.url || '/api/test'}`;
    
    // Add query parameters to URL if provided
    const query = data.query || {};
    if (Object.keys(query).length > 0) {
      const urlObj = new URL(url);
      Object.entries(query).forEach(([key, value]) => {
        urlObj.searchParams.set(key, String(value));
      });
      url = urlObj.toString();
    }
    
    const method = data.method || 'GET';
    const headers = {
      'content-type': 'application/json',
      ...data.headers,
    };
    const body = data.body || {};
    
    return {
      method,
      url,
      headers,
      body,
      query,
      json: async () => body,
      // Add any other properties that NextRequest might have
      nextUrl: new URL(url),
      cookies: new Map(),
      geo: {},
      ip: '127.0.0.1',
    };
  }

  /**
   * Create a mock response object for API testing
   */
  static createMockResponse() {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      headersSent: false,
    };
    
    return res;
  }
} 