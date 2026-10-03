using System;
using System.Collections.Generic;
using UnityEngine;
using SurakshaAR.Models;
using SurakshaAR.Interaction;

namespace SurakshaAR.Core
{
    /// <summary>
    /// Governs sequential scenario step progression, step timers, and expected action matching.
    /// </summary>
    public class ScenarioStepManager : MonoBehaviour
    {
        public static ScenarioStepManager Instance { get; private set; }

        public event Action<StepData> OnStepStarted;
        public event Action<StepData, bool, long> OnStepCompleted; // step, isCorrect, reactionMs
        public event Action<float> OnStepTimerTick;

        private List<StepData> steps = new List<StepData>();
        private int currentStepIndex = -1;
        private float stepTimer = 0f;
        private bool isTimerRunning = false;
        private long stepStartTimestampMs = 0;

        public StepData CurrentStep => (currentStepIndex >= 0 && currentStepIndex < steps.Count) ? steps[currentStepIndex] : null;
        public int CurrentStepIndex => currentStepIndex;
        public int TotalSteps => steps.Count;
        public float StepTimeRemaining => Mathf.Max(0f, stepTimer);

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        public void LoadSteps(List<StepData> scenarioSteps)
        {
            steps = new List<StepData>(scenarioSteps);
            currentStepIndex = -1;
            stepTimer = 0f;
            isTimerRunning = false;
        }

        public bool AdvanceToNextStep()
        {
            currentStepIndex++;
            if (currentStepIndex < steps.Count)
            {
                StartCurrentStep();
                return true;
            }
            else
            {
                isTimerRunning = false;
                return false; // All steps completed
            }
        }

        private void StartCurrentStep()
        {
            var step = CurrentStep;
            if (step == null) return;

            stepTimer = step.timeLimitSeconds > 0 ? step.timeLimitSeconds : 30f;
            stepStartTimestampMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            isTimerRunning = true;

            // Highlight target object if registered
            if (!string.IsNullOrEmpty(step.targetObjectId) && ARObjectManager.Instance != null)
            {
                ARObjectManager.Instance.HighlightObject(step.targetObjectId, true);
            }

            OnStepStarted?.Invoke(step);
            Debug.Log($"[ScenarioStepManager] Step {step.stepOrder} Started: {step.title}");
        }

        private void Update()
        {
            if (!isTimerRunning || CurrentStep == null) return;

            stepTimer -= Time.deltaTime;
            OnStepTimerTick?.Invoke(stepTimer);

            if (stepTimer <= 0f)
            {
                isTimerRunning = false;
                HandleStepTimeout();
            }
        }

        public bool EvaluateAction(ARInteractableObject targetObject, string actionType)
        {
            var step = CurrentStep;
            if (step == null) return false;

            long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            long reactionMs = now - stepStartTimestampMs;

            bool isObjectMatch = string.Equals(targetObject.ObjectId, step.targetObjectId, StringComparison.OrdinalIgnoreCase);
            bool isActionMatch = string.Equals(actionType, step.expectedAction, StringComparison.OrdinalIgnoreCase);
            bool isSuccess = isObjectMatch && isActionMatch;

            isTimerRunning = false;

            // Remove highlight
            if (!string.IsNullOrEmpty(step.targetObjectId) && ARObjectManager.Instance != null)
            {
                ARObjectManager.Instance.HighlightObject(step.targetObjectId, false);
            }

            OnStepCompleted?.Invoke(step, isSuccess, reactionMs);
            return isSuccess;
        }

        private void HandleStepTimeout()
        {
            var step = CurrentStep;
            if (step == null) return;

            long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            long reactionMs = now - stepStartTimestampMs;

            Debug.LogWarning($"[ScenarioStepManager] Step timed out: {step.title}");
            OnStepCompleted?.Invoke(step, false, reactionMs);
        }

        public void StopSteps()
        {
            isTimerRunning = false;
            currentStepIndex = -1;
        }
    }
}
