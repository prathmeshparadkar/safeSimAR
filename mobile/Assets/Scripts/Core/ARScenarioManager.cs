using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using SurakshaAR.Models;
using SurakshaAR.Interaction;

namespace SurakshaAR.Core
{
    /// <summary>
    /// Master State Machine Controller for SurakshaAR Training Modules.
    /// Manages data-driven scenario execution, AR placement, transitions, and assessment triggering.
    /// </summary>
    public class ARScenarioManager : MonoBehaviour
    {
        public static ARScenarioManager Instance { get; private set; }

        [Header("System References")]
        [SerializeField] private ARPlaneManager planeManager;
        [SerializeField] private ARPlacementReticle placementReticle;
        [SerializeField] private Camera arCamera;

        [Header("Scenario Configuration")]
        [SerializeField] private TextAsset defaultScenarioJson;
        [SerializeField] private GameObject defaultScenarioPrefab;

        public event Action<ScenarioState> OnStateChanged;
        public event Action<AssessmentReport> OnScenarioConcluded;

        private ScenarioState currentState = ScenarioState.IDLE;
        private ScenarioData activeScenario;
        private GameObject spawnedScenarioInstance;
        private bool isScenarioPlaced = false;

        public ScenarioState CurrentState => currentState;
        public ScenarioData ActiveScenario => activeScenario;
        public bool IsScenarioPlaced => isScenarioPlaced;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);

            if (arCamera == null) arCamera = Camera.main;
        }

        private void Start()
        {
            // Connect to subsystem events
            if (ARInteractionManager.Instance != null)
            {
                ARInteractionManager.Instance.OnActionExecuted += HandleObjectInteraction;
                ARInteractionManager.Instance.OnEmptySpaceTapped += HandleEmptySpaceTap;
            }

            if (ScenarioStepManager.Instance != null)
            {
                ScenarioStepManager.Instance.OnStepStarted += HandleStepStarted;
                ScenarioStepManager.Instance.OnStepCompleted += HandleStepCompleted;
            }

            // Load default data-driven scenario
            if (defaultScenarioJson != null)
            {
                LoadScenarioFromJson(defaultScenarioJson.text);
            }
            else
            {
                LoadFallbackTestScenario();
            }

            SetState(ScenarioState.IDLE);
        }

        private void OnDestroy()
        {
            if (ARInteractionManager.Instance != null)
            {
                ARInteractionManager.Instance.OnActionExecuted -= HandleObjectInteraction;
                ARInteractionManager.Instance.OnEmptySpaceTapped -= HandleEmptySpaceTap;
            }

            if (ScenarioStepManager.Instance != null)
            {
                ScenarioStepManager.Instance.OnStepStarted -= HandleStepStarted;
                ScenarioStepManager.Instance.OnStepCompleted -= HandleStepCompleted;
            }
        }

        public void LoadScenarioFromJson(string json)
        {
            try
            {
                activeScenario = ScenarioData.FromJson(json);
                Debug.Log($"[ARScenarioManager] Loaded Scenario: {activeScenario.title} ({activeScenario.steps.Count} steps)");
            }
            catch (Exception ex)
            {
                Debug.LogError($"[ARScenarioManager] Error parsing scenario JSON: {ex.Message}");
                LoadFallbackTestScenario();
            }
        }

        private void LoadFallbackTestScenario()
        {
            // Standard Test Scenario: "Object Identification"
            activeScenario = new ScenarioData
            {
                scenarioId = "scen-test-obj-ident-01",
                moduleCode = "MOD-TEST-01",
                title = "Object Identification Drill",
                description = "Scan horizontal ground surface, tap to place equipment, then identify and inspect the target monitor.",
                environmentType = "COAL_SEAM",
                hazardLevel = "MEDIUM",
                passingScore = 80f,
                steps = new List<StepData>
                {
                    new StepData
                    {
                        stepId = "step-ident-01",
                        stepOrder = 1,
                        title = "Target Equipment Identification",
                        instructionEn = "Identify and tap on the highlighted safety monitor.",
                        instructionHi = "हाइलाइट किए गए सुरक्षा मॉनिटर को पहचानें और उस पर टैप करें।",
                        instructionSat = "ᱪᱤᱱᱦᱟᱹᱣ ᱢᱮ ᱟᱨ ᱥᱩᱨᱚᱠᱷᱤᱛ ᱢᱚᱱᱤᱴᱚᱨ ᱪᱮᱛᱟᱱ ᱨᱮ ᱴᱤᱯ ᱢᱮ (Monitor ñel kate tip me).",
                        expectedAction = "TAP_OBJECT",
                        targetObjectId = "TargetEquipment_AR",
                        timeLimitSeconds = 30f,
                        penaltyPoints = 15f,
                        hintText = "Move your camera within 1.5 meters of the equipment box and tap it directly."
                    }
                }
            };
        }

        public void SetState(ScenarioState newState)
        {
            if (currentState == newState) return;

            currentState = newState;
            Debug.Log($"[ARScenarioManager] State changed to: {currentState}");
            OnStateChanged?.Invoke(currentState);

            switch (currentState)
            {
                case ScenarioState.IDLE:
                    HandleStateIdle();
                    break;
                case ScenarioState.INTRO:
                    HandleStateIntro();
                    break;
                case ScenarioState.ACTIVE:
                    HandleStateActive();
                    break;
                case ScenarioState.ACTION_SUCCESS:
                    StartCoroutine(TransitionAfterDelay(1.5f, AdvanceOrComplete));
                    break;
                case ScenarioState.ACTION_FAILURE:
                    StartCoroutine(TransitionAfterDelay(1.5f, AdvanceOrComplete));
                    break;
                case ScenarioState.COMPLETED:
                    HandleStateCompleted();
                    break;
                case ScenarioState.FAILED:
                    HandleStateFailed();
                    break;
            }
        }

        private void HandleStateIdle()
        {
            isScenarioPlaced = false;
            if (placementReticle != null)
            {
                placementReticle.SetVisible(true);
            }

            if (planeManager != null)
            {
                planeManager.enabled = true;
                SetPlanesVisible(true);
            }

            if (InstructionManager.Instance != null)
            {
                string scanPrompt = LocalizationManager.Instance != null 
                    ? LocalizationManager.Instance.GetText("ui.scan_surface") 
                    : "Scan floor surface and tap reticle to place equipment";
                InstructionManager.Instance.DisplayCustomPrompt("SURFACE DETECTION", scanPrompt);
            }
        }

        private void HandleStateIntro()
        {
            if (placementReticle != null)
            {
                placementReticle.SetVisible(false);
            }

            // Dim or hide detected plane polygons to clean up view
            SetPlanesVisible(false);

            if (InstructionManager.Instance != null && activeScenario != null)
            {
                InstructionManager.Instance.DisplayCustomPrompt(
                    activeScenario.title.ToUpper(),
                    activeScenario.description
                );
            }

            // Transition into ACTIVE execution after brief orientation
            StartCoroutine(TransitionAfterDelay(2.5f, () => SetState(ScenarioState.ACTIVE)));
        }

        private void HandleStateActive()
        {
            if (activeScenario == null || activeScenario.steps.Count == 0)
            {
                Debug.LogWarning("[ARScenarioManager] Active scenario has no steps.");
                SetState(ScenarioState.COMPLETED);
                return;
            }

            if (TrainingSessionManager.Instance != null)
            {
                TrainingSessionManager.Instance.StartSession(activeScenario.scenarioId);
            }

            if (AssessmentManager.Instance != null)
            {
                AssessmentManager.Instance.InitializeSession(activeScenario.passingScore);
            }

            if (ScenarioStepManager.Instance != null)
            {
                ScenarioStepManager.Instance.LoadSteps(activeScenario.steps);
                ScenarioStepManager.Instance.AdvanceToNextStep();
            }

            SetState(ScenarioState.WAITING_FOR_ACTION);
        }

        private void HandleStepStarted(StepData step)
        {
            if (InstructionManager.Instance != null)
            {
                InstructionManager.Instance.DisplayStep(step);
            }
        }

        private void HandleObjectInteraction(ARInteractableObject interactable, string actionType)
        {
            if (currentState != ScenarioState.WAITING_FOR_ACTION) return;

            bool isSuccess = false;
            if (ScenarioStepManager.Instance != null)
            {
                isSuccess = ScenarioStepManager.Instance.EvaluateAction(interactable, actionType);
            }

            if (isSuccess)
            {
                interactable.SetHighlight(true, false);
                if (InstructionManager.Instance != null)
                {
                    InstructionManager.Instance.ShowFeedback("CORRECT ACTION VERIFIED", Color.green);
                }
                SetState(ScenarioState.ACTION_SUCCESS);
            }
            else
            {
                interactable.SetHighlight(true, true);
                if (InstructionManager.Instance != null)
                {
                    InstructionManager.Instance.ShowFeedback("HAZARD VIOLATION / INCORRECT TARGET", Color.red);
                }
                SetState(ScenarioState.ACTION_FAILURE);
            }
        }

        private void HandleStepCompleted(StepData step, bool isCorrect, long reactionMs)
        {
            Vector3 targetPos = Vector3.zero;
            if (ARObjectManager.Instance != null && step != null)
            {
                var targetObj = ARObjectManager.Instance.GetInteractable(step.targetObjectId);
                if (targetObj != null) targetPos = targetObj.transform.position;
            }

            if (AssessmentManager.Instance != null)
            {
                AssessmentManager.Instance.RecordAction(step, isCorrect, reactionMs, arCamera.transform, targetPos);
            }
        }

        private void AdvanceOrComplete()
        {
            if (ScenarioStepManager.Instance != null && ScenarioStepManager.Instance.AdvanceToNextStep())
            {
                SetState(ScenarioState.WAITING_FOR_ACTION);
            }
            else
            {
                // Check score benchmark
                if (AssessmentManager.Instance != null && AssessmentManager.Instance.CurrentScore >= activeScenario.passingScore)
                {
                    SetState(ScenarioState.COMPLETED);
                }
                else
                {
                    SetState(ScenarioState.FAILED);
                }
            }
        }

        private void HandleStateCompleted()
        {
            AssessmentReport report = null;
            if (AssessmentManager.Instance != null)
            {
                report = AssessmentManager.Instance.GenerateFinalReport();
            }

            if (TrainingSessionManager.Instance != null)
            {
                TrainingSessionManager.Instance.ConcludeSession(activeScenario, report);
            }

            if (InstructionManager.Instance != null)
            {
                InstructionManager.Instance.DisplayCustomPrompt(
                    "DRILL COMPLETED - PASSED",
                    $"Competency Score: {report?.totalScore:F1}% (Required: {activeScenario.passingScore}%). Regulatory compliance logged."
                );
            }

            OnScenarioConcluded?.Invoke(report);
        }

        private void HandleStateFailed()
        {
            AssessmentReport report = null;
            if (AssessmentManager.Instance != null)
            {
                report = AssessmentManager.Instance.GenerateFinalReport();
            }

            if (TrainingSessionManager.Instance != null)
            {
                TrainingSessionManager.Instance.ConcludeSession(activeScenario, report);
            }

            if (InstructionManager.Instance != null)
            {
                InstructionManager.Instance.DisplayCustomPrompt(
                    "DRILL FAILED - RETAKE REQUIRED",
                    $"Score: {report?.totalScore:F1}%. Safety deductions exceeded limit. Please review hazard protocols and retry."
                );
            }

            OnScenarioConcluded?.Invoke(report);
        }

        private void HandleEmptySpaceTap(Vector2 screenPosition)
        {
            // If in IDLE and reticle is pointing to a valid surface pose, spawn scenario
            if (currentState == ScenarioState.IDLE && placementReticle != null && placementReticle.IsPoseValid)
            {
                PlaceScenario(placementReticle.CurrentPose);
            }
        }

        public void PlaceScenario(Pose pose)
        {
            if (isScenarioPlaced) return;

            GameObject prefabToSpawn = defaultScenarioPrefab;
            if (prefabToSpawn == null)
            {
                prefabToSpawn = CreateProceduralTestTargetPrefab();
            }

            if (ARObjectManager.Instance != null)
            {
                spawnedScenarioInstance = ARObjectManager.Instance.PlaceScenarioPrefab(prefabToSpawn, pose);
                isScenarioPlaced = true;
                SetState(ScenarioState.INTRO);
            }
        }

        private GameObject CreateProceduralTestTargetPrefab()
        {
            // Standalone low-poly fallback box for immediate verification without external asset dependencies
            GameObject root = new GameObject("Procedural_TestScenario_Root");
            GameObject cube = GameObject.CreatePrimitive(PrimitiveType.Cube);
            cube.name = "TargetEquipment_AR";
            cube.transform.SetParent(root.transform, false);
            cube.transform.localScale = new Vector3(0.35f, 0.4f, 0.25f);
            cube.transform.localPosition = new Vector3(0f, 0.2f, 0f);

            ARInteractableObject interactable = cube.AddComponent<ARInteractableObject>();
            return root;
        }

        private void SetPlanesVisible(bool visible)
        {
            if (planeManager == null) return;
            foreach (var plane in planeManager.trackables)
            {
                plane.gameObject.SetActive(visible);
            }
        }

        public void ResetScenario()
        {
            StopAllCoroutines();

            if (ScenarioStepManager.Instance != null)
            {
                ScenarioStepManager.Instance.StopSteps();
            }

            if (ARObjectManager.Instance != null)
            {
                ARObjectManager.Instance.ClearScenarioObjects();
            }

            SetState(ScenarioState.IDLE);
        }

        private IEnumerator TransitionAfterDelay(float delay, Action action)
        {
            yield return new WaitForSeconds(delay);
            action?.Invoke();
        }
    }
}
