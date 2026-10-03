# SurakshaAR Unity AR Foundation Core Engine Documentation

## Overview
The **SurakshaAR AR Engine** is an extensible, data-driven vocational training framework implemented in C# for Unity and ARCore. It provides plane detection, surface raycasting, physical world anchors, tactile raycast interaction, countdown timers, trilingual instruction overlays, and automated competency scoring.

---

## Core System Components

### 1. `ARScenarioManager` (`SurakshaAR.Core`)
- **Role**: Master State Machine for simulation sessions.
- **States**: `IDLE`, `INTRO`, `ACTIVE`, `WAITING_FOR_ACTION`, `ACTION_SUCCESS`, `ACTION_FAILURE`, `COMPLETED`, `FAILED`.
- **Key Methods**:
  - `LoadScenarioFromJson(string json)`: Dynamically configures steps and parameters.
  - `PlaceScenario(Pose pose)`: Instantiates the scenario anchor on a detected real-world plane.
  - `ResetScenario()`: Clears active anchors, resets counters, and returns to `IDLE`.

### 2. `ARObjectManager` (`SurakshaAR.Core`)
- **Role**: Manages 3D equipment assets and ARCore anchors.
- **Key Methods**:
  - `PlaceScenarioPrefab(GameObject prefab, Pose pose)`: Creates an `ARAnchor` and parents the 3D model hierarchy.
  - `HighlightObject(string objectId, bool enable, bool isError)`: Triggers safety orange glow or hazard red warning tint.
  - `ClearScenarioObjects()`: Destroys physical anchors and frees memory.

### 3. `ARInteractionManager` (`SurakshaAR.Core`)
- **Role**: Processes user taps and touch gestures.
- **Features**:
  - Filters out UI clicks using `EventSystem.current.IsPointerOverGameObject()`.
  - Casts physical rays into the AR environment to locate `ARInteractableObject`.
  - Triggers mobile haptic feedback (`Handheld.Vibrate()`) on Android devices.

### 4. `ScenarioStepManager` (`SurakshaAR.Core`)
- **Role**: Step progression and timing engine.
- **Features**:
  - Ticks down `stepTimer` per step.
  - Matches user action type and interacted object ID against expected action.
  - Calculates reaction latency in milliseconds (`DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()`).

### 5. `AssessmentManager` (`SurakshaAR.Core`)
- **Role**: Computes quantitative vocational compliance scores.
- **Scoring Model**:
  - Starts at 100%.
  - Deducts points based on step violation severity (`penaltyPoints`).
  - Evaluates `hazardAwarenessScore`, `reactionSpeedScore`, and `protocolAccuracyScore`.
  - Compares against regulatory `passingScore` (e.g., 80%).

### 6. `InstructionManager` & `LocalizationManager` (`SurakshaAR.Core`)
- **Role**: Vernacular communication interface.
- **Languages**:
  - English (`en`)
  - Hindi (`hi`, Devanagari)
  - Santali (`sat`, Ol Chiki script `ᱥᱟᱱᱛᱟᱲᱤ` + Romanized transliteration)

### 7. `TrainingSessionManager` (`SurakshaAR.Core`)
- **Role**: Device identity tracking and offline queue serialization.
- **Offline Storage**: Writes completed drill records to `Application.persistentDataPath/OfflineSyncQueue/attempt_{sessionId}.json`.

---

## Android 10+ Configuration Reference

### `AndroidManifest.xml` ARCore Directives
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Camera permission required for AR optical tracking -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera.ar" android:required="true" />

    <!-- Vibration for tactile hazard feedback -->
    <uses-permission android:name="android.permission.VIBRATE" />

    <application>
        <!-- Informs Google Play Services that ARCore is required -->
        <meta-data android:name="com.google.ar.core" android:value="required" />
    </application>
</manifest>
```

---

## Test Scenario Verification: "Object Identification Drill"

The baseline drill verifies:
1. Ground surface plane tracking with green reticle feedback.
2. User tap spawning an anchored safety gas detector.
3. Vernacular HUD prompts instructing worker to inspect the device.
4. User tap on the gas detector triggering a highlight and success sound.
5. System assessment awarding passing score and saving attempt to local JSON queue.
