import { useState } from "react";
import "./App.css";

function App() {
  const [display, setDisplay] = useState("");
  const [history, setHistory] = useState([]);

  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState(null);

  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [interest, setInterest] = useState(null);

  const [matrixA, setMatrixA] = useState([
    ["", ""],
    ["", ""],
  ]);

  const [matrixB, setMatrixB] = useState([
    ["", ""],
    ["", ""],
  ]);

  const [matrixResult, setMatrixResult] = useState(null);

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

  const calculateAge = () => {
    if (!birthDate) {
      setAge(null);
      return;
    }

    const birth = new Date(birthDate);
    const today = new Date();

    let calculatedAge =
      today.getFullYear() - birth.getFullYear();

    const monthDifference =
      today.getMonth() - birth.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birth.getDate())
    ) {
      calculatedAge--;
    }

    setAge(calculatedAge);
  };

  const calculateInterest = () => {
    if (!principal || !rate || !time) {
      setInterest(null);
      return;
    }

    const p = Number(principal);
    const r = Number(rate);
    const t = Number(time);

    setInterest((p * r * t) / 100);
  };

  const handleClick = async (value) => {
    if (value === "C") {
      setDisplay("");
      return;
    }

    if (value === "=") {
      try {
        const result = Function(
          `"use strict"; return (${display})`
        )();

        const resultText = String(result);

        setDisplay(resultText);

        await fetch("http://localhost:8080/api/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            expression: display,
            result: resultText,
          }),
        });

        const response = await fetch(
          "http://localhost:8080/api/history"
        );

        const data = await response.json();
        setHistory(data);
      } catch {
        setDisplay("Error");
      }

      return;
    }

    setDisplay((previous) => previous + value);
  };

  const loadHistory = async () => {
    const response = await fetch(
      "http://localhost:8080/api/history"
    );

    const data = await response.json();
    setHistory(data);
  };

  const clearHistory = async () => {
    await fetch("http://localhost:8080/api/history", {
      method: "DELETE",
    });

    setHistory([]);
  };

  const updateMatrix = (
    matrix,
    setMatrix,
    row,
    col,
    value
  ) => {
    const updatedMatrix = matrix.map((r) => [...r]);
    updatedMatrix[row][col] = value;
    setMatrix(updatedMatrix);
  };

  const addMatrices = () => {
    const result = matrixA.map((row, i) =>
      row.map((value, j) =>
        Number(value) + Number(matrixB[i][j])
      )
    );

    setMatrixResult(result);
  };

  const subtractMatrices = () => {
    const result = matrixA.map((row, i) =>
      row.map((value, j) =>
        Number(value) - Number(matrixB[i][j])
      )
    );

    setMatrixResult(result);
  };

  const multiplyMatrices = () => {
    const result = [
      [
        Number(matrixA[0][0]) * Number(matrixB[0][0]) +
          Number(matrixA[0][1]) * Number(matrixB[1][0]),

        Number(matrixA[0][0]) * Number(matrixB[0][1]) +
          Number(matrixA[0][1]) * Number(matrixB[1][1]),
      ],
      [
        Number(matrixA[1][0]) * Number(matrixB[0][0]) +
          Number(matrixA[1][1]) * Number(matrixB[1][0]),

        Number(matrixA[1][0]) * Number(matrixB[0][1]) +
          Number(matrixA[1][1]) * Number(matrixB[1][1]),
      ],
    ];

    setMatrixResult(result);
  };

  const solveQuadratic = () => {
    const A = Number(a);
    const B = Number(b);
    const C = Number(c);

    if (!a || !b || !c || A === 0) {
      setQuadraticResult(
        "Please enter valid values. A cannot be 0."
      );
      return;
    }

    const discriminant = B * B - 4 * A * C;

    if (discriminant > 0) {
      const root1 =
        (-B + Math.sqrt(discriminant)) / (2 * A);

      const root2 =
        (-B - Math.sqrt(discriminant)) / (2 * A);

      setQuadraticResult(
        `x₁ = ${root1.toFixed(2)}, x₂ = ${root2.toFixed(2)}`
      );
    } else if (discriminant === 0) {
      const root = -B / (2 * A);

      setQuadraticResult(`x = ${root.toFixed(2)}`);
    } else {
      setQuadraticResult("No real roots");
    }
  };

  const solveLinear = () => {
    const A = Number(linearA);
    const B = Number(linearB);
    const C = Number(linearC);
    const D = Number(linearD);

    const coefficient = A - C;
    const constant = D - B;

    if (
      linearA === "" ||
      linearB === "" ||
      linearC === "" ||
      linearD === ""
    ) {
      setLinearResult("Please enter all values.");
      return;
    }

    if (coefficient === 0 && constant === 0) {
      setLinearResult("Infinite solutions");
      return;
    }

    if (coefficient === 0) {
      setLinearResult("No solution");
      return;
    }

    const x = constant / coefficient;

    setLinearResult(`x = ${x}`);
  };

  const plotFunction = () => {
    if (!functionInput.trim()) {
      setPlotPoints([]);
      return;
    }

    try {
      const points = [];

      for (let x = -10; x <= 10; x += 0.5) {
        const y = Function(
          "x",
          `"use strict"; return (${functionInput})`
        )(x);

        if (Number.isFinite(y)) {
          points.push({ x, y });
        }
      }

      setPlotPoints(points);
    } catch {
      setPlotPoints([]);
    }
  };

  const buttons = [
    "7", "8", "9", "/",
    "4", "5", "6", "*",
    "1", "2", "3", "-",
    "0", ".", "C", "+",
    "=",
  ];

  return (
    <div className="app">

      <div className="calculator">

        <h1>Pro Math Calculator</h1>

        <input
          type="text"
          value={display}
          placeholder="0"
          readOnly
        />

        <div className="buttons">
          {buttons.map((button) => (
            <button
              key={button}
              onClick={() => handleClick(button)}
              className={button === "=" ? "equal" : ""}
            >
              {button}
            </button>
          ))}
        </div>

        <div className="history">

          <h2>History</h2>

          <button onClick={loadHistory}>
            Load History
          </button>

          <button onClick={clearHistory}>
            Clear History
          </button>

          {history.map((item) => (
            <div
              key={item.id}
              className="history-item"
            >
              <span>{item.expression}</span>
              <span>= {item.result}</span>
            </div>
          ))}

        </div>

      </div>


      <div className="age-calculator">

        <h2>Age Calculator</h2>

        <input
          type="date"
          value={birthDate}
          onChange={(e) =>
            setBirthDate(e.target.value)
          }
        />

        <button onClick={calculateAge}>
          Calculate Age
        </button>

        {age !== null && (
          <h3>Your Age: {age} years</h3>
        )}

      </div>


      <div className="interest-calculator">

        <h2>Interest Calculator</h2>

        <input
          type="number"
          placeholder="Principal Amount"
          value={principal}
          onChange={(e) =>
            setPrincipal(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Rate (%)"
          value={rate}
          onChange={(e) =>
            setRate(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Time (Years)"
          value={time}
          onChange={(e) =>
            setTime(e.target.value)
          }
        />

        <button onClick={calculateInterest}>
          Calculate Interest
        </button>

        {interest !== null && (
          <h3>Interest: ₹{interest}</h3>
        )}

      </div>


      <div className="matrix-calculator">

        <h2>Matrix Calculator</h2>

        <h3>Matrix A</h3>

        <div className="matrix-grid">
          {matrixA.map((row, i) =>
            row.map((value, j) => (
              <input
                key={`A-${i}-${j}`}
                type="number"
                value={value}
                onChange={(e) =>
                  updateMatrix(
                    matrixA,
                    setMatrixA,
                    i,
                    j,
                    e.target.value
                  )
                }
              />
            ))
          )}
        </div>

        <h3>Matrix B</h3>

        <div className="matrix-grid">
          {matrixB.map((row, i) =>
            row.map((value, j) => (
              <input
                key={`B-${i}-${j}`}
                type="number"
                value={value}
                onChange={(e) =>
                  updateMatrix(
                    matrixB,
                    setMatrixB,
                    i,
                    j,
                    e.target.value
                  )
                }
              />
            ))
          )}
        </div>

        <div className="matrix-buttons">

          <button onClick={addMatrices}>
            A + B
          </button>

          <button onClick={subtractMatrices}>
            A - B
          </button>

          <button onClick={multiplyMatrices}>
            A × B
          </button>

        </div>

        {matrixResult && (
          <div className="matrix-result">

            <h3>Result</h3>

            {matrixResult.map((row, i) => (
              <div key={i}>
                {row.map((value, j) => (
                  <span key={j}>
                    {value}
                  </span>
                ))}
              </div>
            ))}

          </div>
        )}

      </div>


      <div className="quadratic-calculator">

        <h2>Quadratic Solver</h2>

        <p>Equation: ax² + bx + c = 0</p>

        <input
          type="number"
          placeholder="Enter a"
          value={a}
          onChange={(e) =>
            setA(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Enter b"
          value={b}
          onChange={(e) =>
            setB(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Enter c"
          value={c}
          onChange={(e) =>
            setC(e.target.value)
          }
        />

        <button onClick={solveQuadratic}>
          Solve
        </button>

        {quadraticResult && (
          <h3>{quadraticResult}</h3>
        )}

      </div>


      <div className="linear-calculator">

        <h2>Linear Equation Solver</h2>

        <p>Equation: Ax + B = Cx + D</p>

        <input
          type="number"
          placeholder="A"
          value={linearA}
          onChange={(e) =>
            setLinearA(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="B"
          value={linearB}
          onChange={(e) =>
            setLinearB(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="C"
          value={linearC}
          onChange={(e) =>
            setLinearC(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="D"
          value={linearD}
          onChange={(e) =>
            setLinearD(e.target.value)
          }
        />

        <button onClick={solveLinear}>
          Solve
        </button>

        {linearResult && (
          <h3>{linearResult}</h3>
        )}

      </div>


      <div className="plotter">

        <h2>Math Plotter</h2>

        <p>Enter function using x</p>

        <input
          type="text"
          placeholder="Example: x * x"
          value={functionInput}
          onChange={(e) =>
            setFunctionInput(e.target.value)
          }
        />

        <button onClick={plotFunction}>
          Plot Graph
        </button>

        {plotPoints.length > 0 && (
          <div className="graph">

            {plotPoints.map((point, index) => (
              <span
                key={index}
                className="point"
                style={{
                  left: `${((point.x + 10) / 20) * 100}%`,
                  bottom: `${Math.max(
                    5,
                    Math.min(95, 50 + point.y * 2)
                  )}%`,
                }}
              />
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default App;