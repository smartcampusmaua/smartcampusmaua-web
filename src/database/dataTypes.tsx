class Alarme {
  id: number;
  userId: number;
  type: string; // Smartlight
  local: string;
  deveui: string;
  trigger: string;
  triggerAt: string; // higher / lower than trigger
  triggerType: string; // boardVoltage
  alreadyPlayed: boolean;

  constructor(id: number, userId: number, type: string, local: string, deveui: string, trigger: string, triggerAt: string, triggerType: string, alreadyPlayed: boolean) {
    this.id = id;
    this.userId = userId;
    this.deveui = deveui;
    this.trigger = trigger;
    this.triggerAt = triggerAt;
    this.triggerType = triggerType;
    this.local = local;
    this.type = type;
    this.alreadyPlayed = alreadyPlayed;
  }
}

class AlarmeValue {
  id: number;
  userId: number;
  type: string; // Smartlight
  local: string;
  deveui: string;
  trigger: string;
  triggerAt: string; // higher / lower than trigger
  triggerType: string; // boardVoltage
  alreadyPlayed: boolean;
  currentValue: number

  constructor(id: number, userId: number, type: string, local: string, deveui: string, trigger: string, triggerAt: string, triggerType: string, alreadyPlayed: boolean, currentValue: number) {
    this.id = id;
    this.userId = userId;
    this.deveui = deveui;
    this.trigger = trigger;
    this.triggerAt = triggerAt;
    this.triggerType = triggerType;
    this.local = local;
    this.type = type;
    this.alreadyPlayed = alreadyPlayed;
    this.currentValue = currentValue;
  }
}

class GenericSensor {
  constructor(
    public name: string, // DET-20
    public type: string | null, // Smartlight
    public fields: string[],
    public tags: string[],
    public local: string,
    public timestamp?: Date,
  ) { }
}

export { Alarme, GenericSensor, AlarmeValue }