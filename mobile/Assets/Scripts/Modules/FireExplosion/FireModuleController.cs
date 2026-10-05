using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SurakshaAR.Core;
using SurakshaAR.Models;
using SurakshaAR.Interaction;

namespace SurakshaAR.Modules.FireExplosion
{
    /// <summary>
    /// Master coordinator for the Fire & Explosion Response Module.
    /// Manages the full 8-step training drill:
    /// Step 1: Introduction & non-substitute disclaimer
    /// Step 2: AR Environment placement (fire, hazard zone, alarm, extinguishers, exit)
    /// Step 3: Hazard identification (+20)
    /// Step 4: Alarm activation (+15)
    /// Step 5: Extinguisher selection (+15)
    /// Step 6: 4-stage P.A.S.S. interactive suppression (+25)
    /// Step 7: Emergency evacuation routing (+25)
    /// Step 8: Competency assessment and backend sync
    /// </summary>
    public class FireModuleController : MonoBehaviour
    {
        public static FireModuleController Instance { get; private set; }

        [Header("Module Subsystems")]
        [SerializeField] private FireHazardZone fireHazard;
        [SerializeField] private ExtinguisherSelector extinguisherSelector;
        [SerializeField] private PASSProcedureController passController;
        [SerializeField] private EmergencyExitMarker emergencyExit;
        [SerializeField] private ARInteractableObject alarmStation;
        [SerializeField] private GameObject hazardPerimeterZone;

        [Header("Scenario Data")]
        [SerializeField] private TextAsset fireScenarioJson;

        [Header("Runtime State")]
        [SerializeField] private bool initializeOnStart = false;
        [SerializeField] private bool autoBuildIfMissing = true;
        private bool isInitialized = false;

        public FireHazardZone FireHazard => fireHazard;
        public ExtinguisherSelector ExtinguisherSelector => extinguisherSelector;
        public PASSProcedureController PassController => passController;
        public EmergencyExitMarker EmergencyExit => emergencyExit;
        public ARInteractableObject AlarmStation => alarmStation;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        private void Start()
        {
            if (initializeOnStart)
            {
                InitializeModule();
            }
        }

        public void InitializeModule()
        {
            if (isInitialized) return;

            // Load scenario JSON if available
            if (fireScenarioJson == null)
            {
                fireScenarioJson = Resources.Load<TextAsset>("Scenarios/FireExplosionScenario");
            }

            if (fireScenarioJson != null && ARScenarioManager.Instance != null)
            {
                ARScenarioManager.Instance.LoadScenarioFromJson(fireScenarioJson.text);
            }

            // Auto-build procedural 3D training assets if not already assigned in editor
            if (autoBuildIfMissing && fireHazard == null)
            {
                BuildProceduralEnvironment();
            }

            // Wire up callbacks
            WireEvents();

            isInitialized = true;
            Debug.Log("[FireModuleController] Fire & Explosion Response Module initialized.");
        }

        private void WireEvents()
        {
            if (passController != null)
            {
                passController.OnPASSProcedureFinished -= HandlePASSFinished;
                passController.OnPASSProcedureFinished += HandlePASSFinished;
            }

            if (extinguisherSelector != null)
            {
                extinguisherSelector.OnExtinguisherSelected -= HandleExtinguisherSelected;
                extinguisherSelector.OnExtinguisherSelected += HandleExtinguisherSelected;
            }

            if (emergencyExit != null)
            {
                emergencyExit.OnExitReached -= HandleEvacuationFinished;
                emergencyExit.OnExitReached += HandleEvacuationFinished;
            }
        }

        private void OnDestroy()
        {
            if (passController != null) passController.OnPASSProcedureFinished -= HandlePASSFinished;
            if (extinguisherSelector != null) extinguisherSelector.OnExtinguisherSelected -= HandleExtinguisherSelected;
            if (emergencyExit != null) emergencyExit.OnExitReached -= HandleEvacuationFinished;
        }

        /// <summary>
        /// Procedurally constructs all 6 interactive objects required for the training environment:
        /// 1. Simulated methane flame hazard
        /// 2. Danger perimeter warning zone
        /// 3. Red emergency pit alarm
        /// 4. Triple extinguisher selection rack (Water, CO2, Dry Powder)
        /// 5. Green emergency escape shaft exit
        /// 6. P.A.S.S. interactive suppression components
        /// </summary>
        public void BuildProceduralEnvironment()
        {
            Debug.Log("[FireModuleController] Procedurally building AR Fire Environment...");
            GameObject root = this.gameObject;

            // 1. Simulated Fire Hazard
            GameObject fireObj = new GameObject("SimulatedFire_AR");
            fireObj.transform.SetParent(root.transform, false);
            fireObj.transform.localPosition = new Vector3(0f, 0f, 2.0f); // 2m in front
            
            GameObject flameVisual = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            flameVisual.name = "FlameVisual";
            flameVisual.transform.SetParent(fireObj.transform, false);
            flameVisual.transform.localScale = new Vector3(0.5f, 0.8f, 0.5f);
            flameVisual.transform.localPosition = new Vector3(0f, 0.4f, 0f);

            var flameRenderer = flameVisual.GetComponent<Renderer>();
            if (flameRenderer != null)
            {
                flameRenderer.material.color = new Color(1f, 0.27f, 0f, 0.9f); // Flame Red-Orange
            }

            // Fire interactable
            var fireInteractable = fireObj.AddComponent<ARInteractableObject>();
            SetObjectField(fireInteractable, "objectId", "SimulatedFire_AR");
            SetObjectField(fireInteractable, "displayName", "Methane Coal Flare");
            SetObjectField(fireInteractable, "defaultAction", "IDENTIFY_HAZARD");

            fireHazard = fireObj.AddComponent<FireHazardZone>();

            // 2. Warning / Hazard Zone
            hazardPerimeterZone = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            hazardPerimeterZone.name = "HazardZonePerimeter_AR";
            hazardPerimeterZone.transform.SetParent(fireObj.transform, false);
            hazardPerimeterZone.transform.localScale = new Vector3(2.5f, 0.02f, 2.5f);
            hazardPerimeterZone.transform.localPosition = new Vector3(0f, 0.01f, 0f);
            var zoneRenderer = hazardPerimeterZone.GetComponent<Renderer>();
            if (zoneRenderer != null)
            {
                zoneRenderer.material.color = new Color(1f, 0.8f, 0f, 0.35f); // Amber Caution Zone
            }

            // 3. Emergency Alarm Station
            GameObject alarmObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
            alarmObj.name = "EmergencyAlarm_AR";
            alarmObj.transform.SetParent(root.transform, false);
            alarmObj.transform.localPosition = new Vector3(-1.2f, 1.1f, 1.5f); // Left wall at eye level
            alarmObj.transform.localScale = new Vector3(0.25f, 0.35f, 0.15f);
            var alarmRenderer = alarmObj.GetComponent<Renderer>();
            if (alarmRenderer != null)
            {
                alarmRenderer.material.color = new Color(0.9f, 0.1f, 0.1f, 1f); // Emergency Red
            }

            alarmStation = alarmObj.AddComponent<ARInteractableObject>();
            SetObjectField(alarmStation, "objectId", "EmergencyAlarm_AR");
            SetObjectField(alarmStation, "displayName", "Pithead Fire Alarm Station");
            SetObjectField(alarmStation, "defaultAction", "ACTIVATE_ALARM");

            // 4. Extinguishers Rack (Water, CO2, Dry Powder)
            GameObject extRack = new GameObject("ExtinguisherRack");
            extRack.transform.SetParent(root.transform, false);
            extRack.transform.localPosition = new Vector3(1.2f, 0f, 1.5f); // Right side

            // Water (Incorrect)
            var waterObj = CreateExtinguisherUnit(extRack.transform, "Extinguisher_Water_AR", "Class A Water Extinguisher", new Vector3(-0.35f, 0.3f, 0f), Color.blue);
            // CO2 (Incorrect)
            var co2Obj = CreateExtinguisherUnit(extRack.transform, "Extinguisher_CO2_AR", "Class B/C Carbon Dioxide Extinguisher", new Vector3(0f, 0.3f, 0f), Color.black);
            // Dry Powder (Correct)
            var dryObj = CreateExtinguisherUnit(extRack.transform, "Extinguisher_DryPowder_AR", "Class D / ABC Dry Powder Extinguisher", new Vector3(0.35f, 0.3f, 0f), new Color(0.85f, 0.1f, 0.1f));

            extinguisherSelector = extRack.AddComponent<ExtinguisherSelector>();
            SetObjectField(extinguisherSelector, "waterExtinguisher", waterObj);
            SetObjectField(extinguisherSelector, "co2Extinguisher", co2Obj);
            SetObjectField(extinguisherSelector, "dryPowderExtinguisher", dryObj);

            // 5. P.A.S.S. Suppression Controller & Physical Sub-components
            GameObject pinObj = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            pinObj.name = "SafetyPin_AR";
            pinObj.transform.SetParent(dryObj.transform, false);
            pinObj.transform.localPosition = new Vector3(0.08f, 0.22f, 0f);
            pinObj.transform.localScale = new Vector3(0.04f, 0.08f, 0.04f);
            var pinRenderer = pinObj.GetComponent<Renderer>();
            if (pinRenderer != null) pinRenderer.material.color = Color.yellow;
            var pinInteractable = pinObj.AddComponent<ARInteractableObject>();
            SetObjectField(pinInteractable, "objectId", "SafetyPin_AR");
            SetObjectField(pinInteractable, "displayName", "Extinguisher Safety Pin");
            SetObjectField(pinInteractable, "defaultAction", "PULL_PIN");

            GameObject nozObj = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            nozObj.name = "Nozzle_AR";
            nozObj.transform.SetParent(dryObj.transform, false);
            nozObj.transform.localPosition = new Vector3(0f, 0.15f, 0.12f);
            nozObj.transform.localScale = new Vector3(0.05f, 0.1f, 0.05f);
            var nozRenderer = nozObj.GetComponent<Renderer>();
            if (nozRenderer != null) nozRenderer.material.color = Color.black;
            var nozInteractable = nozObj.AddComponent<ARInteractableObject>();
            SetObjectField(nozInteractable, "objectId", "Nozzle_AR");
            SetObjectField(nozInteractable, "displayName", "Discharge Nozzle");
            SetObjectField(nozInteractable, "defaultAction", "AIM_NOZZLE");

            GameObject handleObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
            handleObj.name = "DischargeHandle_AR";
            handleObj.transform.SetParent(dryObj.transform, false);
            handleObj.transform.localPosition = new Vector3(0f, 0.26f, 0f);
            handleObj.transform.localScale = new Vector3(0.06f, 0.04f, 0.14f);
            var handleRenderer = handleObj.GetComponent<Renderer>();
            if (handleRenderer != null) handleRenderer.material.color = Color.gray;
            var handleInteractable = handleObj.AddComponent<ARInteractableObject>();
            SetObjectField(handleInteractable, "objectId", "DischargeHandle_AR");
            SetObjectField(handleInteractable, "displayName", "Discharge Handle");
            SetObjectField(handleInteractable, "defaultAction", "SQUEEZE_HANDLE");

            passController = dryObj.gameObject.AddComponent<PASSProcedureController>();
            passController.ConfigureParts(pinInteractable, nozInteractable, handleInteractable, fireHazard);

            // 6. Emergency Exit Marker
            GameObject exitObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
            exitObj.name = "EmergencyExit_AR";
            exitObj.transform.SetParent(root.transform, false);
            exitObj.transform.localPosition = new Vector3(0f, 1.2f, -2.5f); // Behind the worker
            exitObj.transform.localScale = new Vector3(1.0f, 1.8f, 0.2f);
            var exitRenderer = exitObj.GetComponent<Renderer>();
            if (exitRenderer != null)
            {
                exitRenderer.material.color = new Color(0.1f, 0.85f, 0.2f, 0.9f); // Safety Green
            }

            var exitInteractable = exitObj.AddComponent<ARInteractableObject>();
            SetObjectField(exitInteractable, "objectId", "EmergencyExit_AR");
            SetObjectField(exitInteractable, "displayName", "Emergency Escape Shaft Exit");
            SetObjectField(exitInteractable, "defaultAction", "EVACUATE_EXIT");

            emergencyExit = exitObj.AddComponent<EmergencyExitMarker>();

            // Register all interactables with ARObjectManager
            if (ARObjectManager.Instance != null)
            {
                ARObjectManager.Instance.RegisterInteractables(root);
            }
        }

        private ARInteractableObject CreateExtinguisherUnit(Transform parent, string id, string name, Vector3 localPos, Color color)
        {
            GameObject cylinder = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            cylinder.name = id;
            cylinder.transform.SetParent(parent, false);
            cylinder.transform.localPosition = localPos;
            cylinder.transform.localScale = new Vector3(0.18f, 0.35f, 0.18f);

            var rend = cylinder.GetComponent<Renderer>();
            if (rend != null)
            {
                rend.material.color = color;
            }

            var interactable = cylinder.AddComponent<ARInteractableObject>();
            SetObjectField(interactable, "objectId", id);
            SetObjectField(interactable, "displayName", name);
            SetObjectField(interactable, "defaultAction", "SELECT_EXTINGUISHER");
            return interactable;
        }

        private void SetObjectField(object target, string fieldName, object value)
        {
            var field = target.GetType().GetField(fieldName, System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.Public);
            if (field != null)
            {
                field.SetValue(target, value);
            }
        }

        // ==========================================
        // Interactive Drill Step Handlers
        // ==========================================

        public void HandleExtinguisherSelected(string extinguisherId, bool isCorrect)
        {
            if (isCorrect)
            {
                if (passController != null)
                {
                    passController.BeginPASSSequence();
                }
            }
        }

        public void HandlePASSFinished()
        {
            if (emergencyExit != null)
            {
                emergencyExit.HighlightExit(true);
            }

            if (InstructionManager.Instance != null)
            {
                InstructionManager.Instance.ShowFeedback("HAZARD SUPPRESSED: Proceed to Emergency Exit Shaft!", Color.green);
            }
        }

        public void HandleEvacuationFinished()
        {
            Debug.Log("[FireModuleController] Full Fire & Explosion evacuation sequence completed successfully!");
        }

        public void RestartModule()
        {
            Debug.Log("[FireModuleController] Restarting Fire Emergency drill...");
            if (fireHazard != null) fireHazard.ResetFire();
            if (passController != null) passController.ResetSequence();
            if (emergencyExit != null) emergencyExit.ResetMarker();

            if (ARScenarioManager.Instance != null)
            {
                ARScenarioManager.Instance.ResetScenario();
            }
        }

        /// <summary>
        /// Activates the Fire & Explosion training drill within the reusable AR foundation engine.
        /// Loads FireExplosionScenario.json and sets up the AR environment.
        /// </summary>
        public void LaunchFireTrainingDrill()
        {
            if (fireScenarioJson == null)
            {
                fireScenarioJson = Resources.Load<TextAsset>("Scenarios/FireExplosionScenario");
            }

            if (fireScenarioJson != null && ARScenarioManager.Instance != null)
            {
                ARScenarioManager.Instance.LoadScenarioFromJson(fireScenarioJson.text);
                BuildProceduralEnvironment();
                WireEvents();
                ARScenarioManager.Instance.ResetScenario();
                Debug.Log("[FireModuleController] Fire & Explosion drill launched successfully.");
            }
        }
    }
}
