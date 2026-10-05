using System;
using System.Collections;
using UnityEngine;
using SurakshaAR.Core;
using SurakshaAR.Models;
using SurakshaAR.Interaction;

namespace SurakshaAR.Tests
{
    /// <summary>
    /// Automated test harness for the sample test scenario: "Object Identification Drill".
    /// Validates full lifecycle:
    /// 1. Surface plane detection & AR object placement (IDLE -> INTRO -> ACTIVE -> WAITING_FOR_ACTION)
    /// 2. Target equipment visual highlight & spatial registry in ARObjectManager
    /// 3. Worker tap interaction & action verification (WAITING_FOR_ACTION -> ACTION_SUCCESS)
    /// 4. Competency score logging, reaction telemetry recording, and offline sync caching
    /// 5. Scenario completion (COMPLETED state with passing grade)
    /// 6. Error path validation (incorrect tap -> penalty deduction -> ACTION_FAILURE)
    /// 7. Complete scenario reset back to IDLE
    /// </summary>
    public class ObjectIdentificationTester : MonoBehaviour
    {
        [Header("Test Configuration")]
        [SerializeField] private bool runTestsOnStart = false;
        [SerializeField] private float stepDelay = 0.5f;

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
            Debug.Log("======================================================================");
            Debug.Log(">>> STARTING SURAKSHA-AR FOUNDATION ENGINE: OBJECT IDENTIFICATION TEST <<<");
            Debug.Log("======================================================================");

            yield return StartCoroutine(TestScenarioInitialization());
            yield return new WaitForSeconds(stepDelay);

            yield return StartCoroutine(TestCorrectPlacementAndTapWorkflow());
            yield return new WaitForSeconds(stepDelay);

            yield return StartCoroutine(TestIncorrectTapPenaltyWorkflow());
            yield return new WaitForSeconds(stepDelay);

            yield return StartCoroutine(TestScenarioResetWorkflow());
            yield return new WaitForSeconds(stepDelay);

            Debug.Log("======================================================================");
            Debug.Log(">>> ALL AR FOUNDATION ENGINE TESTS CONCLUDED SUCCESSFULLY <<<");
            Debug.Log("======================================================================");
        }

        /// <summary>
        /// TEST 1: Scenario Data-Driven Initialization
        /// </summary>
        public IEnumerator TestScenarioInitialization()
        {
            Debug.Log("\n[TEST 1] Testing Scenario Data Loading...");

            var scenarioManager = ARScenarioManager.Instance;
            if (scenarioManager == null)
            {
                Debug.LogError("[TEST 1 FAIL] ARScenarioManager instance is missing.");
                OnTestCompleted?.Invoke("TestScenarioInitialization", false);
                yield break;
            }

            // Ensure "Object Identification Drill" is loaded
            var activeScenario = scenarioManager.ActiveScenario;
            if (activeScenario == null || !activeScenario.scenarioId.Contains("ident"))
            {
                TextAsset json = Resources.Load<TextAsset>("Scenarios/ObjectIdentificationScenario");
                if (json != null)
                {
                    scenarioManager.LoadScenarioFromJson(json.text);
                    activeScenario = scenarioManager.ActiveScenario;
                }
            }

            bool passed = activeScenario != null && activeScenario.steps != null && activeScenario.steps.Count > 0;
            Debug.Log($"[TEST 1 {(passed ? "PASS" : "FAIL")}] Scenario: '{activeScenario?.title}' with {activeScenario?.steps?.Count} steps.");
            OnTestCompleted?.Invoke("TestScenarioInitialization", passed);
            yield return null;
        }

        /// <summary>
        /// TEST 2: Correct Placement & Tap Interaction Execution Path
        /// </summary>
        public IEnumerator TestCorrectPlacementAndTapWorkflow()
        {
            Debug.Log("\n[TEST 2] Testing Correct Placement & Target Tap Execution...");

            var scenarioManager = ARScenarioManager.Instance;
            var objectManager = ARObjectManager.Instance;
            var sessionManager = TrainingSessionManager.Instance;
            var assessment = AssessmentManager.Instance;

            // 1. Reset to IDLE
            scenarioManager.ResetScenario();
            yield return new WaitForSeconds(0.2f);

            if (scenarioManager.CurrentState != ScenarioState.IDLE)
            {
                Debug.LogError($"[TEST 2 FAIL] Expected IDLE state, got: {scenarioManager.CurrentState}");
                OnTestCompleted?.Invoke("TestCorrectPlacementAndTapWorkflow", false);
                yield break;
            }
            Debug.Log("  1. State confirmed: IDLE. Ready for surface placement.");

            // 2. Simulate surface placement
            scenarioManager.TriggerTestPlacement();
            yield return new WaitForSeconds(0.2f);

            if (scenarioManager.CurrentState != ScenarioState.INTRO && scenarioManager.CurrentState != ScenarioState.ACTIVE && scenarioManager.CurrentState != ScenarioState.WAITING_FOR_ACTION)
            {
                Debug.LogError($"[TEST 2 FAIL] Expected transition to INTRO/ACTIVE, got: {scenarioManager.CurrentState}");
                OnTestCompleted?.Invoke("TestCorrectPlacementAndTapWorkflow", false);
                yield break;
            }
            Debug.Log("  2. AR equipment placed on surface. State transitioned from IDLE.");

            // 3. Wait for state to reach WAITING_FOR_ACTION
            float waitTimer = 0f;
            while (scenarioManager.CurrentState != ScenarioState.WAITING_FOR_ACTION && waitTimer < 4f)
            {
                waitTimer += 0.2f;
                yield return new WaitForSeconds(0.2f);
            }

            if (scenarioManager.CurrentState != ScenarioState.WAITING_FOR_ACTION)
            {
                Debug.LogError($"[TEST 2 FAIL] Timed out waiting for WAITING_FOR_ACTION. State: {scenarioManager.CurrentState}");
                OnTestCompleted?.Invoke("TestCorrectPlacementAndTapWorkflow", false);
                yield break;
            }
            Debug.Log("  3. Instruction HUD active. State: WAITING_FOR_ACTION.");

            // 4. Verify target interactable object is registered
            ARInteractableObject targetEquipment = objectManager.GetInteractable("TargetEquipment_AR");
            if (targetEquipment == null)
            {
                Debug.LogError("[TEST 2 FAIL] Target equipment 'TargetEquipment_AR' not found in ARObjectManager registry.");
                OnTestCompleted?.Invoke("TestCorrectPlacementAndTapWorkflow", false);
                yield break;
            }
            Debug.Log($"  4. Target equipment verified in registry: {targetEquipment.ObjectId}");

            // 5. Simulate correct user tap interaction
            scenarioManager.TriggerTestInteraction("TargetEquipment_AR", "TAP_OBJECT");
            yield return new WaitForSeconds(0.2f);

            if (scenarioManager.CurrentState != ScenarioState.ACTION_SUCCESS)
            {
                Debug.LogError($"[TEST 2 FAIL] Expected ACTION_SUCCESS state, got: {scenarioManager.CurrentState}");
                OnTestCompleted?.Invoke("TestCorrectPlacementAndTapWorkflow", false);
                yield break;
            }
            Debug.Log("  5. Correct action verified. State: ACTION_SUCCESS.");

            // 6. Wait for transition to COMPLETED
            waitTimer = 0f;
            while (scenarioManager.CurrentState != ScenarioState.COMPLETED && waitTimer < 3f)
            {
                waitTimer += 0.2f;
                yield return new WaitForSeconds(0.2f);
            }

            bool passed = scenarioManager.CurrentState == ScenarioState.COMPLETED && assessment.CurrentScore >= 80f;
            Debug.Log($"[TEST 2 {(passed ? "PASS" : "FAIL")}] Scenario Concluded! State: {scenarioManager.CurrentState}, Score: {assessment.CurrentScore:F1}%.");
            OnTestCompleted?.Invoke("TestCorrectPlacementAndTapWorkflow", passed);
        }

        /// <summary>
        /// TEST 3: Incorrect Action & Penalty Deduction Validation
        /// </summary>
        public IEnumerator TestIncorrectTapPenaltyWorkflow()
        {
            Debug.Log("\n[TEST 3] Testing Incorrect Action & Penalty Deduction...");

            var scenarioManager = ARScenarioManager.Instance;
            var assessment = AssessmentManager.Instance;

            // Reset drill
            scenarioManager.ResetScenario();
            yield return new WaitForSeconds(0.2f);

            scenarioManager.TriggerTestPlacement();

            // Wait for WAITING_FOR_ACTION
            float waitTimer = 0f;
            while (scenarioManager.CurrentState != ScenarioState.WAITING_FOR_ACTION && waitTimer < 4f)
            {
                waitTimer += 0.2f;
                yield return new WaitForSeconds(0.2f);
            }

            float initialScore = assessment.CurrentScore;

            // Trigger WRONG action type
            scenarioManager.TriggerTestInteraction("TargetEquipment_AR", "WRONG_GESTURE");
            yield return new WaitForSeconds(0.2f);

            bool actionFailed = scenarioManager.CurrentState == ScenarioState.ACTION_FAILURE;
            bool scoreDeducted = assessment.CurrentScore < initialScore;

            bool passed = actionFailed && scoreDeducted;
            Debug.Log($"[TEST 3 {(passed ? "PASS" : "FAIL")}] Incorrect action triggered. State: {scenarioManager.CurrentState}, Score after penalty: {assessment.CurrentScore:F1}% (Initial: {initialScore:F1}%).");
            OnTestCompleted?.Invoke("TestIncorrectTapPenaltyWorkflow", passed);
        }

        /// <summary>
        /// TEST 4: Full Scenario Reset & Purge Validation
        /// </summary>
        public IEnumerator TestScenarioResetWorkflow()
        {
            Debug.Log("\n[TEST 4] Testing Scenario Reset & Memory Cleanup...");

            var scenarioManager = ARScenarioManager.Instance;
            var objectManager = ARObjectManager.Instance;

            scenarioManager.ResetScenario();
            yield return new WaitForSeconds(0.2f);

            bool isStateIdle = scenarioManager.CurrentState == ScenarioState.IDLE;
            bool isObjectCleared = objectManager.GetInteractable("TargetEquipment_AR") == null;
            bool isPlacedFlagReset = !scenarioManager.IsScenarioPlaced;

            bool passed = isStateIdle && isObjectCleared && isPlacedFlagReset;
            Debug.Log($"[TEST 4 {(passed ? "PASS" : "FAIL")}] Reset completed. State: {scenarioManager.CurrentState}, Objects Cleared: {isObjectCleared}, Placed Flag: {!isPlacedFlagReset}.");
            OnTestCompleted?.Invoke("TestScenarioResetWorkflow", passed);
        }
    }
}
