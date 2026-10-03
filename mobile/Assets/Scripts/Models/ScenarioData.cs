using System;
using System.Collections.Generic;
using UnityEngine;

namespace SurakshaAR.Models
{
    [Serializable]
    public class ScenarioData
    {
        public string scenarioId;
        public string moduleCode;
        public string title;
        public string description;
        public string environmentType; // COAL_SEAM, CONFINED_TUNNEL, etc.
        public string hazardLevel;     // LOW, MEDIUM, HIGH, CRITICAL
        public float passingScore = 80f;
        public float totalScenarioTimeLimit = 180f;
        public List<StepData> steps = new List<StepData>();

        public static ScenarioData FromJson(string json)
        {
            return JsonUtility.FromJson<ScenarioData>(json);
        }

        public string ToJson()
        {
            return JsonUtility.ToJson(this, true);
        }
    }
}
