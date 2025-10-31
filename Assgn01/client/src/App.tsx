import React, { useEffect, useState } from "react";
import { Task } from "./types";
import { getTasks, addTask, updateTask, deleteTask } from "./api";
import { Button, Form, ListGroup, Container, Row, Col, ButtonGroup } from "react-bootstrap";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [desc, setDesc] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
      localStorage.setItem("tasks", JSON.stringify(data));
    } catch {
      // fallback to localStorage if API unavailable
      const saved = localStorage.getItem("tasks");
      if (saved) setTasks(JSON.parse(saved));
    }
  };

  const handleAdd = async () => {
    if (!desc.trim()) return;
    const newTask = await addTask(desc);
    const updated = [...tasks, newTask];
    setTasks(updated);
    localStorage.setItem("tasks", JSON.stringify(updated));
    setDesc("");
  };

  const toggleComplete = async (task: Task) => {
    const updatedTask = { ...task, isCompleted: !task.isCompleted };
    await updateTask(updatedTask);
    const updated = tasks.map(t => (t.id === task.id ? updatedTask : t));
    setTasks(updated);
    localStorage.setItem("tasks", JSON.stringify(updated));
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    localStorage.setItem("tasks", JSON.stringify(updated));
  };

  const filteredTasks = tasks.filter(t =>
    filter === "completed" ? t.isCompleted :
    filter === "active" ? !t.isCompleted :
    true
  );

  return (
    <Container className="mt-5">
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <h2 className="text-center mb-4">Task Manager</h2>

          <Form className="d-flex mb-3">
            <Form.Control
              type="text"
              placeholder="Enter task description..."
              value={desc}
              onChange={(e: any) => setDesc(e.target.value)}
            />
            <Button variant="primary" className="ms-2" onClick={handleAdd}>
              Add
            </Button>
          </Form>

          <ButtonGroup className="mb-3">
            <Button
              variant={filter === "all" ? "secondary" : "outline-secondary"}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "active" ? "secondary" : "outline-secondary"}
              onClick={() => setFilter("active")}
            >
              Active
            </Button>
            <Button
              variant={filter === "completed" ? "secondary" : "outline-secondary"}
              onClick={() => setFilter("completed")}
            >
              Completed
            </Button>
          </ButtonGroup>

          <ListGroup>
            {filteredTasks.map(task => (
              <ListGroup.Item
                key={task.id}
                className="d-flex justify-content-between align-items-center"
              >
                <span
                  style={{
                    textDecoration: task.isCompleted ? "line-through" : "none",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleComplete(task)}
                >
                  {task.desc}
                </span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(task.id)}
                >
                  Delete
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
