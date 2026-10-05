using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using SurakshaAR.Interaction;

namespace SurakshaAR.Core
{
    /// <summary>
    /// Manages spawning, anchoring, registry, and cleanup of AR equipment and hazard objects.
    /// Supports data-driven instantiation from pre-loaded assets or prefabs.
    /// </summary>
    public class ARObjectManager : MonoBehaviour
    {
        public static ARObjectManager Instance { get; private set; }

        [SerializeField] private ARAnchorManager anchorManager;
        [SerializeField] private Transform scenarioRoot;

        private Dictionary<string, ARInteractableObject> registeredObjects = new Dictionary<string, ARInteractableObject>();
        private List<ARAnchor> activeAnchors = new List<ARAnchor>();
        private GameObject currentSpawnedScenarioInstance;

        public event Action<ARInteractableObject> OnObjectSpawned;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);

            if (anchorManager == null)
            {
                anchorManager = FindObjectOfType<ARAnchorManager>();
            }
        }

        public GameObject PlaceScenarioPrefab(GameObject scenarioPrefab, Pose placementPose)
        {
            if (scenarioPrefab == null)
            {
                Debug.LogError("[ARObjectManager] scenarioPrefab is null!");
                return null;
            }

            ClearScenarioObjects();

            // AR Foundation 5.x standard anchor creation
            Transform parentTransform = scenarioRoot;
            if (anchorManager != null)
            {
                GameObject anchorGO = new GameObject("AR_Anchor_ScenarioRoot");
                anchorGO.transform.SetPositionAndRotation(placementPose.position, placementPose.rotation);
                if (scenarioRoot != null) anchorGO.transform.SetParent(scenarioRoot, true);

                ARAnchor anchor = anchorGO.AddComponent<ARAnchor>();
                if (anchor != null)
                {
                    activeAnchors.Add(anchor);
                    parentTransform = anchor.transform;
                }
                else
                {
                    parentTransform = anchorGO.transform;
                }
            }

            currentSpawnedScenarioInstance = Instantiate(
                scenarioPrefab,
                placementPose.position,
                placementPose.rotation,
                parentTransform
            );

            // Register all ARInteractableObjects under this scenario
            RegisterInteractables(currentSpawnedScenarioInstance);

            return currentSpawnedScenarioInstance;
        }

        public void RegisterInteractables(GameObject root)
        {
            if (root == null) return;

            ARInteractableObject[] interactables = root.GetComponentsInChildren<ARInteractableObject>(true);
            foreach (var item in interactables)
            {
                if (!string.IsNullOrEmpty(item.ObjectId))
                {
                    registeredObjects[item.ObjectId] = item;
                    OnObjectSpawned?.Invoke(item);
                    Debug.Log($"[ARObjectManager] Registered interactable object: {item.ObjectId}");
                }
            }
        }

        public ARInteractableObject GetInteractable(string objectId)
        {
            if (string.IsNullOrEmpty(objectId)) return null;
            registeredObjects.TryGetValue(objectId, out ARInteractableObject obj);
            return obj;
        }

        public void HighlightObject(string objectId, bool enable, bool isError = false)
        {
            var obj = GetInteractable(objectId);
            if (obj != null)
            {
                obj.SetHighlight(enable, isError);
            }
        }

        public void ClearScenarioObjects()
        {
            registeredObjects.Clear();

            if (currentSpawnedScenarioInstance != null)
            {
                Destroy(currentSpawnedScenarioInstance);
                currentSpawnedScenarioInstance = null;
            }

            foreach (var anchor in activeAnchors)
            {
                if (anchor != null)
                {
                    Destroy(anchor.gameObject);
                }
            }
            activeAnchors.Clear();
        }
    }
}
