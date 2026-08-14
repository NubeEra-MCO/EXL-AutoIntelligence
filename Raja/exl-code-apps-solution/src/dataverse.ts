import { exlpf_departmentsService } from "./exlpf_departmentsService";
import { exlpf_employeesService }   from "./exlpf_employeesService";

export type Department = {
  exlpf_departmentid: string;
  exlpf_departmentidentifier: string;
  exlpf_departmentname: string;
  exlpf_departmentmanager: string;
};

export type Employee = {
  exlpf_employeeid: string;
  exlpf_employeeid1: string;
  exlpf_employeename: string;
  exlpf_emailaddress: string;
  exlpf_departmentid: string;
};

export async function getDepartments(): Promise<Department[]> {
  const result = await exlpf_departmentsService.getAll();
  return (result.data ?? []).map((d) => ({
    ...d,
    exlpf_departmentid: d.exlpf_departmentid ?? "",
    exlpf_departmentidentifier: d.exlpf_departmentidentifier ?? "",
    exlpf_departmentname: d.exlpf_departmentname ?? "",
    exlpf_departmentmanager: d.exlpf_departmentmanager ?? ""
  }));
}

export async function createDepartment(department: Department): Promise<void> {
  const { exlpf_departmentid: _departmentId, ...payload } = department;
  await exlpf_departmentsService.create(payload);
}

export async function updateDepartment(departmentIdentifier: string, department: Partial<Department>): Promise<void> {
  await exlpf_departmentsService.update(departmentIdentifier, department);
}

export async function deleteDepartment(departmentIdentifier: string): Promise<void> {
  await exlpf_departmentsService.delete(departmentIdentifier);
}

export async function getEmployees(): Promise<Employee[]> {
  const result = await exlpf_employeesService.getAll();
  return (result.data ?? []).map((e) => ({
    ...e,
    exlpf_employeeid: e.exlpf_employeeid ?? "",
    exlpf_employeeid1: e.exlpf_employeeid1 ?? "",
    exlpf_employeename: e.exlpf_employeename ?? "",
    exlpf_emailaddress: e.exlpf_emailaddress ?? "",
    exlpf_departmentid: e.exlpf_departmentid ?? ""
  }));
}

export async function createEmployee(employee: Employee): Promise<void> {
  const { exlpf_employeeid: _employeeId, ...payload } = employee;
  await exlpf_employeesService.create(payload);
}

export async function updateEmployee(employeeId: string, employee: Partial<Employee>): Promise<void> {
  await exlpf_employeesService.update(employeeId, employee);
}

export async function deleteEmployee(employeeId: string): Promise<void> {
  await exlpf_employeesService.delete(employeeId);
}
