import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function EmployeesPage() {
  return <LiveRecordsPage title="Funcionários" description="Registos reais da equipa da exploração." endpoint="/api/employees" columns={[{ key: 'employee_name', label: 'Nome' }, { key: 'employee_id', label: 'Código' }, { key: 'position', label: 'Cargo' }, { key: 'department', label: 'Departamento' }, { key: 'hire_date', label: 'Data de admissão', kind: 'date' }, { key: 'employment_status', label: 'Estado' }, { key: 'email', label: 'Email' }]} />
}
