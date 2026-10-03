import React, { useState, useEffect } from 'react';
import {
  X,
  Flame,
  AlertTriangle,
  Bell,
  ShieldAlert,
  Compass,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Award,
  Play,
  Languages,
} from 'lucide-react';
import { api } from '../services/api';

interface FireDrillSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttemptSynced?: () => void;
}

export const FireDrillSimulatorModal: React.FC<FireDrillSimulatorModalProps> = ({
  isOpen,
  onClose,
  onAttemptSynced,
}) => {
  // Scenario State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [score, setScore] = useState<number>(100);
  const [passingThreshold] = useState<number>(80);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [actionLog, setActionLog] = useState<any[]>([]);
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'sat'>('en');

  // Interactive Sub-states
  const [isEnvironmentPlaced, setIsEnvironmentPlaced] = useState<boolean>(false);
  const [isHazardIdentified, setIsHazardIdentified] = useState<boolean>(false);
  const [isAlarmActivated, setIsAlarmActivated] = useState<boolean>(false);
  const [selectedExtinguisher, setSelectedExtinguisher] = useState<string | null>(null);

  // P.A.S.S. Sub-step state (1: Pin, 2: Aim, 3: Squeeze, 4: Sweep)
  const [passState, setPassState] = useState<{
    pinPulled: boolean;
    aimed: boolean;
    squeezed: boolean;
    sweepsCompleted: number;
  }>({
    pinPulled: false,
    aimed: false,
    squeezed: false,
    sweepsCompleted: 0,
  });

  const [isEvacuated, setIsEvacuated] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<any | null>(null);

  // Reset drill
  const resetDrill = () => {
    setCurrentStep(1);
    setScore(100);
    setMistakes([]);
    setActionLog([]);
    setIsEnvironmentPlaced(false);
    setIsHazardIdentified(false);
    setIsAlarmActivated(false);
    setSelectedExtinguisher(null);
    setPassState({
      pinPulled: false,
      aimed: false,
      squeezed: false,
      sweepsCompleted: 0,
    });
    setIsEvacuated(false);
    setFeedback(null);
    setSyncResult(null);
  };

  useEffect(() => {
    if (isOpen) {
      resetDrill();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const logAction = (
    stepId: string,
    actionType: string,
    objectInteracted: string,
    isCorrect: boolean,
    reactionMs: number,
    penaltyApplied = 0
  ) => {
    const item = {
      stepId,
      actionType,
      objectInteracted,
      isCorrect,
      reactionTimeMs: reactionMs,
      penaltyApplied,
      timestamp: new Date().toISOString(),
    };
    setActionLog((prev) => [...prev, item]);
  };

  // Step 1: Introduction acknowledge
  const handleAcknowledgeBriefing = () => {
    logAction('step-fire-1-intro', 'ACKNOWLEDGE_BRIEFING', 'BriefingHUD_AR', true, 1200, 0);
    setFeedback({ message: 'Briefing acknowledged. AR spatial tracking activated.', isError: false });
    setCurrentStep(2);
  };

  // Step 2: Environment setup
  const handlePlaceEnvironment = () => {
    setIsEnvironmentPlaced(true);
    logAction('step-fire-2-setup', 'PLACE_ENVIRONMENT', 'PlacementReticle_AR', true, 2100, 0);
    setFeedback({
      message: 'AR Scene Deployed: Fire zone, alarm panel, extinguisher rack, and emergency exit mapped.',
      isError: false,
    });
    setCurrentStep(3);
  };

  // Step 3: Hazard identification (+20)
  const handleIdentifyHazard = (isTarget: boolean) => {
    if (isTarget) {
      setIsHazardIdentified(true);
      logAction('step-fire-3-hazard', 'IDENTIFY_HAZARD', 'SimulatedFire_AR', true, 1600, 0);
      setFeedback({ message: 'HAZARD IDENTIFIED: Methane ignition confirmed at coal face! +20 Points', isError: false });
      setTimeout(() => setCurrentStep(4), 1000);
    } else {
      const deduction = 20;
      setScore((prev) => Math.max(0, prev - deduction));
      setMistakes((prev) => [...prev, 'Failed initial hazard identification: clicked non-hazardous object']);
      logAction('step-fire-3-hazard', 'IDENTIFY_HAZARD', 'FloorBoundary_AR', false, 3000, deduction);
      setFeedback({ message: 'INCORRECT: That is not the active flame source! (-20 PTS)', isError: true });
    }
  };

  // Step 4: Alarm activation (+15)
  const handleActivateAlarm = () => {
    setIsAlarmActivated(true);
    logAction('step-fire-4-alarm', 'ACTIVATE_ALARM', 'EmergencyAlarm_AR', true, 1900, 0);
    setFeedback({ message: 'ALARM TRIGGERED: Pithead evacuation siren engaged! +15 Points', isError: false });
    setTimeout(() => setCurrentStep(5), 1000);
  };

  // Step 5: Extinguisher selection (+15)
  const handleSelectExtinguisher = (type: string) => {
    setSelectedExtinguisher(type);
    if (type === 'DRY_POWDER') {
      logAction('step-fire-5-select', 'SELECT_EXTINGUISHER', 'Extinguisher_DryPowder_AR', true, 2800, 0);
      setFeedback({ message: 'CORRECT EQUIPMENT: Class D / ABC Dry Powder selected for gas/coal fire! +15 Points', isError: false });
      setTimeout(() => setCurrentStep(6), 1200);
    } else if (type === 'WATER') {
      const deduction = 15;
      setScore((prev) => Math.max(0, prev - deduction));
      setMistakes((prev) => [...prev, 'CRITICAL HAZARD: Selected Water extinguisher on coal gas flare']);
      logAction('step-fire-5-select', 'SELECT_EXTINGUISHER', 'Extinguisher_Water_AR', false, 3200, deduction);
      setFeedback({
        message: 'FATAL VIOLATION: Water causes violent steam explosion & spreads coal gas fire! (-15 PTS)',
        isError: true,
      });
    } else if (type === 'CO2') {
      const deduction = 10;
      setScore((prev) => Math.max(0, prev - deduction));
      setMistakes((prev) => [...prev, 'Selected CO2 extinguisher which lacks chemical smothering capacity']);
      logAction('step-fire-5-select', 'SELECT_EXTINGUISHER', 'Extinguisher_CO2_AR', false, 3500, deduction);
      setFeedback({
        message: 'INEFFECTIVE: Carbon Dioxide lacks chemical smothering capacity for burning seam coal! (-10 PTS)',
        isError: true,
      });
    }
  };

  // Step 6: P.A.S.S. sequence (+25)
  const handlePASSAction = (action: 'PULL' | 'AIM' | 'SQUEEZE' | 'SWEEP') => {
    if (action === 'PULL') {
      setPassState((prev) => ({ ...prev, pinPulled: true }));
      logAction('step-fire-6-pass', 'PULL_PIN', 'Extinguisher_Pin_AR', true, 1100, 0);
      setFeedback({ message: 'P.A.S.S. [1/4] Pin Pulled! Now aim nozzle low at fire base.', isError: false });
    } else if (action === 'AIM') {
      if (!passState.pinPulled) {
        setFeedback({ message: 'MISTAKE: You must pull safety pin before aiming nozzle!', isError: true });
        return;
      }
      setPassState((prev) => ({ ...prev, aimed: true }));
      logAction('step-fire-6-pass', 'AIM_NOZZLE', 'Extinguisher_Nozzle_AR', true, 1300, 0);
      setFeedback({ message: 'P.A.S.S. [2/4] Nozzle Aimed at Base! Now squeeze discharge handle.', isError: false });
    } else if (action === 'SQUEEZE') {
      if (!passState.pinPulled) {
        const deduction = 10;
        setScore((prev) => Math.max(0, prev - deduction));
        setMistakes((prev) => [...prev, 'Attempted to squeeze extinguisher handle without pulling pin']);
        logAction('step-fire-6-pass', 'SQUEEZE_HANDLE', 'Extinguisher_Lever_AR', false, 2000, deduction);
        setFeedback({ message: 'ERROR: Cannot squeeze handle while pin is locked! (-10 PTS)', isError: true });
        return;
      }
      if (!passState.aimed) {
        setFeedback({ message: 'MISTAKE: Must aim nozzle at fire base before squeezing handle!', isError: true });
        return;
      }
      setPassState((prev) => ({ ...prev, squeezed: true }));
      logAction('step-fire-6-pass', 'SQUEEZE_HANDLE', 'Extinguisher_Lever_AR', true, 1500, 0);
      setFeedback({ message: 'P.A.S.S. [3/4] Agent Discharging! Sweep side to side 3 times.', isError: false });
    } else if (action === 'SWEEP') {
      if (!passState.squeezed) {
        setFeedback({ message: 'MISTAKE: Squeeze handle first before sweeping!', isError: true });
        return;
      }
      const newSweeps = passState.sweepsCompleted + 1;
      setPassState((prev) => ({ ...prev, sweepsCompleted: newSweeps }));
      logAction('step-fire-6-pass', 'SWEEP_BASE', 'Extinguisher_Nozzle_AR', true, 1200, 0);

      if (newSweeps >= 3) {
        setFeedback({
          message: 'P.A.S.S. [4/4] COMPLETE: Flame 100% extinguished! Proceed to evacuation exit. +25 Points',
          isError: false,
        });
        setTimeout(() => setCurrentStep(7), 1200);
      } else {
        setFeedback({ message: `Sweeping flame base... (${newSweeps}/3 sweeps)`, isError: false });
      }
    }
  };

  // Step 7: Evacuation (+25)
  const handleEvacuate = () => {
    setIsEvacuated(true);
    logAction('step-fire-7-evacuate', 'EVACUATE_EXIT', 'EmergencyExit_AR', true, 2400, 0);
    setFeedback({
      message: 'EVACUATION COMPLETE: Emergency escape shaft reached safely! +25 Points',
      isError: false,
    });
    setTimeout(() => setCurrentStep(8), 1200);
  };

  // Automated Test Runs
  const runAutoTest = (pathType: 'CORRECT' | 'INCORRECT') => {
    resetDrill();
    setTimeout(() => {
      // Step 1
      handleAcknowledgeBriefing();
      // Step 2
      setTimeout(() => {
        handlePlaceEnvironment();
        // Step 3
        setTimeout(() => {
          handleIdentifyHazard(true);
          // Step 4
          setTimeout(() => {
            handleActivateAlarm();
            // Step 5
            setTimeout(() => {
              if (pathType === 'INCORRECT') {
                // Mistake 1: Water extinguisher (-15)
                handleSelectExtinguisher('WATER');
                // Select Dry powder afterwards to continue
                setTimeout(() => {
                  handleSelectExtinguisher('DRY_POWDER');
                  // Step 6: Out of order mistake (-10)
                  setTimeout(() => {
                    handlePASSAction('SQUEEZE'); // Mistake: squeeze without pull (-10)
                    setTimeout(() => {
                      handlePASSAction('PULL');
                      handlePASSAction('AIM');
                      handlePASSAction('SQUEEZE');
                      handlePASSAction('SWEEP');
                      handlePASSAction('SWEEP');
                      handlePASSAction('SWEEP');
                      setTimeout(() => {
                        handleEvacuate();
                      }, 500);
                    }, 400);
                  }, 400);
                }, 500);
              } else {
                // Correct Path
                handleSelectExtinguisher('DRY_POWDER');
                setTimeout(() => {
                  handlePASSAction('PULL');
                  handlePASSAction('AIM');
                  handlePASSAction('SQUEEZE');
                  handlePASSAction('SWEEP');
                  handlePASSAction('SWEEP');
                  handlePASSAction('SWEEP');
                  setTimeout(() => {
                    handleEvacuate();
                  }, 500);
                }, 400);
              }
            }, 400);
          }, 400);
        }, 400);
      }, 400);
    }, 200);
  };

  // Sync to Backend
  const handleSyncToBackend = async () => {
    setIsSyncing(true);
    try {
      const payload = {
        workerId: 'wrk-001', // Birsa Munda
        scenarioId: 'scen-fire-01',
        startTime: new Date(Date.now() - 120000).toISOString(),
        endTime: new Date().toISOString(),
        durationSeconds: 115,
        score: score,
        passed: score >= passingThreshold,
        isOffline: false,
        deviceFingerprint: 'arcore-samsung-sm-g998b-jh01',
        deviceModel: 'Samsung Galaxy Tab Active4 Pro (Industrial Rugged AR)',
        actions: actionLog,
      };

      const res = await api.attempts.record(payload);
      setSyncResult(res);
      setFeedback({ message: 'Session telemetry synced to DGMS registry!', isError: false });
      if (onAttemptSynced) onAttemptSynced();
    } catch (err: any) {
      setFeedback({ message: `Sync failed: ${err.message}`, isError: true });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-industrial-surface border border-industrial-border rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-4 bg-industrial-elevated border-b border-industrial-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-950/60 border border-red-700/50 flex items-center justify-center text-red-400">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">
                  AR Fire & Explosion Response Drill Simulator
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-safety-orange/20 text-safety-orange border border-safety-orange/40 font-bold">
                  PHASE 5 INTERACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                DGMS Standardized Drill • Coal Face Methane Flare Suppression
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-industrial-surface rounded border border-industrial-border p-0.5 text-xs font-mono">
              <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              <button
                onClick={() => setSelectedLang('en')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  selectedLang === 'en' ? 'bg-safety-orange text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setSelectedLang('hi')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  selectedLang === 'hi' ? 'bg-safety-orange text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                HI
              </button>
              <button
                onClick={() => setSelectedLang('sat')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  selectedLang === 'sat' ? 'bg-safety-orange text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SAT
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 p-1 rounded hover:bg-industrial-surface"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* HUD Top Bar */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-industrial-bg/80 border-b border-industrial-border/60 text-xs">
          <div className="flex items-center justify-between px-3 py-1.5 rounded bg-industrial-elevated border border-industrial-border">
            <span className="text-slate-400 font-mono text-[11px]">STEP</span>
            <span className="font-bold font-mono text-safety-orange">{currentStep} / 8</span>
          </div>

          <div className="flex items-center justify-between px-3 py-1.5 rounded bg-industrial-elevated border border-industrial-border">
            <span className="text-slate-400 font-mono text-[11px]">LIVE SCORE</span>
            <span
              className={`font-bold font-mono text-sm ${
                score >= passingThreshold ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {score} / 100
            </span>
          </div>

          <div className="flex items-center justify-between px-3 py-1.5 rounded bg-industrial-elevated border border-industrial-border">
            <span className="text-slate-400 font-mono text-[11px]">PASS THRESHOLD</span>
            <span className="font-bold font-mono text-slate-300">{passingThreshold}%</span>
          </div>

          <div className="flex items-center justify-between px-3 py-1.5 rounded bg-industrial-elevated border border-industrial-border">
            <span className="text-slate-400 font-mono text-[11px]">MISTAKES</span>
            <span
              className={`font-bold font-mono ${
                mistakes.length === 0 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {mistakes.length} Logged
            </span>
          </div>
        </div>

        {/* Regulatory Disclaimer Banner */}
        <div className="px-4 py-2 bg-amber-950/30 border-b border-amber-800/40 text-[11px] text-amber-300/90 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>STATUTORY MANDATE:</strong> This AR drill reinforces statutory mine safety protocols under DGMS Circular 04 of 2024. It does not replace physical underground pit evacuation drills.
          </span>
        </div>

        {/* Interactive Viewport Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Step Instruction Card */}
          <div className="p-4 rounded-lg bg-industrial-elevated border border-industrial-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-safety-orange">
                Step {currentStep} Active Objective
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {currentStep === 1 && 'Weight: Briefing • 0 Pts'}
                {currentStep === 2 && 'Weight: AR Placement • 0 Pts'}
                {currentStep === 3 && 'Weight: Hazard Identification • +20 Pts'}
                {currentStep === 4 && 'Weight: Alarm Activation • +15 Pts'}
                {currentStep === 5 && 'Weight: Equipment Selection • +15 Pts'}
                {currentStep === 6 && 'Weight: P.A.S.S. Suppression • +25 Pts'}
                {currentStep === 7 && 'Weight: Evacuation Route • +25 Pts'}
                {currentStep === 8 && 'Weight: Final Assessment Sync'}
              </span>
            </div>

            <div className="text-sm font-semibold text-slate-100">
              {currentStep === 1 && 'Fire Emergency Training Briefing'}
              {currentStep === 2 && 'Environment & Hazard Surface Setup'}
              {currentStep === 3 && 'Hazard Identification (+20 Points)'}
              {currentStep === 4 && 'Emergency Alarm Activation (+15 Points)'}
              {currentStep === 5 && 'Extinguisher Selection (+15 Points)'}
              {currentStep === 6 && 'Interactive P.A.S.S. Suppression Procedure (+25 Points)'}
              {currentStep === 7 && 'Emergency Evacuation Route (+25 Points)'}
              {currentStep === 8 && 'Assessment Completion & Cloud Sync'}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {selectedLang === 'en' && (
                <>
                  {currentStep === 1 &&
                    'Welcome to Fire Emergency Training. This is a simulated training environment designed to reinforce DGMS emergency protocols.'}
                  {currentStep === 2 &&
                    'Scan floor surface using AR camera and tap the placement reticle to deploy simulated hazard, alarm, and extinguishers.'}
                  {currentStep === 3 &&
                    'A methane ignition has occurred at the coal face! Locate and tap directly on the active fire zone.'}
                  {currentStep === 4 &&
                    'Activate the emergency alarm pull station immediately to alert the mine ventilation station.'}
                  {currentStep === 5 &&
                    'Review extinguisher choices (Water, CO2, Dry Powder). Select the correct Class D / ABC Dry Chemical unit.'}
                  {currentStep === 6 &&
                    'Execute mandatory 4-step sequence: [1] Pull safety pin, [2] Aim nozzle at base, [3] Squeeze lever, [4] Sweep side to side.'}
                  {currentStep === 7 &&
                    'Suppression verified. Orient camera toward the green illuminated Emergency Escape Shaft Exit.'}
                  {currentStep === 8 &&
                    'Drill completed. Review competency breakdown, actions log, and sync to Jharkhand safety registry.'}
                </>
              )}
              {selectedLang === 'hi' && (
                <>
                  {currentStep === 1 &&
                    'अग्नि आपातकालीन प्रशिक्षण में आपका स्वागत है। यह एक सिम्युलेटेड प्रशिक्षण वातावरण है जो डीजीएमएस प्रोटोकॉल को मजबूत करता है।'}
                  {currentStep === 2 &&
                    'फर्श को स्कैन करें और सिम्युलेटेड आग, अलार्म और अग्निशामक रैक को स्थापित करने के लिए टैप करें।'}
                  {currentStep === 3 &&
                    'कोयला कटिंग फेस पर आग भड़क गई है! सक्रिय अग्नि क्षेत्र का पता लगाएं और सीधे उस पर टैप करें (+20 अंक)।'}
                  {currentStep === 4 &&
                    'पिटहेड को सचेत करने के लिए लाल आपातकालीन अलार्म स्टेशन ढूंढें और अलार्म बजाएं (+15 अंक)।'}
                  {currentStep === 5 &&
                    'अग्निशामक विकल्पों (पानी, CO2, सूखा पाउडर) में से सही क्लास डी सूखा पाउडर चुनें (+15 अंक)।'}
                  {currentStep === 6 &&
                    'P.A.S.S. क्रम पूरा करें: [1] पिन खींचें, [2] नोजल जड़ पर रखें, [3] लीवर दबाएं, [4] क्षैतिज रूप से झाड़ू लगाएं (+25 अंक)।'}
                  {currentStep === 7 &&
                    'आग बुझ गई है। पीछे मुड़ें और हरे रंग के आपातकालीन निकास शाफ्ट की ओर बढ़ें (+25 अंक)।'}
                  {currentStep === 8 &&
                    'प्रशिक्षण पूरा हुआ। योग्यता रिपोर्ट की समीक्षा करें और डेटा सिंक करें।'}
                </>
              )}
              {selectedLang === 'sat' && (
                <>
                  {currentStep === 1 &&
                    'ᱥᱮᱸᱜᱮᱞ ᱟᱯᱚᱛᱠᱟᱞᱤᱱ ᱴᱨᱮᱱᱤᱝ ᱨᱮ ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ᱾ ᱱᱚᱣᱟ ᱫᱚ ᱢᱤᱫ ᱥᱤᱢᱩᱞᱮᱴᱮᱰ ᱴᱨᱮᱱᱤᱝ ᱠᱟᱱᱟ (Simulated fire training briefing).'}
                  {currentStep === 2 &&
                    'ᱚᱛ ᱯᱟᱥᱱᱟᱣ ᱧᱮᱞ ᱢᱮ ᱟᱨ ᱥᱮᱸᱜᱮᱞ, ᱟᱞᱟᱨᱢ, ᱟᱨ ᱵᱟᱦᱨᱮ ᱚᱰᱚᱠᱚᱜ ᱫᱩᱣᱟᱹᱨ ᱫᱚᱦᱚᱭ ᱢᱮ (Deploy AR fire scene).'}
                  {currentStep === 3 &&
                    'ᱠᱚᱭᱞᱟ ᱵᱷᱤᱛᱨᱤ ᱨᱮ ᱥᱮᱸᱜᱮᱞ ᱡᱩᱞ ᱮᱱᱟ! ᱥᱮᱸᱜᱮᱞ ᱧᱮᱞ ᱠᱟᱛᱮ ᱴᱤᱯ ᱢᱮ (+20 Points).'}
                  {currentStep === 4 &&
                    'ᱟᱞᱟᱨᱢ ᱪᱟᱹᱞᱩᱭ ᱢᱮ: ᱟᱨᱟᱜ ᱟᱯᱚᱛᱠᱟᱞᱤᱱ ᱥᱩᱭᱤᱪ ᱚᱨ ᱟᱬᱜᱚᱭ ᱢᱮ (+15 Points).'}
                  {currentStep === 5 &&
                    'ᱫᱟᱜ, CO2 ᱟᱨ ᱥᱩᱠᱷᱟ ᱯᱟᱣᱰᱟᱨ ᱢᱩᱫᱽ ᱨᱮ ᱴᱷᱤᱠ ᱯᱟᱣᱰᱟᱨ ᱢᱤᱥᱤᱱ ᱵᱟᱪᱷᱟᱣ ᱢᱮ (+15 Points).'}
                  {currentStep === 6 &&
                    'P.A.S.S. ᱱᱤᱭᱚᱢ: [1] ᱯᱤᱱ ᱚᱨ, [2] ᱱᱚᱡᱚᱞ ᱫᱚᱦᱚ, [3] ᱞᱤᱵᱷᱚᱨ ᱚᱛᱟ, [4] ᱪᱷᱤᱴᱠᱟᱹᱣ (+25 Points).'}
                  {currentStep === 7 &&
                    'ᱦᱟᱹᱨᱭᱟᱹᱲ ᱡᱩᱞᱩᱜ ᱠᱟᱱ ᱵᱟᱦᱨᱮ ᱚᱰᱚᱠᱚᱜ ᱫᱩᱣᱟᱹᱨ ᱥᱮᱱ ᱢᱚᱦᱰᱟᱜ ᱢᱮ (+25 Points).'}
                  {currentStep === 8 &&
                    'ᱴᱨᱮᱱᱤᱝ ᱯᱩᱨᱟᱹᱣ ᱮᱱᱟ᱾ ᱥᱚᱨᱠᱟᱨᱤ ᱨᱮᱠᱚᱨᱰ ᱨᱮ ᱥᱤᱝᱠ ᱦᱩᱭ ᱮᱱᱟ (Assessment completed).'}
                </>
              )}
            </p>
          </div>

          {/* Feedback Toast */}
          {feedback && (
            <div
              className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
                feedback.isError
                  ? 'bg-red-950/50 border-red-800 text-red-300'
                  : 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
              }`}
            >
              {feedback.isError ? (
                <XCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Step 1 View */}
          {currentStep === 1 && (
            <div className="p-6 bg-industrial-bg rounded-lg border border-industrial-border text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-950/60 border border-red-700/50 mx-auto flex items-center justify-center text-red-400">
                <Flame className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-100">
                Industrial Fire & Explosion Emergency Drill
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                You will practice identifying methane flare hazards, activating pit alarms, selecting the correct chemical suppression equipment, executing the strict 4-step P.A.S.S. sequence, and emergency route evacuation.
              </p>
              <button
                onClick={handleAcknowledgeBriefing}
                className="px-6 py-2.5 bg-safety-orange hover:bg-safety-orange-hover text-white rounded-lg font-bold text-xs shadow-lg transition-all"
              >
                Acknowledge Briefing & Begin Drill
              </button>
            </div>
          )}

          {/* Step 2 View: Placement */}
          {currentStep === 2 && (
            <div className="p-6 bg-industrial-bg rounded-lg border border-industrial-border text-center space-y-4">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-safety-orange mx-auto flex items-center justify-center text-safety-orange animate-spin">
                <Compass className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-slate-100">Surface Detection & Reticle Alignment</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Horizontal plane detected at distance 1.8m. Tap below to anchor the simulated coal seam flare, warning boundary, alarm station, and extinguisher rack.
              </p>
              <button
                onClick={handlePlaceEnvironment}
                className="px-6 py-2.5 bg-safety-orange hover:bg-safety-orange-hover text-white rounded-lg font-bold text-xs shadow-lg transition-all"
              >
                {isEnvironmentPlaced ? 'Environment Deployed' : 'Tap Reticle to Deploy AR Environment'}
              </button>
            </div>
          )}

          {/* Step 3 View: Hazard Identification */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => handleIdentifyHazard(true)}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all text-center space-y-3 ${
                    isHazardIdentified
                      ? 'bg-emerald-950/40 border-emerald-500'
                      : 'bg-red-950/30 border-red-500/80 hover:border-red-400 hover:scale-[1.02]'
                  }`}
                >
                  <Flame className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
                  <div>
                    <h5 className="text-sm font-bold text-slate-100">Active Methane Flame Hazard</h5>
                    <p className="text-[11px] text-red-300">Coal face cutting ignition • Perimeter caution zone active</p>
                  </div>
                  <span className="inline-block px-3 py-1 bg-red-600/30 text-red-300 text-xs font-bold rounded">
                    TAP TO IDENTIFY HAZARD (+20 PTS)
                  </span>
                </div>

                <div
                  onClick={() => handleIdentifyHazard(false)}
                  className="p-6 rounded-lg border border-industrial-border bg-industrial-surface hover:border-slate-500 cursor-pointer transition-all text-center space-y-3"
                >
                  <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto" />
                  <div>
                    <h5 className="text-sm font-bold text-slate-300">Ventilation Duct Support</h5>
                    <p className="text-[11px] text-slate-500">Non-combustible steel framing</p>
                  </div>
                  <span className="inline-block px-3 py-1 bg-slate-800 text-slate-400 text-xs rounded">
                    Inspect Target (Distractor)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 View: Alarm */}
          {currentStep === 4 && (
            <div className="p-6 bg-industrial-bg rounded-lg border border-industrial-border text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-600/30 border border-red-500 mx-auto flex items-center justify-center text-red-400 animate-pulse">
                <Bell className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-100">Pithead Emergency Alarm Pull Station</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Safety regulations mandate triggering the alarm BEFORE attempting fire suppression.
              </p>
              <button
                onClick={handleActivateAlarm}
                disabled={isAlarmActivated}
                className={`px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-wider shadow-lg transition-all ${
                  isAlarmActivated
                    ? 'bg-emerald-700 text-white cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                }`}
              >
                {isAlarmActivated ? 'ALARM ENGAGED (+15 PTS)' : 'PULL EMERGENCY ALARM LEVER (+15 PTS)'}
              </button>
            </div>
          )}

          {/* Step 5 View: Extinguisher Selection */}
          {currentStep === 5 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase text-slate-400 font-bold">
                  Select Correct Training Equipment (Class D / ABC Dry Powder Required):
                </h4>
                {selectedExtinguisher && (
                  <span className="text-[10px] font-mono text-safety-orange font-bold">
                    Selected: {selectedExtinguisher}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {/* Option 1: Water */}
                <div
                  onClick={() => handleSelectExtinguisher('WATER')}
                  className="p-4 rounded-lg border border-industrial-border bg-industrial-surface hover:border-red-500 cursor-pointer text-center space-y-2"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-950/60 border border-blue-600 mx-auto flex items-center justify-center text-blue-400 font-mono font-bold text-xs">
                    H2O
                  </div>
                  <h5 className="text-xs font-bold text-slate-200">Water Extinguisher</h5>
                  <span className="text-[10px] text-slate-400 block">Class A Only</span>
                  <span className="text-[10px] text-red-400 font-semibold block">Violates DGMS Rule 12</span>
                </div>

                {/* Option 2: CO2 */}
                <div
                  onClick={() => handleSelectExtinguisher('CO2')}
                  className="p-4 rounded-lg border border-industrial-border bg-industrial-surface hover:border-amber-500 cursor-pointer text-center space-y-2"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-600 mx-auto flex items-center justify-center text-slate-300 font-mono font-bold text-xs">
                    CO2
                  </div>
                  <h5 className="text-xs font-bold text-slate-200">Carbon Dioxide</h5>
                  <span className="text-[10px] text-slate-400 block">Class B/C Electrical</span>
                  <span className="text-[10px] text-amber-400 font-semibold block">Ineffective on Coal</span>
                </div>

                {/* Option 3: Dry Powder (Correct) */}
                <div
                  onClick={() => handleSelectExtinguisher('DRY_POWDER')}
                  className="p-4 rounded-lg border-2 border-safety-orange bg-safety-orange/10 hover:bg-safety-orange/20 cursor-pointer text-center space-y-2"
                >
                  <div className="w-10 h-10 rounded-full bg-red-950 border border-safety-orange mx-auto flex items-center justify-center text-safety-orange font-mono font-bold text-xs">
                    ABC
                  </div>
                  <h5 className="text-xs font-bold text-slate-100">Dry Chemical Powder</h5>
                  <span className="text-[10px] text-slate-300 block">Class D / ABC Industrial</span>
                  <span className="text-[10px] text-emerald-400 font-bold block">+15 PTS (CORRECT)</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 6 View: Interactive P.A.S.S. */}
          {currentStep === 6 && (
            <div className="space-y-4 p-5 bg-industrial-bg rounded-lg border border-industrial-border">
              <div className="flex items-center justify-between border-b border-industrial-border pb-3">
                <span className="text-xs font-bold text-slate-100">
                  P.A.S.S. Interactive Suppression Sequence
                </span>
                <span className="text-xs font-mono text-safety-orange font-bold">
                  Progress: {passState.sweepsCompleted >= 3 ? '4 / 4 Complete' : passState.squeezed ? '3 / 4' : passState.aimed ? '2 / 4' : passState.pinPulled ? '1 / 4' : '0 / 4'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {/* 1. PULL */}
                <button
                  onClick={() => handlePASSAction('PULL')}
                  disabled={passState.pinPulled}
                  className={`p-3 rounded border text-left transition-all ${
                    passState.pinPulled
                      ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                      : 'bg-industrial-surface border-industrial-border hover:border-safety-orange text-slate-200'
                  }`}
                >
                  <span className="text-lg font-bold block">[P] PULL</span>
                  <span className="text-[10px] text-slate-400">Pull safety pin</span>
                  {passState.pinPulled && <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1" />}
                </button>

                {/* 2. AIM */}
                <button
                  onClick={() => handlePASSAction('AIM')}
                  disabled={!passState.pinPulled || passState.aimed}
                  className={`p-3 rounded border text-left transition-all ${
                    passState.aimed
                      ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                      : !passState.pinPulled
                      ? 'bg-industrial-surface/50 border-industrial-border text-slate-500 cursor-not-allowed'
                      : 'bg-industrial-surface border-industrial-border hover:border-safety-orange text-slate-200'
                  }`}
                >
                  <span className="text-lg font-bold block">[A] AIM</span>
                  <span className="text-[10px] text-slate-400">Aim nozzle at base</span>
                  {passState.aimed && <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1" />}
                </button>

                {/* 3. SQUEEZE */}
                <button
                  onClick={() => handlePASSAction('SQUEEZE')}
                  disabled={passState.squeezed}
                  className={`p-3 rounded border text-left transition-all ${
                    passState.squeezed
                      ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                      : 'bg-industrial-surface border-industrial-border hover:border-safety-orange text-slate-200'
                  }`}
                >
                  <span className="text-lg font-bold block">[S] SQUEEZE</span>
                  <span className="text-[10px] text-slate-400">Squeeze trigger lever</span>
                  {passState.squeezed && <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1" />}
                </button>

                {/* 4. SWEEP */}
                <button
                  onClick={() => handlePASSAction('SWEEP')}
                  disabled={!passState.squeezed || passState.sweepsCompleted >= 3}
                  className={`p-3 rounded border text-left transition-all ${
                    passState.sweepsCompleted >= 3
                      ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                      : !passState.squeezed
                      ? 'bg-industrial-surface/50 border-industrial-border text-slate-500 cursor-not-allowed'
                      : 'bg-industrial-surface border-industrial-border hover:border-safety-orange text-slate-200'
                  }`}
                >
                  <span className="text-lg font-bold block">[S] SWEEP</span>
                  <span className="text-[10px] text-slate-400">
                    Sweep {passState.sweepsCompleted}/3 arcs
                  </span>
                  {passState.sweepsCompleted >= 3 && <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1" />}
                </button>
              </div>
            </div>
          )}

          {/* Step 7 View: Evacuation */}
          {currentStep === 7 && (
            <div className="p-6 bg-industrial-bg rounded-lg border border-industrial-border text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500 mx-auto flex items-center justify-center text-emerald-400 animate-pulse">
                <Compass className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-100">
                Suppression Successful • Emergency Escape Shaft
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Turn camera 180 degrees to identify green illuminated escape shaft markers and orient toward egress route.
              </p>
              <button
                onClick={handleEvacuate}
                disabled={isEvacuated}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
              >
                ORIENT & MOVE TO EMERGENCY EXIT (+25 PTS)
              </button>
            </div>
          )}

          {/* Step 8 View: Summary & Sync */}
          {currentStep === 8 && (
            <div className="space-y-4 p-5 bg-industrial-bg rounded-lg border border-industrial-border">
              <div className="flex items-center justify-between border-b border-industrial-border pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-safety-orange" />
                  <h4 className="text-sm font-bold text-slate-100">Drill Competency Scorecard</h4>
                </div>
                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded ${
                    score >= passingThreshold
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}
                >
                  {score >= passingThreshold ? 'STATUS: PASSED' : 'STATUS: RETAKE REQUIRED'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-industrial-elevated rounded border border-industrial-border">
                  <span className="text-[10px] text-slate-500 uppercase block">Final Score</span>
                  <span className="text-base font-mono font-bold text-slate-100">{score}%</span>
                </div>
                <div className="p-3 bg-industrial-elevated rounded border border-industrial-border">
                  <span className="text-[10px] text-slate-500 uppercase block">Pass Benchmark</span>
                  <span className="text-base font-mono font-bold text-slate-100">{passingThreshold}%</span>
                </div>
                <div className="p-3 bg-industrial-elevated rounded border border-industrial-border">
                  <span className="text-[10px] text-slate-500 uppercase block">Mistakes Recorded</span>
                  <span className="text-base font-mono font-bold text-amber-400">{mistakes.length}</span>
                </div>
                <div className="p-3 bg-industrial-elevated rounded border border-industrial-border">
                  <span className="text-[10px] text-slate-500 uppercase block">Actions Logged</span>
                  <span className="text-base font-mono font-bold text-sky-400">{actionLog.length}</span>
                </div>
              </div>

              {/* Mistakes Breakdown */}
              {mistakes.length > 0 && (
                <div className="p-3 rounded bg-red-950/20 border border-red-900/50 space-y-1">
                  <span className="text-[11px] font-bold text-red-400 uppercase tracking-wide block">
                    Recorded Safety Violations:
                  </span>
                  <ul className="text-xs text-red-300 list-disc list-inside space-y-0.5">
                    {mistakes.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sync Button & Output */}
              {syncResult ? (
                <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Attempt Recorded & Verified with DGMS Cloud Registry</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 space-y-1">
                    <div>Attempt ID: {syncResult.attemptId}</div>
                    <div>Worker: {syncResult.workerName}</div>
                    {syncResult.certificate && (
                      <div className="text-emerald-300 font-bold">
                        Certificate Issued: {syncResult.certificate.certNumber} (2-Year DGMS Compliance)
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSyncToBackend}
                  disabled={isSyncing}
                  className="w-full py-3 bg-safety-orange hover:bg-safety-orange-hover text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  {isSyncing ? 'Submitting to DGMS Cloud Registry...' : 'Save & Sync Attempt Telemetry'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Automated Test Controls */}
        <div className="p-4 bg-industrial-elevated border-t border-industrial-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">AUTOMATED PATH TESTS:</span>
            <button
              onClick={() => runAutoTest('CORRECT')}
              className="px-3 py-1.5 rounded bg-emerald-950/60 border border-emerald-700 text-emerald-300 hover:bg-emerald-900/60 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              Test Correct Path (100%)
            </button>
            <button
              onClick={() => runAutoTest('INCORRECT')}
              className="px-3 py-1.5 rounded bg-red-950/60 border border-red-700 text-red-300 hover:bg-red-900/60 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              Test Incorrect Path (Mistakes / 75%)
            </button>
          </div>

          <button
            onClick={resetDrill}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-industrial-surface border border-industrial-border text-slate-300 hover:bg-industrial-hover"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart Drill
          </button>
        </div>
      </div>
    </div>
  );
};
