const asyncHandler = require('../../utils/asyncHandler');
const { exec } = require('child_process'); // Add child_process import

// Controller to handle Nominatim search requests
exports.searchNominatimLocation = asyncHandler(async (req, res, next) => {
  const { q: query } = req.query;

  if (!query || query.length < 3) {
    return res.status(400).json({ success: false, message: 'Search query must be at least 3 characters long.' });
  }

  const APP_USER_AGENT = process.env.NOMINATIM_USER_AGENT || 'IslamicDashboardApp/1.0 (Contact: your-email@example.com)'; 

  try {
    console.log(`[LocationController] Proxying search to Nominatim for query: "${query}"`);
    console.log(`[LocationController] Using User-Agent: "${APP_USER_AGENT}"`);
    
    // Create curl command with proper escaping and parameters
    const sanitizedQuery = query.replace(/['"]/g, '\\$&'); // Escape quotes
    const curlCommand = `curl -s -L -A "${APP_USER_AGENT}" "https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(sanitizedQuery)}&format=json&addressdetails=1&limit=5"`;
    
    console.log(`[LocationController] Executing: ${curlCommand}`);
    
    // Execute curl command
    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`[LocationController] Curl exec error: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Error calling location service' });
      }
      
      if (stderr) {
        console.error(`[LocationController] Curl stderr: ${stderr}`);
      }
      
      try {
        // Ensure stdout is not empty
        if (!stdout || stdout.trim() === '') {
          console.error('[LocationController] Empty response from Nominatim');
          return res.status(404).json({ success: false, message: 'No data returned from location service' });
        }
        
        // Log the raw stdout for debugging
        console.log(`[LocationController] Raw stdout: ${stdout.substring(0, 200)}${stdout.length > 200 ? '...' : ''}`);
        
        // Parse JSON response from curl
        const data = JSON.parse(stdout);
        console.log(`[LocationController] Successfully retrieved ${data.length} results`);
        
        // Set proper content type header
        res.setHeader('Content-Type', 'application/json');
        
        // Send the results directly, not wrapped in another object
        return res.status(200).json(data);
      } catch (parseError) {
        console.error(`[LocationController] Error parsing curl response: ${parseError.message}`);
        console.error(`[LocationController] Raw response: ${stdout.substring(0, 200)}...`);
        return res.status(500).json({ success: false, message: 'Error processing location data' });
      }
    });

  } catch (error) {
    console.error(`[LocationController] Error in curl execution for query "${query}":`, error.message);
    res.status(500).json({ success: false, message: 'Internal server error during location search.' });
  }
}); 