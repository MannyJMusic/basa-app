import { UnitTestUtils } from '../helpers/unit-test-utils';

describe('UnitTestUtils Unit Tests', () => {
  describe('generateRandomData', () => {
    it('should generate unique data with timestamps', () => {
      const data1 = UnitTestUtils.generateRandomData();
      const data2 = UnitTestUtils.generateRandomData();
      
      expect(data1.email).not.toBe(data2.email);
      expect(data1.businessName).not.toBe(data2.businessName);
      expect(data1.eventTitle).not.toBe(data2.eventTitle);
      expect(data1.resourceTitle).not.toBe(data2.resourceTitle);
    });

    it('should include timestamp in generated data', () => {
      const data = UnitTestUtils.generateRandomData();
      
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
      
      await UnitTestUtils.waitFor(() => condition, 1000, 10);
      expect(condition).toBe(true);
    });

    it('should throw error when condition is not met within timeout', async () => {
      await expect(
        UnitTestUtils.waitFor(() => false, 50, 10)
      ).rejects.toThrow('Condition not met within 50ms');
    });
  });

  describe('mockEnv', () => {
    it('should mock environment variables and restore them', () => {
      const originalValue = process.env.TEST_VAR;
      
      const restore = UnitTestUtils.mockEnv({ TEST_VAR: 'test-value' });
      expect(process.env.TEST_VAR).toBe('test-value');
      
      restore();
      expect(process.env.TEST_VAR).toBe(originalValue);
    });
  });

  describe('createMockRequest', () => {
    it('should create a mock request with default values', () => {
      const req = UnitTestUtils.createMockRequest();
      
      expect(req.method).toBe('GET');
      expect(req.url).toBe('http://localhost/api/test');
      expect(req.headers['content-type']).toBe('application/json');
    });

    it('should allow custom request data', () => {
      const req = UnitTestUtils.createMockRequest({
        method: 'POST',
        body: { test: 'data' },
        headers: { authorization: 'Bearer token' },
      });
      
      expect(req.method).toBe('POST');
      expect(req.body).toEqual({ test: 'data' });
      expect(req.headers.authorization).toBe('Bearer token');
    });

    it('should include query parameters in URL', () => {
      const req = UnitTestUtils.createMockRequest({
        url: '/api/events',
        query: { page: '1', limit: '10' },
      });
      
      expect(req.url).toBe('http://localhost/api/events?page=1&limit=10');
    });
  });

  describe('createMockResponse', () => {
    it('should create a mock response with jest functions', () => {
      const res = UnitTestUtils.createMockResponse();
      
      expect(typeof res.status).toBe('function');
      expect(typeof res.json).toBe('function');
      expect(typeof res.send).toBe('function');
      expect(res.headersSent).toBe(false);
    });
  });
}); 