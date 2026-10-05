# SurakshaAR Mobile Client: Unity AR Foundation Engine

This directory contains the modular, reusable Augmented Reality (AR) training engine developed for **Smart India Hackathon Problem Statement 26041: AR-Based Vocational Training Simulator for Industrial Safety in Jharkhand's Mining & Manufacturing Sector**.

- **Target Platform**: Android 10+ (API Level 29 to 34)
- **Frameworks**: Unity 2022.3 LTS, AR Foundation 5.1.4, Google ARCore XR Plugin 5.1.4, XR Core Utilities 2.2.3, TextMeshPro 3.0.6
- **Architecture**: Modular Finite State Machine (FSM), Data-Driven Scenarios (JSON/ScriptableObject), Decoupled Subsystems

---

## 1. Core Engine Architecture

The framework is completely decoupled from any specific training module (such as Fire Safety or Chemical Spill). Any industrial scenario can be authored purely via data without touching core C# logic.

```
                                +---------------------------+
                                |  ScenarioData (JSON/SO)   |
                                +---------------------------+
                                              |
                                              v
+-------------------+             +-----------------------+             +-----------------------+
|  ARCameraManager  | ----------> |   ARScenarioManager   | <---------> |  ARPlacementReticle   |
| (Raycast / Plane) |             |  (Finite State Mach.) |             | (ARRaycastManager Hit)|
+-------------------+             +-----------------------+             +-----------------------+
                                    |         |         |
          +-------------------------+         |         +--------------------------+
          |                                   |                                    |
          v                                   v                                    v
+-------------------+             +-----------------------+             +-----------------------+
|  ARObjectManager  |             |  ScenarioStepManager  |             |  ARInteractionManager |
| (AR Foundation 5  |             | (Timers, Progression, |             | (Screen / Physics Tap |
|  Anchors & Prefab)|             |  Expected Action Eval)|             |  UI Exclusion Filter) |
+-------------------+             +-----------------------+             +-----------------------+
          |                                   |                                    |
          v                                   v                                    v
+-------------------+             +-----------------------+             +-----------------------+
| ARInteractableObj |             |   AssessmentManager   |             |  InstructionManager   |
| (Dynamic Emissive |             | (Telemetry, Reaction  |             | (HUD Alerts, Hints,   |
|  Material Highl.) |             |  Speed, Penalty Calc) |             |  Feedback Banners)    |
+-------------------+             +-----------------------+             +-----------------------+
                                              |                                    |
                                              v                                    v
                                  +-----------------------+             +-----------------------+
                                  | TrainingSessionMgr    |             |  LocalizationManager  |
                                  | (Offline SQLite/JSON  |             | (Santali Ol Chiki,    |
                                  |  Sync Queue Storage)  |             |  Hindi, English)      |
                                  +-----------------------+             +-----------------------+
```

### The 8 Reusable Engine Systems

| System | Role & Responsibilities |
|---|---|
| [ARScenarioManager](file:///c:/Users/asus/OneDrive/Desktop/SIH2NDPS/mobile/Assets/Scripts/Core/ARScenarioManager.cs) | Master state machine controller (`IDLE` &rarr; `INTRO` &rarr; `ACTIVE` &rarr; `WAITING_FOR_ACTION` &rarr; `ACTION_SUCCESS`/`FAILURE` &rarr; `COMPLETED`/`FAILED`). Handles scenario lifecycle, reset, and conclusion. |
| [ARObjectManager](file:///c:/Users/asus/OneDrive/Desktop/SIH2NDPS/mobile/Assets/Scripts/Core/ARObjectManager.cs) | Instantiates equipment prefabs onto physical planes using AR Foundation 5.x `ARAnchor` components. Tracks object registry and handles cleanup. |
| [ARInteractionManager](file:///c:/Users/asus/OneDrive/Desktop/SIH2NDPS/mobile/Assets/Scripts/Core/ARInteractionManager.cs) | Processes touch gestures, screen raycasting, and pointer-over-UI filtering. Dispatches interaction events to interactable objects. |
| [ScenarioStepManager](file:///c:/Users/asus/OneDrive/Desktop/SIH2NDPS/mobile/Assets/Scripts/Core/ScenarioStepManager.cs) | Manages linear step progression, step countdown timers (`OnStepTimerTick`), timeout handling, and expected action matching. |
| [TrainingSessionManager](file:///c:/Users/asus/OneDrive/Desktop/SIH2NDPS/mobile/Assets/Scripts/Core/TrainingSessionManager.cs) | Worker session identity mapping, start/end ISO timestamping, and encrypted offline attempt queue caching (`Application.persistentDataPath/OfflineSyncQueue/`). |
| [AssessmentManager](file:///c:/Users/asus/OneDrive/Desktop/SIH2NDPS/mobile/Assets/Scripts/Core/AssessmentManager.cs) | Calculates real-time competency score (100% baseline), applies penalty deductions, evaluates protocol accuracy and reaction speed, and outputs `AssessmentReport`. |
| [InstructionManager](file:///c:/Users/asus/OneDrive/Desktop/SIH2NDPS/mobile/Assets/Scripts/Core/InstructionManager.cs) | Manages step instructions, dynamic contextual hints, feedback banners, and integrates with `LocalizationManager`. |
| [LocalizationManager](file:///c:/Users/asus/OneDrive/Desktop/SIH2NDPS/mobile/Assets/Scripts/Core/LocalizationManager.cs) | Trilingual dictionary manager supporting **Hindi**, **Santali (Ol Chiki + Romanized)**, and **English**, tailored for the Jharkhand industrial workforce. |

---

## 2. Finite State Machine (FSM) Lifecycle

```
       +------------+
       |    IDLE    | <--------------------------- Reset Drill ---------------------------+
       +------------+                                                                     |
              | Floor scanned & surface tapped                                            |
              v                                                                           |
       +------------+                                                                     |
       |   INTRO    | (2.5s Audio/Visual Orientation & Hazard Briefing)                   |
       +------------+                                                                     |
              | Briefing completed                                                        |
              v                                                                           |
       +------------+                                                                     |
       |   ACTIVE   | (Initializes session, timer, and loads Step 1)                      |
       +------------+                                                                     |
              |                                                                           |
              v                                                                           |
       +--------------------+ <----------------------- Next Step --------------------+    |
  +--> | WAITING_FOR_ACTION |                                                        |    |
  |    +--------------------+                                                        |    |
  |           |                                                                      |    |
  |           +---------------------------+---------------------------+              |    |
  |           | Correct Target Tap        | Wrong Object / Action     | Timeout      |    |
  |           v                           v                           v              |    |
  |    +----------------+          +----------------+          +----------------+    |    |
  |    | ACTION_SUCCESS |          | ACTION_FAILURE |          | ACTION_FAILURE |    |    |
  |    +----------------+          +----------------+          +----------------+    |    |
  |           |                           |                           |              |    |
  |           +---------------------------+---------------------------+              |    |
  |                                       | 1.5s Feedback Delay                      |    |
  |                                       v                                          |    |
  |                             More steps remain?                                   |    |
  |                             /                \                                   |    |
  +-------------------------- YES                 NO                                 |    |
                                                  |                                  |    |
                                                  v                                  |    |
                                     Score >= Passing Threshold?                     |    |
                                         /                  \                        |    |
                                   YES  /                    \  NO                   |    |
                                       v                      v                      |    |
                                +-----------+            +--------+                  |    |
                                | COMPLETED |            | FAILED |                  |    |
                                +-----------+            +--------+                  |    |
                                       |                      |                      |    |
                                       +----------------------+----------------------+----+
```

---

## 3. Sample Test Scenario: "Object Identification Drill"

Located in [ObjectIdentificationScenario.json](file:///c:/Users/asus/OneDrive/Desktop/SIH2NDPS/mobile/Assets/Resources/Scenarios/ObjectIdentificationScenario.json):

```json
{
  "scenarioId": "scen-test-obj-ident-01",
  "moduleCode": "MOD-TEST-01",
  "title": "Object Identification Drill",
  "description": "Scan horizontal ground surface, tap to place equipment, then identify and inspect the target monitor.",
  "passingScore": 80.0,
  "steps": [
    {
      "stepId": "step-ident-01",
      "stepOrder": 1,
      "title": "Target Equipment Identification",
      "instructionEn": "Locate and tap on the highlighted safety gas monitor.",
      "instructionHi": "हाइलाइट किए गए सुरक्षा गैस मॉनिटर को पहचानें और उस पर टैप करें।",
      "instructionSat": "ᱪᱤᱱᱦᱟᱹᱣ ᱢᱮ ᱟᱨ ᱥᱩᱨᱚᱠᱷᱤᱛ ᱜᱮᱥ ᱢᱚᱱᱤᱴᱚᱨ ᱪᱮᱛᱟᱱ ᱨᱮ ᱴᱤᱯ ᱢᱮ (Gas monitor ñel kate tip me).",
      "expectedAction": "TAP_OBJECT",
      "targetObjectId": "TargetEquipment_AR",
      "timeLimitSeconds": 30.0,
      "penaltyPoints": 15.0,
      "hintText": "Move your camera within 1.5 meters of the equipment box and tap it directly."
    }
  ]
}
```

### Execution Flow:
1. **Surface Detection**: User moves phone camera across floor or table; `ARPlaneManager` detects the surface and `ARPlacementReticle` projects an alignment indicator.
2. **Placement**: User taps anywhere; the equipment root is anchored using `ARAnchor`. State transitions from `IDLE` &rarr; `INTRO` &rarr; `ACTIVE` &rarr; `WAITING_FOR_ACTION`.
3. **Step Instruction**: The Heads-Up Display renders localized instructions and initiates the 30-second countdown timer.
4. **Interaction**: User taps the target equipment box (`TargetEquipment_AR`); `ARInteractableObject` pulses with safety orange/green emission.
5. **Score & Telemetry**: 0 penalties applied, reaction latency recorded, session saved to offline queue, and state transitions to `COMPLETED`.

---

## 4. Unity & Android ARCore Setup Instructions

### Environment Requirements
- **Unity Editor**: `2022.3.20f1 LTS` or newer `2022.3 LTS`
- **Android Target**: Android 10.0 (API Level 29) to Android 14 (API Level 34)
- **Build System**: Gradle with OpenJDK 11 / 17, Android NDK `r23b`+
- **Hardware**: ARCore-supported Android device (e.g., Samsung Galaxy S10+, Google Pixel 4+, OnePlus 7+, Xiaomi Redmi Note 10 Pro+)

### Step-by-Step Project Configuration

#### 1. Open the Project
1. Open **Unity Hub**.
2. Click **Add** &rarr; **Add project from disk**.
3. Select the `mobile` folder in this repository.
4. Set Unity Version to `2022.3.20f1` (or your installed `2022.3.x LTS`).

#### 2. Configure XR Plug-in Management (ARCore)
1. Navigate to **Edit &rarr; Project Settings &rarr; XR Plug-in Management**.
2. Click the **Android** tab.
3. Check the **Google ARCore** checkbox.
4. Under **Project Settings &rarr; XR Plug-in Management &rarr; ARCore Extensions** (optional), ensure camera configuration matches requirements.

#### 3. Android Player Settings
In **Edit &rarr; Project Settings &rarr; Player &rarr; Android tab**:
- **Company Name**: `SurakshaAR`
- **Product Name**: `SurakshaAR-Mobile`
- **Package Name**: `com.suraksha.ar.training`
- **Minimum API Level**: `Android 10.0 (API level 29)`
- **Target API Level**: `Automatic (highest installed)` or `API level 33/34`
- **Scripting Backend**: `IL2CPP`
- **Target Architectures**: Check `ARM64` (uncheck `ARMv7`)
- **Graphics APIs**: `OpenGLES3` or `Vulkan`
- **Active Input Handling**: `Both` (or `Input System Package (New)`)

#### 4. Instant "Drop-and-Play" Scene Setup
Thanks to the included [ARSceneInitializer](file:///c:/Users/asus/OneDrive/Desktop/SIH2NDPS/mobile/Assets/Scripts/Core/ARSceneInitializer.cs), you can run the engine in an empty scene with a single click:
1. In Unity, create a new Scene (**File &rarr; New Scene**).
2. Create an empty GameObject (**GameObject &rarr; Create Empty**), name it `_EngineBootstrap`.
3. Add the `ARSceneInitializer` component to it.
4. Press **Play** in Unity Editor (or build to Android).
5. `ARSceneInitializer` will automatically construct the `ARSession`, `ARCamera`, `ARPlaneManager`, `ARRaycastManager`, `ARAnchorManager`, `ARScenarioManager`, HUD, and Reticle at runtime!

---

## 5. Automated Test Runner

To execute the automated test suite for the sample scenario:
1. Attach the [ObjectIdentificationTester](file:///c:/Users/asus/OneDrive/Desktop/SIH2NDPS/mobile/Assets/Scripts/Tests/ObjectIdentificationTester.cs) component to any GameObject in the scene.
2. Check `Run Tests On Start` in the Inspector.
3. Hit **Play**.
4. The test harness executes 4 automated integration tests:
   - `Test 1`: Scenario data deserialization and validation
   - `Test 2`: Placement, target tap interaction, score evaluation, and `COMPLETED` state verification
   - `Test 3`: Incorrect action penalty deduction (-15 pts) and `ACTION_FAILURE` handling
   - `Test 4`: Complete scenario reset and memory cleanup verification

---

## 6. Mobile Performance Optimizations

1. **Draw Call Batching**: Low-poly geometric assets with shared URP Lit/Unlit materials.
2. **Object Pooling**: Pre-instantiated object pools via [ObjectPooler](file:///c:/Users/asus/OneDrive/Desktop/SIH2NDPS/mobile/Assets/Scripts/Core/ObjectPooler.cs) eliminate garbage collection spikes during hazardous particle effects and spawn events.
3. **Plane Polygon Caching**: Tracked plane polygons are hidden when transitioning from `IDLE` to `ACTIVE` to minimize GPU fill-rate overhead.
4. **Zero Heap Allocations in Update Loops**: Interaction and raycast checks run on pre-allocated static lists (`List<ARRaycastHit>`) without runtime allocations.
5. **Offline Queue Resilience**: Telemetry payloads are written asynchronously to JSON cache files on the flash storage before backend synchronization.

---

## 7. Module 1: Fire & Explosion Response Module

The complete, playable vocational safety simulation drill for underground methane ignition and coal face fires:

### The 8-Step Interactive Drill Sequence

| Step | Action & Objective | Scoring & Penalty |
|---|---|---|
| **Step 1: Introduction** | "Fire Emergency Training" briefing with disclaimer that simulation reinforces protocols but does not substitute statutory physical pit drills. Worker confirms briefing. | 0 Pts (Orientation) |
| **Step 2: Environment Setup** | Worker scans floor surface with AR. Taps reticle to anchor: simulated fire, amber warning boundary, emergency alarm pull station, 3-unit extinguisher rack, and emergency escape exit. | 0 Pts (Setup) |
| **Step 3: Hazard Identification** | Methane flare erupts at cutting face (+flame particle effects). Worker must identify and tap the active fire zone (`SimulatedFire_AR`). | **+20 Points** (Mistake: -20 pts) |
| **Step 4: Emergency Alarm** | Worker must locate the red pull station mounted on the electrical distribution panel (`EmergencyAlarm_AR`) and activate it to alert the pithead and ventilation station. | **+15 Points** (Mistake: -15 pts) |
| **Step 5: Extinguisher Selection** | 3 extinguisher options presented: Water, CO2, Dry Powder. Worker must select Class D / ABC Dry Powder (`Extinguisher_DryPowder_AR`). Selecting Water triggers steam explosion warning (-15 pts); CO2 triggers ineffective warning (-10 pts). | **+15 Points** (Mistake: -15 pts) |
| **Step 6: P.A.S.S. Suppression** | Multi-action interactive sequence: **[P]** Pull Red Pin &rarr; **[A]** Aim Nozzle at Base &rarr; **[S]** Squeeze Discharge Lever &rarr; **[S]** Sweep horizontally 3 times. Flame shrinks and extinguishes. | **+25 Points** (Mistake: -25 pts) |
| **Step 7: Evacuation** | Green illuminated Emergency Escape Shaft Exit (`EmergencyExit_AR`) activates. Worker must turn, orient camera, and navigate to the exit shaft. | **+25 Points** (Mistake: -25 pts) |
| **Step 8: Completion** | System evaluates overall competency score (Total 100). Validates against configurable passing threshold (default: 80%). Displays summary HUD and encrypts session record to local offline sync queue. | **Total: 100 Points** (Configurable passing threshold) |

### Testing the Fire Module

We provide a dedicated automated test suite in [FireModuleTester.cs](file:///c:/Users/asus/OneDrive/Desktop/SIH2NDPS/mobile/Assets/Scripts/Tests/FireModuleTester.cs):
1. Attach `FireModuleTester` to any GameObject in the scene.
2. Check `Run Tests On Start`.
3. Hit **Play**:
   - `Test 1 (Correct Path)`: Executes all 8 steps flawlessly &rarr; Score: 100%, Passed: True, 0 mistakes, saves offline queue record.
   - `Test 2 (Incorrect Path)`: Worker selects wrong extinguisher (Water) and squeezes handle before pulling pin &rarr; Score: 75%, Passed: False, 2 violations recorded in telemetry.
   - `Test 3 (Restart Sequence)`: Resets flame height, resets P.A.S.S. sequence, resets HUD, and restores score to 100%.
