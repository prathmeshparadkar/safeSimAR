using System.Collections;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using SurakshaAR.Core;
using SurakshaAR.Models;

namespace SurakshaAR.UI
{
    /// <summary>
    /// Heads-Up Display (HUD) overlay rendering real-time safety instructions, step timer, score, and feedback.
    /// </summary>
    public class ARInstructionHUD : MonoBehaviour
    {
        [Header("Instruction Text References")]
        [SerializeField] private TextMeshProUGUI titleText;
        [SerializeField] private TextMeshProUGUI bodyText;
        [SerializeField] private TextMeshProUGUI hintText;
        [SerializeField] private TextMeshProUGUI timerText;
        [SerializeField] private TextMeshProUGUI scoreText;

        [Header("Feedback Banner")]
        [SerializeField] private GameObject feedbackPanel;
        [SerializeField] private TextMeshProUGUI feedbackText;
        [SerializeField] private Image feedbackBackground;

        [Header("Buttons")]
        [SerializeField] private Button resetButton;
        [SerializeField] private Button hintToggleButton;

        private void Start()
        {
            if (InstructionManager.Instance != null)
            {
                InstructionManager.Instance.OnInstructionUpdated += HandleInstructionUpdated;
                InstructionManager.Instance.OnHintUpdated += HandleHintUpdated;
                InstructionManager.Instance.OnFeedbackBanner += HandleFeedbackBanner;
            }

            if (ScenarioStepManager.Instance != null)
            {
                ScenarioStepManager.Instance.OnStepTimerTick += HandleTimerTick;
            }

            if (AssessmentManager.Instance != null)
            {
                AssessmentManager.Instance.OnScoreUpdated += HandleScoreUpdated;
            }

            if (resetButton != null)
            {
                resetButton.onClick.AddListener(OnResetClicked);
            }

            if (hintToggleButton != null)
            {
                hintToggleButton.onClick.AddListener(OnToggleHintClicked);
            }

            if (feedbackPanel != null)
            {
                feedbackPanel.SetActive(false);
            }
            if (hintText != null)
            {
                hintText.gameObject.SetActive(false);
            }
        }

        private void OnDestroy()
        {
            if (InstructionManager.Instance != null)
            {
                InstructionManager.Instance.OnInstructionUpdated -= HandleInstructionUpdated;
                InstructionManager.Instance.OnHintUpdated -= HandleHintUpdated;
                InstructionManager.Instance.OnFeedbackBanner -= HandleFeedbackBanner;
            }

            if (ScenarioStepManager.Instance != null)
            {
                ScenarioStepManager.Instance.OnStepTimerTick -= HandleTimerTick;
            }

            if (AssessmentManager.Instance != null)
            {
                AssessmentManager.Instance.OnScoreUpdated -= HandleScoreUpdated;
            }
        }

        private void HandleInstructionUpdated(string title, string body)
        {
            if (titleText != null) titleText.text = title;
            if (bodyText != null) bodyText.text = body;
        }

        private void HandleHintUpdated(string hint)
        {
            if (hintText != null)
            {
                hintText.text = !string.IsNullOrEmpty(hint) ? $"HINT: {hint}" : string.Empty;
            }
        }

        private void HandleTimerTick(float secondsRemaining)
        {
            if (timerText != null)
            {
                int sec = Mathf.CeilToInt(secondsRemaining);
                timerText.text = $"{sec}s";
                timerText.color = sec <= 5 ? Color.red : Color.white;
            }
        }

        private void HandleScoreUpdated(float score)
        {
            if (scoreText != null)
            {
                scoreText.text = $"SCORE: {score:F1}%";
                scoreText.color = score >= 80f ? Color.green : (score >= 60f ? Color.yellow : Color.red);
            }
        }

        private void HandleFeedbackBanner(string message, Color color)
        {
            if (feedbackPanel == null || feedbackText == null) return;

            feedbackText.text = message;
            if (feedbackBackground != null)
            {
                feedbackBackground.color = color;
            }
            feedbackPanel.SetActive(true);

            StopAllCoroutines();
            StartCoroutine(HideFeedbackCoroutine(2f));
        }

        private IEnumerator HideFeedbackCoroutine(float delay)
        {
            yield return new WaitForSeconds(delay);
            if (feedbackPanel != null) feedbackPanel.SetActive(false);
        }

        private void OnResetClicked()
        {
            if (ARScenarioManager.Instance != null)
            {
                ARScenarioManager.Instance.ResetScenario();
            }
        }

        private void OnToggleHintClicked()
        {
            if (hintText != null && !string.IsNullOrEmpty(hintText.text))
            {
                hintText.gameObject.SetActive(!hintText.gameObject.activeSelf);
            }
        }
    }
}
