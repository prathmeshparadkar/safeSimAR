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

        private void Awake()
        {
            if (raycastManager == null)
            {
                raycastManager = FindObjectOfType<ARRaycastManager>();
            }

            if (arCamera == null)
            {
                arCamera = Camera.main;
            }

            if (visualReticle == null)
            {
                CreateProceduralReticle();
            }
        }

        private void Start()
        {
            if (visualReticle != null)
            {
                visualReticle.SetActive(false);
            }
        }

        private void CreateProceduralReticle()
        {
            GameObject reticleGO = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            reticleGO.name = "Procedural_PlacementReticle_Visual";
            reticleGO.transform.SetParent(transform, false);
            reticleGO.transform.localScale = new Vector3(0.35f, 0.005f, 0.35f);

            var col = reticleGO.GetComponent<Collider>();
            if (col != null) Destroy(col);

            var rend = reticleGO.GetComponent<Renderer>();
            if (rend != null)
            {
                Shader s = Shader.Find("Universal Render Pipeline/Unlit") ?? Shader.Find("Unlit/Color") ?? Shader.Find("Standard");
                if (s != null)
                {
                    Material m = new Material(s);
                    Color reticleColor = new Color(0.13f, 0.59f, 0.95f, 0.75f);
                    if (m.HasProperty("_Color")) m.SetColor("_Color", reticleColor);
                    if (m.HasProperty("_BaseColor")) m.SetColor("_BaseColor", reticleColor);
                    rend.material = m;
                }
            }

            visualReticle = reticleGO;
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
