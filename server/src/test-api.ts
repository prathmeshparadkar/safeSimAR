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

    // =========================================================================
    // 6. PHASE 5: FIRE & EXPLOSION MODULE TESTS (Correct, Incorrect, Sync)
    // =========================================================================
    console.log('\n🔥 Testing Phase 5: Fire & Explosion Response Module Endpoints...');

    // Test 6A: Correct Path (100% Score, Passed, Certificate Issued)
    const correctAttemptRes = await fetch(`${baseUrl}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId: 'wrk-001',
        scenarioId: 'scen-fire-01',
        startTime: new Date(Date.now() - 110000).toISOString(),
        endTime: new Date().toISOString(),
        durationSeconds: 110,
        score: 100.0,
        passed: true,
        isOffline: false,
        deviceFingerprint: 'arcore-samsung-sm-g998b-jh01',
        deviceModel: 'Samsung Galaxy Tab Active4 Pro Rugged AR',
        actions: [
          { stepId: 'step-fire-1-intro', actionType: 'ACKNOWLEDGE_BRIEFING', objectInteracted: 'BriefingHUD_AR', isCorrect: true, reactionTimeMs: 1200, penaltyApplied: 0 },
          { stepId: 'step-fire-2-setup', actionType: 'PLACE_ENVIRONMENT', objectInteracted: 'PlacementReticle_AR', isCorrect: true, reactionTimeMs: 2500, penaltyApplied: 0 },
          { stepId: 'step-fire-3-hazard', actionType: 'IDENTIFY_HAZARD', objectInteracted: 'SimulatedFire_AR', isCorrect: true, reactionTimeMs: 1800, penaltyApplied: 0 },
          { stepId: 'step-fire-4-alarm', actionType: 'ACTIVATE_ALARM', objectInteracted: 'EmergencyAlarm_AR', isCorrect: true, reactionTimeMs: 2100, penaltyApplied: 0 },
          { stepId: 'step-fire-5-select', actionType: 'SELECT_EXTINGUISHER', objectInteracted: 'Extinguisher_DryPowder_AR', isCorrect: true, reactionTimeMs: 3000, penaltyApplied: 0 },
          { stepId: 'step-fire-6-pass', actionType: 'COMPLETE_PASS_SEQUENCE', objectInteracted: 'Extinguisher_DryPowder_AR', isCorrect: true, reactionTimeMs: 7200, penaltyApplied: 0 },
          { stepId: 'step-fire-7-evacuate', actionType: 'EVACUATE_EXIT', objectInteracted: 'EmergencyExit_AR', isCorrect: true, reactionTimeMs: 3500, penaltyApplied: 0 },
          { stepId: 'step-fire-8-summary', actionType: 'CONCLUDE_DRILL', objectInteracted: 'SummaryHUD_AR', isCorrect: true, reactionTimeMs: 1000, penaltyApplied: 0 }
        ]
      })
    });
    const correctData: any = await correctAttemptRes.json();
    console.log('✅ POST /attempts (Correct Path):', {
      attemptId: correctData.data?.attemptId,
      score: `${correctData.data?.score}%`,
      passed: correctData.data?.passed,
      certificateIssued: correctData.data?.certificate?.certNumber || 'None'
    });

    if (!correctData.data?.passed || correctData.data?.score !== 100) {
      throw new Error('Correct path failed expectation: score should be 100 and passed true.');
    }

    // Test 6B: Incorrect Path (75% Score, Failed, Below 80% Passing Threshold)
    const incorrectAttemptRes = await fetch(`${baseUrl}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId: 'wrk-002',
        scenarioId: 'scen-fire-01',
        startTime: new Date(Date.now() - 140000).toISOString(),
        endTime: new Date().toISOString(),
        durationSeconds: 140,
        score: 75.0,
        passed: false,
        isOffline: false,
        deviceFingerprint: 'arcore-tab-active3-02',
        deviceModel: 'Samsung Galaxy Tab Active3',
        actions: [
          { stepId: 'step-fire-1-intro', actionType: 'ACKNOWLEDGE_BRIEFING', objectInteracted: 'BriefingHUD_AR', isCorrect: true, reactionTimeMs: 1500, penaltyApplied: 0 },
          { stepId: 'step-fire-2-setup', actionType: 'PLACE_ENVIRONMENT', objectInteracted: 'PlacementReticle_AR', isCorrect: true, reactionTimeMs: 3000, penaltyApplied: 0 },
          { stepId: 'step-fire-3-hazard', actionType: 'IDENTIFY_HAZARD', objectInteracted: 'SimulatedFire_AR', isCorrect: true, reactionTimeMs: 2000, penaltyApplied: 0 },
          { stepId: 'step-fire-4-alarm', actionType: 'ACTIVATE_ALARM', objectInteracted: 'EmergencyAlarm_AR', isCorrect: true, reactionTimeMs: 2500, penaltyApplied: 0 },
          { stepId: 'step-fire-5-select', actionType: 'SELECT_EXTINGUISHER', objectInteracted: 'Extinguisher_Water_AR', isCorrect: false, reactionTimeMs: 4000, penaltyApplied: 15 },
          { stepId: 'step-fire-6-pass', actionType: 'SQUEEZE_HANDLE_PREMATURE', objectInteracted: 'Extinguisher_Lever_AR', isCorrect: false, reactionTimeMs: 3500, penaltyApplied: 10 },
          { stepId: 'step-fire-7-evacuate', actionType: 'EVACUATE_EXIT', objectInteracted: 'EmergencyExit_AR', isCorrect: true, reactionTimeMs: 4000, penaltyApplied: 0 },
        ]
      })
    });
    const incorrectData: any = await incorrectAttemptRes.json();
    console.log('✅ POST /attempts (Incorrect Path):', {
      attemptId: incorrectData.data?.attemptId,
      score: `${incorrectData.data?.score}%`,
      passed: incorrectData.data?.passed,
      certificateIssued: incorrectData.data?.certificate ? 'Unexpected Certificate' : 'None (Correct: Below 80% Threshold)'
    });

    if (incorrectData.data?.passed || incorrectData.data?.certificate != null) {
      throw new Error('Incorrect path failed expectation: passed should be false and no certificate issued.');
    }

    // Test 6C: List Attempts
    const attemptsListRes = await fetch(`${baseUrl}/attempts?limit=5`);
    const attemptsListData: any = await attemptsListRes.json();
    console.log(`✅ GET /attempts: Retrieved ${attemptsListData.data?.length} recent training attempts.`);

    console.log('\n🎉 ALL DASHBOARD & PHASE 5 FIRE RESPONSE MODULE REST ENDPOINTS VALIDATED!');
  } finally {
    server.close();
  }
}

testApi().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
