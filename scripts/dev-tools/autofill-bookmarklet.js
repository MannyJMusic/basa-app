// BASA Auto-fill Bookmarklet
// Copy this entire script and save it as a browser bookmark
// When you click the bookmark on any BASA page, it will auto-fill the forms

javascript:(function(){
  'use strict';
  
  // Test data
  const TEST_DATA = {
    contact: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@testcompany.com',
      phone: '(210) 555-0123',
      jobTitle: 'CEO',
      linkedin: 'https://linkedin.com/in/johndoe'
    },
    business: {
      businessName: 'Test Company LLC',
      industry: 'technology',
      businessAddress: '123 Main Street',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78205',
      businessPhone: '(210) 555-0124',
      website: 'https://testcompany.com',
      businessDescription: 'A technology company specializing in web development and digital solutions.'
    },
    customer: {
      name: 'John Doe',
      email: 'john.doe@testcompany.com',
      company: 'Test Company LLC',
      phone: '(210) 555-0123'
    }
  };

  // Helper functions
  function fillInput(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  }

  function fillTextarea(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  }

  function selectOption(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
      element.value = value;
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  }

  function checkCheckbox(selector, checked = true) {
    const element = document.querySelector(selector);
    if (element) {
      element.checked = checked;
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  }

  // Auto-fill functions
  function fillMembershipJoinPage() {
    let filled = 0;
    
    // Contact Information
    if (fillInput('input[name="firstName"]', TEST_DATA.contact.firstName)) filled++;
    if (fillInput('input[name="lastName"]', TEST_DATA.contact.lastName)) filled++;
    if (fillInput('input[name="jobTitle"]', TEST_DATA.contact.jobTitle)) filled++;
    if (fillInput('input[name="email"]', TEST_DATA.contact.email)) filled++;
    if (fillInput('input[name="phone"]', TEST_DATA.contact.phone)) filled++;
    if (fillInput('input[name="linkedin"]', TEST_DATA.contact.linkedin)) filled++;

    // Business Information
    if (fillInput('input[name="businessName"]', TEST_DATA.business.businessName)) filled++;
    if (selectOption('select[data-value]', TEST_DATA.business.industry)) filled++;
    if (fillInput('input[name="businessAddress"]', TEST_DATA.business.businessAddress)) filled++;
    if (fillInput('input[name="city"]', TEST_DATA.business.city)) filled++;
    if (fillInput('input[name="state"]', TEST_DATA.business.state)) filled++;
    if (fillInput('input[name="zipCode"]', TEST_DATA.business.zipCode)) filled++;
    if (fillInput('input[name="businessPhone"]', TEST_DATA.business.businessPhone)) filled++;
    if (fillInput('input[name="website"]', TEST_DATA.business.website)) filled++;
    if (fillTextarea('textarea', TEST_DATA.business.businessDescription)) filled++;

    return filled;
  }

  function fillMembershipPaymentPage() {
    let filled = 0;
    
    if (fillInput('input[name="name"]', TEST_DATA.customer.name)) filled++;
    if (fillInput('input[name="email"]', TEST_DATA.customer.email)) filled++;
    if (fillInput('input[name="company"]', TEST_DATA.customer.company)) filled++;
    if (fillInput('input[name="phone"]', TEST_DATA.customer.phone)) filled++;
    if (checkCheckbox('input[id="auto-renew"]', true)) filled++;

    return filled;
  }

  function fillEventRegistrationPage() {
    let filled = 0;
    
    // Primary attendee
    if (fillInput('input[name="name-0"]', TEST_DATA.contact.firstName + ' ' + TEST_DATA.contact.lastName)) filled++;
    if (fillInput('input[name="email-0"]', TEST_DATA.contact.email)) filled++;
    if (fillInput('input[name="company-0"]', TEST_DATA.business.businessName)) filled++;
    if (fillInput('input[name="phone-0"]', TEST_DATA.contact.phone)) filled++;

    // Check member status if available
    if (checkCheckbox('input[id="isMember"]', true)) filled++;

    return filled;
  }

  // Detect and fill current page
  const currentUrl = window.location.href;
  let filledCount = 0;
  let pageType = '';

  if (currentUrl.includes('/membership/join')) {
    filledCount = fillMembershipJoinPage();
    pageType = 'Membership Join Page';
  } else if (currentUrl.includes('/membership/payment')) {
    filledCount = fillMembershipPaymentPage();
    pageType = 'Membership Payment Page';
  } else if (currentUrl.includes('/events/') && currentUrl.includes('/register')) {
    filledCount = fillEventRegistrationPage();
    pageType = 'Event Registration Page';
  } else {
    alert('BASA Auto-fill: Unknown page type. Please navigate to a BASA form page.');
    return;
  }

  // Show results
  if (filledCount > 0) {
    alert(`BASA Auto-fill: Successfully filled ${filledCount} fields on ${pageType}!\n\n💳 Stripe Test Card: 4242424242424242\nExpiry: 12/25, CVV: 123`);
  } else {
    alert('BASA Auto-fill: No form fields found to fill. Please check if you are on the correct page.');
  }

})(); 