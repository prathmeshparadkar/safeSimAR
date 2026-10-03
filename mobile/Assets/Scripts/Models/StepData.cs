using System;
using UnityEngine;

namespace SurakshaAR.Models
{
    [Serializable]
    public class StepData
    {
        public string stepId;
        public int stepOrder;
        public string title;
        
        [TextArea(2, 4)]
        public string instructionEn;
        
        [TextArea(2, 4)]
        public string instructionHi;
        
        [TextArea(2, 4)]
        public string instructionSat; // Ol Chiki & Latin representation
        
        public string expectedAction; // e.g., "TAP_OBJECT", "PULL_LEVER", "DISCHARGE"
        public string targetObjectId; // Unique key matching ARInteractableObject ID
        public float timeLimitSeconds = 30f;
        public float penaltyPoints = 10f;
        public string hintText;

        public string GetLocalizedInstruction(string langCode)
        {
            switch (langCode?.ToLower())
            {
                case "sat":
                case "sat_olchiki":
                case "sat_latin":
                    return !string.IsNullOrEmpty(instructionSat) ? instructionSat : instructionHi;
                case "hi":
                    return !string.IsNullOrEmpty(instructionHi) ? instructionHi : instructionEn;
                case "en":
                default:
                    return instructionEn;
            }
        }
    }
}
