import { Paper, Group, NumberInput, Select } from "@mantine/core";
import { create, all } from "mathjs";
import { useState, forwardRef, useImperativeHandle } from "react";

const math = create(all);

interface ValueSearchProps {
  valueType: string; // теперь строка, поддерживающая казахский
}

const kzToEn: Record<string, ValueType> = {
  Кернеу: "voltage",
  Ток: "current",
  Кедергі: "resistance",
  Қуат: "power",
  Жиілік: "frequency",
  Сыйымдылық: "capacitance",
  Индуктивтілік: "inductance",
};

type UnitPrefixes =
  | "p" | "n" | "u" | "m" | "" | "k" | "M" | "G" | "T" | "P" | "E" | "Z" | "Y";

type ValueType =
  | "voltage"
  | "current"
  | "resistance"
  | "power"
  | "frequency"
  | "capacitance"
  | "inductance";

const prefixes: UnitPrefixes[] = ["p", "n", "u", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];

const baseUnits: Record<ValueType, string> = {
  voltage: "V",
  current: "A",
  resistance: "Ω",
  power: "W",
  frequency: "Hz",
  capacitance: "F",
  inductance: "H",
};

const units: Record<ValueType, { label: string; value: string }[]> = Object.keys(baseUnits).reduce(
  (acc, key) => {
    const k = key as ValueType;
    acc[k] = prefixes.map((prefix) => {
      const full = prefix + baseUnits[k];
      return { label: full, value: full };
    });
    return acc;
  },
  {} as Record<ValueType, { label: string; value: string }[]>
);

const operations: { label: string; value: string }[] = [
  { label: "=", value: "=" },
  { label: "<", value: "<" },
  { label: ">", value: ">" },
  { label: "<=", value: "<=" },
  { label: ">=", value: ">=" },
];

export interface ValueSearchRef {
  getSearchParameters: () => { value: number | null; operation: string | null };
  clear: () => void;
}

const ValueSearch = forwardRef<ValueSearchRef, ValueSearchProps>(({ valueType }, ref) => {
  const enType: ValueType = kzToEn[valueType] ?? "voltage";
  const defaultUnit = units[enType][0]?.value || "V";

  const [value, setValue] = useState<number | null>(null);
  const [unit, setUnit] = useState<string | null>(defaultUnit);
  const [operation, setOperation] = useState<string | null>(operations[0]?.value ?? null);

  useImperativeHandle(ref, () => ({
    getSearchParameters: () => {
      let siValue = value;

      if (value !== null && unit !== null && enType !== "capacitance") {
        let u = unit === "Ω" ? "ohm" : unit;
        try {
          siValue = math.unit(value, u).toSI().value;
        } catch {
          siValue = null;
        }
      }

      if (enType === "capacitance" && value !== null && unit !== null) {
        try {
          siValue = math.unit(value, unit).toNumber("pF");
        } catch {
          siValue = null;
        }
      }

      if (enType === "inductance" && value !== null && unit !== null) {
        try {
          siValue = math.unit(value, unit).toNumber("uH");
        } catch {
          siValue = null;
        }
      }

      return { value: siValue, operation };
    },
    clear: () => {
      setValue(null);
      setUnit(defaultUnit);
      setOperation(operations[0]?.value ?? null);
    },
  }));

  return (
    <Paper withBorder>
      <Group gap={0}>
      <Select
          data={operations}
          value={operation}
          onChange={(val) => setOperation(val)}
          w="30%"
          size="sm"
          radius={0}
          styles={{
            input: { fontFamily: "monospace" },
            item: { fontFamily: "monospace" },
          }}
          placeholder="Оператор"
        />
        <NumberInput
          placeholder={valueType}
          value={value ?? ""}
          onChange={(val) => setValue(Number(val))}
          w="55%"
          size="sm"
          radius={0}
        />
        <Select
          data={units[enType]}
          value={unit}
          onChange={setUnit}
          w="40%"
          size="sm"
          radius={0}
          rightSection={<></>}
        />
      </Group>
    </Paper>
  );
});

ValueSearch.displayName = "ValueSearch";
export default ValueSearch;
