import type { IOperationResult } from "@microsoft/power-apps/data";
import type { Exlpf_employeesBase, Exlpf_employees } from "./generated/models/Exlpf_employeesModel";
import { Exlpf_employeesService } from "./generated/services/Exlpf_employeesService";

export interface ExlpfEmployee {
  exlpf_employeeid?: string;
  exlpf_employeeid1?: string;
  exlpf_employeename?: string;
  exlpf_emailaddress?: string;
  exlpf_departmentid?: string;
}

export class exlpf_employeesService {
  public static async create(record: ExlpfEmployee): Promise<IOperationResult<ExlpfEmployee>> {
    return Exlpf_employeesService.create(
      record as Omit<Exlpf_employeesBase, "exlpf_employeeid">
    );
  }

  public static async update(id: string, changedFields: Partial<ExlpfEmployee>): Promise<IOperationResult<ExlpfEmployee>> {
    return Exlpf_employeesService.update(
      id,
      changedFields as Partial<Omit<Exlpf_employeesBase, "exlpf_employeeid">>
    );
  }

  public static async delete(id: string): Promise<void> {
    await Exlpf_employeesService.delete(id);
  }

  public static async getAll(): Promise<IOperationResult<Exlpf_employees[]>> {
    return Exlpf_employeesService.getAll();
  }
}
