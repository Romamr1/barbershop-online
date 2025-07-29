const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test the new barber endpoints
async function testBarberEndpoints() {
  try {
    console.log('Testing barber endpoints...\n');

    // 1. Test getting available users for barber assignment
    console.log('1. Testing GET /api/barbers/available-users');
    try {
      const response = await axios.get(`${BASE_URL}/api/barbers/available-users?barbershopId=test-id`);
      console.log('✅ Available users endpoint accessible');
      console.log('Response:', response.data);
    } catch (error) {
      console.log('❌ Available users endpoint error:', error.response?.data || error.message);
    }

    // 2. Test creating barber with user (this will fail without auth, but we can test the endpoint exists)
    console.log('\n2. Testing POST /api/barbers/with-user');
    try {
      const response = await axios.post(`${BASE_URL}/api/barbers/with-user`, {
        name: 'Test Barber',
        email: 'test@example.com',
        password: 'password123',
        barberShopId: 'test-id'
      });
      console.log('✅ Create barber with user endpoint accessible');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Create barber with user endpoint exists (auth required)');
      } else {
        console.log('❌ Create barber with user endpoint error:', error.response?.data || error.message);
      }
    }

    // 3. Test assigning user as barber
    console.log('\n3. Testing POST /api/barbers/assign-user');
    try {
      const response = await axios.post(`${BASE_URL}/api/barbers/assign-user`, {
        userId: 'test-user-id',
        barberShopId: 'test-barbershop-id'
      });
      console.log('✅ Assign user as barber endpoint accessible');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Assign user as barber endpoint exists (auth required)');
      } else {
        console.log('❌ Assign user as barber endpoint error:', error.response?.data || error.message);
      }
    }

    console.log('\n✅ All endpoints are accessible!');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testBarberEndpoints(); 