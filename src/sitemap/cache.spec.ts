import { SitemapCache } from './cache.js';
import { SitemapGlobal } from '../globals/sitemap.js' // Adjust import path as needed

// Mock data & types
const mockContent = '<?xml version="1.0" encoding="UTF-8"?><urlset></urlset>';
const mockDate = '2025-03-15T12:00:00.000Z';

// Mock dependencies
const mockLogger = {
  debug: jest.fn(),
  error: jest.fn(),
};

const mockPayload = {
  findGlobal: jest.fn(),
  updateGlobal: jest.fn(),
  logger: mockLogger,
};

const mockRequest = {
  payload: mockPayload,
} as any; // Cast to any to avoid full type implementation

const mockPluginConfig = {
  cache: {
    duration: 3600, // 1 hour in seconds
  },
} as any;

// Helper to reset all mocks between tests
const resetMocks = () => {
  jest.clearAllMocks();
  jest.spyOn(global.Date, 'now').mockImplementation(() => new Date(mockDate).getTime());
};

describe('SitemapCache', () => {
  let sitemapCache: SitemapCache;

  beforeEach(() => {
    resetMocks();
    sitemapCache = new SitemapCache(mockRequest, mockPluginConfig);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('get()', () => {
    it('should return cached content when valid', async () => {
      // Setup: Cache is valid (generated less than 1 hour ago)
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
      mockPayload.findGlobal.mockResolvedValueOnce({
        content: mockContent,
        lastGenerated: oneMinuteAgo,
      });

      // Act
      const result = await sitemapCache.get();

      // Assert
      expect(mockPayload.findGlobal).toHaveBeenCalledWith({ slug: SitemapGlobal.slug });
      expect(result).toBe(mockContent);
    });

    it('should return null when cache is expired', async () => {
      // Setup: Cache is expired (generated more than 1 hour ago)
      const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
      mockPayload.findGlobal.mockResolvedValueOnce({
        content: mockContent,
        lastGenerated: twoHoursAgo,
      });

      // Act
      const result = await sitemapCache.get();

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when content is missing', async () => {
      // Setup: No content in cache
      mockPayload.findGlobal.mockResolvedValueOnce({
        content: null,
        lastGenerated: mockDate,
      });

      // Act
      const result = await sitemapCache.get();

      // Assert
      expect(result).toBeNull();
    });

    it('should handle errors and return null', async () => {
      // Setup: findGlobal throws an error
      mockPayload.findGlobal.mockRejectedValueOnce(new Error('Database error'));

      // Act
      const result = await sitemapCache.get();

      // Assert
      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error retrieving cached sitemap:',
        expect.any(Error)
      );
    });

    it('should use default cache duration when not specified', async () => {
      // Setup: Create cache with no duration in config
      const cacheWithDefaultDuration = new SitemapCache(mockRequest, {} as any);

      // Cache generated 23 hours ago (within default 24h expiry)
      const twentyThreeHoursAgo = new Date(Date.now() - 23 * 3600 * 1000).toISOString();
      mockPayload.findGlobal.mockResolvedValueOnce({
        content: mockContent,
        lastGenerated: twentyThreeHoursAgo,
      });

      // Act
      const result = await cacheWithDefaultDuration.get();

      // Assert
      expect(result).toBe(mockContent); // Should still be valid with default expiry
    });
  });

  describe('set()', () => {
    it('should update the global with content and timestamp', async () => {
      // Act
      await sitemapCache.set(mockContent);

      // Assert
      expect(mockPayload.updateGlobal).toHaveBeenCalledWith({
        slug: SitemapGlobal.slug,
        data: {
          content: mockContent,
          lastGenerated: expect.any(String),
        },
      });
    });

    it('should handle errors when updating', async () => {
      // Setup: updateGlobal throws an error
      mockPayload.updateGlobal.mockRejectedValueOnce(new Error('Update failed'));

      // Act
      await sitemapCache.set(mockContent);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error saving sitemap to cache:',
        expect.any(Error)
      );
    });
  });

  describe('clear()', () => {
    it('should clear the cache content and timestamp', async () => {
      // Act
      await sitemapCache.clear();

      // Assert
      expect(mockPayload.updateGlobal).toHaveBeenCalledWith({
        slug: SitemapGlobal.slug,
        data: {
          content: null,
          lastGenerated: null,
        },
      });
      expect(mockLogger.debug).toHaveBeenCalledWith('Sitemap cache wiped successfully');
    });

    it('should handle errors when clearing', async () => {
      // Setup: updateGlobal throws an error
      mockPayload.updateGlobal.mockRejectedValueOnce(new Error('Clear failed'));

      // Act
      await sitemapCache.clear();

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error wiping sitemap cache:',
        expect.any(Error)
      );
    });
  });
});