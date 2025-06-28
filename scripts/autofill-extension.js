// BASA Payment Form Auto-fill Extension
// This script can be run in the browser console to auto-fill forms during testing

(function() {
  'use strict';

  // Test data for auto-filling forms
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

  // Stripe test card numbers
  const STRIPE_TEST_CARDS = {
    success: '4242424242424242',
    decline: '4000000000000002',
    requiresAuth: '4000002500003155',
    insufficientFunds: '4000000000009995',
    expired: '4000000000000069',
    incorrectCvc: '4000000000000127'
  };

  // Function to fill input fields
  function fillInput(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`✅ Filled ${selector} with: ${value}`);
    } else {
      console.log(`❌ Element not found: ${selector}`);
    }
  }

  // Function to fill textarea fields
  function fillTextarea(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`✅ Filled textarea ${selector} with: ${value}`);
    } else {
      console.log(`❌ Textarea not found: ${selector}`);
    }
  }

  // Function to select dropdown options
  function selectOption(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
      element.value = value;
      element.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`✅ Selected ${selector} with: ${value}`);
    } else {
      console.log(`❌ Select element not found: ${selector}`);
    }
  }

  // Function to check checkboxes
  function checkCheckbox(selector, checked = true) {
    const element = document.querySelector(selector);
    if (element) {
      element.checked = checked;
      element.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`✅ ${checked ? 'Checked' : 'Unchecked'} ${selector}`);
    } else {
      console.log(`❌ Checkbox not found: ${selector}`);
    }
  }

  // Auto-fill membership join page
  function fillMembershipJoinPage() {
    console.log('🚀 Auto-filling BASA Membership Join Page...');
    
    // Contact Information
    fillInput('input[name="firstName"]', TEST_DATA.contact.firstName);
    fillInput('input[name="lastName"]', TEST_DATA.contact.lastName);
    fillInput('input[name="jobTitle"]', TEST_DATA.contact.jobTitle);
    fillInput('input[name="email"]', TEST_DATA.contact.email);
    fillInput('input[name="phone"]', TEST_DATA.contact.phone);
    fillInput('input[name="linkedin"]', TEST_DATA.contact.linkedin);

    // Business Information
    fillInput('input[name="businessName"]', TEST_DATA.business.businessName);
    selectOption('select[data-value]', TEST_DATA.business.industry);
    fillInput('input[name="businessAddress"]', TEST_DATA.business.businessAddress);
    fillInput('input[name="city"]', TEST_DATA.business.city);
    fillInput('input[name="state"]', TEST_DATA.business.state);
    fillInput('input[name="zipCode"]', TEST_DATA.business.zipCode);
    fillInput('input[name="businessPhone"]', TEST_DATA.business.businessPhone);
    fillInput('input[name="website"]', TEST_DATA.business.website);
    fillTextarea('textarea', TEST_DATA.business.businessDescription);

    console.log('✅ Membership join page auto-filled!');
  }

  // Auto-fill membership payment page
  function fillMembershipPaymentPage() {
    console.log('🚀 Auto-filling BASA Membership Payment Page...');
    
    fillInput('input[name="name"]', TEST_DATA.customer.name);
    fillInput('input[name="email"]', TEST_DATA.customer.email);
    fillInput('input[name="company"]', TEST_DATA.customer.company);
    fillInput('input[name="phone"]', TEST_DATA.customer.phone);
    checkCheckbox('input[id="auto-renew"]', true);

    console.log('✅ Membership payment page auto-filled!');
  }

  // Auto-fill event registration page
  function fillEventRegistrationPage() {
    console.log('🚀 Auto-filling Event Registration Page...');
    
    // Primary attendee
    fillInput('input[name="name-0"]', TEST_DATA.contact.firstName + ' ' + TEST_DATA.contact.lastName);
    fillInput('input[name="email-0"]', TEST_DATA.contact.email);
    fillInput('input[name="company-0"]', TEST_DATA.business.businessName);
    fillInput('input[name="phone-0"]', TEST_DATA.contact.phone);

    // Check member status if available
    checkCheckbox('input[id="isMember"]', true);

    console.log('✅ Event registration page auto-filled!');
  }

  // Auto-fill Stripe payment form (basic fields)
  function fillStripeForm() {
    console.log('🚀 Auto-filling Stripe Payment Form...');
    
    // Note: Stripe PaymentElement is iframe-based, so we can't directly fill it
    // But we can provide the test card numbers for manual entry
    console.log('💳 Stripe Test Card Numbers:');
    console.log('Success: 4242424242424242');
    console.log('Decline: 4000000000000002');
    console.log('Requires Auth: 4000002500003155');
    console.log('Expiry: 12/25, CVV: 123');
    
    console.log('⚠️ Stripe PaymentElement fields must be filled manually');
  }

  // Detect current page and auto-fill accordingly
  function autoFillCurrentPage() {
    const currentUrl = window.location.href;
    
    if (currentUrl.includes('/membership/join')) {
      fillMembershipJoinPage();
    } else if (currentUrl.includes('/membership/payment')) {
      fillMembershipPaymentPage();
    } else if (currentUrl.includes('/events/') && currentUrl.includes('/register')) {
      fillEventRegistrationPage();
    } else {
      console.log('❓ Unknown page. Available functions:');
      console.log('- fillMembershipJoinPage()');
      console.log('- fillMembershipPaymentPage()');
      console.log('- fillEventRegistrationPage()');
      console.log('- fillStripeForm()');
    }
  }

  // Make functions available globally
  window.BASAAutoFill = {
    fillMembershipJoinPage,
    fillMembershipPaymentPage,
    fillEventRegistrationPage,
    fillStripeForm,
    autoFillCurrentPage,
    TEST_DATA,
    STRIPE_TEST_CARDS
  };

  console.log('🎯 BASA Auto-fill Extension Loaded!');
  console.log('Available functions:');
  console.log('- BASAAutoFill.autoFillCurrentPage() - Auto-detect and fill current page');
  console.log('- BASAAutoFill.fillMembershipJoinPage() - Fill membership join form');
  console.log('- BASAAutoFill.fillMembershipPaymentPage() - Fill membership payment form');
  console.log('- BASAAutoFill.fillEventRegistrationPage() - Fill event registration form');
  console.log('- BASAAutoFill.fillStripeForm() - Show Stripe test card info');
  console.log('- BASAAutoFill.TEST_DATA - Access test data');
  console.log('- BASAAutoFill.STRIPE_TEST_CARDS - Access Stripe test cards');

  // Auto-run if on a known page
  setTimeout(() => {
    autoFillCurrentPage();
  }, 1000);

})(); 