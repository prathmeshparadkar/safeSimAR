using System;
using System.Collections.Generic;
using UnityEngine;

namespace SurakshaAR.Core
{
    /// <summary>
    /// Trilingual localization manager for English, Hindi, and Santali (Ol Chiki + Romanized).
    /// Tailored for industrial workers in Jharkhand mining and manufacturing zones.
    /// </summary>
    public class LocalizationManager : MonoBehaviour
    {
        public static LocalizationManager Instance { get; private set; }

        public event Action<string> OnLanguageChanged;

        [SerializeField] private string currentLanguage = "hi"; // Default Hindi for Jharkhand workforce

        private Dictionary<string, string> localizedStrings = new Dictionary<string, string>();

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                LoadLanguageDictionary(currentLanguage);
            }
            else
            {
                Destroy(gameObject);
            }
        }

        public string CurrentLanguage => currentLanguage;

        public void SetLanguage(string langCode)
        {
            if (string.IsNullOrEmpty(langCode)) return;

            string normalized = langCode.ToLower().Trim();
            if (normalized == currentLanguage) return;

            currentLanguage = normalized;
            LoadLanguageDictionary(currentLanguage);
            OnLanguageChanged?.Invoke(currentLanguage);
            Debug.Log($"[LocalizationManager] Switched active language to: {currentLanguage}");
        }

        private void LoadLanguageDictionary(string lang)
        {
            localizedStrings.Clear();
            TextAsset textAsset = Resources.Load<TextAsset>($"Localization/{lang}");
            if (textAsset != null)
            {
                try
                {
                    var data = JsonUtility.FromJson<LocalizationDictionaryWrapper>(textAsset.text);
                    if (data != null && data.items != null)
                    {
                        foreach (var item in data.items)
                        {
                            localizedStrings[item.key] = item.value;
                        }
                    }
                }
                catch (Exception ex)
                {
                    Debug.LogWarning($"[LocalizationManager] Failed parsing JSON for {lang}: {ex.Message}");
                }
            }

            // Fallback default keys if dictionary missing
            PopulateFallbackDefaults(lang);
        }

        private void PopulateFallbackDefaults(string lang)
        {
            if (!localizedStrings.ContainsKey("ui.scan_surface"))
            {
                localizedStrings["ui.scan_surface"] = lang == "sat" 
                    ? "ᱚᱛ ᱯᱟᱥᱱᱟᱣ ᱧᱮᱞ ᱢᱮ (Scan floor surface)" 
                    : (lang == "hi" ? "समतल सतह को स्कैन करें और टैप करें" : "Scan floor plane and tap to place");
            }
            if (!localizedStrings.ContainsKey("ui.tap_target"))
            {
                localizedStrings["ui.tap_target"] = lang == "sat"
                    ? "ᱡᱤᱱᱤᱥ ᱪᱮᱛᱟᱱ ᱨᱮ ᱴᱤᱯ ᱢᱮ (Tap target object)"
                    : (lang == "hi" ? "दिखाए गए सही उपकरण पर टैप करें" : "Tap on the highlighted target equipment");
            }
            if (!localizedStrings.ContainsKey("ui.action_success"))
            {
                localizedStrings["ui.action_success"] = lang == "sat"
                    ? "ᱴᱷᱤᱠ ᱜᱮᱭᱟ! (Action verified)"
                    : (lang == "hi" ? "सटीक क्रिया! प्रक्रिया सफल।" : "Correct action verified!");
            }
        }

        public string GetText(string key, string fallback = "")
        {
            if (localizedStrings.TryGetValue(key, out string val))
            {
                return val;
            }
            return !string.IsNullOrEmpty(fallback) ? fallback : key;
        }

        [Serializable]
        public class LocalizationItem
        {
            public string key;
            public string value;
        }

        [Serializable]
        public class LocalizationDictionaryWrapper
        {
            public List<LocalizationItem> items;
        }
    }
}
