using System;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;
using SurakshaAR.Interaction;
using SurakshaAR.UI;

namespace SurakshaAR.Core
{
    /// <summary>
    /// Automatic scene bootstrapper that configures and binds all required AR Foundation subsystems,
    /// tracking managers, and UI components if they are not pre-wired in the scene hierarchy.
    /// Guarantees instant "drop-and-play" verification in Unity Editor or on Android ARCore devices.
    /// </summary>
    [DefaultExecutionOrder(-500)]
    public class ARSceneInitializer : MonoBehaviour
    {
        [Header("Bootstrap Configuration")]
        [SerializeField] private bool autoInitializeHierarchy = true;
        [SerializeField] private TextAsset defaultScenarioJson;
        [SerializeField] private bool initializeFireModule = false;

        private void Awake()
        {
            if (autoInitializeHierarchy)
            {
                EnsureARSession();
                EnsureCameraAndManagers();
                EnsureCoreManagers();
                EnsureReticle();
                EnsureUI();

                if (initializeFireModule)
                {
                    var fireModule = FindObjectOfType<Modules.FireExplosion.FireModuleController>();
                    if (fireModule == null)
                    {
                        GameObject go = new GameObject("FireModuleController");
                        fireModule = go.AddComponent<Modules.FireExplosion.FireModuleController>();
                    }
                    fireModule.LaunchFireTrainingDrill();
                }
            }
        }

        private void EnsureARSession()
        {
            ARSession session = FindObjectOfType<ARSession>();
            if (session == null)
            {
                GameObject sessionGO = new GameObject("AR Session");
                session = sessionGO.AddComponent<ARSession>();
                sessionGO.AddComponent<ARInputManager>();
                Debug.Log("[ARSceneInitializer] Auto-created ARSession & ARInputManager.");
            }
        }

        private void EnsureCameraAndManagers()
        {
            Camera cam = Camera.main;
            GameObject cameraGO = cam != null ? cam.gameObject : null;

            if (cameraGO == null)
            {
                cameraGO = new GameObject("AR Camera");
                cam = cameraGO.AddComponent<Camera>();
                cam.tag = "MainCamera";
                cam.clearFlags = CameraClearFlags.SolidColor;
                cam.backgroundColor = Color.black;
                cam.nearClipPlane = 0.1f;
                cam.farClipPlane = 20f;
            }

            // Ensure AR Foundation Camera components
            if (cameraGO.GetComponent<ARCameraManager>() == null)
            {
                cameraGO.AddComponent<ARCameraManager>();
            }
            if (cameraGO.GetComponent<ARCameraBackground>() == null)
            {
                cameraGO.AddComponent<ARCameraBackground>();
            }

            // Ensure AR Plane Manager on origin/camera root
            if (FindObjectOfType<ARPlaneManager>() == null)
            {
                cameraGO.AddComponent<ARPlaneManager>();
                Debug.Log("[ARSceneInitializer] Auto-attached ARPlaneManager.");
            }

            // Ensure AR Raycast Manager
            if (FindObjectOfType<ARRaycastManager>() == null)
            {
                cameraGO.AddComponent<ARRaycastManager>();
                Debug.Log("[ARSceneInitializer] Auto-attached ARRaycastManager.");
            }

            // Ensure AR Anchor Manager
            if (FindObjectOfType<ARAnchorManager>() == null)
            {
                cameraGO.AddComponent<ARAnchorManager>();
                Debug.Log("[ARSceneInitializer] Auto-attached ARAnchorManager.");
            }
        }

        private void EnsureCoreManagers()
        {
            EnsureManager<LocalizationManager>("LocalizationManager");
            EnsureManager<InstructionManager>("InstructionManager");
            EnsureManager<AssessmentManager>("AssessmentManager");
            EnsureManager<TrainingSessionManager>("TrainingSessionManager");
            EnsureManager<ScenarioStepManager>("ScenarioStepManager");
            EnsureManager<ARObjectManager>("ARObjectManager");
            EnsureManager<ARInteractionManager>("ARInteractionManager");

            ARScenarioManager scenarioManager = EnsureManager<ARScenarioManager>("ARScenarioManager");
            if (scenarioManager != null && defaultScenarioJson != null)
            {
                scenarioManager.LoadScenarioFromJson(defaultScenarioJson.text);
            }
        }

        private T EnsureManager<T>(string name) where T : Component
        {
            T instance = FindObjectOfType<T>();
            if (instance == null)
            {
                GameObject go = new GameObject(name);
                instance = go.AddComponent<T>();
                Debug.Log($"[ARSceneInitializer] Auto-created manager: {name}");
            }
            return instance;
        }

        private void EnsureReticle()
        {
            if (FindObjectOfType<ARPlacementReticle>() == null)
            {
                GameObject reticleGO = new GameObject("ARPlacementReticle");
                reticleGO.AddComponent<ARPlacementReticle>();
                Debug.Log("[ARSceneInitializer] Auto-created ARPlacementReticle.");
            }
        }

        private void EnsureUI()
        {
            if (FindObjectOfType<ARInstructionHUD>() == null)
            {
                GameObject hudGO = new GameObject("ARInstructionHUD");
                hudGO.AddComponent<ARInstructionHUD>();
                Debug.Log("[ARSceneInitializer] Auto-created ARInstructionHUD.");
            }

            if (FindObjectOfType<ARSessionSummaryUI>() == null)
            {
                GameObject summaryGO = new GameObject("ARSessionSummaryUI");
                summaryGO.AddComponent<ARSessionSummaryUI>();
                Debug.Log("[ARSceneInitializer] Auto-created ARSessionSummaryUI.");
            }
        }
    }
}
