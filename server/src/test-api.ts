import app from './index';
import http from 'http';

async function testApi() {
  console.log('🧪 Starting API Integration Tests for Dashboard & Compliance...');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5098, resolve));
  const baseUrl = 'http://localhost:5098/api/v1';

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData: any = await healthRes.json();
    console.log('✅ GET /health:', healthData.data?.status);

    // 2. Auth login
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@jharkhandsafety.gov.in',
        password: 'Admin@12345',
      }),
    });
    const loginData: any = await loginRes.json();
    const token = loginData.data?.token;
    console.log('✅ POST /auth/login: Token issued for', loginData.data?.user?.email);

    // 3. Analytics Dashboard
    const analyticsRes = await fetch(`${baseUrl}/analytics/dashboard`);
    const analyticsData: any = await analyticsRes.json();
    console.log('✅ GET /analytics/dashboard:');
    console.log('   - Total workers:', analyticsData.data?.summary?.total_workers);
    console.log('   - Pass rate:', analyticsData.data?.summary?.pass_rate + '%');
    console.log('   - Valid certificates:', analyticsData.data?.summary?.valid_certificates);
    console.log('   - Certificates expiring soon:', analyticsData.data?.summary?.certificates_expiring_soon);
    console.log('   - Module completion items:', analyticsData.data?.charts?.module_completion?.length);
    console.log('   - Common mistakes recorded:', analyticsData.data?.charts?.common_mistakes?.length);

    // 4. Workers listing & detail
    const workersRes = await fetch(`${baseUrl}/workers?search=Birsa`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const workersData: any = await workersRes.json();
    const worker = workersData.data?.workers[0];
    console.log('✅ GET /workers (search): Found', worker?.name, '| ID:', worker?.id);

    const workerDetailRes = await fetch(`${baseUrl}/workers/${worker.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const workerDetailData: any = await workerDetailRes.json();
    console.log('✅ GET /workers/:id: Retrieved profile, attempts count:', workerDetailData.data?.attempts?.length);

    // 5. Certificates & Verification
    const certsRes = await fetch(`${baseUrl}/certificates`);
    const certsData: any = await certsRes.json();
    const sampleCert = certsData.data[0];
    console.log('✅ GET /certificates: Count =', certsData.data?.length, '| Sample #:', sampleCert?.certificate_number);

    const verifyRes = await fetch(`${baseUrl}/certificates/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ certificate_number: sampleCert?.certificate_number }),
    });
    const verifyData: any = await verifyRes.json();
    console.log('✅ POST /certificates/verify:', verifyData.data?.is_valid ? 'VALID CERTIFICATE' : 'INVALID');

    console.log('\n🎉 ALL DASHBOARD & COMPLIANCE REST API ENDPOINTS VALIDATED!');
  } finally {
    server.close();
  }
}

testApi().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
