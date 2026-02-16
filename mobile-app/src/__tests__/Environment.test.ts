describe('Environment Smoke Test', () => {
    it('should have a working test runner', () => {
        expect(true).toBe(true);
    });

    it('should be running in a test environment', () => {
        expect(process.env.NODE_ENV).toBe('test');
    });
});
