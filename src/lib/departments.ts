import departmentData from "@/content/departments.json";

export type DepartmentCampus = "Main" | "East" | "West" | null;

export type Department = {
  id: string;
  name: string;
  shortName: string;
  campus: DepartmentCampus;
  sortOrder: number;
};

export const DEPARTMENTS = (departmentData as Department[]).toSorted(
  (left, right) => left.sortOrder - right.sortOrder,
);

export const DEPARTMENT_IDS = DEPARTMENTS.map((department) => department.id);

const departmentById = new Map(DEPARTMENTS.map((department) => [department.id, department]));

const legacyDepartmentIds: Record<string, string> = {
  BBA: "management-studies-main",
  BT: "biological-sciences-engineering-main",
  CIVIL: "civil-engineering-west",
  CSE: "computer-science-engineering-main",
  ECE: "electronics-communication-engineering-main",
  ICE: "instrumentation-control-engineering-main",
  IT: "information-technology-main",
  MAC: "mathematics-main",
  MECH: "mechanical-engineering-main",
};

export function normalizeDepartmentId(value: string | null | undefined) {
  if (!value) return null;
  if (departmentById.has(value)) return value;
  return legacyDepartmentIds[value.toUpperCase()] || null;
}

export function isDepartmentId(value: unknown): value is string {
  return typeof value === "string" && departmentById.has(value);
}

export function getDepartment(value: string | null | undefined) {
  const id = normalizeDepartmentId(value);
  return id ? departmentById.get(id) || null : null;
}

export function getDepartmentLabel(value: string | null | undefined) {
  const department = getDepartment(value);
  if (!department) return value || "Not specified";
  return department.campus
    ? `${department.name} — ${department.campus} Campus`
    : department.name;
}

export function getDepartmentCompactLabel(value: string | null | undefined) {
  const department = getDepartment(value);
  if (!department) return value || "NSUT";
  return department.campus
    ? `${department.shortName} · ${department.campus}`
    : department.shortName;
}
