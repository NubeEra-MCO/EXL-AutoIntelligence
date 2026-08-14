import { useEffect, useMemo, useState } from "react";
import {
  createDepartment,
  createEmployee,
  deleteDepartment,
  deleteEmployee,
  getDepartments,
  getEmployees,
  type Department,
  type Employee,
  updateDepartment,
  updateEmployee
} from "./dataverse";
import "./App.css";

const emptyDepartment: Department = {
  exlpf_departmentid: "",
  exlpf_departmentidentifier: "",
  exlpf_departmentname: "",
  exlpf_departmentmanager: ""
};

const emptyEmployee: Employee = {
  exlpf_employeeid: "",
  exlpf_employeeid1: "",
  exlpf_employeename: "",
  exlpf_emailaddress: "",
  exlpf_departmentid: ""
};

function App() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departmentForm, setDepartmentForm] = useState<Department>(emptyDepartment);
  const [employeeForm, setEmployeeForm] = useState<Employee>(emptyEmployee);
  const [departmentEditId, setDepartmentEditId] = useState<string>("");
  const [employeeEditId, setEmployeeEditId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const departmentNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of departments) {
      map.set(d.exlpf_departmentidentifier, d.exlpf_departmentname);
    }
    return map;
  }, [departments]);

  async function refreshAll(): Promise<void> {
    setLoading(true);
    setError("");
    try {
      const [departmentRows, employeeRows] = await Promise.all([getDepartments(), getEmployees()]);
      setDepartments(departmentRows);
      setEmployees(employeeRows);
      setEmployeeForm((current) => {
        if (current.exlpf_departmentid || departmentRows.length === 0) {
          return current;
        }
        return { ...current, exlpf_departmentid: departmentRows[0].exlpf_departmentidentifier };
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load Dataverse records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshAll();
  }, []);

  async function onDepartmentSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    try {
      if (departmentEditId) {
        await updateDepartment(departmentEditId, departmentForm);
      } else {
        await createDepartment(departmentForm);
      }
      setDepartmentForm(emptyDepartment);
      setDepartmentEditId("");
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save department.");
    }
  }

  async function onEmployeeSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    try {
      if (employeeEditId) {
        await updateEmployee(employeeEditId, employeeForm);
      } else {
        await createEmployee(employeeForm);
      }
      setEmployeeForm({
        ...emptyEmployee,
        exlpf_departmentid: departments[0]?.exlpf_departmentidentifier ?? ""
      });
      setEmployeeEditId("");
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save employee.");
    }
  }

  async function removeDepartment(id: string): Promise<void> {
    setError("");
    try {
      await deleteDepartment(id);
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete department.");
    }
  }

  async function removeEmployee(id: string): Promise<void> {
    setError("");
    try {
      await deleteEmployee(id);
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete employee.");
    }
  }

  return (
    <main className="page">
      <header className="hero-card page-header">
        <div className="hero-copy">
          <span className="eyebrow">Dataverse Workspace</span>
          <h1>EXL Employee and Department Manager</h1>
          <p>
            Manage departments and employee records from one clean Power Apps code app connected to Dataverse.
          </p>
        </div>
        <div className="hero-metrics" aria-label="Overview metrics">
          <article className="metric-card">
            <span className="metric-label">Departments</span>
            <strong className="metric-value">{departments.length}</strong>
          </article>
          <article className="metric-card">
            <span className="metric-label">Employees</span>
            <strong className="metric-value">{employees.length}</strong>
          </article>
        </div>
      </header>

      <section className="feedback-row" aria-live="polite">
        {loading ? <p className="status banner">Loading records from Dataverse...</p> : null}
        {error ? <p className="error banner">{error}</p> : null}
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <span className="section-kicker">Directory</span>
            <h2>Departments</h2>
          </div>
          <p>Define business units that employees can be assigned to.</p>
        </div>
        <form className="form-grid" onSubmit={(e) => void onDepartmentSubmit(e)}>
          <label>
            Department Identifier
            <input
              value={departmentForm.exlpf_departmentidentifier}
              onChange={(e) =>
                setDepartmentForm((current) => ({
                  ...current,
                  exlpf_departmentidentifier: e.target.value
                }))
              }
              required
            />
          </label>
          <label>
            Department Name
            <input
              value={departmentForm.exlpf_departmentname}
              onChange={(e) =>
                setDepartmentForm((current) => ({
                  ...current,
                  exlpf_departmentname: e.target.value
                }))
              }
              required
            />
          </label>
          <label>
            Department Manager
            <input
              value={departmentForm.exlpf_departmentmanager}
              onChange={(e) =>
                setDepartmentForm((current) => ({
                  ...current,
                  exlpf_departmentmanager: e.target.value
                }))
              }
              required
            />
          </label>
          <div className="button-row">
            <button type="submit">{departmentEditId ? "Update Department" : "Add Department"}</button>
            {departmentEditId ? (
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setDepartmentEditId("");
                  setDepartmentForm(emptyDepartment);
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Identifier</th>
                <th>Name</th>
                <th>Manager</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">No departments available yet.</td>
                </tr>
              ) : (
                departments.map((d) => (
                  <tr key={d.exlpf_departmentid || d.exlpf_departmentidentifier}>
                    <td>{d.exlpf_departmentidentifier}</td>
                    <td>{d.exlpf_departmentname}</td>
                    <td>{d.exlpf_departmentmanager}</td>
                    <td className="actions">
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => {
                          setDepartmentEditId(d.exlpf_departmentid);
                          setDepartmentForm(d);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => void removeDepartment(d.exlpf_departmentid)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <span className="section-kicker">People</span>
            <h2>Employees</h2>
          </div>
          <p>Maintain employee identities, contact details, and department assignment.</p>
        </div>
        <form className="form-grid" onSubmit={(e) => void onEmployeeSubmit(e)}>
          <label>
            Employee Id
            <input
              value={employeeForm.exlpf_employeeid1}
              onChange={(e) =>
                setEmployeeForm((current) => ({
                  ...current,
                  exlpf_employeeid1: e.target.value
                }))
              }
              required
            />
          </label>
          <label>
            Employee Name
            <input
              value={employeeForm.exlpf_employeename}
              onChange={(e) =>
                setEmployeeForm((current) => ({
                  ...current,
                  exlpf_employeename: e.target.value
                }))
              }
              required
            />
          </label>
          <label>
            Email Address
            <input
              type="email"
              value={employeeForm.exlpf_emailaddress}
              onChange={(e) =>
                setEmployeeForm((current) => ({
                  ...current,
                  exlpf_emailaddress: e.target.value
                }))
              }
              required
            />
          </label>
          <label>
            Department
            <select
              value={employeeForm.exlpf_departmentid}
              onChange={(e) =>
                setEmployeeForm((current) => ({
                  ...current,
                  exlpf_departmentid: e.target.value
                }))
              }
              required
            >
              <option value="" disabled>
                Select Department
              </option>
              {departments.map((d) => (
                <option key={d.exlpf_departmentidentifier} value={d.exlpf_departmentidentifier}>
                  {d.exlpf_departmentname}
                </option>
              ))}
            </select>
          </label>
          <div className="button-row">
            <button type="submit">{employeeEditId ? "Update Employee" : "Add Employee"}</button>
            {employeeEditId ? (
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setEmployeeEditId("");
                  setEmployeeForm({
                    ...emptyEmployee,
                    exlpf_departmentid: departments[0]?.exlpf_departmentidentifier ?? ""
                  });
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Employee Id</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">No employees available yet.</td>
                </tr>
              ) : (
                employees.map((e) => (
                  <tr key={e.exlpf_employeeid || e.exlpf_employeeid1}>
                    <td>{e.exlpf_employeeid1}</td>
                    <td>{e.exlpf_employeename}</td>
                    <td>{e.exlpf_emailaddress}</td>
                    <td>{departmentNameById.get(e.exlpf_departmentid) ?? e.exlpf_departmentid}</td>
                    <td className="actions">
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => {
                          setEmployeeEditId(e.exlpf_employeeid);
                          setEmployeeForm(e);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => void removeEmployee(e.exlpf_employeeid)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default App;
