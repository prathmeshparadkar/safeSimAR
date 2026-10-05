using System;
using System.Collections.Generic;
using UnityEngine;
using SurakshaAR.Models;

namespace SurakshaAR.Core
{
    [Serializable]
    public class AssessmentReport
    {
        public float totalScore;
        public float maxScore = 100f;
        public float passingScore;
        public bool passed;
        public float totalDeductions;
        public float hazardAwarenessScore;
        public float reactionSpeedScore;
        public float protocolAccuracyScore;
        public int totalSteps;
        public int passedSteps;
        public int failedSteps;
        public List<ActionTelemetry> actionLog = new List<ActionTelemetry>();
    }

    /// <summary>
    /// Computes quantitative competency scores and penalty deductions for vocational safety drills.
    /// </summary>
    public class AssessmentManager : MonoBehaviour
    {
        public static AssessmentManager Instance { get; private set; }

        public event Action<float> OnScoreUpdated;
        public event Action<float, float> OnPenaltyDeducted; // penaltyAmount, remainingScore
        public event Action<ActionTelemetry> OnActionRecorded;
        public event Action<AssessmentReport> OnAssessmentCompleted;

        private float currentScore = 100f;
        private float cumulativeDeductions = 0f;
        private float passingThreshold = 80f;
        private List<ActionTelemetry> sessionActions = new List<ActionTelemetry>();
        private int successfulStepsCount = 0;
        private int failedStepsCount = 0;

        public float CurrentScore => Mathf.Clamp(currentScore, 0f, 100f);

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        public void InitializeSession(float passingScore)
        {
            currentScore = 100f;
            cumulativeDeductions = 0f;
            passingThreshold = passingScore > 0 ? passingScore : 80f;
            sessionActions.Clear();
            successfulStepsCount = 0;
            failedStepsCount = 0;

            OnScoreUpdated?.Invoke(currentScore);
        }

        public void RecordAction(StepData step, bool isCorrect, long reactionMs, Transform cameraTransform, Vector3 targetPos)
        {
            float penalty = 0f;
            if (!isCorrect)
            {
                penalty = step != null ? step.penaltyPoints : 15f;
                cumulativeDeductions += penalty;
                currentScore = Mathf.Max(0f, 100f - cumulativeDeductions);
                failedStepsCount++;
            }
            else
            {
                successfulStepsCount++;
            }

            ActionTelemetry telemetry = ActionTelemetry.Create(
                step != null ? step.stepId : "unknown_step",
                step != null ? step.expectedAction : "ACTION",
                step != null ? step.targetObjectId : "OBJECT",
                isCorrect,
                reactionMs,
                penalty,
                cameraTransform,
                targetPos
            );

            sessionActions.Add(telemetry);
            if (penalty > 0f)
            {
                OnPenaltyDeducted?.Invoke(penalty, currentScore);
            }
            OnActionRecorded?.Invoke(telemetry);
            OnScoreUpdated?.Invoke(currentScore);

            Debug.Log($"[AssessmentManager] Action logged. Correct: {isCorrect}, Deduction: {penalty}, Score: {currentScore}%");
        }

        public AssessmentReport GenerateFinalReport()
        {
            int totalSteps = successfulStepsCount + failedStepsCount;
            float accuracy = totalSteps > 0 ? ((float)successfulStepsCount / totalSteps) * 100f : 100f;
            bool isPassed = currentScore >= passingThreshold;

            AssessmentReport report = new AssessmentReport
            {
                totalScore = Mathf.Round(currentScore * 10f) / 10f,
                maxScore = 100f,
                passingScore = passingThreshold,
                passed = isPassed,
                totalDeductions = cumulativeDeductions,
                hazardAwarenessScore = Mathf.Clamp(currentScore + 5f, 0f, 100f),
                reactionSpeedScore = Mathf.Clamp(100f - (cumulativeDeductions * 0.5f), 0f, 100f),
                protocolAccuracyScore = accuracy,
                totalSteps = totalSteps,
                passedSteps = successfulStepsCount,
                failedSteps = failedStepsCount,
                actionLog = new List<ActionTelemetry>(sessionActions)
            };

            OnAssessmentCompleted?.Invoke(report);
            return report;
        }
    }
}
