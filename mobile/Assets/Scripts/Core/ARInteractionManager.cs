using System;
using UnityEngine;
using UnityEngine.EventSystems;
using SurakshaAR.Interaction;

namespace SurakshaAR.Core
{
    /// <summary>
    /// Processes touch inputs, physics raycasts, and user interaction gestures on AR objects.
    /// Filters out UI clicks to avoid false triggers during HUD navigation.
    /// </summary>
    public class ARInteractionManager : MonoBehaviour
    {
        public static ARInteractionManager Instance { get; private set; }

        [SerializeField] private Camera arCamera;
        [SerializeField] private LayerMask interactableLayers = ~0; // All layers default

        public event Action<ARInteractableObject, string> OnActionExecuted;
        public event Action<Vector2> OnEmptySpaceTapped;

        private bool isInteractionEnabled = true;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);

            if (arCamera == null) arCamera = Camera.main;
        }

        public void SetInteractionEnabled(bool enabledState)
        {
            isInteractionEnabled = enabledState;
        }

        private void Update()
        {
            if (!isInteractionEnabled) return;

            // Handle Android touch or Mouse input
            #if UNITY_EDITOR || UNITY_STANDALONE
            if (Input.GetMouseButtonDown(0))
            {
                if (!IsPointerOverUI(Input.mousePosition))
                {
                    ProcessTap(Input.mousePosition);
                }
            }
            #else
            if (Input.touchCount > 0)
            {
                Touch touch = Input.GetTouch(0);
                if (touch.phase == TouchPhase.Began)
                {
                    if (!IsPointerOverUI(touch.position))
                    {
                        ProcessTap(touch.position);
                    }
                }
            }
            #endif
        }

        private void ProcessTap(Vector2 screenPosition)
        {
            Ray ray = arCamera.ScreenPointToRay(screenPosition);
            if (Physics.Raycast(ray, out RaycastHit hit, 20f, interactableLayers))
            {
                ARInteractableObject interactable = hit.collider.GetComponentInParent<ARInteractableObject>();
                if (interactable != null)
                {
                    interactable.TriggerInteraction("TAP_OBJECT");
                    OnActionExecuted?.Invoke(interactable, "TAP_OBJECT");
                    return;
                }
            }

            OnEmptySpaceTapped?.Invoke(screenPosition);
        }

        private bool IsPointerOverUI(Vector2 screenPosition)
        {
            if (EventSystem.current == null) return false;
            return EventSystem.current.IsPointerOverGameObject();
        }
    }
}
