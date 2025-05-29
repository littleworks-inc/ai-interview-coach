// ==========================================
// AI Interview Coach - Tips Route
// ==========================================

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// Cache tips data in memory for performance
let tipsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

/**
 * Load tips data from JSON file with caching
 * @returns {Promise<Object>} Tips data
 */
async function loadTipsData() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (tipsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return tipsCache;
  }
  
  try {
    const tipsPath = path.join(__dirname, '../data/interview-tips.json');
    const tipsData = await fs.readFile(tipsPath, 'utf8');
    const parsedData = JSON.parse(tipsData);
    
    // Update cache
    tipsCache = parsedData;
    cacheTimestamp = now;
    
    console.log('[TIPS] Data loaded successfully:', {
      categories: parsedData.categories.length,
      totalTips: parsedData.meta.totalTips,
      version: parsedData.meta.version
    });
    
    return parsedData;
  } catch (error) {
    console.error('[TIPS] Error loading tips data:', error.message);
    throw new Error('Unable to load interview tips data');
  }
}

/**
 * GET /api/tips - Get all interview tips
 */
router.get('/', async (req, res) => {
  try {
    const tipsData = await loadTipsData();
    
    // Log request for analytics
    console.log('[TIPS REQUEST]', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent')?.substring(0, 100)
    });
    
    res.json({
      success: true,
      data: tipsData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[TIPS ERROR]', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      error: 'Unable to fetch interview tips',
      code: 'TIPS_LOAD_ERROR'
    });
  }
});

/**
 * GET /api/tips/categories - Get just the category list
 */
router.get('/categories', async (req, res) => {
  try {
    const tipsData = await loadTipsData();
    
    // Return simplified category info
    const categories = tipsData.categories.map(cat => ({
      id: cat.id,
      title: cat.title,
      icon: cat.icon,
      description: cat.description,
      tipCount: cat.tips.length
    }));
    
    res.json({
      success: true,
      data: categories,
      meta: {
        totalCategories: categories.length,
        totalTips: tipsData.meta.totalTips
      }
    });
    
  } catch (error) {
    console.error('[TIPS CATEGORIES ERROR]', error.message);
    res.status(500).json({
      success: false,
      error: 'Unable to fetch tip categories',
      code: 'CATEGORIES_LOAD_ERROR'
    });
  }
});

/**
 * GET /api/tips/category/:categoryId - Get tips for specific category
 */
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const tipsData = await loadTipsData();
    
    // Find the specific category
    const category = tipsData.categories.find(cat => cat.id === categoryId);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
        code: 'CATEGORY_NOT_FOUND',
        availableCategories: tipsData.categories.map(cat => cat.id)
      });
    }
    
    res.json({
      success: true,
      data: category,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[TIPS CATEGORY ERROR]', error.message);
    res.status(500).json({
      success: false,
      error: 'Unable to fetch category tips',
      code: 'CATEGORY_LOAD_ERROR'
    });
  }
});

/**
 * Health check for tips service
 */
router.get('/health', (req, res) => {
  res.json({
    service: 'tips',
    status: 'healthy',
    cache: {
      active: !!tipsCache,
      lastUpdated: cacheTimestamp ? new Date(cacheTimestamp).toISOString() : null
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;