import { useState } from "react";

function MatrixMultiplication() {
  const [matrixA, setMatrixA] = useState([
    [0, 0],
    [0, 0],
  ]);
  const [matrixB, setMatrixB] = useState([
    [0, 0],
    [0, 0],
  ]);
  const [result, setResult] = useState(null);

  const handleInputChange = (matrixSetter, matrix, row, col, value) => {
    const updated = matrix.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? parseFloat(value) || 0 : c))
    );
    matrixSetter(updated);
  };

  const multiplyMatrices = () => {
    const a = matrixA;
    const b = matrixB;
    const res = [
      [
        a[0][0] * b[0][0] + a[0][1] * b[1][0],
        a[0][0] * b[0][1] + a[0][1] * b[1][1],
      ],
      [
        a[1][0] * b[0][0] + a[1][1] * b[1][0],
        a[1][0] * b[0][1] + a[1][1] * b[1][1],
      ],
    ];
    setResult(res);
  };

  const renderMatrix = (matrix, setter, name) => (
    <div className="space-y-2">
      <h2 className="font-bold mb-1">{name}</h2>
      {matrix.map((row, rowIndex) => (
        <div key={rowIndex} className="flex space-x-2">
          {row.map((val, colIndex) => (
            <input
              key={colIndex}
              type="number"
              className="w-16 p-2 rounded text-black"
              value={val}
              onChange={(e) =>
                handleInputChange(setter, matrix, rowIndex, colIndex, e.target.value)
              }
            />
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="text-black bg-white bg-opacity-90 p-6 rounded shadow-md space-y-6">
      <h1 className="text-xl font-bold text-center mb-4 text-blue-600">Matrix Multiplication</h1>

      <div className="flex justify-around flex-wrap gap-6">
        {renderMatrix(matrixA, setMatrixA, "Matrix A")}
        {renderMatrix(matrixB, setMatrixB, "Matrix B")}
      </div>

      <div className="text-center">
        <button
          onClick={multiplyMatrices}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Multiply
        </button>
      </div>

      {result && (
        <div className="mt-6 text-center">
          <h2 className="font-bold mb-2 text-blue-600">Result</h2>
          <div className="inline-block">
            {result.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center space-x-4">
                {row.map((val, colIndex) => (
                  <div
                    key={colIndex}
                    className="w-16 p-2 border border-gray-300 rounded bg-gray-100"
                  >
                    {val}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MatrixMultiplication;


 