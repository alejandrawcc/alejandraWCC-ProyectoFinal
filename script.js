// Configuración inicial
document.addEventListener('DOMContentLoaded', function() {
    // Configurar enlace de GitHub
    document.getElementById('github-repo-link').href = "#";
    
    // Inicializar gráficos
    initializeCharts();
    
    // Configurar event listeners para los botones
    document.getElementById('run-newton').addEventListener('click', runNewtonMethod);
    document.getElementById('run-jacobi').addEventListener('click', runJacobiMethod);
    document.getElementById('run-taylor').addEventListener('click', runTaylorMethod);
    
    // Ejecutar ejemplos iniciales
    runNewtonMethod();
    runJacobiMethod();
    runTaylorMethod();
});

// Gráficos iniciales
let newtonChart, taylorChart;

function initializeCharts() {
    // Gráfico para método de Newton
    const newtonCtx = document.getElementById('newton-chart').getContext('2d');
    newtonChart = new Chart(newtonCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Aproximación de la raíz',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Convergencia del método de Newton'
                },
                legend: {
                    display: true
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Iteración'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Valor de x'
                    }
                }
            }
        }
    });
    
    // Gráfico para serie de Taylor
    const taylorCtx = document.getElementById('taylor-chart').getContext('2d');
    taylorChart = new Chart(taylorCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Aproximación de Taylor',
                    data: [],
                    borderColor: '#9b59b6',
                    backgroundColor: 'rgba(155, 89, 182, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Valor real de cos(x)',
                    data: [],
                    borderColor: '#2ecc71',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Aproximación de cos(x) por series de Taylor'
                },
                legend: {
                    display: true
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Número de términos'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Valor'
                    }
                }
            }
        }
    });
}

// 1. MÉTODO DE NEWTON-RAPHSON
function runNewtonMethod() {
    // Obtener parámetros de entrada
    const initialGuess = parseFloat(document.getElementById('newton-guess').value);
    const tolerance = parseFloat(document.getElementById('newton-tolerance').value);
    const maxIterations = parseInt(document.getElementById('newton-max-iter').value);
    
    // Definir la función y su derivada para el problema de punto de equilibrio económico
    // Utilidad(x) = Ingresos(x) - Costos(x) = (50x - 0.5x²) - (100 + 10x + 0.1x³)
    const f = x => (50*x - 0.5*x*x) - (100 + 10*x + 0.1*x*x*x);
    const df = x => (50 - x) - (10 + 0.3*x*x); // Derivada de la utilidad
    
    // Implementación del método de Newton-Raphson
    let x = initialGuess;
    let iterations = [];
    let error = Infinity;
    let i = 0;
    
    // Actualizar gráfico
    const chartLabels = [];
    const chartData = [];
    
    for (i = 0; i < maxIterations; i++) {
        const fx = f(x);
        const dfx = df(x);
        
        if (Math.abs(dfx) < 1e-10) {
            break; // Evitar división por cero
        }
        
        const xNew = x - fx / dfx;
        error = Math.abs(xNew - x);
        
        // Guardar iteración
        iterations.push({
            iteration: i + 1,
            x: x.toFixed(6),
            fx: fx.toFixed(6),
            dfx: dfx.toFixed(6),
            xNew: xNew.toFixed(6),
            error: error.toFixed(6)
        });
        
        // Actualizar datos para el gráfico
        chartLabels.push(`Iter ${i+1}`);
        chartData.push(parseFloat(xNew.toFixed(6)));
        
        // Verificar convergencia
        if (error < tolerance) {
            x = xNew;
            break;
        }
        
        x = xNew;
    }
    
    // Actualizar gráfico
    newtonChart.data.labels = chartLabels;
    newtonChart.data.datasets[0].data = chartData;
    newtonChart.update();
    
    // Mostrar resultados
    const resultDiv = document.getElementById('newton-result');
    if (error < tolerance) {
        resultDiv.innerHTML = `
            <p><strong>Solución encontrada después de ${i+1} iteraciones:</strong></p>
            <p>Punto de equilibrio: x = <strong>${x.toFixed(6)}</strong> unidades</p>
            <p>Error final: ${error.toFixed(8)}</p>
            <p>Interpretación: La empresa alcanza su punto de equilibrio (utilidad = 0) produciendo ${x.toFixed(1)} unidades.</p>
        `;
        resultDiv.style.borderLeftColor = '#2ecc71';
    } else {
        resultDiv.innerHTML = `
            <p><strong>El método no convergió después de ${maxIterations} iteraciones</strong></p>
            <p>Última aproximación: x = ${x.toFixed(6)}</p>
            <p>Último error: ${error.toFixed(6)}</p>
            <p>Sugerencia: Intente con un valor inicial diferente.</p>
        `;
        resultDiv.style.borderLeftColor = '#e74c3c';
    }
    
    // Mostrar tabla de iteraciones
    const tableDiv = document.getElementById('newton-iterations');
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Iteración</th>
                    <th>x</th>
                    <th>f(x)</th>
                    <th>f'(x)</th>
                    <th>xₙₑₓₜ</th>
                    <th>Error</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    iterations.forEach(iter => {
        tableHTML += `
            <tr>
                <td>${iter.iteration}</td>
                <td>${iter.x}</td>
                <td>${iter.fx}</td>
                <td>${iter.dfx}</td>
                <td>${iter.xNew}</td>
                <td>${iter.error}</td>
            </tr>
        `;
    });
    
    tableHTML += `</tbody></table>`;
    tableDiv.innerHTML = tableHTML;
}

// 2. MÉTODO DE JACOBI
function runJacobiMethod() {
    // Obtener parámetros de entrada
    const tolerance = parseFloat(document.getElementById('jacobi-tolerance').value);
    const maxIterations = parseInt(document.getElementById('jacobi-max-iter').value);
    
    // Sistema de ecuaciones para el circuito eléctrico
    // 10I₁ - 2I₂ - 4I₃ = 12
    // -2I₁ + 8I₂ - 2I₃ = 0
    // -4I₁ - 2I₂ + 10I₃ = 0
    const A = [
        [10, -2, -4],
        [-2, 8, -2],
        [-4, -2, 10]
    ];
    const b = [12, 0, 0];
    
    // Verificar si la matriz es diagonalmente dominante
    let isDiagonallyDominant = true;
    for (let i = 0; i < A.length; i++) {
        let sum = 0;
        for (let j = 0; j < A[i].length; j++) {
            if (i !== j) {
                sum += Math.abs(A[i][j]);
            }
        }
        if (Math.abs(A[i][i]) <= sum) {
            isDiagonallyDominant = false;
            break;
        }
    }
    
    // Valores iniciales (suponemos I₁ = I₂ = I₃ = 0)
    let x = [0, 0, 0];
    let xNew = [0, 0, 0];
    let iterations = [];
    let maxError = Infinity;
    let i = 0;
    
    for (i = 0; i < maxIterations; i++) {
        maxError = 0;
        
        // Calcular nuevos valores para cada variable
        for (let j = 0; j < A.length; j++) {
            let sum = b[j];
            
            for (let k = 0; k < A[j].length; k++) {
                if (j !== k) {
                    sum -= A[j][k] * x[k];
                }
            }
            
            xNew[j] = sum / A[j][j];
            
            // Calcular error para esta variable
            const error = Math.abs(xNew[j] - x[j]);
            if (error > maxError) {
                maxError = error;
            }
        }
        
        // Guardar iteración
        iterations.push({
            iteration: i + 1,
            I1: xNew[0].toFixed(6),
            I2: xNew[1].toFixed(6),
            I3: xNew[2].toFixed(6),
            error: maxError.toFixed(6)
        });
        
        // Actualizar valores para la siguiente iteración
        x = [...xNew];
        
        // Verificar convergencia
        if (maxError < tolerance) {
            break;
        }
    }
    
    // Mostrar resultados
    const resultDiv = document.getElementById('jacobi-result');
    if (maxError < tolerance) {
        resultDiv.innerHTML = `
            <p><strong>Solución encontrada después de ${i+1} iteraciones:</strong></p>
            <p>Corriente I₁ = <strong>${x[0].toFixed(4)} A</strong></p>
            <p>Corriente I₂ = <strong>${x[1].toFixed(4)} A</strong></p>
            <p>Corriente I₃ = <strong>${x[2].toFixed(4)} A</strong></p>
            <p>Error final: ${maxError.toFixed(8)}</p>
            <p>${!isDiagonallyDominant ? '<em>Nota: La convergencia no está garantizada (matriz no diagonalmente dominante)</em>' : ''}</p>
        `;
        resultDiv.style.borderLeftColor = '#2ecc71';
    } else {
        resultDiv.innerHTML = `
            <p><strong>El método no convergió después de ${maxIterations} iteraciones</strong></p>
            <p>Última aproximación: I₁ = ${x[0].toFixed(4)}, I₂ = ${x[1].toFixed(4)}, I₃ = ${x[2].toFixed(4)}</p>
            <p>Último error: ${maxError.toFixed(6)}</p>
            <p>${!isDiagonallyDominant ? '<em>La matriz no es diagonalmente dominante, por lo que la convergencia no está garantizada</em>' : ''}</p>
        `;
        resultDiv.style.borderLeftColor = '#e74c3c';
    }
    
    // Mostrar tabla de iteraciones
    const tableDiv = document.getElementById('jacobi-iterations');
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Iteración</th>
                    <th>I₁ (A)</th>
                    <th>I₂ (A)</th>
                    <th>I₃ (A)</th>
                    <th>Error máximo</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    iterations.forEach(iter => {
        tableHTML += `
            <tr>
                <td>${iter.iteration}</td>
                <td>${iter.I1}</td>
                <td>${iter.I2}</td>
                <td>${iter.I3}</td>
                <td>${iter.error}</td>
            </tr>
        `;
    });
    
    tableHTML += `</tbody></table>`;
    tableDiv.innerHTML = tableHTML;
}

// 3. SERIE DE TAYLOR PARA COS(X)
function runTaylorMethod() {
    // Obtener parámetros de entrada
    const x = parseFloat(document.getElementById('taylor-x').value);
    const terms = parseInt(document.getElementById('taylor-terms').value);
    
    // Función para calcular factorial
    const factorial = n => {
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    };
    
    // Calcular aproximación usando serie de Taylor para cos(x)
    // cos(x) = Σ (-1)^n * x^(2n) / (2n)!
    let approximation = 0;
    const approximations = [];
    const termsData = [];
    
    // Actualizar gráfico
    const chartLabels = [];
    const chartApproxData = [];
    const chartRealData = [];
    
    for (let n = 0; n < terms; n++) {
        const term = Math.pow(-1, n) * Math.pow(x, 2*n) / factorial(2*n);
        approximation += term;
        
        // Guardar término
        termsData.push({
            n: n,
            term: term.toFixed(8),
            approximation: approximation.toFixed(8)
        });
        
        // Actualizar datos para el gráfico
        chartLabels.push(`Término ${n+1}`);
        chartApproxData.push(approximation);
        chartRealData.push(Math.cos(x));
        
        approximations.push(approximation);
    }
    
    // Calcular error
    const realValue = Math.cos(x);
    const error = Math.abs(realValue - approximation);
    
    // Actualizar gráfico
    taylorChart.data.labels = chartLabels;
    taylorChart.data.datasets[0].data = chartApproxData;
    taylorChart.data.datasets[1].data = chartRealData;
    taylorChart.update();
    
    // Mostrar resultados
    const resultDiv = document.getElementById('taylor-result');
    resultDiv.innerHTML = `
        <p><strong>Aproximación de cos(${x}) usando ${terms} términos:</strong></p>
        <p>Valor aproximado: <strong>${approximation.toFixed(8)}</strong></p>
        <p>Valor real de cos(${x}): ${realValue.toFixed(8)}</p>
        <p>Error absoluto: ${error.toFixed(8)}</p>
        <p>Error relativo: ${(error / Math.abs(realValue) * 100).toFixed(4)}%</p>
        <p>Aplicación: Esta aproximación es útil en gráficos por computadora donde se necesitan cálculos rápidos de funciones trigonométricas.</p>
    `;
    resultDiv.style.borderLeftColor = '#9b59b6';
    
    // Mostrar tabla de términos
    const tableDiv = document.getElementById('taylor-terms-table');
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Término (n)</th>
                    <th>Valor del término</th>
                    <th>Aproximación acumulada</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    termsData.forEach(term => {
        tableHTML += `
            <tr>
                <td>${term.n}</td>
                <td>${term.term}</td>
                <td>${term.approximation}</td>
            </tr>
        `;
    });
    
    tableHTML += `</tbody></table>`;
    tableDiv.innerHTML = tableHTML;
}