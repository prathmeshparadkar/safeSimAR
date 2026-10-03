using System;
using System.Collections.Generic;
using UnityEngine;

namespace SurakshaAR.Core
{
    /// <summary>
    /// Lightweight mobile-optimized object pooler to prevent garbage collection spikes on mid-range Android devices.
    /// </summary>
    public class ObjectPooler : MonoBehaviour
    {
        public static ObjectPooler Instance { get; private set; }

        [Serializable]
        public class Pool
        {
            public string tag;
            public GameObject prefab;
            public int size = 5;
        }

        [SerializeField] private List<Pool> pools = new List<Pool>();
        private Dictionary<string, Queue<GameObject>> poolDictionary = new Dictionary<string, Queue<GameObject>>();

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
            }
            else
            {
                Destroy(gameObject);
                return;
            }

            InitializePools();
        }

        private void InitializePools()
        {
            poolDictionary.Clear();

            foreach (var pool in pools)
            {
                if (pool.prefab == null) continue;

                Queue<GameObject> objectQueue = new Queue<GameObject>();

                for (int i = 0; i < pool.size; i++)
                {
                    GameObject obj = Instantiate(pool.prefab, transform);
                    obj.SetActive(false);
                    objectQueue.Enqueue(obj);
                }

                poolDictionary[pool.tag] = objectQueue;
            }
        }

        public GameObject SpawnFromPool(string tag, Vector3 position, Quaternion rotation)
        {
            if (!poolDictionary.ContainsKey(tag))
            {
                Debug.LogWarning($"[ObjectPooler] Pool tag '{tag}' does not exist.");
                return null;
            }

            Queue<GameObject> queue = poolDictionary[tag];
            if (queue.Count == 0) return null;

            GameObject objectToSpawn = queue.Dequeue();
            objectToSpawn.SetActive(true);
            objectToSpawn.transform.position = position;
            objectToSpawn.transform.rotation = rotation;

            queue.Enqueue(objectToSpawn);
            return objectToSpawn;
        }

        public void ReturnToPool(GameObject obj)
        {
            if (obj != null)
            {
                obj.SetActive(false);
            }
        }
    }
}
