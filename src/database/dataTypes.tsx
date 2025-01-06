class Luz {
    boardVoltage: number;
    batteryVoltage: number;
    humidity: number;
    luminosity: number;
    temperature: number;
    movement: number; // Contador de pessoas que entraram na sala
    deviceId: string;
    local: string;

    constructor(boardVoltage: number, batteryVoltage: number, humidity: number, luminosity: number, temperature: number, movement: number, deviceId: string, local: string) {
        this.boardVoltage = boardVoltage;
        this.batteryVoltage = batteryVoltage;
        this.humidity = humidity;
        this.luminosity = luminosity;
        this.temperature = temperature;
        this.movement = movement;
        this.deviceId = deviceId;
        this.local = local;
    }
}

class Alarme {
    id: number;
    trigger: number;
    triggerAtLowerThan: boolean;
    triggerType: string;
    currentValue: number;
    local: string;
    type: string;

    constructor(id: number, trigger: number, triggerAtLowerThan: boolean, triggerType: string, currentValue: number, local: string, type: string) {
        this.id = id;
        this.trigger = trigger;
        this.triggerAtLowerThan = triggerAtLowerThan;
        this.triggerType = triggerType;
        this.currentValue = currentValue;
        this.local = local;
        this.type = type;
    }
}

class Local {
    local: string;
    smartLight: boolean | null = null;
    waterTankLevel: boolean | null = null;
    gaugePressure: boolean | null = null;
    hydrometer: boolean | null = null;
    energyMeter: boolean | null = null;
    weatherStation: boolean | null = null;

    constructor(
        local: string,
        options: {
            smartLight?: boolean; waterTankLevel?: boolean; gaugePressure?: boolean; hydrometer?: boolean; energyMeter?: boolean; weatherStation?: boolean;
        } = {}
    ) {
        this.local = local;
        this.smartLight = options.smartLight ?? this.smartLight;
        this.waterTankLevel = options.waterTankLevel ?? this.waterTankLevel;
        this.gaugePressure = options.gaugePressure ?? this.gaugePressure;
        this.hydrometer = options.hydrometer ?? this.hydrometer;
        this.energyMeter = options.energyMeter ?? this.energyMeter;
        this.weatherStation = options.weatherStation ?? this.weatherStation;
    }
}

class GenericSensor {
    constructor(
        public name: String,
        public type: String | null,
        public deveui: String,
        public boardVoltage: number | null,
        public batteryVoltage: number | null,
        public humidity: number | null,
        public luminosity: number | null,
        public temperature: number | null,
        public movement: boolean | null,
        public pressure: number | null,
        public co2: number | null,
        public local: String,
        // public date: Date, 
    ) {}
}

export { Luz, Alarme, Local, GenericSensor }