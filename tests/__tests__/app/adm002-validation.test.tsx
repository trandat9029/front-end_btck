import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import EmployeeListPage from '@/app/(protected)/employees/adm002/page';
import { departmentApi } from '@/lib/api/department';
import { employeeApi } from '@/lib/api/employee';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => {},
}));

jest.mock('@/lib/api/department', () => ({
  departmentApi: {
    getDepartments: jest.fn(),
  },
}));

jest.mock('@/lib/api/employee', () => ({
  employeeApi: {
    getEmployees: jest.fn(),
  },
}));

describe('ADM002 search validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (departmentApi.getDepartments as jest.Mock).mockResolvedValue({
      code: '200',
      departments: [],
    });
    (employeeApi.getEmployees as jest.Mock).mockResolvedValue({
      code: '200',
      employees: [],
      totalRecords: 0,
      params: [],
    });
  });

  it('normalizes leading and consecutive spaces in employee name input', async () => {
    render(<EmployeeListPage />);

    await waitFor(() => {
      expect(employeeApi.getEmployees).toHaveBeenCalledTimes(1);
    });

    const employeeNameInput = screen.getByRole('textbox') as HTMLInputElement;
    const [searchButton] = screen.getAllByRole('button');

    fireEvent.change(employeeNameInput, {
      target: { value: '   John   Doe' },
    });

    expect(employeeNameInput.value).toBe('John Doe');

    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(employeeApi.getEmployees).toHaveBeenCalledTimes(2);
    });

    expect((employeeApi.getEmployees as jest.Mock).mock.calls[1][0]).toMatchObject({
      employee_name: 'John Doe',
    });
  });

  it('limits employee name input to 125 characters', async () => {
    render(<EmployeeListPage />);

    await waitFor(() => {
      expect(employeeApi.getEmployees).toHaveBeenCalledTimes(1);
    });

    const employeeNameInput = screen.getByRole('textbox') as HTMLInputElement;
    const [searchButton] = screen.getAllByRole('button');
    const tooLongValue = 'a'.repeat(126);

    fireEvent.change(employeeNameInput, {
      target: { value: tooLongValue },
    });

    expect(employeeNameInput.maxLength).toBe(125);
    expect(employeeNameInput.value).toHaveLength(126);

    fireEvent.click(searchButton);

    expect(
      screen.getByText('Employee name must be 125 characters or fewer.')
    ).toBeInTheDocument();
    expect(employeeApi.getEmployees).toHaveBeenCalledTimes(1);
  });
});
