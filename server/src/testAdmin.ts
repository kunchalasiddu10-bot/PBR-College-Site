export {};
const BASE_URL = 'http://localhost:5000/api/v1';

const runTests = async () => {
  console.log('🏁 Starting Administrator Portal Integration Tests...');

  try {
    // 1. Authenticate as Admin
    console.log('➡️ Testing Admin Login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@college.edu',
        password: 'Password@123',
      }),
    });

    const loginData: any = await loginRes.json();
    if (loginRes.status !== 200 || !loginData.data?.accessToken) {
      throw new Error('Admin login failed or token missing');
    }
    const token = loginData.data.accessToken;
    console.log('✅ Admin login succeeded. Token acquired.');

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // 2. Fetch Dashboard summary
    console.log('➡️ Testing Admin Dashboard stats...');
    const dashRes = await fetch(`${BASE_URL}/admin/dashboard`, { headers });
    const dashData: any = await dashRes.json();
    if (dashRes.status !== 200 || !dashData.data?.stats) {
      throw new Error('Failed to retrieve dashboard statistics');
    }
    console.log('✅ Admin Dashboard stats fetched successfully:');
    console.log(`   - Students Count: ${dashData.data.stats.totalStudents}`);
    console.log(`   - Faculty Count: ${dashData.data.stats.totalFaculty}`);
    console.log(`   - Departments Count: ${dashData.data.stats.totalDepartments}`);

    // 3. Fetch Students List
    console.log('➡️ Testing Student Register retrieval...');
    const studRes = await fetch(`${BASE_URL}/admin/students`, { headers });
    const studData: any = await studRes.json();
    if (studRes.status !== 200 || !Array.isArray(studData.data?.students)) {
      throw new Error('Failed to fetch students roster');
    }
    console.log(`✅ Student Register fetched successfully. Loaded ${studData.data.students.length} students.`);

    // 4. Fetch Faculty List
    console.log('➡️ Testing Faculty Directory retrieval...');
    const facRes = await fetch(`${BASE_URL}/admin/faculty`, { headers });
    const facData: any = await facRes.json();
    if (facRes.status !== 200 || !Array.isArray(facData.data?.faculty)) {
      throw new Error('Failed to fetch faculty list');
    }
    console.log(`✅ Faculty Directory fetched successfully. Loaded ${facData.data.faculty.length} members.`);

    // 5. Fetch Departments List
    console.log('➡️ Testing Departments retrieval...');
    const deptRes = await fetch(`${BASE_URL}/admin/departments`, { headers });
    const deptData: any = await deptRes.json();
    if (deptRes.status !== 200 || !Array.isArray(deptData.data?.departments)) {
      throw new Error('Failed to fetch departments list');
    }
    console.log(`✅ Departments fetched successfully. Loaded ${deptData.data.departments.length} departments.`);

    console.log('🎉 All Administrator Integration Tests completed successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Integration Tests Failed:', error.message || error);
    process.exit(1);
  }
};

runTests();
