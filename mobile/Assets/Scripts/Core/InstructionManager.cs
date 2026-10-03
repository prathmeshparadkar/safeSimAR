using System;
using UnityEngine;
using SurakshaAR.Models;

namespace SurakshaAR.Core
{
    /// <summary>
    /// Coordinates vernacular instructions, hints, timer overlays, and status prompts on the AR HUD.
    /// </summary>
    public class InstructionManager : MonoBehaviour
    {
        public static InstructionManager Instance { get; private set; }

        public event Action<string, string> OnInstructionUpdated; // title, body
        public event Action<string> OnHintUpdated;
        public event Action<string, Color> OnFeedbackBanner; // message, color

        private StepData activeStep;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        private void Start()
        {
            if (LocalizationManager.Instance != null)
            {
                LocalizationManager.Instance.OnLanguageChanged += HandleLanguageChanged;
            }
        }

        private void OnDestroy()
        {
            if (LocalizationManager.Instance != null)
            {
                LocalizationManager.Instance.OnLanguageChanged -= HandleLanguageChanged;
            }
        }

        public void DisplayStep(StepData step)
        {
            activeStep = step;
            UpdateDisplay();
        }

        public void DisplayCustomPrompt(string title, string body)
        {
            activeStep = null;
            OnInstructionUpdated?.Invoke(title, body);
        }

        public void ShowFeedback(string message, Color color)
        {
            OnFeedbackBanner?.Invoke(message, color);
        }

        private void HandleLanguageChanged(string lang)
        {
            if (activeStep != null)
            {
                UpdateDisplay();
            }
        }

        private void UpdateDisplay()
        {
            if (activeStep == null) return;

            string lang = LocalizationManager.Instance != null ? LocalizationManager.Instance.CurrentLanguage : "hi";
            string bodyText = activeStep.GetLocalizedInstruction(lang);
            string titleText = $"STEP {activeStep.stepOrder}: {activeStep.title}";

            OnInstructionUpdated?.Invoke(titleText, bodyText);
            if (!string.IsNullOrEmpty(activeStep.hintText))
            {
                OnHintUpdated?.Invoke(activeStep.hintText);
            }
            else
            {
                OnHintUpdated?.Invoke(string.Empty);
            }
        }
    }
}
