import type { IOperationResult } from "@microsoft/power-apps/data";
import type { Exlpf_departmentsBase, Exlpf_departments } from "./generated/models/Exlpf_departmentsModel";
import { Exlpf_departmentsService } from "./generated/services/Exlpf_departmentsService";

export interface ExlpfDepartment {
  exlpf_departmentid?: string;
  exlpf_departmentidentifier?: string;
  exlpf_departmentname?: string;
  exlpf_departmentmanager?: string;
}

export class exlpf_departmentsService {
  public static async create(record: ExlpfDepartment): Promise<IOperationResult<ExlpfDepartment>> {
    return Exlpf_departmentsService.create(
      record as Omit<Exlpf_departmentsBase, "exlpf_departmentid">
    );
  }

  public static async update(id: string, changedFields: Partial<ExlpfDepartment>): Promise<IOperationResult<ExlpfDepartment>> {
    return Exlpf_departmentsService.update(
      id,
      changedFields as Partial<Omit<Exlpf_departmentsBase, "exlpf_departmentid">>
    );
  }

  public static async delete(id: string): Promise<void> {
    await Exlpf_departmentsService.delete(id);
  }

  public static async getAll(): Promise<IOperationResult<Exlpf_departments[]>> {
    return Exlpf_departmentsService.getAll();
  }
}
