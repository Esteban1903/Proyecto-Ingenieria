// Clase principal para manejar opciones de financiamiento
class FinanciamientoComparador {
    constructor() {
        this.opciones = [];
        this.resultados = [];
        this.chart = null;
        this.sensitivityChart = null;
        this.init();
    }

    init() {
        // Event listeners
        document.getElementById('compararBtn').addEventListener('click', () => this.compararOpciones());
        document.getElementById('limpiarBtn').addEventListener('click', () => this.limpiarDatos());
        
        // Navegación suave
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.getAttribute('href');
                document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
                this.actualizarNavActiva(target);
            });
        });

        // Controles de sensibilidad
        document.getElementById('rateSensitivity').addEventListener('input', (e) => {
            document.getElementById('rateValue').textContent = e.target.value + '%';
            this.actualizarAnalisisSensibilidad();
        });

        document.getElementById('termSensitivity').addEventListener('input', (e) => {
            document.getElementById('termValue').textContent = e.target.value + ' meses';
            this.actualizarAnalisisSensibilidad();
        });

        // Inicializar gráficos
        this.initCharts();
    }

    actualizarNavActiva(target) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === target) {
                link.classList.add('active');
            }
        });
    }

    obtenerDatosFormulario() {
        const opciones = [];
        
        document.querySelectorAll('.option-card').forEach(card => {
            const form = card.querySelector('.option-form');
            const tipo = card.dataset.type;
            const datos = {};
            
            // Obtener todos los inputs del formulario
            const inputs = form.querySelectorAll('.form-input');
            inputs.forEach(input => {
                const valor = parseFloat(input.value) || 0;
                // Obtener el label para usar como key
                const label = input.previousElementSibling.textContent
                    .replace(':', '')
                    .replace(/\s+/g, '_')
                    .replace(/\(|\)|%/g, '')
                    .toLowerCase();
                datos[label] = valor;
            });
            
            datos.tipo = tipo;
            opciones.push(datos);
        });
        
        return opciones;
    }

    calcularOpcionesFinanciamiento(opciones) {
        const resultados = [];
        
        opciones.forEach(opcion => {
            let resultado = {
                tipo: opcion.tipo,
                costoTotal: 0,
                pagoMensual: 0,
                tasaEfectiva: 0,
                roi: 0,
                riesgo: 'medio',
                flujoPagos: [],
                ventajas: [],
                desventajas: []
            };

            switch(opcion.tipo) {
                case 'prestamo':
                    resultado = this.calcularPrestamo(opcion);
                    break;
                case 'leasing':
                    resultado = this.calcularLeasing(opcion);
                    break;
                case 'capital':
                    resultado = this.calcularCapitalRiesgo(opcion);
                    break;
                case 'crowdfunding':
                    resultado = this.calcularCrowdfunding(opcion);
                    break;
            }

            resultados.push(resultado);
        });
        
        return resultados;
    }

    calcularPrestamo(datos) {
        const { monto_del_préstamo, tasa_de_interés_anual, plazo_meses, comisión_de_apertura } = datos;
        
        // Calcular comisión de apertura
        const comision = (monto_del_préstamo * comisión_de_apertura) / 100;
        const montoFinanciado = monto_del_préstamo + comision;
        
        // Calcular pago mensual (fórmula de amortización francesa)
        const tasaMensual = tasa_de_interés_anual / 100 / 12;
        const pagoMensual = montoFinanciado * (tasaMensual * Math.pow(1 + tasaMensual, plazo_meses)) / 
                           (Math.pow(1 + tasaMensual, plazo_meses) - 1);
        
        // Costo total
        const costoTotal = pagoMensual * plazo_meses;
        
        // Tasa efectiva anual
        const tea = Math.pow(1 + tasaMensual, 12) - 1;
        
        // Generar flujo de pagos
        const flujoPagos = [];
        let saldo = montoFinanciado;
        for(let i = 1; i <= plazo_meses; i++) {
            const interes = saldo * tasaMensual;
            const capital = pagoMensual - interes;
            saldo -= capital;
            flujoPagos.push({
                mes: i,
                pago: pagoMensual,
                interes: interes,
                capital: capital,
                saldo: Math.max(0, saldo)
            });
        }

        return {
            tipo: 'prestamo',
            costoTotal: costoTotal,
            pagoMensual: pagoMensual,
            tasaEfectiva: tea * 100,
            roi: this.calcularROI(costoTotal, monto_del_préstamo),
            riesgo: 'bajo',
            flujoPagos: flujoPagos,
            ventajas: ['Interés fijo', 'Plazo definido', 'Desgravación fiscal posible'],
            desventajas: ['Requiere garantía', 'Pago de intereses', 'Comisiones adicionales']
        };
    }

    calcularLeasing(datos) {
        const { valor_del_bien, cuota_inicial, tasa_de_interés_anual, plazo_meses } = datos;
        
        // Calcular cuota inicial
        const cuotaInicial = (valor_del_bien * cuota_inicial) / 100;
        const montoFinanciado = valor_del_bien - cuotaInicial;
        
        // Calcular cuota mensual
        const tasaMensual = tasa_de_interés_anual / 100 / 12;
        const cuotaMensual = montoFinanciado * (tasaMensual * Math.pow(1 + tasaMensual, plazo_meses)) / 
                           (Math.pow(1 + tasaMensual, plazo_meses) - 1);
        
        // Costo total
        const costoTotal = cuotaInicial + (cuotaMensual * plazo_meses);
        
        // Tasa efectiva
        const tea = Math.pow(1 + tasaMensual, 12) - 1;

        return {
            tipo: 'leasing',
            costoTotal: costoTotal,
            pagoMensual: cuotaMensual,
            tasaEfectiva: tea * 100,
            roi: this.calcularROI(costoTotal, valor_del_bien),
            riesgo: 'medio',
            flujoPagos: [],
            ventajas: ['Uso del bien sin propiedad inicial', 'Beneficios fiscales', 'Mantenimiento incluido'],
            desventajas: ['Costo total más alto', 'No adquiere propiedad hasta el final', 'Restricciones de uso']
        };
    }

    calcularCapitalRiesgo(datos) {
        const { inversión_requerida, porcentaje_de_participación, valoración_de_la_empresa, tiempo_de_salida_años } = datos;
        
        // Calcular participación accionaria
        const participacion = porcentaje_de_participación / 100;
        const valorParticipacion = (valoración_de_la_empresa * participacion) - inversión_requerida;
        
        // ROI esperado (estimación conservadora)
        const roiEsperado = valorParticipacion / inversión_requerida;
        
        return {
            tipo: 'capital',
            costoTotal: inversión_requerida,
            pagoMensual: 0,
            tasaEfectiva: 0,
            roi: roiEsperado * 100,
            riesgo: 'alto',
            flujoPagos: [],
            ventajas: ['Sin pagos periódicos', 'Mentoría y contactos', 'No requiere garantía'],
            desventajas: ['Pérdida de control', 'Alta incertidumbre', 'Proceso largo de negociación']
        };
    }

    calcularCrowdfunding(datos) {
        const { meta_de_financiamiento, comisión_de_plataforma, recompensas_promedio, tiempo_de_campaña_días } = datos;
        
        // Calcular comisión de plataforma
        const comision = (meta_de_financiamiento * comisión_de_plataforma) / 100;
        const costoTotal = meta_de_financiamiento + comision;
        
        // Costo promedio por recompensa
        const costoPorRecompensa = costoTotal / (meta_de_financiamiento / recompensas_promedio);
        
        return {
            tipo: 'crowdfunding',
            costoTotal: costoTotal,
            pagoMensual: costoTotal / tiempo_de_campaña_días * 30, // Estimación mensual
            tasaEfectiva: comisión_de_plataforma,
            roi: this.calcularROI(costoTotal, meta_de_financiamiento),
            riesgo: 'medio-alto',
            flujoPagos: [],
            ventajas: ['Validación de mercado', 'Marketing incluido', 'Sin garantía requerida'],
            desventajas: ['Comisión alta', 'Riesgo de no alcanzar meta', 'Tiempo y esfuerzo requerido']
        };
    }

    calcularROI(costoTotal, inversionInicial) {
        if (costoTotal === 0 || inversionInicial === 0) return 0;
        return ((costoTotal - inversionInicial) / inversionInicial) * 100;
    }

    mostrarResultados(resultados) {
        this.resultados = resultados;
        this.mostrarTablaComparativa(resultados);
        this.mostrarGraficoFlujoCaja(resultados);
        this.mostrarAlertas(resultados);
        this.mostrarIndicadores(resultados);
    }

    mostrarTablaComparativa(resultados) {
        const tbody = document.getElementById('comparisonBody');
        tbody.innerHTML = '';

        resultados.forEach(resultado => {
            const tr = document.createElement('tr');
            
            // Formatear moneda
            const formatoMoneda = (valor) => `$${valor.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
            
            tr.innerHTML = `
                <td>${this.obtenerNombreTipo(resultado.tipo)}</td>
                <td>${formatoMoneda(resultado.costoTotal)}</td>
                <td>${formatoMoneda(resultado.pagoMensual)}</td>
                <td>${resultado.tasaEfectiva.toFixed(2)}%</td>
                <td>${resultado.roi.toFixed(2)}%</td>
                <td><span class="riesgo-badge riesgo-${resultado.riesgo}">${resultado.riesgo}</span></td>
            `;
            
            tbody.appendChild(tr);
        });
    }

    obtenerNombreTipo(tipo) {
        const nombres = {
            'prestamo': 'Préstamo Bancario',
            'leasing': 'Leasing',
            'capital': 'Capital de Riesgo',
            'crowdfunding': 'Crowdfunding'
        };
        return nombres[tipo] || tipo;
    }

    mostrarGraficoFlujoCaja(resultados) {
        const ctx = document.getElementById('cashflowChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }

        const datasets = resultados.map((resultado, index) => ({
            label: this.obtenerNombreTipo(resultado.tipo),
            data: resultado.flujoPagos.slice(0, 12).map(pago => pago.pago || 0), // Primer año
            borderColor: this.obtenerColor(index),
            backgroundColor: this.obtenerColorTransparente(index),
            fill: false,
            tension: 0.4
        }));

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 12}, (_, i) => `Mes ${i + 1}`),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Pago Mensual ($)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparación de Flujos de Caja (Primer Año)'
                    }
                }
            }
        });
    }

    mostrarAlertas(resultados) {
        const container = document.getElementById('alertsContainer');
        container.innerHTML = '';

        // Encontrar la opción más económica
        const masEconomica = resultados.reduce((min, curr) => curr.costoTotal < min.costoTotal ? curr : min);
        
        // Encontrar la opción más riesgosa
        const masRiesgosa = resultados.reduce((max, curr) => {
            const riesgoScore = { 'bajo': 1, 'medio': 2, 'medio-alto': 3, 'alto': 4 };
            return riesgoScore[curr.riesgo] > riesgoScore[max.riesgo] ? curr : max;
        });

        // Crear alertas
        const alertas = [
            {
                tipo: 'success',
                mensaje: `La opción más económica es ${this.obtenerNombreTipo(masEconomica.tipo)} con un costo total de $${masEconomica.costoTotal.toLocaleString('es-ES', {minimumFractionDigits: 2})}`
            },
            {
                tipo: 'warning',
                mensaje: `${this.obtenerNombreTipo(masRiesgosa.tipo)} presenta el mayor riesgo (${masRiesgosa.riesgo})`
            }
        ];

        // Agregar alertas específicas por tipo
        resultados.forEach(resultado => {
            if (resultado.tasaEfectiva > 20) {
                alertas.push({
                    tipo: 'danger',
                    mensaje: `${this.obtenerNombreTipo(resultado.tipo)} tiene una tasa efectiva muy alta (${resultado.tasaEfectiva.toFixed(2)}%)`
                });
            }
            
            if (resultado.roi > 50) {
                alertas.push({
                    tipo: 'info',
                    mensaje: `${this.obtenerNombreTipo(resultado.tipo)} ofrece un ROI estimado atractivo (${resultado.roi.toFixed(2)}%)`
                });
            }
        });

        alertas.forEach(alerta => {
            const div = document.createElement('div');
            div.className = `alert ${alerta.tipo}`;
            div.innerHTML = `<i class="fas fa-${alerta.tipo === 'success' ? 'check-circle' : alerta.tipo === 'warning' ? 'exclamation-triangle' : alerta.tipo === 'danger' ? 'times-circle' : 'info-circle'}"></i> ${alerta.mensaje}`;
            container.appendChild(div);
        });
    }

    mostrarIndicadores(resultados) {
        // Calcular métricas generales
        const costoTotalProyecto = resultados.reduce((sum, r) => sum + r.costoTotal, 0);
        const promedioTasaEfectiva = resultados.reduce((sum, r) => sum + r.tasaEfectiva, 0) / resultados.length;
        
        // Payback Period (estimación simplificada)
        const paybackPeriod = this.calcularPaybackPeriod(resultados);
        
        // VAN (Valor Actual Neto) - simplificado
        const van = this.calcularVAN(resultados);
        
        // TIR (Tasa Interna de Retorno) - aproximación
        const tir = this.calcularTIR(resultados);
        
        // Benefit-Cost Ratio
        const beneficioCosto = this.calcularBenefitCostRatio(resultados);

        document.getElementById('paybackPeriod').textContent = `${paybackPeriod.toFixed(1)} meses`;
        document.getElementById('van').textContent = `$${van.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
        document.getElementById('tir').textContent = `${tir.toFixed(2)}%`;
        document.getElementById('benefitCostRatio').textContent = beneficioCosto.toFixed(2);
    }

    calcularPaybackPeriod(resultados) {
        // Estimación basada en el promedio de los costos mensuales
        const costoMensualPromedio = resultados.reduce((sum, r) => sum + r.pagoMensual, 0) / resultados.length;
        const inversionInicial = resultados.reduce((sum, r) => sum + r.costoTotal, 0) / resultados.length;
        return costoMensualPromedio > 0 ? (inversionInicial / costoMensualPromedio) : 0;
    }

    calcularVAN(resultados) {
        // VAN simplificado - suma de flujos descontados
        const tasaDescuento = 0.10; // 10% anual
        return resultados.reduce((sum, resultado) => {
            const flujoAnual = resultado.pagoMensual * 12;
            return sum + (flujoAnual / Math.pow(1 + tasaDescuento, 1));
        }, 0) - resultados.reduce((sum, r) => sum + r.costoTotal, 0);
    }

    calcularTIR(resultados) {
        // TIR simplificada basada en el promedio
        const costoTotal = resultados.reduce((sum, r) => sum + r.costoTotal, 0);
        const beneficioTotal = resultados.reduce((sum, r) => sum + (r.roi/100 * r.costoTotal), 0);
        return costoTotal > 0 ? (beneficioTotal / costoTotal) * 100 : 0;
    }

    calcularBenefitCostRatio(resultados) {
        const costoTotal = resultados.reduce((sum, r) => sum + r.costoTotal, 0);
        const beneficioTotal = resultados.reduce((sum, r) => sum + (r.roi/100 * r.costoTotal), 0);
        return costoTotal > 0 ? beneficioTotal / costoTotal : 0;
    }

    actualizarAnalisisSensibilidad() {
        if (this.resultados.length === 0) return;
        
        // Obtener valores de sensibilidad
        const variacionTasa = parseFloat(document.getElementById('rateSensitivity').value) / 100;
        const variacionPlazo = parseInt(document.getElementById('termSensitivity').value);
        
        // Aplicar variaciones a los resultados
        const resultadosSensibilidad = this.resultados.map(resultado => {
            let resultadoModificado = {...resultado};
            
            if (resultadoModificado.tasaEfectiva > 0) {
                resultadoModificado.tasaEfectiva *= (1 + variacionTasa);
                resultadoModificado.costoTotal *= (1 + variacionTasa * 0.1); // Impacto aproximado
            }
            
            return resultadoModificado;
        });
        
        this.mostrarGraficoSensibilidad(resultadosSensibilidad);
    }

    mostrarGraficoSensibilidad(resultados) {
        const ctx = document.getElementById('sensitivityChart').getContext('2d');
        
        if (this.sensitivityChart) {
            this.sensitivityChart.destroy();
        }

        const datasets = resultados.map((resultado, index) => ({
            label: this.obtenerNombreTipo(resultado.tipo),
            data: [resultado.costoTotal],
            backgroundColor: this.obtenerColor(index),
            borderColor: this.obtenerColor(index),
            borderWidth: 1
        }));

        this.sensitivityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Costo Total Ajustado'],
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Análisis de Sensibilidad - Costo Total'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Costo Total ($)'
                        }
                    }
                }
            }
        });
    }

    obtenerColor(index) {
        const colores = [
            '#2563eb', // Azul
            '#059669', // Verde
            '#dc2626', // Rojo
            '#d97706'  // Naranja
        ];
        return colores[index % colores.length];
    }

    obtenerColorTransparente(index) {
        const colores = [
            'rgba(37, 99, 235, 0.1)',
            'rgba(5, 150, 105, 0.1)',
            'rgba(220, 38, 38, 0.1)',
            'rgba(217, 119, 6, 0.1)'
        ];
        return colores[index % colores.length];
    }

    compararOpciones() {
        const opciones = this.obtenerDatosFormulario();
        
        if (opciones.length === 0 || !this.validarDatos(opciones)) {
            this.mostrarAlerta('Por favor complete todos los campos requeridos', 'danger');
            return;
        }

        const resultados = this.calcularOpcionesFinanciamiento(opciones);
        this.mostrarResultados(resultados);
        
        // Scroll a resultados
        document.getElementById('resultados').scrollIntoView({ behavior: 'smooth' });
    }

    validarDatos(opciones) {
        return opciones.every(opcion => {
            const valores = Object.values(opcion);
            return valores.every(valor => valor > 0);
        });
    }

    limpiarDatos() {
        document.querySelectorAll('.form-input').forEach(input => {
            input.value = '';
        });
        
        // Limpiar resultados
        document.getElementById('comparisonBody').innerHTML = '';
        document.getElementById('alertsContainer').innerHTML = '';
        document.getElementById('paybackPeriod').textContent = '-';
        document.getElementById('van').textContent = '-';
        document.getElementById('tir').textContent = '-';
        document.getElementById('benefitCostRatio').textContent = '-';
        
        // Destruir gráficos
        if (this.chart) this.chart.destroy();
        if (this.sensitivityChart) this.sensitivityChart.destroy();
        
        this.mostrarAlerta('Datos limpiados correctamente', 'info');
    }

    mostrarAlerta(mensaje, tipo) {
        const alerta = document.createElement('div');
        alerta.className = `alert ${tipo}`;
        alerta.innerHTML = `<i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'danger' ? 'times-circle' : 'info-circle'}"></i> ${mensaje}`;
        alerta.style.position = 'fixed';
        alerta.style.top = '20px';
        alerta.style.right = '20px';
        alerta.style.zIndex = '1000';
        alerta.style.padding = '1rem 2rem';
        alerta.style.borderRadius = '0.5rem';
        alerta.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        
        document.body.appendChild(alerta);
        
        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }

    initCharts() {
        // Inicializar gráficos vacíos
        const ctx1 = document.getElementById('cashflowChart').getContext('2d');
        const ctx2 = document.getElementById('sensitivityChart').getContext('2d');
        
        // Crear gráficos vacíos para evitar errores
        new Chart(ctx1, {
            type: 'line',
            data: { labels: [], datasets: [] },
            options: { maintainAspectRatio: false }
        });
        
        new Chart(ctx2, {
            type: 'bar',
            data: { labels: [], datasets: [] },
            options: { maintainAspectRatio: false }
        });
    }
}

// Inicializar la aplicación cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
    new FinanciamientoComparador();
});


