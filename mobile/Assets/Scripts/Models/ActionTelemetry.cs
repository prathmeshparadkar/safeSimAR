using System;
using UnityEngine;

namespace SurakshaAR.Models
{
    [Serializable]
    public class ActionTelemetry
    {
        public string actionId;
        public string sessionId;
        public string stepId;
        public string timestampIso;
        public string actionType;
        public string objectInteracted;
        public bool isCorrect;
        public long reactionTimeMs;
        public float penaltyApplied;
        
        // Mobile AR spatial telemetry for safety compliance evaluation
        public Vector3 cameraPosition;
        public Quaternion cameraRotation;
        public float distanceToObjectMeters;
        public string arTrackingState;

        public static ActionTelemetry Create(
            string stepId,
            string actionType,
            string objectId,
            bool correct,
            long reactionMs,
            float penalty,
            Transform cameraTransform,
            Vector3 targetPosition)
        {
            float dist = cameraTransform != null ? Vector3.Distance(cameraTransform.position, targetPosition) : 0f;

            return new ActionTelemetry
            {
                actionId = Guid.NewGuid().ToString(),
                stepId = stepId,
                timestampIso = DateTime.UtcNow.ToString("o"),
                actionType = actionType,
                objectInteracted = objectId,
                isCorrect = correct,
                reactionTimeMs = reactionMs,
                penaltyApplied = penalty,
                cameraPosition = cameraTransform != null ? cameraTransform.position : Vector3.zero,
                cameraRotation = cameraTransform != null ? cameraTransform.rotation : Quaternion.identity,
                distanceToObjectMeters = dist,
                arTrackingState = "TRACKING_NORMAL"
            };
        }
    }
}
