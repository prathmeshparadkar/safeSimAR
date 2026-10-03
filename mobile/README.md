# SurakshaAR Mobile Client: Unity AR Foundation Engine

This directory contains the production-grade Unity Augmented Reality (AR) training engine for **Smart India Hackathon Problem Statement 26041: AR-Based Vocational Training Simulator for Industrial Safety in Jharkhand's Mining & Manufacturing Sector**.

Target Platform: **Android 10+ (API Level 29 to 34)**  
Technology Stack: **Unity 2022.3 LTS / 2023.2 LTS, AR Foundation 5.x, ARCore XR Plugin**

---

## 1. System Architecture

The engine is built around a decoupled, data-driven finite state machine:

```
[ARCamera / ARRaycastManager] ---> [ARPlacementReticle] (Horizontal plane detection)
                                           |
                                           v
[ARScenarioManager] <============ [ScenarioData (JSON)]
      |
      +---> [ARObjectManager] (Spawns, anchors, and registers 3D equipment)
      |
      +---> [ARInteractionManager] (Raycast tap and tactile interaction filters)
      |
      +---> [ScenarioStepManager] (Sequential progression & countdown timer)
      |
      +---> [AssessmentManager] (Scores, penalties, reaction latency)
      |
      +---> [InstructionManager] (HUD instructions, hints, feedback banners)
      |
      +---> [LocalizationManager] (Santali Ol Chiki, Hindi, English)
      |
      +---> [TrainingSessionManager] (Offline attempt caching & sync queue)
```

---

## 2. Finite State Machine Lifecycle

```
  +------+       Surface Scan       +-------+
  | IDLE | -----------------------> | INTRO |
  +------+                          +-------+
                                        |  2.5s Briefing
                                        v
                                    +--------+
                                    | ACTIVE |
                                    +--------+
                                        |  Load Step 1
                                        v
                            +--------------------+
                            | WAITING_FOR_ACTION | <---+
                            +--------------------+     |
                              |              |         |
           Correct Object Tap |              | Wrong   | Next
                              v              v         | Step
                     +----------------+  +----------------+
                     | ACTION_SUCCESS |  | ACTION_FAILURE|
                     +----------------+  +----------------+
                              |              |
                              +------+-------+
                                     |
                          All Steps Concluded
                                     v
                   Score >= Benchmark ?
                   /                  \
             YES  /                    \  NO
                 v                      v
          +-----------+          +--------+
          | COMPLETED |          | FAILED |
          +-----------+          +--------+
```

---

## 3. Unity Project Setup Guide

### Prerequisites
1. **Unity Hub**: Install Unity **2022.3.x LTS** (with Android Build Support, Android SDK & NDK tools, and OpenJDK).
2. **Device**: An ARCore-compatible Android phone (Android 10+).

### Step-by-Step Scene Setup
1. **Open Project**: In Unity Hub, click **Add project from disk** and select the `mobile` folder.
2. **Project Settings -> XR Plug-in Management**:
   - Check **Google ARCore** under the Android tab.
3. **Player Settings**:
   - **Minimum API Level**: Android 10.0 (API Level 29)
   - **Target API Level**: Automatic (highest installed, API 33/34)
   - **Scripting Backend**: IL2CPP
   - **Target Architectures**: ARM64 checked (ARMv7 unchecked)
4. **Hierarchy Setup**:
   - Create an empty GameObject named `AR Session` -> Add `ARSession` and `ARInputManager` components.
   - Create an `XR Origin (Mobile AR)` -> Includes `ARCamera`, `ARPlaneManager` (set Detection Mode to Horizontal), `ARRaycastManager`, and `ARAnchorManager`.
   - Add an empty GameObject named `CoreEngine` -> Attach:
     - `ARScenarioManager`
     - `ARObjectManager`
     - `ARInteractionManager`
     - `ScenarioStepManager`
     - `AssessmentManager`
     - `InstructionManager`
     - `LocalizationManager`
     - `TrainingSessionManager`
     - `ObjectPooler`
   - Create a Canvas for HUD overlay -> Attach `ARInstructionHUD`, `ARSessionSummaryUI`, and `LanguageSelectorUI`.

---

## 4. Test Scenario: Object Identification Drill

A pre-configured JSON scenario is loaded from `Resources/Scenarios/ObjectIdentificationScenario.json`:
1. **Plane Detection**: Aim camera at floor or flat table surface. The placement reticle aligns with the detected plane.
2. **Placement**: Tap anywhere to spawn the safety equipment target anchor.
3. **Step Instruction**: The HUD prompts in Hindi/Santali/English: *"Identify and tap on the highlighted safety monitor"*.
4. **Interaction**: Tap the highlighted object.
5. **Assessment**: The system logs reaction time, registers correct interaction, displays a green success banner, concludes the drill, and calculates the score.
6. **Offline Sync**: The session attempt is saved to `Application.persistentDataPath/OfflineSyncQueue/` ready for synchronization with the Node.js backend.

---

## 5. Adding New Modules (Fire Response, Gas Leak, etc.)

Because the AR framework is **data-driven**, new modules do not require modifying the core C# codebase:
1. Create a 3D prefab containing `ARInteractableObject` components with unique IDs (e.g. `MethaneMonitor_AR`, `EmergencyBreaker_AR`, `FireExtinguisher_AR`).
2. Author a scenario JSON file defining the steps, expected actions, target IDs, time limits, and trilingual instruction texts.
3. Call `ARScenarioManager.Instance.LoadScenarioFromJson(jsonString)` to run the new drill!
