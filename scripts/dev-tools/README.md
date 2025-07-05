# Development Tools

This directory contains development and testing tools for the BASA application.

## Auto-fill Scripts

### `autofill-bookmarklet.js`
A bookmarklet script that can be saved as a browser bookmark to auto-fill forms during testing.

**Usage:**
1. Copy the entire script content
2. Create a new browser bookmark
3. Set the URL to the copied script
4. Click the bookmark on any BASA form page to auto-fill

### `autofill-extension.js`
A browser console script for auto-filling forms during development and testing.

**Usage:**
1. Open browser developer tools (F12)
2. Go to the Console tab
3. Copy and paste the script content
4. Use the available functions:
   - `BASAAutoFill.autoFillCurrentPage()` - Auto-detect and fill current page
   - `BASAAutoFill.fillMembershipJoinPage()` - Fill membership join form
   - `BASAAutoFill.fillMembershipPaymentPage()` - Fill membership payment form
   - `BASAAutoFill.fillEventRegistrationPage()` - Fill event registration form

## Test Data

Both scripts use the same test data:
- **Contact:** John Doe, john.doe@testcompany.com
- **Business:** Test Company LLC
- **Stripe Test Card:** 4242424242424242 (expiry: 12/25, CVV: 123)

## Notes

- These tools are for development and testing purposes only
- They should not be used in production
- The test data is hardcoded and should be updated as needed for your testing scenarios 