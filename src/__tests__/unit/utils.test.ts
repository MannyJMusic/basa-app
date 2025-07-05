import { TestUtils } from '../integration/helpers/test-utils';

describe('TestUtils Unit Tests', () => {
  describe('generateRandomData', () => {
    it('should generate unique data with timestamps', () => {
      const data1 = TestUtils.generateRandomData();
      const data2 = TestUtils.generateRandomData();
      
      expect(data1.email).not.toBe(data2.email);
      expect(data1.businessName).not.toBe(data2.businessName);
      expect(data1.eventTitle).not.toBe(data2.eventTitle);
      expect(data1.resourceTitle).not.toBe(data2.resourceTitle);
    });

    it('should include timestamp in generated data', () => {
      const data = TestUtils.generateRandomData();
      
      expect(data.email).toMatch(/test-\d+@example\.com/);
      expect(data.businessName).toMatch(/Test Business \d+/);
      expect(data.eventTitle).toMatch(/Test Event \d+/);
      expect(data.resourceTitle).toMatch(/Test Resource \d+/);
    });
  });

  describe('waitFor', () => {
    it('should resolve when condition is met', async () => {
      let condition = false;
      setTimeout(() => { condition = true; }, 10);
      
      await TestUtils.waitFor(() => condition, 1000, 10);
      expect(condition).toBe(true);
    });

    it('should throw error when condition is not met within timeout', async () => {
      await expect(
        TestUtils.waitFor(() => false, 50, 10)
      ).rejects.toThrow('Condition not met within 50ms');
    });
  });

  describe('mockEnv', () => {
    it('should mock environment variables and restore them', () => {
      const originalValue = process.env.TEST_VAR;
      
      const restore = TestUtils.mockEnv({ TEST_VAR: 'test-value' });
      expect(process.env.TEST_VAR).toBe('test-value');
      
      restore();
      expect(process.env.TEST_VAR).toBe(originalValue);
    });
  });

  describe('createMockRequest', () => {
    it('should create a mock request with default values', () => {
      const req = TestUtils.createMockRequest();
      
      expect(req.method).toBe('GET');
      expect(req.url).toBe('/api/test');
      expect(req.headers['content-type']).toBe('application/json');
    });

    it('should allow custom request data', () => {
      const req = TestUtils.createMockRequest({
        method: 'POST',
        body: { test: 'data' },
        headers: { authorization: 'Bearer token' },
      });
      
      expect(req.method).toBe('POST');
      expect(req.body).toEqual({ test: 'data' });
      expect(req.headers.authorization).toBe('Bearer token');
    });
  });

  describe('createMockResponse', () => {
    it('should create a mock response with jest functions', () => {
      const res = TestUtils.createMockResponse();
      
      expect(typeof res.status).toBe('function');
      expect(typeof res.json).toBe('function');
      expect(typeof res.send).toBe('function');
      expect(res.headersSent).toBe(false);
    });
  });
});

describe('Test Helper Functions', () => {
  describe('withTestDatabase', () => {
    it('should create and cleanup test environment', async () => {
      let testEnv: any = null;
      
      const testFn = jest.fn().mockImplementation(async (env) => {
        testEnv = env;
        expect(env.database).toBeDefined();
        expect(env.database.prisma).toBeDefined();
        expect(env.cleanup).toBeDefined();
      });

      const wrappedTest = withTestDatabase(testFn);
      await wrappedTest();

      expect(testFn).toHaveBeenCalledTimes(1);
      expect(testEnv).toBeDefined();
    });
  });

  describe('withEmptyTestDatabase', () => {
    it('should create empty test environment', async () => {
      let testEnv: any = null;
      
      const testFn = jest.fn().mockImplementation(async (env) => {
        testEnv = env;
        expect(env.database).toBeDefined();
        expect(env.database.prisma).toBeDefined();
        expect(env.cleanup).toBeDefined();
      });

      const wrappedTest = withEmptyTestDatabase(testFn);
      await wrappedTest();

      expect(testFn).toHaveBeenCalledTimes(1);
      expect(testEnv).toBeDefined();
    });
  });
}); 