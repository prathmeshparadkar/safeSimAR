namespace SurakshaAR.Core
{
    /// <summary>
    /// Lifecycle states for AR Vocational Safety Training Scenarios.
    /// Strict adherence to state transitions ensures verifiable telemetry.
    /// </summary>
    public enum ScenarioState
    {
        IDLE,               // System initialized, waiting for room scan / plane detection
        INTRO,              // Hazard context introduction, objectives display
        ACTIVE,             // Simulation in progress, step actively evaluated
        WAITING_FOR_ACTION, // Specific user gesture or tactile tap expected
        ACTION_SUCCESS,     // Correct object/switch interaction verified
        ACTION_FAILURE,     // Safety violation, improper sequence, or timeout
        COMPLETED,          // All steps successfully concluded with passing grade
        FAILED              // Cumulative penalties exceeded maximum allowable threshold
    }
}
