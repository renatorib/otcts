import { FileInput } from "../file/FileInput";
import { FileOutput } from "../file/FileOutput";

export class Animator {
  animationPhases = 0;
  startPhase = 0;
  loopCount = 0;
  async = false;
  phaseDurations: number[][] = [];

  getPhaseDuration(phase = 0) {
    const durations = this.phaseDurations[phase];

    if (durations) {
      // TODO: understand what sprites have different min/max
      const min = durations[0];
      const _max = durations[1];
      return min;
    }

    return 200;
  }

  getDuration() {
    return this.phaseDurations
      .map((_, phase) => this.getPhaseDuration(phase))
      .reduce((a, b) => a + b);
  }

  getCurrentPhase(elapsedTimeMS: number) {
    let time = Math.floor(elapsedTimeMS) % this.getDuration();

    for (let phaseIndex = 0; phaseIndex < this.animationPhases; phaseIndex++) {
      time -= this.getPhaseDuration(phaseIndex);
      if (time <= 0) return phaseIndex;
    }

    return 0;
  }

  unserialize(animationPhases: number, fin: FileInput) {
    this.animationPhases = animationPhases;
    this.async = fin.getU8() == 0;
    this.loopCount = fin.get32();
    this.startPhase = fin.get8();

    for (let i = 0; i < this.animationPhases; ++i) {
      let minimum = fin.getU32();
      let maximum = fin.getU32();
      this.phaseDurations.push([minimum, maximum]);
    }
  }

  serialize(fout: FileOutput) {
    fout.addU8(this.async ? 0 : 1);
    fout.add32(this.loopCount);
    fout.add8(this.startPhase);

    for (const phase of this.phaseDurations) {
      fout.addU32(phase[0]);
      fout.addU32(phase[1]);
    }
  }
}
