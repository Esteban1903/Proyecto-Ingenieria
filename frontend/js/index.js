// Variable global para la instancia
let comparadorInstance = null;

// Clase principal para manejar opciones de financiamiento
class FinanciamientoComparador {
    constructor() {
        this.opciones = [];
        this.resultados = [];
        this.chart = null;
        this.usuario = null;
        this.init();
    }

    init() {
        console.log('Inicializando FinanciamientoComparador...');
        
        // Cargar datos del usuario
        this.cargarUsuario();
        
        // Event listeners
        const compararBtn = document.getElementById('compararBtn');
        const limpiarBtn = document.getElementById('limpiarBtn');
        const saveBtn = document.getElementById('saveRecommendation');
        const exportBtn = document.getElementById('exportReport');
        
        console.log('Botones encontrados:', {
            comparar: compararBtn,
            limpiar: limpiarBtn,
            save: saveBtn,
            export: exportBtn
        });
        
        if (compararBtn) {
            compararBtn.addEventListener('click', () => {
                console.log('Botón comparar clickeado!');
                this.compararOpciones();
            });
            console.log('Event listener agregado a compararBtn');
        } else {
            console.error('No se encontró el botón compararBtn');
        }
        
        if (limpiarBtn) {
            limpiarBtn.addEventListener('click', () => this.limpiarDatos());
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.guardarRecomendacion());
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportarReporte());
        }
        
        // Navegación suave
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.getAttribute('href');
                document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
                this.actualizarNavActiva(target);
            });
        });

        // Inicializar gráficos
        this.initCharts();
        
        console.log('FinanciamientoComparador inicializado correctamente');
    }

    cargarUsuario() {
        try {
            const usuarioData = localStorage.getItem('usuario');
            if (usuarioData && usuarioData !== 'undefined') {
                const usuario = JSON.parse(usuarioData);
                if (usuario) {
                    this.usuario = usuario;
                    const nombreElement = document.getElementById('nombre-usuario');
                    if (nombreElement) {
                        nombreElement.textContent = usuario.nombre;
                    }
                }
            }
        } catch (error) {
            console.log('No hay usuario logueado o error al cargar usuario:', error);
        }
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
        console.log('Buscando option-cards...');
        const cards = document.querySelectorAll('.option-card');
        console.log('Cards encontradas:', cards.length);
        
        cards.forEach((card, index) => {
            console.log(`Procesando card ${index}:`, card);
            const form = card.querySelector('.option-form');
            const tipo = card.dataset.type;
            console.log(`Tipo: ${tipo}, Form encontrado:`, form);
            
            if (!form) {
                console.log('No se encontró form en card:', card);
                return;
            }
            
            const datos = {};
            
            // Obtener todos los inputs del formulario
            const inputs = form.querySelectorAll('.form-input');
            console.log(`Inputs encontrados en ${tipo}:`, inputs.length);
            
            inputs.forEach((input, inputIndex) => {
                const valor = parseFloat(input.value) || 0;
                console.log(`Input ${inputIndex}: valor = ${valor}, input.value = "${input.value}"`);
                
                // Obtener el label para usar como key
                const labelElement = input.previousElementSibling;
                if (labelElement) {
                    const label = labelElement.textContent
                        .replace(':', '')
                        .replace(/\s+/g, '_')
                        .replace(/\(|\)|%|COP/g, '')
                        .replace(/_+$/, '') // Quitar guiones bajos al final
                        .toLowerCase();
                    console.log(`Label procesado: "${label}"`);
                    datos[label] = valor;
                } else {
                    console.log('No se encontró label para input:', input);
                }
            });
            
            datos.tipo = tipo;
            console.log(`Datos finales para ${tipo}:`, datos);
            opciones.push(datos);
        });
        
        console.log('Opciones finales:', opciones);
        return opciones;
    }

    calcularOpcionesFinanciamiento(opciones) {
        const resultados = [];
        
        opciones.forEach(opcion => {
            let resultado = {};

            switch(opcion.tipo) {
                case 'prestamo':
                    resultado = this.calcularPrestamo(opcion);
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
        console.log('Datos recibidos en calcularPrestamo:', datos);
        
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
        
        // Calcular capacidad de pago
        const capacidadPago = this.usuario ? (pagoMensual / this.usuario.ingresos) * 100 : 0;
        
        return {
            tipo: 'prestamo',
            nombre: 'Préstamo Bancario',
            costoTotal: costoTotal,
            pagoMensual: pagoMensual,
            tasaEfectiva: tea * 100,
            roi: this.calcularROI(costoTotal, monto_del_préstamo),
            riesgo: this.calcularRiesgoPrestamo(tasa_de_interés_anual, capacidadPago),
            capacidadPago: capacidadPago,
            tiempoRecuperacion: this.calcularTiempoRecuperacion(pagoMensual, monto_del_préstamo),
            ventajas: [
                'Tasa de interés fija y predecible',
                'Plazo definido y controlado',
                'Posible desgravación fiscal de intereses',
                'Acceso a montos significativos',
                'Proceso establecido y transparente'
            ],
            desventajas: [
                'Requiere garantías y avales',
                'Proceso de aprobación largo',
                'Comisiones y seguros adicionales',
                'Pago obligatorio de intereses',
                'Impacto en historial crediticio'
            ],
            bancos: this.obtenerBancosPrestamo(),
            puntuacion: this.calcularPuntuacionPrestamo(tasa_de_interés_anual, capacidadPago, plazo_meses)
        };
    }

    calcularCapitalRiesgo(datos) {
        const { inversión_requerida, porcentaje_de_participación, valoración_de_la_empresa, tiempo_de_salida_años } = datos;
        console.log('Datos recibidos en calcularCapitalRiesgo:', datos);
        
        // Calcular participación accionaria
        const participacion = porcentaje_de_participación / 100;
        const valorParticipacion = (valoración_de_la_empresa * participacion) - inversión_requerida;
        
        // ROI esperado (estimación conservadora)
        const roiEsperado = valorParticipacion / inversión_requerida;
        
        return {
            tipo: 'capital',
            nombre: 'Capital de Riesgo',
            costoTotal: inversión_requerida,
            pagoMensual: 0,
            tasaEfectiva: 0,
            roi: roiEsperado * 100,
            riesgo: 'alto',
            capacidadPago: 0,
            tiempoRecuperacion: tiempo_de_salida_años * 12,
            ventajas: [
                'Sin pagos periódicos obligatorios',
                'Mentoría y contactos estratégicos',
                'No requiere garantías personales',
                'Acceso a expertise y redes',
                'Posible escalamiento rápido'
            ],
            desventajas: [
                'Pérdida de control accionario',
                'Alta incertidumbre en retornos',
                'Proceso largo de negociación',
                'Dilución de participación',
                'Expectativas altas de crecimiento'
            ],
            bancos: this.obtenerBancosCapitalRiesgo(),
            puntuacion: this.calcularPuntuacionCapitalRiesgo(roiEsperado, participacion, tiempo_de_salida_años)
        };
    }

    calcularCrowdfunding(datos) {
        const { meta_de_financiamiento, comisión_de_plataforma, recompensas_promedio, tiempo_de_campaña_días } = datos;
        console.log('Datos recibidos en calcularCrowdfunding:', datos);
        
        // Calcular comisión de plataforma
        const comision = (meta_de_financiamiento * comisión_de_plataforma) / 100;
        const costoTotal = meta_de_financiamiento + comision;
        
        // Costo promedio por recompensa
        const costoPorRecompensa = costoTotal / (meta_de_financiamiento / recompensas_promedio);
        
        return {
            tipo: 'crowdfunding',
            nombre: 'Crowdfunding',
            costoTotal: costoTotal,
            pagoMensual: costoTotal / tiempo_de_campaña_días * 30, // Estimación mensual
            tasaEfectiva: comisión_de_plataforma,
            roi: this.calcularROI(costoTotal, meta_de_financiamiento),
            riesgo: 'medio-alto',
            capacidadPago: 0,
            tiempoRecuperacion: tiempo_de_campaña_días / 30,
            ventajas: [
                'Validación de mercado y producto',
                'Marketing y exposición incluidos',
                'Sin garantías requeridas',
                'Feedback directo de clientes',
                'Posible viralización'
            ],
            desventajas: [
                'Comisión alta de plataforma',
                'Riesgo de no alcanzar la meta',
                'Tiempo y esfuerzo significativo',
                'Dependencia de campaña exitosa',
                'Costo de recompensas'
            ],
            bancos: this.obtenerBancosCrowdfunding(),
            puntuacion: this.calcularPuntuacionCrowdfunding(comisión_de_plataforma, tiempo_de_campaña_días)
        };
    }

    calcularRiesgoPrestamo(tasaInteres, capacidadPago) {
        if (tasaInteres > 20 || capacidadPago > 40) return 'alto';
        if (tasaInteres > 15 || capacidadPago > 30) return 'medio-alto';
        if (tasaInteres > 12 || capacidadPago > 25) return 'medio';
        return 'bajo';
    }

    calcularTiempoRecuperacion(pagoMensual, inversionInicial) {
        return pagoMensual > 0 ? (inversionInicial / pagoMensual) : 0;
    }

    calcularROI(costoTotal, inversionInicial) {
        if (costoTotal === 0 || inversionInicial === 0) return 0;
        return ((costoTotal - inversionInicial) / inversionInicial) * 100;
    }

    calcularPuntuacionPrestamo(tasaInteres, capacidadPago, plazo) {
        let puntuacion = 100;
        puntuacion -= (tasaInteres - 10) * 2; // Penalizar tasas altas
        puntuacion -= capacidadPago * 0.5; // Penalizar alta capacidad de pago
        puntuacion += (plazo <= 36) ? 10 : -5; // Bonificar plazos cortos
        return Math.max(0, Math.min(100, puntuacion));
    }

    calcularPuntuacionCapitalRiesgo(roi, participacion, tiempoSalida) {
        let puntuacion = 50;
        puntuacion += roi * 10; // Bonificar ROI alto
        puntuacion -= participacion * 20; // Penalizar alta participación
        puntuacion += (tiempoSalida <= 5) ? 10 : -10; // Bonificar salidas rápidas
        return Math.max(0, Math.min(100, puntuacion));
    }

    calcularPuntuacionCrowdfunding(comision, tiempoCampana) {
        let puntuacion = 60;
        puntuacion -= comision * 2; // Penalizar comisiones altas
        puntuacion += (tiempoCampana <= 60) ? 10 : -5; // Bonificar campañas cortas
        return Math.max(0, Math.min(100, puntuacion));
    }

    obtenerBancosPrestamo() {
        return [
            {
                nombre: 'Bancolombia',
                tipo: 'Banco Tradicional',
                caracteristicas: ['Líder en préstamos empresariales', 'Tasas competitivas', 'Amplia red de sucursales'],
                contacto: 'www.bancolombia.com'
            },
            {
                nombre: 'BBVA Colombia',
                tipo: 'Banco Tradicional',
                caracteristicas: ['Programas especiales para emprendedores', 'Proceso ágil', 'Tasas preferenciales'],
                contacto: 'www.bbva.com.co'
            },
            {
                nombre: 'Bancóldex',
                tipo: 'Entidad Especializada',
                caracteristicas: ['Financiamiento para emprendimiento', 'Tasas subsidiadas', 'Asesoría especializada'],
                contacto: 'www.bancoldex.com'
            },
            {
                nombre: 'Davivienda',
                tipo: 'Banco Tradicional',
                caracteristicas: ['Programas para PYMES', 'Financiamiento internacional', 'Servicios digitales'],
                contacto: 'www.davivienda.com'
            }
        ];
    }

    obtenerBancosCapitalRiesgo() {
        return [
            {
                nombre: 'iNNpulsa',
                tipo: 'Fondo de Capital',
                caracteristicas: ['Capital semilla', 'Aceleración de startups', 'Mentoría especializada'],
                contacto: 'www.innpulsa.com'
            },
            {
                nombre: 'Velum Ventures',
                tipo: 'Venture Capital',
                caracteristicas: ['Inversión en tecnología', 'Red internacional', 'Experiencia en escalamiento'],
                contacto: 'www.velumventures.com'
            },
            {
                nombre: 'Polymath Ventures',
                tipo: 'Venture Capital',
                caracteristicas: ['Enfoque en mercados emergentes', 'Modelo de construcción', 'Red de mentores'],
                contacto: 'www.polymathv.com'
            },
            {
                nombre: 'Mountain Nazca',
                tipo: 'Venture Capital',
                caracteristicas: ['Inversión en fintech', 'Experiencia regional', 'Red de contactos'],
                contacto: 'www.mountainnazca.com'
            }
        ];
    }

    obtenerBancosCrowdfunding() {
        return [
            {
                nombre: 'Vaki',
                tipo: 'Plataforma Crowdfunding',
                caracteristicas: ['Crowdfunding de recompensas', 'Comisión competitiva', 'Soporte en español'],
                contacto: 'www.vaki.co'
            },
            {
                nombre: 'Ideame',
                tipo: 'Plataforma Crowdfunding',
                caracteristicas: ['Enfoque en proyectos creativos', 'Comunidad activa', 'Herramientas de marketing'],
                contacto: 'www.ideame.com'
            },
            {
                nombre: 'Kickstarter',
                tipo: 'Plataforma Internacional',
                caracteristicas: ['Alcance global', 'Comunidad grande', 'Prestigio internacional'],
                contacto: 'www.kickstarter.com'
            },
            {
                nombre: 'Indiegogo',
                tipo: 'Plataforma Internacional',
                caracteristicas: ['Flexibilidad en metas', 'Herramientas avanzadas', 'Alcance internacional'],
                contacto: 'www.indiegogo.com'
            }
        ];
    }

    mostrarResultados(resultados) {
        this.resultados = resultados;
        
        // Encontrar la mejor opción
        const mejorOpcion = this.encontrarMejorOpcion(resultados);
        
        this.mostrarMejorOpcion(mejorOpcion);
        this.mostrarBancos(mejorOpcion);
        this.mostrarTablaComparativa(resultados);
        this.mostrarIndicadores(resultados);
        this.mostrarRecomendacion(mejorOpcion);
    }

    encontrarMejorOpcion(resultados) {
        // Algoritmo de puntuación que considera múltiples factores
        return resultados.reduce((mejor, actual) => {
            const scoreActual = this.calcularScoreCompleto(actual);
            const scoreMejor = this.calcularScoreCompleto(mejor);
            return scoreActual > scoreMejor ? actual : mejor;
        });
    }

    calcularScoreCompleto(opcion) {
        let score = opcion.puntuacion;
        
        // Ajustar según el perfil del usuario
        if (this.usuario) {
            // Si el usuario tiene ingresos altos, favorecer préstamos
            if (this.usuario.ingresos > 10000000 && opcion.tipo === 'prestamo') {
                score += 20;
            }
            
            // Si el usuario tiene deudas altas, favorecer capital de riesgo
            if (this.usuario.deudas > this.usuario.ingresos * 0.5 && opcion.tipo === 'capital') {
                score += 15;
            }
            
            // Si el usuario es nuevo, favorecer crowdfunding
            if (this.usuario.ingresos < 5000000 && opcion.tipo === 'crowdfunding') {
                score += 10;
            }
        }
        
        return score;
    }

    mostrarMejorOpcion(opcion) {
        document.getElementById('bestOptionTitle').textContent = opcion.nombre;
        document.getElementById('totalCost').textContent = this.formatearMoneda(opcion.costoTotal);
        document.getElementById('monthlyPayment').textContent = this.formatearMoneda(opcion.pagoMensual);
        document.getElementById('effectiveRate').textContent = `${opcion.tasaEfectiva.toFixed(2)}%`;
        
        // Mostrar nivel de riesgo
        const riskBadge = document.getElementById('riskBadge');
        const riskLevel = document.getElementById('riskLevel');
        riskLevel.textContent = opcion.riesgo.toUpperCase();
        riskBadge.className = `risk-badge riesgo-${opcion.riesgo}`;
        
        // Mostrar ventajas y desventajas
        const prosList = document.getElementById('prosList');
        const consList = document.getElementById('consList');
        
        prosList.innerHTML = opcion.ventajas.map(ventaja => `<li>${ventaja}</li>`).join('');
        consList.innerHTML = opcion.desventajas.map(desventaja => `<li>${desventaja}</li>`).join('');
    }

    mostrarBancos(opcion) {
        const banksGrid = document.getElementById('banksGrid');
        banksGrid.innerHTML = '';
        
        opcion.bancos.forEach(banco => {
            const bankCard = document.createElement('div');
            bankCard.className = 'bank-card';
            bankCard.innerHTML = `
                <h4>${banco.nombre}</h4>
                <span class="bank-type">${banco.tipo}</span>
                <ul class="bank-features">
                    ${banco.caracteristicas.map(caracteristica => `<li>${caracteristica}</li>`).join('')}
                </ul>
                <a href="https://${banco.contacto}" target="_blank" class="bank-link">
                    <i class="fas fa-external-link-alt"></i> Visitar
                </a>
            `;
            banksGrid.appendChild(bankCard);
        });
    }

    mostrarTablaComparativa(resultados) {
        const tbody = document.getElementById('comparisonBody');
        tbody.innerHTML = '';

        resultados.forEach(resultado => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${resultado.nombre}</td>
                <td>${this.formatearMoneda(resultado.costoTotal)}</td>
                <td>${this.formatearMoneda(resultado.pagoMensual)}</td>
                <td>${resultado.tasaEfectiva.toFixed(2)}%</td>
                <td><span class="riesgo-badge riesgo-${resultado.riesgo}">${resultado.riesgo}</span></td>
                <td>${this.obtenerRecomendacionTexto(resultado)}</td>
            `;
            
            tbody.appendChild(tr);
        });
    }

    obtenerRecomendacionTexto(opcion) {
        if (opcion.puntuacion >= 80) return 'Excelente opción';
        if (opcion.puntuacion >= 60) return 'Buena opción';
        if (opcion.puntuacion >= 40) return 'Opción viable';
        return 'Considerar cuidadosamente';
    }

    mostrarIndicadores(resultados) {
        const mejorOpcion = this.encontrarMejorOpcion(resultados);
        
        document.getElementById('paybackPeriod').textContent = `${mejorOpcion.tiempoRecuperacion.toFixed(1)} meses`;
        document.getElementById('roi').textContent = `${mejorOpcion.roi.toFixed(2)}%`;
        document.getElementById('paymentCapacity').textContent = `${mejorOpcion.capacidadPago.toFixed(1)}%`;
    }

    mostrarRecomendacion(opcion) {
        const recommendationText = document.getElementById('recommendationText');
        
        let texto = `Basado en su perfil financiero, recomendamos ${opcion.nombre} como la mejor opción. `;
        
        if (opcion.tipo === 'prestamo') {
            texto += `Esta opción ofrece estabilidad y predictibilidad en los pagos, ideal para emprendedores con flujo de caja estable.`;
        } else if (opcion.tipo === 'capital') {
            texto += `El capital de riesgo es ideal para empresas con alto potencial de crecimiento y que buscan escalamiento rápido.`;
        } else if (opcion.tipo === 'crowdfunding') {
            texto += `El crowdfunding es perfecto para validar su producto en el mercado y generar comunidad alrededor de su marca.`;
        }
        
        texto += ` La puntuación de esta opción es ${opcion.puntuacion.toFixed(0)}/100.`;
        
        recommendationText.textContent = texto;
    }

    formatearMoneda(valor) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    }

    compararOpciones() {
        console.log('Comparar opciones iniciado');
        const opciones = this.obtenerDatosFormulario();
        console.log('Opciones obtenidas:', opciones);
        
        if (opciones.length === 0 || !this.validarDatos(opciones)) {
            console.log('Datos inválidos');
            this.mostrarAlerta('Por favor complete todos los campos requeridos', 'danger');
            return;
        }

        console.log('Calculando opciones...');
        const resultados = this.calcularOpcionesFinanciamiento(opciones);
        console.log('Resultados calculados:', resultados);
        
        this.mostrarResultados(resultados);
        
        // Scroll a resultados
        document.getElementById('resultados').scrollIntoView({ behavior: 'smooth' });
    }

    validarDatos(opciones) {
        return opciones.every(opcion => {
            // Excluir el campo 'tipo' de la validación
            const { tipo, ...datosNumericos } = opcion;
            const valores = Object.values(datosNumericos);
            console.log(`Validando ${tipo}:`, valores);
            return valores.every(valor => valor > 0);
        });
    }

    limpiarDatos() {
        document.querySelectorAll('.form-input').forEach(input => {
            input.value = '';
        });
        
        // Limpiar resultados
        document.getElementById('comparisonBody').innerHTML = '';
        document.getElementById('bestOptionTitle').textContent = 'Mejor Opción';
        document.getElementById('totalCost').textContent = '-';
        document.getElementById('monthlyPayment').textContent = '-';
        document.getElementById('effectiveRate').textContent = '-';
        document.getElementById('riskLevel').textContent = '-';
        document.getElementById('prosList').innerHTML = '';
        document.getElementById('consList').innerHTML = '';
        document.getElementById('banksGrid').innerHTML = '';
        document.getElementById('paybackPeriod').textContent = '-';
        document.getElementById('roi').textContent = '-';
        document.getElementById('paymentCapacity').textContent = '-';
        document.getElementById('recommendationText').textContent = 'Complete los datos para obtener una recomendación personalizada basada en su perfil financiero.';
        
        this.mostrarAlerta('Datos limpiados correctamente', 'info');
    }

    async guardarRecomendacion() {
        if (!this.usuario || this.resultados.length === 0) {
            this.mostrarAlerta('No hay recomendación para guardar', 'warning');
            return;
        }

        try {
            const mejorOpcion = this.encontrarMejorOpcion(this.resultados);
            const recomendacion = {
                usuario_id: this.usuario.id,
                opcion_recomendada: mejorOpcion.tipo,
                puntuacion: mejorOpcion.puntuacion,
                datos: mejorOpcion
            };

            const response = await fetch('http://localhost:3000/auth/save-recommendation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recomendacion)
            });

            if (response.ok) {
                this.mostrarAlerta('Recomendación guardada exitosamente', 'success');
            } else {
                throw new Error('Error en la respuesta del servidor');
            }
        } catch (error) {
            console.error('Error:', error);
            this.mostrarAlerta('Error al guardar la recomendación', 'danger');
        }
    }

    exportarReporte() {
        if (this.resultados.length === 0) {
            this.mostrarAlerta('No hay datos para exportar', 'warning');
            return;
        }

        const mejorOpcion = this.encontrarMejorOpcion(this.resultados);
        const reporte = {
            fecha: new Date().toLocaleDateString('es-CO'),
            usuario: this.usuario ? this.usuario.nombre : 'Usuario',
            recomendacion: mejorOpcion,
            comparacion: this.resultados,
            indicadores: {
                tiempoRecuperacion: mejorOpcion.tiempoRecuperacion,
                roi: mejorOpcion.roi,
                capacidadPago: mejorOpcion.capacidadPago
            }
        };

        // Crear y descargar archivo JSON
        const dataStr = JSON.stringify(reporte, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-financiamiento-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);

        this.mostrarAlerta('Reporte exportado exitosamente', 'success');
    }

    mostrarAlerta(mensaje, tipo) {
        const alerta = document.createElement('div');
        alerta.className = `alert ${tipo}`;
        alerta.innerHTML = `<i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'danger' ? 'times-circle' : tipo === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i> ${mensaje}`;
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
        // Inicializar gráficos vacíos si es necesario
        const ctx1 = document.getElementById('cashflowChart');
        if (ctx1) {
            new Chart(ctx1.getContext('2d'), {
                type: 'line',
                data: { labels: [], datasets: [] },
                options: { maintainAspectRatio: false }
            });
        }
    }
}

// Inicializar la aplicación cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, creando instancia...');
    comparadorInstance = new FinanciamientoComparador();
    console.log('Instancia creada:', comparadorInstance);
    
    // Cargar usuario
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario) {
        document.getElementById('nombre-usuario').textContent = usuario.nombre;
    }
});

// Función de test global
function testFunction() {
    console.log('=== TEST INICIADO ===');
    
    // Verificar si la clase existe
    console.log('FinanciamientoComparador existe:', typeof FinanciamientoComparador);
    
    // Verificar elementos del DOM
    const cards = document.querySelectorAll('.option-card');
    console.log('Cards encontradas:', cards.length);
    
    const inputs = document.querySelectorAll('.form-input');
    console.log('Inputs encontrados:', inputs.length);
    
    const compararBtn = document.getElementById('compararBtn');
    console.log('Botón comparar encontrado:', compararBtn);
    
    // Llenar algunos datos de prueba
    const testInputs = document.querySelectorAll('.form-input');
    testInputs.forEach((input, index) => {
        if (index < 4) { // Solo los primeros 4 inputs
            input.value = '1000000';
            console.log(`Llenado input ${index} con valor: 1000000`);
        }
    });
    
    console.log('=== TEST COMPLETADO ===');
}

// Función global de respaldo para comparar
function compararOpcionesGlobal() {
    console.log('=== FUNCIÓN GLOBAL LLAMADA ===');
    console.log('comparadorInstance:', comparadorInstance);
    console.log('Tipo de comparadorInstance:', typeof comparadorInstance);
    
    if (comparadorInstance) {
        console.log('Llamando compararOpciones...');
        comparadorInstance.compararOpciones();
    } else {
        console.error('No hay instancia de comparador disponible');
        console.log('Intentando crear nueva instancia...');
        comparadorInstance = new FinanciamientoComparador();
        if (comparadorInstance) {
            console.log('Nueva instancia creada, llamando compararOpciones...');
            comparadorInstance.compararOpciones();
        }
    }
}