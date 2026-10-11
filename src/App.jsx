import { useState } from "react";
import "./App.css";

const API = "http://localhost:8080/api/history";

function App() {
  const [display, setDisplay] = useState("");
  const [history, setHistory] = useState([]);
  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState("");
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [interest, setInterest] = useState("");
  const [matrixA, setMatrixA] = useState([["", ""], ["", ""]]);
  const [matrixB, setMatrixB] = useState([["", ""], ["", ""]]);
  const [matrixResult, setMatrixResult] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [quadraticResult, setQuadraticResult] = useState("");
  const [linearA, setLinearA] = useState("");
  const [linearB, setLinearB] = useState("");
  const [linearC, setLinearC] = useState("");
  const [linearD, setLinearD] = useState("");
  const [linearResult, setLinearResult] = useState("");
  const [functionInput, setFunctionInput] = useState("");
  const [plotPoints, setPlotPoints] = useState([]);
  const [plotError, setPlotError] = useState("");

  // Backend history
  const loadHistory = async () => {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("History request failed");
      const data = await response.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      alert("Start the Spring Boot backend to load history.");
    }
  };

  const saveHistory = async (expression, result) => {
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expression,
          result: String(result),
        }),
      });
      if (response.ok) {
        const res = await fetch(API);
        if (res.ok) {
          const data = await res.json();
          setHistory(Array.isArray(data) ? data : []);
        }
      }
    } catch {
      console.error("History could not be saved.");
    }
  };

  const clearHistory = async () => {
    try {
      const response = await fetch(API, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      setHistory([]);
    } catch {
      alert("Could not clear history. Check the backend.");
    }
  };

  // Basic calculator
  const handleClick = (value) => {
    if (value === "C") {
      setDisplay("");
      return;
    }

    if (value === "=") {
      const expression = display.trim();

      if (!expression || !/^[0-9+\-*/().%\s]+$/.test(expression)) {
        setDisplay("Invalid");
        return;
      }

      try {
        const result = Function(`"use strict"; return (${expression})`)();
        if (typeof result !== "number" || !Number.isFinite(result)) {
          throw new Error("Invalid result");
        }
        setDisplay(String(result));
        saveHistory(expression, result);
      } catch {
        setDisplay("Error");
      }
      return;
    }

    setDisplay((previous) =>
      previous === "Error" || previous === "Invalid"
        ? value
        : previous + value
    );
  };

  // Age calculator
  const calculateAge = () => {
    if (!birthDate) {
      setAge("Please select your birth date.");
      return;
    }

    const birth = new Date(`${birthDate}T00:00:00`);
    const today = new Date();

    if (birth > today) {
      setAge("Birth date cannot be in the future.");
      return;
    }

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    setAge(`${years} years, ${months} months, ${days} days`);
  };

  // Simple interest
  const calculateInterest = () => {
    if (
      principal === "" || rate === "" || time === "" ||
      ![principal, rate, time].every((v) => Number.isFinite(Number(v))) ||
      Number(principal) < 0 || Number(rate) < 0 || Number(time) < 0
    ) {
      setInterest("Enter valid non-negative values.");
      return;
    }

    const p = Number(principal);
    const value = (p * Number(rate) * Number(time)) / 100;
    setInterest(
      `Simple Interest: ${value.toFixed(2)} | Total Amount: ${(p + value).toFixed(2)}`
    );
  };

  // Matrix input updater
  const updateMatrix = (matrix, setter, row, col, value) => {
    const updated = matrix.map((line) => [...line]);
    updated[row][col] = value;
    setter(updated);
  };

  // 2x2 matrix operations
  const matrixOperation = (operation) => {
    if ([...matrixA, ...matrixB].some((row) =>
      row.some((v) => v === "")
    )) {
      setMatrixResult("Please fill all matrix values.");
      return;
    }

    const A = matrixA.map((row) => row.map(Number));
    const B = matrixB.map((row) => row.map(Number));
    let result;

    if (operation === "add") {
      result = A.map((row, i) => row.map((v, j) => v + B[i][j]));
    } else if (operation === "subtract") {
      result = A.map((row, i) => row.map((v, j) => v - B[i][j]));
    } else {
      result = A.map((row, i) =>
        row.map((_, j) => A[i][0] * B[0][j] + A[i][1] * B[1][j])
      );
    }

    setMatrixResult(result.map((row) => row.join("   ")).join("\n"));
  };

  // Quadratic equation: ax² + bx + c = 0
  const solveQuadratic = () => {
    if (a === "" || b === "" || c === "") {
      setQuadraticResult("Please enter a, b and c.");
      return;
    }

    const A = Number(a);
    const B = Number(b);
    const C = Number(c);

    if (![A, B, C].every(Number.isFinite) || A === 0) {
      setQuadraticResult("Enter valid values. a cannot be 0.");
      return;
    }

    const d = B * B - 4 * A * C;

    if (d > 0) {
      setQuadraticResult(
        `Roots: ${((-B + Math.sqrt(d)) / (2 * A)).toFixed(4)}, ${((-B - Math.sqrt(d)) / (2 * A)).toFixed(4)}`
      );
    } else if (d === 0) {
      setQuadraticResult(`Repeated root: ${(-B / (2 * A)).toFixed(4)}`);
    } else {
      const real = (-B / (2 * A)).toFixed(4);
      const imaginary = (Math.sqrt(-d) / Math.abs(2 * A)).toFixed(4);
      setQuadraticResult(`Complex roots: ${real} ± ${imaginary}i`);
    }
  };

  // Linear equation: Ax + B = Cx + D
  const solveLinear = () => {
    const values = [linearA, linearB, linearC, linearD];

    if (values.some((v) => v === "")) {
      setLinearResult("Enter A, B, C and D.");
      return;
    }

    const [A, B, C, D] = values.map(Number);

    if (![A, B, C, D].every(Number.isFinite)) {
      setLinearResult("Enter valid numbers.");
      return;
    }

    const coefficient = A - C;
    const constant = D - B;

    if (coefficient === 0 && constant === 0) {
      setLinearResult("Infinite solutions.");
    } else if (coefficient === 0) {
      setLinearResult("No solution.");
    } else {
      setLinearResult(`x = ${(constant / coefficient).toFixed(4)}`);
    }
  };

  // Convert a math expression into a function for plotting
  const createFunction = (expression) => {
    let code = expression.trim().toLowerCase();

    code = code
      .replace(/\^/g, "**")
      .replace(/\b(sin|cos|tan|sqrt|abs|log|exp)\(/g, "Math.$1(")
      .replace(/\bpi\b/g, "Math.PI")
      .replace(/\be\b/g, "Math.E");

    if (!/^[0-9x+\-*/().,\sA-Za-z]*$/.test(code)) {
      throw new Error("Invalid characters");
    }

    return Function("x", `"use strict"; return (${code});`);
  };

  // Math plotter
  const plotFunction = () => {
    setPlotError("");
    setPlotPoints([]);

    if (!functionInput.trim()) {
      setPlotError("Enter a function, e.g. x*x");
      return;
    }

    try {
      const fn = createFunction(functionInput);
      const points = [];

      for (let x = -10; x <= 10.001; x += 0.1) {
        const y = fn(x);

        points.push(
          typeof y === "number" && Number.isFinite(y) && Math.abs(y) <= 100
            ? { x, y: Math.max(-10, Math.min(10, y)) }
            : { x, y: null }
        );
      }

      if (!points.some((p) => p.y !== null)) {
        throw new Error("No graph points");
      }

      setPlotPoints(points);
    } catch {
      setPlotError("Invalid function. Try x*x, x^2 or sin(x).");
    }
  };

  const graphWidth = 420;
  const graphHeight = 260;
  const svgX = (x) => ((x + 10) / 20) * graphWidth;
  const svgY = (y) => ((10 - y) / 20) * graphHeight;

  let graphPath = "";
  let drawing = false;

  plotPoints.forEach((point) => {
    if (point.y === null) {
      drawing = false;
      return;
    }

    graphPath += `${drawing ? " L" : " M"} ${svgX(point.x)} ${svgY(point.y)}`;
    drawing = true;
  });

  const buttons = [
    "7", "8", "9", "/",
    "4", "5", "6", "*",
    "1", "2", "3", "-",
    "0", ".", "C", "+",
    "=",
  ];

  return (
    <main className="app">
      <section className="calculator">
        <h1>Pro Math Calculator</h1>
        <input className="display" value={display || "0"} readOnly />

        <div className="keypad">
          {buttons.map((button) => (
            <button
              type="button"
              key={button}
              className={button === "=" ? "equals" : ""}
              onClick={() => handleClick(button)}
            >
              {button}
            </button>
          ))}
        </div>

        <h2>History</h2>
        <div className="history-actions">
          <button type="button" onClick={loadHistory}>Load History</button>
          <button type="button" onClick={clearHistory}>Clear History</button>
        </div>
        <div className="history-list">
          {history.map((item, i) => (
            <p key={item.id ?? i}>
              {item.expression} = {item.result}
            </p>
          ))}
        </div>
      </section>

      <section className="plotter">
        <h2>Math Plotter</h2>
        <label htmlFor="functionInput">Enter function using x</label>
        <input
          id="functionInput"
          value={functionInput}
          onChange={(e) => setFunctionInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && plotFunction()}
          placeholder="Example: x*x or sin(x)"
        />
        <button type="button" onClick={plotFunction}>Plot Graph</button>
        {plotError && <p className="error">{plotError}</p>}

        {plotPoints.length > 0 && (
          <div className="graph-container">
            <svg
              viewBox={`0 0 ${graphWidth} ${graphHeight}`}
              className="function-graph"
              role="img"
              aria-label={`Graph of ${functionInput}`}
            >
              {Array.from({ length: 21 }, (_, i) => (
                <g key={i}>
                  <line
                    x1={i * 21}
                    y1="0"
                    x2={i * 21}
                    y2={graphHeight}
                    stroke="#42445b"
                  />
                  <line
                    x1="0"
                    y1={i * 13}
                    x2={graphWidth}
                    y2={i * 13}
                    stroke="#42445b"
                  />
                </g>
              ))}
              <line x1={svgX(0)} y1="0" x2={svgX(0)} y2={graphHeight} stroke="#b4b6ca" />
              <line x1="0" y1={svgY(0)} x2={graphWidth} y2={svgY(0)} stroke="#b4b6ca" />
              <path
                d={graphPath}
                fill="none"
                stroke="#48d597"
                strokeWidth="2.5"
              />
            </svg>
            <p className="graph-caption">X and Y range: −10 to 10</p>
          </div>
        )}
      </section>

      <section className="linear-calculator">
        <h2>Linear Equation Solver</h2>
        <p>Ax + B = Cx + D</p>
        <input type="number" placeholder="A" value={linearA} onChange={(e) => setLinearA(e.target.value)} />
        <input type="number" placeholder="B" value={linearB} onChange={(e) => setLinearB(e.target.value)} />
        <input type="number" placeholder="C" value={linearC} onChange={(e) => setLinearC(e.target.value)} />
        <input type="number" placeholder="D" value={linearD} onChange={(e) => setLinearD(e.target.value)} />
        <button type="button" onClick={solveLinear}>Solve</button>
        {linearResult && <p className="result">{linearResult}</p>}
      </section>

      <section className="quadratic-calculator">
        <h2>Quadratic Solver</h2>
        <p>ax² + bx + c = 0</p>
        <input type="number" placeholder="Enter a" value={a} onChange={(e) => setA(e.target.value)} />
        <input type="number" placeholder="Enter b" value={b} onChange={(e) => setB(e.target.value)} />
        <input type="number" placeholder="Enter c" value={c} onChange={(e) => setC(e.target.value)} />
        <button type="button" onClick={solveQuadratic}>Solve</button>
        {quadraticResult && <p className="result">{quadraticResult}</p>}
      </section>

      <section className="matrix-calculator">
        <h2>Matrix Calculator</h2>
        <h3>Matrix A</h3>
        <div className="matrix-grid">
          {matrixA.map((row, i) =>
            row.map((value, j) => (
              <input
                key={`a${i}${j}`}
                type="number"
                value={value}
                aria-label={`Matrix A ${i + 1},${j + 1}`}
                onChange={(e) => updateMatrix(matrixA, setMatrixA, i, j, e.target.value)}
              />
            ))
          )}
        </div>
        <h3>Matrix B</h3>
        <div className="matrix-grid">
          {matrixB.map((row, i) =>
            row.map((value, j) => (
              <input
                key={`b${i}${j}`}
                type="number"
                value={value}
                aria-label={`Matrix B ${i + 1},${j + 1}`}
                onChange={(e) => updateMatrix(matrixB, setMatrixB, i, j, e.target.value)}
              />
            ))
          )}
        </div>
        <div className="matrix-actions">
          <button type="button" onClick={() => matrixOperation("add")}>A + B</button>
          <button type="button" onClick={() => matrixOperation("subtract")}>A − B</button>
          <button type="button" onClick={() => matrixOperation("multiply")}>A × B</button>
        </div>
        {matrixResult && <pre className="result matrix-result">{matrixResult}</pre>}
      </section>

      <section className="interest-calculator">
        <h2>Interest Calculator</h2>
        <p>Simple Interest = (P × R × T) / 100</p>
        <input type="number" placeholder="Principal amount" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
        <input type="number" placeholder="Rate (%)" value={rate} onChange={(e) => setRate(e.target.value)} />
        <input type="number" placeholder="Time (years)" value={time} onChange={(e) => setTime(e.target.value)} />
        <button type="button" onClick={calculateInterest}>Calculate Interest</button>
        {interest && <p className="result">{interest}</p>}
      </section>

      <section className="age-calculator">
        <h2>Age Calculator</h2>
        <label htmlFor="birthDate">Select your birth date</label>
        <input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        <button type="button" onClick={calculateAge}>Calculate Age</button>
        {age && <p className="result">{age}</p>}
      </section>
    </main>
  );
}

export default App;