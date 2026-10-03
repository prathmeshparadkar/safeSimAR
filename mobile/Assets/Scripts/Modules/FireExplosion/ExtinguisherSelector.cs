using System;
using UnityEngine;
using SurakshaAR.Core;
using SurakshaAR.Interaction;

namespace SurakshaAR.Modules.FireExplosion
{
    /// <summary>
    /// Presents multiple physical extinguisher models (Water, CO2, Dry Chemical Powder).
    /// Enforces equipment selection knowledge in accordance with mine safety standards.
    /// </summary>
    public class ExtinguisherSelector : MonoBehaviour
    {
        [Header("Extinguisher Units")]
        [SerializeField] private ARInteractableObject waterExtinguisher;
        [SerializeField] private ARInteractableObject co2Extinguisher;
        [SerializeField] private ARInteractableObject dryPowderExtinguisher;

        public event Action<string, bool> OnExtinguisherSelected; // extinguisherId, isCorrect

        private void Start()
        {
            if (waterExtinguisher != null)
            {
                waterExtinguisher.OnInteracted += (obj, act) => HandleSelection(obj.ObjectId);
            }
            if (co2Extinguisher != null)
            {
                co2Extinguisher.OnInteracted += (obj, act) => HandleSelection(obj.ObjectId);
            }
            if (dryPowderExtinguisher != null)
            {
                dryPowderExtinguisher.OnInteracted += (obj, act) => HandleSelection(obj.ObjectId);
            }
        }

        public void HighlightChoices(bool enable)
        {
            if (waterExtinguisher != null) waterExtinguisher.SetHighlight(enable);
            if (co2Extinguisher != null) co2Extinguisher.SetHighlight(enable);
            if (dryPowderExtinguisher != null) dryPowderExtinguisher.SetHighlight(enable);
        }

        private void HandleSelection(string selectedId)
        {
            bool isCorrect = (selectedId == "Extinguisher_DryPowder_AR");

            if (isCorrect)
            {
                if (dryPowderExtinguisher != null) dryPowderExtinguisher.SetHighlight(true, false);
                if (InstructionManager.Instance != null)
                {
                    InstructionManager.Instance.ShowFeedback("CORRECT SELECTION: Class D Dry Powder selected! +15 Points", Color.green);
                }
            }
            else
            {
                string reason = selectedId == "Extinguisher_Water_AR"
                    ? "CRITICAL HAZARD: Water causes explosive steam expansion on burning methane / coal dust! (-15 PTS)"
                    : "INEFFECTIVE: Carbon Dioxide lacks chemical smothering capacity for burning seam coal! (-10 PTS)";

                if (InstructionManager.Instance != null)
                {
                    InstructionManager.Instance.ShowFeedback(reason, Color.red);
                }
            }

            OnExtinguisherSelected?.Invoke(selectedId, isCorrect);
        }
    }
}
