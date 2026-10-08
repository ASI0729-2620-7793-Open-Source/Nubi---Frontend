import { ContainmentStep } from './containment-step.entity';
import { MandatoryStepNotConfirmedError, SosSession } from './sos-session.entity';
import {
  CrisisIntensity,
  ObservedState,
  SensoryTrigger,
  SosSessionStatus,
} from './sos-session.enums';

const step = (id: number, mandatory = false) =>
  new ContainmentStep(id, 1, id, `STEP_${id}`, mandatory, SensoryTrigger.NONE, []);

const steps = [step(1, true), step(2), step(3)];

const newSession = () =>
  new SosSession(
    1,
    1,
    1,
    1,
    SosSessionStatus.IN_PROGRESS,
    1,
    CrisisIntensity.ALTERED,
    null,
    SensoryTrigger.AUDITORY,
    null,
    new Date('2026-10-08T10:00:00Z'),
    null,
    [],
  );

describe('SosSession', () => {
  it('registra el paso completado y avanza al siguiente', () => {
    const session = newSession().completeStep(steps[0], steps[1]);

    expect(session.currentStepOrder).toBe(2);
    expect(session.completedSteps.map((c) => [c.stepId, c.skipped])).toEqual([[1, false]]);
  });

  it('no registra dos veces el mismo paso', () => {
    const session = newSession().completeStep(steps[0], steps[1]);

    expect(session.completeStep(steps[0], steps[1])).toBe(session);
  });

  it('exige confirmación explícita para omitir un paso obligatorio', () => {
    expect(() => newSession().skipStep(steps[0], steps[1], false)).toThrow(
      MandatoryStepNotConfirmedError,
    );

    const skipped = newSession().skipStep(steps[0], steps[1], true);
    expect(skipped.completedSteps[0].skipped).toBe(true);
  });

  it('omite un paso no obligatorio sin confirmación', () => {
    const session = newSession().skipStep(steps[1], steps[2], false);

    expect(session.completedSteps[0].skipped).toBe(true);
    expect(session.currentStepOrder).toBe(3);
  });

  it('finaliza con todos los pasos atendidos', () => {
    const finished = newSession()
      .completeStep(steps[0], steps[1])
      .completeStep(steps[1], steps[2])
      .skipStep(steps[2], null, false)
      .finish(steps.length, ObservedState.CALM, new Date('2026-10-08T10:12:00Z'));

    expect(finished.status).toBe(SosSessionStatus.FINISHED);
    expect(finished.finalIntensity).toBe(CrisisIntensity.CALM);
    expect(finished.durationMinutes()).toBe(12);
  });

  it('finaliza anticipadamente si quedaron pasos sin atender', () => {
    const finished = newSession()
      .completeStep(steps[0], steps[1])
      .finish(steps.length, null, new Date('2026-10-08T10:05:00Z'));

    expect(finished.status).toBe(SosSessionStatus.FINISHED_EARLY);
    expect(finished.finalIntensity).toBeNull();
  });

  it('no cambia una sesión que ya terminó', () => {
    const finished = newSession().finish(steps.length, null);

    expect(finished.finish(steps.length, ObservedState.IRRITABLE)).toBe(finished);
    expect(finished.completeStep(steps[0], steps[1])).toBe(finished);
  });

  it('cuenta al menos un minuto de duración', () => {
    const finished = newSession().finish(steps.length, null, new Date('2026-10-08T10:00:10Z'));

    expect(finished.durationMinutes()).toBe(1);
  });
});
