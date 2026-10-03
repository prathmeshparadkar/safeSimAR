using UnityEngine;
using UnityEngine.UI;
using TMPro;
using SurakshaAR.Core;

namespace SurakshaAR.UI
{
    /// <summary>
    /// Performance evaluation summary dialog presented upon scenario completion or failure.
    /// </summary>
    public class ARSessionSummaryUI : MonoBehaviour
    {
        [Header("UI Panel")]
        [SerializeField] private GameObject summaryPanel;

        [Header("Text Fields")]
        [SerializeField] private TextMeshProUGUI statusTitleText;
        [SerializeField] private TextMeshProUGUI finalScoreText;
        [SerializeField] private TextMeshProUGUI accuracyText;
        [SerializeField] private TextMeshProUGUI reactionSpeedText;
        [SerializeField] private TextMeshProUGUI deductionsText;
        [SerializeField] private TextMeshProUGUI offlineQueueStatusText;

        [Header("Action Buttons")]
        [SerializeField] private Button retryButton;
        [SerializeField] private Button exitButton;

        private void Start()
        {
            if (ARScenarioManager.Instance != null)
            {
                ARScenarioManager.Instance.OnScenarioConcluded += DisplayReport;
            }

            if (retryButton != null)
            {
                retryButton.onClick.AddListener(OnRetryClicked);
            }

            if (exitButton != null)
            {
                exitButton.onClick.AddListener(OnExitClicked);
            }

            if (summaryPanel != null)
            {
                summaryPanel.SetActive(false);
            }
        }

        private void OnDestroy()
        {
            if (ARScenarioManager.Instance != null)
            {
                ARScenarioManager.Instance.OnScenarioConcluded -= DisplayReport;
            }
        }

        public void DisplayReport(AssessmentReport report)
        {
            if (summaryPanel == null || report == null) return;

            summaryPanel.SetActive(true);

            if (statusTitleText != null)
            {
                statusTitleText.text = report.passed ? "ASSESSMENT PASSED" : "ASSESSMENT FAILED";
                statusTitleText.color = report.passed ? new Color(0.06f, 0.73f, 0.51f) : new Color(0.94f, 0.27f, 0.27f);
            }

            if (finalScoreText != null)
            {
                finalScoreText.text = $"{report.totalScore:F1}%";
                finalScoreText.color = report.passed ? Color.green : Color.red;
            }

            if (accuracyText != null)
            {
                accuracyText.text = $"Protocol Accuracy: {report.protocolAccuracyScore:F0}%";
            }

            if (reactionSpeedText != null)
            {
                reactionSpeedText.text = $"Reaction Speed Score: {report.reactionSpeedScore:F0}/100";
            }

            if (deductionsText != null)
            {
                deductionsText.text = $"Total Deductions: -{report.totalDeductions} PTS";
            }

            if (offlineQueueStatusText != null)
            {
                offlineQueueStatusText.text = "Session saved to local offline encrypted sync queue.";
            }
        }

        private void OnRetryClicked()
        {
            if (summaryPanel != null) summaryPanel.SetActive(false);
            if (ARScenarioManager.Instance != null)
            {
                ARScenarioManager.Instance.ResetScenario();
            }
        }

        private void OnExitClicked()
        {
            if (summaryPanel != null) summaryPanel.SetActive(false);
            if (ARScenarioManager.Instance != null)
            {
                ARScenarioManager.Instance.ResetScenario();
            }
        }
    }
}
