using System;
using System.Collections;
using UnityEngine;
using SurakshaAR.Core;
using SurakshaAR.Interaction;

namespace SurakshaAR.Modules.FireExplosion
{
    public enum PASSStage
    {
        NOT_STARTED,
        NEED_PULL_PIN,       // Step 1: Pull safety pin
        NEED_AIM_NOZZLE,     // Step 2: Aim nozzle at fuel base
        NEED_SQUEEZE_HANDLE, // Step 3: Squeeze discharge handle
        NEED_SWEEP_BASE,     // Step 4: Sweep horizontally side to side
        COMPLETED,
        SEQUENCE_FAILED
    }

    /// <summary>
    /// Interactive 4-step P.A.S.S. sequence controller.
    /// Strictly validates action order (Pull -> Aim -> Squeeze -> Sweep).
    /// Prevents trivial single-click completion.
    /// </summary>
    public class PASSProcedureController : MonoBehaviour
    {
        [Header("Physical Extinguisher Sub-Parts")]
        [SerializeField] private ARInteractableObject safetyPin;
        [SerializeField] private ARInteractableObject nozzle;
        [SerializeField] private ARInteractableObject dischargeHandle;
        [SerializeField] private ParticleSystem powderDischargeParticles;

        [Header("Hazard Zone Reference")]
        [SerializeField] private FireHazardZone targetFireZone;

        public event Action<PASSStage> OnStageChanged;
        public event Action<bool, string> OnStepFeedback; // isSuccess, feedbackMessage
        public event Action OnPASSProcedureFinished;

        private PASSStage currentStage = PASSStage.NOT_STARTED;
        private bool isPinRemoved = false;
        private bool isNozzleAimedAtBase = false;
        private bool isHandleDepressed = false;
        private int sweepCount = 0;
        private const int REQUIRED_SWEEPS = 3;

        public PASSStage CurrentStage => currentStage;
        public bool IsPinRemoved => isPinRemoved;
        public bool IsDischarging => isHandleDepressed && isPinRemoved && isNozzleAimedAtBase;

        public void BeginPASSSequence()
        {
            currentStage = PASSStage.NEED_PULL_PIN;
            isPinRemoved = false;
            isNozzleAimedAtBase = false;
            isHandleDepressed = false;
            sweepCount = 0;

            if (safetyPin != null) safetyPin.SetHighlight(true, false);
            OnStageChanged?.Invoke(currentStage);

            NotifyStepFeedback(true, "P.A.S.S. Step 1: Pull the red safety pin from the extinguisher collar.");
        }

        public bool ExecuteSubAction(string actionType)
        {
            switch (currentStage)
            {
                case PASSStage.NEED_PULL_PIN:
                    if (actionType == "PULL_PIN")
                    {
                        isPinRemoved = true;
                        if (safetyPin != null)
                        {
                            safetyPin.SetHighlight(false);
                            safetyPin.gameObject.SetActive(false); // Pin pulled
                        }
                        currentStage = PASSStage.NEED_AIM_NOZZLE;
                        if (nozzle != null) nozzle.SetHighlight(true, false);
                        NotifyStepFeedback(true, "P.A.S.S. Step 2: Aim nozzle low, directly at base of the fire.");
                        OnStageChanged?.Invoke(currentStage);
                        return true;
                    }
                    else if (actionType == "SQUEEZE_HANDLE")
                    {
                        NotifyStepFeedback(false, "MISTAKE: Cannot squeeze handle while safety pin is still locked in place! (-10 PTS)");
                        return false;
                    }
                    break;

                case PASSStage.NEED_AIM_NOZZLE:
                    if (actionType == "AIM_NOZZLE")
                    {
                        isNozzleAimedAtBase = true;
                        if (nozzle != null) nozzle.SetHighlight(false);
                        currentStage = PASSStage.NEED_SQUEEZE_HANDLE;
                        if (dischargeHandle != null) dischargeHandle.SetHighlight(true, false);
                        NotifyStepFeedback(true, "P.A.S.S. Step 3: Squeeze the discharge lever to release dry chemical agent.");
                        OnStageChanged?.Invoke(currentStage);
                        return true;
                    }
                    else if (actionType == "SWEEP_BASE")
                    {
                        NotifyStepFeedback(false, "MISTAKE: Must aim nozzle at base and squeeze handle before sweeping! (-5 PTS)");
                        return false;
                    }
                    break;

                case PASSStage.NEED_SQUEEZE_HANDLE:
                    if (actionType == "SQUEEZE_HANDLE")
                    {
                        isHandleDepressed = true;
                        if (dischargeHandle != null) dischargeHandle.SetHighlight(false);
                        if (powderDischargeParticles != null) powderDischargeParticles.Play();

                        currentStage = PASSStage.NEED_SWEEP_BASE;
                        NotifyStepFeedback(true, "P.A.S.S. Step 4: Sweep nozzle side to side across base of flare until extinguished.");
                        OnStageChanged?.Invoke(currentStage);
                        return true;
                    }
                    break;

                case PASSStage.NEED_SWEEP_BASE:
                    if (actionType == "SWEEP_BASE")
                    {
                        sweepCount++;
                        if (targetFireZone != null)
                        {
                            targetFireZone.ApplyExtinguisherSuppression(0.5f);
                        }

                        if (sweepCount >= REQUIRED_SWEEPS)
                        {
                            CompletePASS();
                            return true;
                        }
                        else
                        {
                            NotifyStepFeedback(true, $"Sweeping: {sweepCount}/{REQUIRED_SWEEPS} arcs completed...");
                            return true;
                        }
                    }
                    break;
            }

            return false;
        }

        private void CompletePASS()
        {
            currentStage = PASSStage.COMPLETED;
            if (powderDischargeParticles != null)
            {
                powderDischargeParticles.Stop();
            }

            NotifyStepFeedback(true, "P.A.S.S. PROCEDURE COMPLETE: Fire fully suppressed! +25 Points awarded.");
            OnStageChanged?.Invoke(currentStage);
            OnPASSProcedureFinished?.Invoke();
        }

        private void NotifyStepFeedback(bool success, string message)
        {
            OnStepFeedback?.Invoke(success, message);
            if (InstructionManager.Instance != null)
            {
                InstructionManager.Instance.ShowFeedback(message, success ? Color.green : Color.red);
            }
        }

        public void ResetSequence()
        {
            currentStage = PASSStage.NOT_STARTED;
            isPinRemoved = false;
            isNozzleAimedAtBase = false;
            isHandleDepressed = false;
            sweepCount = 0;

            if (safetyPin != null)
            {
                safetyPin.gameObject.SetActive(true);
                safetyPin.SetHighlight(false);
            }
            if (nozzle != null) nozzle.SetHighlight(false);
            if (dischargeHandle != null) dischargeHandle.SetHighlight(false);
            if (powderDischargeParticles != null) powderDischargeParticles.Stop();
        }
    }
}
