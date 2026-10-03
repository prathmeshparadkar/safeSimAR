using System;
using UnityEngine;

namespace SurakshaAR.Interaction
{
    /// <summary>
    /// Component attached to any 3D safety asset / equipment in the AR scene.
    /// Handles visual highlight, touch interaction, and action verification.
    /// </summary>
    [RequireComponent(typeof(Collider))]
    public class ARInteractableObject : MonoBehaviour
    {
        [Header("Object Identity")]
        [SerializeField] private string objectId = "TargetEquipment_AR";
        [SerializeField] private string displayName = "Digital Gas Monitor";
        [SerializeField] private string defaultAction = "TAP_OBJECT";

        [Header("Highlight Settings")]
        [SerializeField] private Renderer targetRenderer;
        [SerializeField] private Color highlightColor = new Color(0.97f, 0.45f, 0.09f, 1f); // Safety Orange
        [SerializeField] private Color errorColor = new Color(0.94f, 0.27f, 0.27f, 1f);    // Hazard Red

        private Material originalMaterial;
        private Material highlightInstanceMaterial;
        private bool isHighlighted = false;

        public event Action<ARInteractableObject, string> OnInteracted;

        public string ObjectId => objectId;
        public string DisplayName => displayName;

        private void Awake()
        {
            if (targetRenderer == null)
            {
                targetRenderer = GetComponentInChildren<Renderer>();
            }

            if (targetRenderer != null)
            {
                originalMaterial = targetRenderer.material;
                highlightInstanceMaterial = new Material(originalMaterial);
            }
        }

        public void SetHighlight(bool enable, bool isError = false)
        {
            if (targetRenderer == null) return;
            isHighlighted = enable;

            if (enable)
            {
                Color colorToUse = isError ? errorColor : highlightColor;
                if (highlightInstanceMaterial.HasProperty("_Color"))
                {
                    highlightInstanceMaterial.SetColor("_Color", colorToUse);
                }
                if (highlightInstanceMaterial.HasProperty("_EmissionColor"))
                {
                    highlightInstanceMaterial.EnableKeyword("_EMISSION");
                    highlightInstanceMaterial.SetColor("_EmissionColor", colorToUse * 0.5f);
                }
                targetRenderer.material = highlightInstanceMaterial;
            }
            else
            {
                targetRenderer.material = originalMaterial;
            }
        }

        public void TriggerInteraction(string actionType = null)
        {
            string action = !string.IsNullOrEmpty(actionType) ? actionType : defaultAction;
            Debug.Log($"[ARInteractableObject] Interacted with: {objectId} (Action: {action})");

            // Quick mobile haptic feedback if running on Android
            #if UNITY_ANDROID && !UNITY_EDITOR
            Handheld.Vibrate();
            #endif

            OnInteracted?.Invoke(this, action);
        }

        private void OnDestroy()
        {
            if (highlightInstanceMaterial != null)
            {
                Destroy(highlightInstanceMaterial);
            }
        }
    }
}
