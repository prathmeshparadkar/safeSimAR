using System;
using UnityEngine;
using SurakshaAR.Core;
using SurakshaAR.Interaction;

namespace SurakshaAR.Modules.FireExplosion
{
    /// <summary>
    /// Represents the green illuminated Emergency Escape Shaft Exit.
    /// Evaluates worker camera orientation and navigation toward the escape route.
    /// </summary>
    public class EmergencyExitMarker : MonoBehaviour
    {
        [SerializeField] private ARInteractableObject exitInteractable;
        [SerializeField] private GameObject exitLightingGlow;
        [SerializeField] private Transform exitDirectionTransform;

        public event Action OnExitReached;

        private bool isEvacuated = false;

        private void Awake()
        {
            if (exitInteractable == null)
            {
                exitInteractable = GetComponentInChildren<ARInteractableObject>();
            }
        }

        private void Start()
        {
            if (exitInteractable != null)
            {
                exitInteractable.OnInteracted += (obj, act) => TriggerEvacuation();
            }
        }

        public void HighlightExit(bool enable)
        {
            if (exitInteractable != null)
            {
                exitInteractable.SetHighlight(enable, false);
            }
            if (exitLightingGlow != null)
            {
                exitLightingGlow.SetActive(enable);
            }
        }

        public void TriggerEvacuation()
        {
            if (isEvacuated) return;
            isEvacuated = true;

            Debug.Log("[EmergencyExitMarker] Worker reached emergency exit route! Evacuation successful.");
            if (InstructionManager.Instance != null)
            {
                InstructionManager.Instance.ShowFeedback("EVACUATION SUCCESSFUL: Emergency escape route confirmed! +25 Points", Color.green);
            }

            OnExitReached?.Invoke();
        }

        public void ResetMarker()
        {
            isEvacuated = false;
            if (exitInteractable != null)
            {
                exitInteractable.SetHighlight(false);
            }
        }
    }
}
