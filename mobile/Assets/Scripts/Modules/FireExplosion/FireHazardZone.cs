using UnityEngine;
using SurakshaAR.Interaction;

namespace SurakshaAR.Modules.FireExplosion
{
    /// <summary>
    /// Represents the simulated methane flame hazard and boundary warning zone.
    /// Supports gradual extinguishing as worker sweeps dry chemical nozzle.
    /// </summary>
    public class FireHazardZone : MonoBehaviour
    {
        [Header("Flame Visuals")]
        [SerializeField] private Transform flameVisualTransform;
        [SerializeField] private ParticleSystem flameParticles;
        [SerializeField] private ParticleSystem smokeParticles;

        [Header("Hazard Zone Perimeter")]
        [SerializeField] private GameObject warningZoneIndicator;
        [SerializeField] private ARInteractableObject fireInteractable;

        private float currentIntensity = 1f;
        private bool isExtinguished = false;

        public bool IsExtinguished => isExtinguished;
        public float CurrentIntensity => currentIntensity;

        private void Awake()
        {
            if (fireInteractable == null)
            {
                fireInteractable = GetComponentInChildren<ARInteractableObject>();
            }
        }

        public void ApplyExtinguisherSuppression(float rate = 0.35f)
        {
            if (isExtinguished) return;

            currentIntensity = Mathf.Max(0f, currentIntensity - rate * Time.deltaTime);

            if (flameVisualTransform != null)
            {
                flameVisualTransform.localScale = Vector3.one * currentIntensity;
            }

            if (currentIntensity <= 0.05f)
            {
                ExtinguishFire();
            }
        }

        private void ExtinguishFire()
        {
            isExtinguished = true;
            currentIntensity = 0f;

            if (flameParticles != null)
            {
                flameParticles.Stop();
            }

            if (flameVisualTransform != null)
            {
                flameVisualTransform.gameObject.SetActive(false);
            }

            if (smokeParticles != null)
            {
                smokeParticles.Play();
            }

            Debug.Log("[FireHazardZone] Simulated methane fire successfully suppressed!");
        }

        public void ResetFire()
        {
            isExtinguished = false;
            currentIntensity = 1f;

            if (flameVisualTransform != null)
            {
                flameVisualTransform.gameObject.SetActive(true);
                flameVisualTransform.localScale = Vector3.one;
            }

            if (flameParticles != null)
            {
                flameParticles.Play();
            }

            if (warningZoneIndicator != null)
            {
                warningZoneIndicator.SetActive(true);
            }
        }
    }
}
