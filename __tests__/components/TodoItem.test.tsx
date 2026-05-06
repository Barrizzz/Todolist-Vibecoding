import { render, screen, fireEvent } from "@testing-library/react";
import TodoItem from "@/components/TodoItem";
import { Todo } from "@/hooks/useTodos";

const baseTodo: Todo = {
  id: "todo-1",
  title: "Learn Jest",
  description: "Write unit tests for the app",
  completed: false,
  priority: "MEDIUM",
  dueDate: null,
  userId: "user-1",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("TodoItem Component", () => {
  const mockToggle = jest.fn();
  const mockDelete = jest.fn().mockResolvedValue(true);
  const mockEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the todo title", () => {
    render(
      <TodoItem
        todo={baseTodo}
        onToggle={mockToggle}
        onDelete={mockDelete}
        onEdit={mockEdit}
      />
    );
    expect(screen.getByText("Learn Jest")).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(
      <TodoItem
        todo={baseTodo}
        onToggle={mockToggle}
        onDelete={mockDelete}
        onEdit={mockEdit}
      />
    );
    expect(screen.getByText("Write unit tests for the app")).toBeInTheDocument();
  });

  it("renders the MEDIUM priority badge", () => {
    render(
      <TodoItem
        todo={baseTodo}
        onToggle={mockToggle}
        onDelete={mockDelete}
        onEdit={mockEdit}
      />
    );
    expect(screen.getByText("MEDIUM")).toBeInTheDocument();
  });

  it("calls onToggle when the checkbox is clicked", () => {
    render(
      <TodoItem
        todo={baseTodo}
        onToggle={mockToggle}
        onDelete={mockDelete}
        onEdit={mockEdit}
      />
    );
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(mockToggle).toHaveBeenCalledWith("todo-1", true);
  });

  it("calls onEdit when the edit button is clicked", () => {
    render(
      <TodoItem
        todo={baseTodo}
        onToggle={mockToggle}
        onDelete={mockDelete}
        onEdit={mockEdit}
      />
    );
    const editBtn = screen.getByLabelText("Edit todo");
    fireEvent.click(editBtn);
    expect(mockEdit).toHaveBeenCalledWith(baseTodo);
  });

  it("calls onDelete when the delete button is clicked", () => {
    render(
      <TodoItem
        todo={baseTodo}
        onToggle={mockToggle}
        onDelete={mockDelete}
        onEdit={mockEdit}
      />
    );
    const deleteBtn = screen.getByLabelText("Delete todo");
    fireEvent.click(deleteBtn);
    expect(mockDelete).toHaveBeenCalledWith("todo-1");
  });

  it("renders a completed todo with line-through style", () => {
    const completedTodo = { ...baseTodo, completed: true };
    render(
      <TodoItem
        todo={completedTodo}
        onToggle={mockToggle}
        onDelete={mockDelete}
        onEdit={mockEdit}
      />
    );
    const title = screen.getByText("Learn Jest");
    expect(title).toHaveStyle({ textDecoration: "line-through" });
  });

  it("does not render a description when absent", () => {
    const noDescTodo = { ...baseTodo, description: null };
    render(
      <TodoItem
        todo={noDescTodo}
        onToggle={mockToggle}
        onDelete={mockDelete}
        onEdit={mockEdit}
      />
    );
    expect(screen.queryByText("Write unit tests for the app")).not.toBeInTheDocument();
  });

  it("shows a due date when provided", () => {
    const todoWithDue = {
      ...baseTodo,
      dueDate: new Date("2030-12-31T00:00:00.000Z").toISOString(),
    };
    render(
      <TodoItem
        todo={todoWithDue}
        onToggle={mockToggle}
        onDelete={mockDelete}
        onEdit={mockEdit}
      />
    );
    expect(screen.getByText(/Dec 31, 2030/)).toBeInTheDocument();
  });

  it("shows Overdue label for past due dates on incomplete todos", () => {
    const overdueTodo = {
      ...baseTodo,
      dueDate: new Date("2020-01-01T00:00:00.000Z").toISOString(),
    };
    render(
      <TodoItem
        todo={overdueTodo}
        onToggle={mockToggle}
        onDelete={mockDelete}
        onEdit={mockEdit}
      />
    );
    expect(screen.getByText(/Overdue/)).toBeInTheDocument();
  });
});
