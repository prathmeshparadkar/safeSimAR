using UnityEngine;
using UnityEngine.UI;
using TMPro;
using SurakshaAR.Core;

namespace SurakshaAR.UI
{
    /// <summary>
    /// Quick trilingual toggle permitting industrial workers to select English, Hindi, or Santali Ol Chiki.
    /// </summary>
    public class LanguageSelectorUI : MonoBehaviour
    {
        [SerializeField] private Button enButton;
        [SerializeField] private Button hiButton;
        [SerializeField] private Button satButton;

        private void Start()
        {
            if (enButton != null) enButton.onClick.AddListener(() => SwitchLanguage("en"));
            if (hiButton != null) hiButton.onClick.AddListener(() => SwitchLanguage("hi"));
            if (satButton != null) satButton.onClick.AddListener(() => SwitchLanguage("sat"));

            HighlightActiveLanguage();
        }

        private void SwitchLanguage(string code)
        {
            if (LocalizationManager.Instance != null)
            {
                LocalizationManager.Instance.SetLanguage(code);
                HighlightActiveLanguage();
            }
        }

        private void HighlightActiveLanguage()
        {
            string current = LocalizationManager.Instance != null ? LocalizationManager.Instance.CurrentLanguage : "hi";
            SetButtonVisual(enButton, current == "en");
            SetButtonVisual(hiButton, current == "hi");
            SetButtonVisual(satButton, current == "sat" || current == "sat_olchiki");
        }

        private void SetButtonVisual(Button btn, bool isActive)
        {
            if (btn == null) return;
            var colors = btn.colors;
            colors.normalColor = isActive ? new Color(0.97f, 0.45f, 0.09f, 1f) : new Color(0.12f, 0.15f, 0.19f, 1f);
            btn.colors = colors;
        }
    }
}
