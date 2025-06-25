import fetch from 'node-fetch';

async function testEventsAPI() {
  try {
    console.log('Testing events API...');
    
    const url = 'http://localhost:3000/api/events?status=PUBLISHED&sortBy=startDate&sortOrder=asc';
    console.log('Fetching from:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    console.log('Events count:', data.events?.length);
    
    if (data.events && data.events.length > 0) {
      console.log('First event:', data.events[0]);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

await testEventsAPI(); 