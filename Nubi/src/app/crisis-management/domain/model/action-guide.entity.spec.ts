import { ActionGuide } from './action-guide.entity';
import { ContainmentStep } from './containment-step.entity';
import { SensitivityLevel, SensoryProfileSnapshot } from './sensory-profile-snapshot';
import { SensoryTrigger } from './sos-session.enums';

const step = (stepOrder: number, relatedTrigger: SensoryTrigger) =>
  new ContainmentStep(stepOrder, 1, stepOrder, `STEP_${stepOrder}`, false, relatedTrigger, []);

// Los pasos llegan desordenados a propósito: stepOrder manda dentro de cada grupo
const guide = new ActionGuide(1, 1, true, [
  step(3, SensoryTrigger.NONE),
  step(2, SensoryTrigger.TACTILE),
  step(4, SensoryTrigger.AUDITORY),
  step(1, SensoryTrigger.NONE),
]);

const profile = (auditory: SensitivityLevel, visual: SensitivityLevel, tactile: SensitivityLevel) =>
  new SensoryProfileSnapshot(1, auditory, visual, tactile);

describe('ActionGuide', () => {
  it('prioriza los pasos de la sensibilidad más alta y respeta stepOrder en cada grupo', () => {
    const ordered = guide.orderedStepsFor(
      profile(SensitivityLevel.HIGH, SensitivityLevel.MEDIUM, SensitivityLevel.LOW),
    );

    expect(ordered.map((s) => s.stepOrder)).toEqual([4, 1, 2, 3]);
  });

  it('usa la guía genérica cuando el perfil no tiene sensibilidades', () => {
    const snapshot = profile(SensitivityLevel.LOW, SensitivityLevel.LOW, SensitivityLevel.LOW);

    expect(snapshot.hasSensitivities()).toBe(false);
    expect(guide.orderedStepsFor(snapshot).map((s) => s.stepOrder)).toEqual([1, 2, 3, 4]);
  });

  it('desempata entre sentidos con la misma sensibilidad en el orden auditivo, visual, táctil', () => {
    const snapshot = profile(
      SensitivityLevel.MEDIUM,
      SensitivityLevel.MEDIUM,
      SensitivityLevel.HIGH,
    );

    expect(snapshot.highestSensitivity()).toBe(SensoryTrigger.TACTILE);
    expect(
      profile(
        SensitivityLevel.MEDIUM,
        SensitivityLevel.MEDIUM,
        SensitivityLevel.MEDIUM,
      ).highestSensitivity(),
    ).toBe(SensoryTrigger.AUDITORY);
  });
});
