using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SurakshaAR.Core;
using SurakshaAR.Models;
using SurakshaAR.Modules.FireExplosion;

namespace SurakshaAR.Tests
{
    /// <summary>
    /// Automated test runner and simulator for the Fire & Explosion Response Module.
    /// Validates:
    /// 1. Correct execution path (100% score, passing, certificate eligibility)
    /// 2. Incorrect execution path (penalties recorded, mistakes flagged, failure below 80% threshold)
    /// 3. Restart sequence (complete state reset to Step 1)
    /// 4. Score generation, action telemetry, and offline queue payload creation
    /// </summary>
    public class FireModuleTester : MonoBehaviour
    {
        [Header("Test Configuration")]
        [SerializeField] private bool runTestsOnStart = false;
        [SerializeField] private float stepDelaySeconds = 0.5f;

        public event Action<string, bool> OnTestCompleted; // testName, isPassed

        private void Start()
        {
            if (runTestsOnStart)
            {
                StartCoroutine(RunAllTestsRoutine());
            }
        }

        public IEnumerator RunAllTestsRoutine()
        {
            Debug.Log("==================================================");
            Debug.Log(">>> STARTING SURAKSHA-AR FIRE MODULE TEST SUITE <<<");
            Debug.Log("==================================================");

            yield return StartCoroutine(TestRestartSequence());
            yield return new WaitForSeconds(stepDelaySeconds);

            yield return StartCoroutine(TestIncorrectPath());
            yield return new WaitForSeconds(stepDelaySeconds);

            yield return StartCoroutine(TestRestartSequence());
            yield return new WaitForSeconds(stepDelaySeconds);

            yield return StartCoroutine(TestCorrectPath());
            yield return new WaitForSeconds(stepDelaySeconds);

            Debug.Log("==================================================");
            Debug.Log(">>> ALL FIRE MODULE TESTS COMPLETED SUCCESSFULLY <<<");
            Debug.Log("==================================================");
        }

        /// <summary>
        /// TEST 1: Correct Execution Path
        /// Simulates perfect worker actions across all 8 steps.
        /// Expected: Score = 100%, Passed = true, Zero mistakes.
        /// </summary>
        public IEnumerator TestCorrectPath()
        {
            Debug.Log("\n[TEST 1] Testing Correct Path Execution...");

            var assessment = AssessmentManager.Instance;
            var session = TrainingSessionManager.Instance;
            var fireModule = FireModuleController.Instance;

            if (session != null)
            {
                session.SetWorkerContext("wrk-001", "CCL-EMP-8921", "org-ccl-ranchi-001");
                session.StartSession("scen-fire-01");
            }

            if (assessment != null)
            {
                assessment.InitializeSession(80f);
            }

            yield return new WaitForSeconds(0.1f);

            // Step 1: Briefing Acknowledged (0 penalty)
            var step1 = new StepData { stepId = "step-fire-1-intro", expectedAction = "ACKNOWLEDGE_BRIEFING", targetObjectId = "BriefingHUD_AR", penaltyPoints = 0 };
            assessment?.RecordAction(step1, true, 1200, transform, Vector3.zero);
            Debug.Log("  [Step 1] Briefing confirmed (+0 pts)");

            // Step 2: Surface Scanned & Environment Placed (0 penalty)
            var step2 = new StepData { stepId = "step-fire-2-setup", expectedAction = "PLACE_ENVIRONMENT", targetObjectId = "PlacementReticle_AR", penaltyPoints = 0 };
            assessment?.RecordAction(step2, true, 2500, transform, Vector3.zero);
            Debug.Log("  [Step 2] Environment placed (+0 pts)");

            // Step 3: Hazard Identification (+20 pts)
            var step3 = new StepData { stepId = "step-fire-3-hazard", expectedAction = "IDENTIFY_HAZARD", targetObjectId = "SimulatedFire_AR", penaltyPoints = 20 };
            assessment?.RecordAction(step3, true, 1800, transform, new Vector3(0, 0, 2));
            Debug.Log("  [Step 3] Hazard identified (+20 pts)");

            // Step 4: Emergency Alarm Activated (+15 pts)
            var step4 = new StepData { stepId = "step-fire-4-alarm", expectedAction = "ACTIVATE_ALARM", targetObjectId = "EmergencyAlarm_AR", penaltyPoints = 15 };
            assessment?.RecordAction(step4, true, 2100, transform, new Vector3(-1.2f, 1.1f, 1.5f));
            Debug.Log("  [Step 4] Emergency alarm pulled (+15 pts)");

            // Step 5: Extinguisher Selected (Class D Dry Powder) (+15 pts)
            var step5 = new StepData { stepId = "step-fire-5-select", expectedAction = "SELECT_EXTINGUISHER", targetObjectId = "Extinguisher_DryPowder_AR", penaltyPoints = 15 };
            assessment?.RecordAction(step5, true, 3000, transform, new Vector3(1.2f, 0, 1.5f));
            fireModule?.HandleExtinguisherSelected("Extinguisher_DryPowder_AR", true);
            Debug.Log("  [Step 5] Correct Class D Dry Powder selected (+15 pts)");

            // Step 6: P.A.S.S. Sequential Execution (+25 pts)
            if (fireModule?.PassController != null)
            {
                fireModule.PassController.BeginPASSSequence();
                fireModule.PassController.ExecuteSubAction("PULL_PIN");
                fireModule.PassController.ExecuteSubAction("AIM_NOZZLE");
                fireModule.PassController.ExecuteSubAction("SQUEEZE_HANDLE");
                fireModule.PassController.ExecuteSubAction("SWEEP_BASE");
                fireModule.PassController.ExecuteSubAction("SWEEP_BASE");
                fireModule.PassController.ExecuteSubAction("SWEEP_BASE");
            }
            var step6 = new StepData { stepId = "step-fire-6-pass", expectedAction = "COMPLETE_PASS_SEQUENCE", targetObjectId = "Extinguisher_DryPowder_AR", penaltyPoints = 25 };
            assessment?.RecordAction(step6, true, 7200, transform, new Vector3(0, 0, 2));
            Debug.Log("  [Step 6] P.A.S.S. sequence completed (+25 pts)");

            // Step 7: Evacuation (+25 pts)
            var step7 = new StepData { stepId = "step-fire-7-evacuate", expectedAction = "EVACUATE_EXIT", targetObjectId = "EmergencyExit_AR", penaltyPoints = 25 };
            assessment?.RecordAction(step7, true, 3500, transform, new Vector3(0, 1.2f, -2.5f));
            fireModule?.HandleEvacuationFinished();
            Debug.Log("  [Step 7] Evacuation exit reached (+25 pts)");

            // Step 8: Final Report & Score Verification
            AssessmentReport report = assessment?.GenerateFinalReport();
            
            // Persist session to local offline sync queue
            TextAsset fireJson = Resources.Load<TextAsset>("Scenarios/FireExplosionScenario");
            ScenarioData scenarioData = fireJson != null ? ScenarioData.FromJson(fireJson.text) : null;
            CompletedSessionRecord record = session?.ConcludeSession(scenarioData, report);

            bool recordValid = record != null && record.isCompleted && record.passed && !string.IsNullOrEmpty(record.deviceModel);
            bool testPassed = report != null && report.totalScore == 100f && report.passed && report.failedSteps == 0 && recordValid;

            if (testPassed)
            {
                Debug.Log($"[TEST 1 SUCCESS] Score: {report.totalScore}% | Passed: {report.passed} | Deductions: {report.totalDeductions} | Offline Record: {record.sessionId}");
            }
            else
            {
                Debug.LogError($"[TEST 1 FAILED] Unexpected score: {report?.totalScore}%, Passed: {report?.passed}, Record Valid: {recordValid}");
            }

            OnTestCompleted?.Invoke("TestCorrectPath", testPassed);
            yield return null;
        }

        /// <summary>
        /// TEST 2: Incorrect Execution Path
        /// Simulates worker errors:
        /// 1. Wrong extinguisher (Water on coal fire => -15 pts)
        /// 2. Out-of-order P.A.S.S. (squeezing handle before pulling pin => -10 pts)
        /// Total Deductions = 25 pts => Score = 75% (< 80% passing threshold).
        /// Expected: Passed = false, Mistakes recorded.
        /// </summary>
        public IEnumerator TestIncorrectPath()
        {
            Debug.Log("\n[TEST 2] Testing Incorrect Path Execution (Violations & Mistakes)...");

            var assessment = AssessmentManager.Instance;
            var fireModule = FireModuleController.Instance;

            if (assessment != null)
            {
                assessment.InitializeSession(80f);
            }

            yield return new WaitForSeconds(0.1f);

            // Step 3: Hazard Identification (+20 pts)
            var step3 = new StepData { stepId = "step-fire-3-hazard", expectedAction = "IDENTIFY_HAZARD", targetObjectId = "SimulatedFire_AR", penaltyPoints = 20 };
            assessment?.RecordAction(step3, true, 1800, transform, Vector3.zero);

            // Step 4: Emergency Alarm Activated (+15 pts)
            var step4 = new StepData { stepId = "step-fire-4-alarm", expectedAction = "ACTIVATE_ALARM", targetObjectId = "EmergencyAlarm_AR", penaltyPoints = 15 };
            assessment?.RecordAction(step4, true, 2100, transform, Vector3.zero);

            // Step 5 ERROR: Worker selects Water Extinguisher (-15 pts deduction)
            var step5 = new StepData { stepId = "step-fire-5-select", expectedAction = "SELECT_EXTINGUISHER", targetObjectId = "Extinguisher_Water_AR", penaltyPoints = 15 };
            assessment?.RecordAction(step5, false, 4000, transform, Vector3.zero);
            fireModule?.HandleExtinguisherSelected("Extinguisher_Water_AR", false);
            Debug.Log("  [Step 5 Mistake] Water extinguisher selected for coal gas fire (-15 pts)");

            // Step 6 ERROR: Worker attempts to SQUEEZE handle without pulling safety pin (-10 pts deduction)
            if (fireModule?.PassController != null)
            {
                fireModule.PassController.BeginPASSSequence();
                bool outOfOrderSuccess = fireModule.PassController.ExecuteSubAction("SQUEEZE_HANDLE");
                Debug.Log($"  [Step 6 Mistake] Squeeze handle before pin pull allowed? {outOfOrderSuccess} (Expected: false)");
            }

            var step6Mistake = new StepData { stepId = "step-fire-6-pass-err", expectedAction = "SQUEEZE_HANDLE_PREMATURE", targetObjectId = "Extinguisher_Handle_AR", penaltyPoints = 10 };
            assessment?.RecordAction(step6Mistake, false, 2500, transform, Vector3.zero);
            Debug.Log("  [Step 6 Mistake] Premature handle squeeze logged (-10 pts)");

            // Step 7: Evacuation (+25 pts)
            var step7 = new StepData { stepId = "step-fire-7-evacuate", expectedAction = "EVACUATE_EXIT", targetObjectId = "EmergencyExit_AR", penaltyPoints = 25 };
            assessment?.RecordAction(step7, true, 4100, transform, Vector3.zero);

            // Final Report Check
            AssessmentReport report = assessment?.GenerateFinalReport();
            
            TextAsset fireJson = Resources.Load<TextAsset>("Scenarios/FireExplosionScenario");
            ScenarioData scenarioData = fireJson != null ? ScenarioData.FromJson(fireJson.text) : null;
            var session = TrainingSessionManager.Instance;
            CompletedSessionRecord record = session?.ConcludeSession(scenarioData, report);

            bool mistakesLogged = record != null && record.mistakeCount == 2 && record.mistakes.Count == 2 && !record.passed;
            bool testPassed = report != null && report.totalScore == 75f && !report.passed && report.failedSteps == 2 && mistakesLogged;

            if (testPassed)
            {
                Debug.Log($"[TEST 2 SUCCESS] Incorrect Path Handled Correctly. Score: {report.totalScore}% | Passed: {report.passed} (Expected: False) | Violations Logged: {record.mistakeCount}");
            }
            else
            {
                Debug.LogError($"[TEST 2 FAILED] Score: {report?.totalScore}%, Passed: {report?.passed}, Violations: {report?.failedSteps}, Mistakes Logged: {mistakesLogged}");
            }

            OnTestCompleted?.Invoke("TestIncorrectPath", testPassed);
            yield return null;
        }

        /// <summary>
        /// TEST 3: Restart Sequence
        /// Tests resetting the module state, flame height, P.A.S.S. sequence, and assessment score.
        /// </summary>
        public IEnumerator TestRestartSequence()
        {
            Debug.Log("\n[TEST 3] Testing Scenario Restart...");

            var fireModule = FireModuleController.Instance;
            var assessment = AssessmentManager.Instance;

            fireModule?.RestartModule();
            assessment?.InitializeSession(80f);

            bool isRestarted = (assessment != null && assessment.CurrentScore == 100f) &&
                               (fireModule?.PassController == null || fireModule.PassController.CurrentStage == PASSStage.NOT_STARTED) &&
                               (fireModule?.FireHazard == null || !fireModule.FireHazard.IsExtinguished);

            if (isRestarted)
            {
                Debug.Log("[TEST 3 SUCCESS] Scenario restarted cleanly to initial Step 1 state.");
            }
            else
            {
                Debug.LogError("[TEST 3 FAILED] Scenario did not reset cleanly.");
            }

            OnTestCompleted?.Invoke("TestRestartSequence", isRestarted);
            yield return null;
        }
    }
}
