using System;
using System.IO;
using UnityEngine;
using SurakshaAR.Models;

namespace SurakshaAR.Core
{
    [Serializable]
    public class CompletedSessionRecord
    {
        public string sessionId;
        public string workerId;
        public string employeeId;
        public string scenarioId;
        public string moduleCode;
        public string startTimeIso;
        public string endTimeIso;
        public float durationSeconds;
        public float finalScore;
        public bool passed;
        public bool isOfflineSession;
        public AssessmentReport assessment;
    }

    /// <summary>
    /// Manages training session persistence, worker identity mapping, and local offline queue caching.
    /// </summary>
    public class TrainingSessionManager : MonoBehaviour
    {
        public static TrainingSessionManager Instance { get; private set; }

        [Header("Active Worker Context")]
        [SerializeField] private string currentWorkerId = "wrk-001";
        [SerializeField] private string currentEmployeeId = "CCL-EMP-8921";
        [SerializeField] private string activeOrganizationId = "org-ccl-ranchi-001";

        private string currentSessionId;
        private string sessionStartIso;
        private float sessionStartTime;

        public string CurrentWorkerId => currentWorkerId;
        public string CurrentEmployeeId => currentEmployeeId;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        public void SetWorkerContext(string workerId, string employeeId, string orgId)
        {
            currentWorkerId = workerId;
            currentEmployeeId = employeeId;
            activeOrganizationId = orgId;
        }

        public void StartSession(string scenarioId)
        {
            currentSessionId = Guid.NewGuid().ToString();
            sessionStartIso = DateTime.UtcNow.ToString("o");
            sessionStartTime = Time.time;
            Debug.Log($"[TrainingSessionManager] Session {currentSessionId} started for Worker {currentEmployeeId}");
        }

        public CompletedSessionRecord ConcludeSession(ScenarioData scenario, AssessmentReport report)
        {
            float duration = Time.time - sessionStartTime;
            string endIso = DateTime.UtcNow.ToString("o");

            CompletedSessionRecord record = new CompletedSessionRecord
            {
                sessionId = currentSessionId,
                workerId = currentWorkerId,
                employeeId = currentEmployeeId,
                scenarioId = scenario != null ? scenario.scenarioId : "unknown_scenario",
                moduleCode = scenario != null ? scenario.moduleCode : "MOD-UNKNOWN",
                startTimeIso = sessionStartIso,
                endTimeIso = endIso,
                durationSeconds = duration,
                finalScore = report != null ? report.totalScore : 0f,
                passed = report != null && report.passed,
                isOfflineSession = (Application.internetReachability == NetworkReachability.NotReachable),
                assessment = report
            };

            // Save session to device offline queue
            SaveToLocalOfflineQueue(record);

            return record;
        }

        private void SaveToLocalOfflineQueue(CompletedSessionRecord record)
        {
            try
            {
                string folder = Path.Combine(Application.persistentDataPath, "OfflineSyncQueue");
                if (!Directory.Exists(folder))
                {
                    Directory.CreateDirectory(folder);
                }

                string filePath = Path.Combine(folder, $"attempt_{record.sessionId}.json");
                string json = JsonUtility.ToJson(record, true);
                File.WriteAllText(filePath, json);
                Debug.Log($"[TrainingSessionManager] Offline record saved at: {filePath}");
            }
            catch (Exception ex)
            {
                Debug.LogError($"[TrainingSessionManager] Failed saving offline queue record: {ex.Message}");
            }
        }
    }
}
