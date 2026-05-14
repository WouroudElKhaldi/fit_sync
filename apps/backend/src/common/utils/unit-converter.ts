export class UnitConverter {
  static KG_TO_LB = 2.20462;
  static CM_TO_IN = 0.393701;

  static kgToLb(kg: number): number {
    return kg * this.KG_TO_LB;
  }

  static lbToKg(lb: number): number {
    return lb / this.KG_TO_LB;
  }

  static cmToIn(cm: number): number {
    return cm * this.CM_TO_IN;
  }

  static inToCm(inch: number): number {
    return inch / this.CM_TO_IN;
  }

  /**
   * Normalizes weight to KG for consistent volume tracking
   */
  static normalizeWeight(weight: number, unit: 'KG' | 'LB'): number {
    if (unit === 'LB') {
      return this.lbToKg(weight);
    }
    return weight;
  }
}
