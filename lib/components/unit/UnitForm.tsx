import { Paper, Group, NumberInput, Select } from "@mantine/core";
import { useState, forwardRef, useImperativeHandle } from "react";
import { create, all } from "mathjs";

const math = create(all);

interface UnitFormProps {
  valueType: ValueType;
}

type UnitPrefixes =
  | "p"
  | "n"
  | "u"
  | "m"
  | ""
  | "k"
  | "M"
  | "G"
  | "T"
  | "P"
  | "E"
  | "Z"
  | "Y";

type ValueType =
  | "voltage"
  | "current"
  | "resistance"
  | "power"
  | "frequency"
  | "capacitance"
  | "inductance";

// Названия единиц в базовой форме (включают казахский + символ)
const baseUnits: Record<ValueType, string> = {
  voltage: "V",
  current: "A",
  resistance: "Ω",
  power: "W",
  frequency: "Hz",
  capacitance: "F",
  inductance: "H",
};

// Локализация названий на казахском
const kazakhLabels: Record<ValueType, string> = {
  voltage: "Кернеу",
  current: "Ток",
  resistance: "Кедергі",
  power: "Қуат",
  frequency: "Жиілік",
  capacitance: "Сыйымдылық",
  inductance: "Индуктивтік",
};

// Префиксы
const prefixes: UnitPrefixes[] = [
  "p",
  "n",
  "u",
  "m",
  "",
  "k",
  "M",
  "G",
  "T",
  "P",
  "E",
  "Z",
  "Y",
];

// Генерация единиц с префиксами
const units: Record<ValueType, string[]> = Object.keys(baseUnits).reduce(
  (acc, key) => {
    acc[key as ValueType] = prefixes.map(
      (prefix) => prefix + baseUnits[key as ValueType]
    );
    return acc;
  },
  {} as Record<ValueType, string[]>
);

export interface UnitFormRef {
  getSearchParameters: () => { value: number | null };
  setValue: (value: number | null, unit?: string) => void;
  clear: () => void;
}

const UnitForm = forwardRef<UnitFormRef, UnitFormProps>(({ valueType }, ref) => {
  const [value, setValue] = useState<number | null>(null);
  const [unit, setUnit] = useState<string | null>(baseUnits[valueType]);

  useImperativeHandle(ref, () => ({
    getSearchParameters: () => {
      let siValue = value;
      if (value !== null && unit !== null && valueType !== "capacitance") {
        let adjustedUnit = unit;
        if (unit === "Ω") adjustedUnit = "ohm";
        siValue = math.unit(value, adjustedUnit).toSI().value;
      }
      if (valueType === "capacitance" && value !== null && unit !== null) {
        siValue = math.unit(value, unit).toNumber("pF");
      }
      if (valueType === "inductance" && value !== null && unit !== null) {
        siValue = math.unit(value, unit).toNumber("uH");
      }
      return { value: siValue };
    },
    setValue: (val: number | null, u?: string) => {
      if (u) setUnit(u);
      setValue(val);
    },
    clear: () => {
      setValue(null);
      setUnit(baseUnits[valueType]);
    },
  }));

  return (
    <Paper withBorder>
      <Group gap={0}>
        <NumberInput
          placeholder={kazakhLabels[valueType] || valueType}
          value={value ?? ""}
          onChange={(val) => setValue(Number(val))}
          w={"75%"}
          size="sm"
          radius={0}
        />
        <Select
          data={units[valueType]}
          value={unit}
          onChange={setUnit}
          w={"25%"}
          size="sm"
          radius={0}
          rightSection={null}
        />
      </Group>
    </Paper>
  );
});

UnitForm.displayName = "UnitForm";
export default UnitForm;
