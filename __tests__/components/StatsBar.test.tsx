import { render, screen } from "@testing-library/react";
import StatsBar from "@/components/StatsBar";
import { Todo } from "@/hooks/useTodos";

const makeTodo = (overrides: Partial<Todo>): Todo => ({
  id: Math.random().toString(),
  title: "Test",
  description: null,
  completed: false,
  priority: "MEDIUM",
  dueDate: null,
  userId: "user-1",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe("StatsBar Component", () => {
  it("shows zero for all counts when todos list is empty", () => {
    render(<StatsBar todos={[]} />);
    // Each StatCard renders a number — all should be 0
    const numbers = screen.getAllByText("0");
    expect(numbers.length).toBeGreaterThanOrEqual(1);
  });

  it("shows correct total count", () => {
    const todos = [makeTodo({}), makeTodo({}), makeTodo({})];
    render(<StatsBar todos={todos} />);
    expect(screen.getByText("Total")).toBeInTheDocument();
    // At least one element should display "3"
    const allThrees = screen.getAllByText("3");
    expect(allThrees.length).toBeGreaterThanOrEqual(1);
  });

  it("shows correct completed count", () => {
    const todos = [
      makeTodo({ completed: true }),
      makeTodo({ completed: true }),
      makeTodo({ completed: false }),
    ];
    render(<StatsBar todos={todos} />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows correct pending count", () => {
    const todos = [
      makeTodo({ completed: false }),
      makeTodo({ completed: true }),
    ];
    render(<StatsBar todos={todos} />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("shows high priority count", () => {
    const todos = [
      makeTodo({ priority: "HIGH", completed: false }),
      makeTodo({ priority: "HIGH", completed: false }),
      makeTodo({ priority: "LOW", completed: false }),
    ];
    render(<StatsBar todos={todos} />);
    expect(screen.getByText("High Priority")).toBeInTheDocument();
  });

  it("shows the progress bar section when todos exist", () => {
    const todos = [makeTodo({ completed: true }), makeTodo({ completed: false })];
    render(<StatsBar todos={todos} />);
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("shows 100% when all todos are completed", () => {
    const todos = [makeTodo({ completed: true }), makeTodo({ completed: true })];
    render(<StatsBar todos={todos} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("hides the progress bar when todos list is empty", () => {
    render(<StatsBar todos={[]} />);
    expect(screen.queryByText("Progress")).not.toBeInTheDocument();
  });

  it("shows Overdue card when overdue todos exist", () => {
    const todos = [
      makeTodo({
        completed: false,
        dueDate: new Date("2020-01-01").toISOString(),
      }),
    ];
    render(<StatsBar todos={todos} />);
    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });

  it("does not show Overdue card when there are none", () => {
    const todos = [makeTodo({ completed: false, dueDate: null })];
    render(<StatsBar todos={todos} />);
    expect(screen.queryByText("Overdue")).not.toBeInTheDocument();
  });
});
