using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;

namespace SurakshaAR.Interaction
{
    /// <summary>
    /// Projects a visual targeting reticle on detected horizontal planes via ARRaycastManager.
    /// Provides smooth orientation alignment with detected real-world surfaces.
    /// </summary>
    public class ARPlacementReticle : MonoBehaviour
    {
        [SerializeField] private ARRaycastManager raycastManager;
        [SerializeField] private GameObject visualReticle;
        [SerializeField] private Camera arCamera;

        private List<ARRaycastHit> hits = new List<ARRaycastHit>();
        private bool isPoseValid = false;
        private Pose currentPose;

        public bool IsPoseValid => isPoseValid;
        public Pose CurrentPose => currentPose;

        private void Start()
        {
            if (arCamera == null)
            {
                arCamera = Camera.main;
            }
            if (visualReticle != null)
            {
                visualReticle.SetActive(false);
            }
        }

        private void Update()
        {
            UpdatePlacementPose();
            UpdateVisualIndicator();
        }

        private void UpdatePlacementPose()
        {
            if (raycastManager == null || arCamera == null)
            {
                isPoseValid = false;
                return;
            }

            Vector2 screenCenter = new Vector2(Screen.width * 0.5f, Screen.height * 0.5f);

            // Raycast against trackable planes
            if (raycastManager.Raycast(screenCenter, hits, TrackableType.PlaneWithinPolygon | TrackableType.PlaneWithinBounds))
            {
                isPoseValid = true;
                currentPose = hits[0].pose;

                // Align reticle facing camera forward projected onto the surface plane
                Vector3 cameraForward = arCamera.transform.forward;
                Vector3 cameraBearing = new Vector3(cameraForward.x, 0f, cameraForward.z).normalized;
                if (cameraBearing != Vector3.zero)
                {
                    currentPose.rotation = Quaternion.LookRotation(cameraBearing);
                }
            }
            else
            {
                isPoseValid = false;
            }
        }

        private void UpdateVisualIndicator()
        {
            if (visualReticle == null) return;

            if (isPoseValid)
            {
                visualReticle.SetActive(true);
                visualReticle.transform.position = currentPose.position;
                visualReticle.transform.rotation = currentPose.rotation;
            }
            else
            {
                visualReticle.SetActive(false);
            }
        }

        public void SetVisible(bool visible)
        {
            enabled = visible;
            if (visualReticle != null)
            {
                visualReticle.SetActive(visible && isPoseValid);
            }
        }
    }
}
