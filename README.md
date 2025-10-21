# Comparador de Financiamiento para Emprendedores Colombianos

## Descripción

Sistema web que ayuda a emprendedores colombianos a comparar y elegir la mejor opción de financiamiento basada en su perfil financiero. El sistema analiza diferentes opciones (Préstamo Bancario, Capital de Riesgo, Crowdfunding) y proporciona recomendaciones personalizadas con información sobre bancos y entidades colombianas.

## Características Principales

### 🎯 Funcionalidades
- **Comparación Inteligente**: Analiza múltiples opciones de financiamiento
- **Recomendación Personalizada**: Sugiere la mejor opción basada en el perfil del usuario
- **Información de Bancos**: Lista de bancos y entidades colombianas para cada tipo de financiamiento
- **Análisis de Riesgo**: Evalúa el nivel de riesgo de cada opción
- **Ventajas y Desventajas**: Presenta pros y contras de cada alternativa
- **Indicadores Financieros**: Calcula métricas clave como ROI, tiempo de recuperación, etc.

### 🏦 Tipos de Financiamiento
1. **Préstamo Bancario**: Financiamiento tradicional con tasas fijas
2. **Capital de Riesgo**: Inversión a cambio de participación accionaria
3. **Crowdfunding**: Financiamiento colectivo a través de plataformas

### 🏛️ Bancos y Entidades Incluidas
- **Bancos Tradicionales**: Bancolombia, BBVA Colombia, Davivienda, Scotiabank Colpatria
- **Entidades Especializadas**: Bancóldex, Findeter, iNNpulsa
- **Venture Capital**: Velum Ventures, Polymath Ventures, Mountain Nazca
- **Plataformas Crowdfunding**: Vaki, Ideame, Kickstarter, Indiegogo

## Tecnologías Utilizadas

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Chart.js para gráficos
- Font Awesome para iconos
- Diseño responsive

### Backend
- Node.js con Express
- PostgreSQL como base de datos
- bcryptjs para encriptación de contraseñas
- CORS habilitado

## Instalación y Configuración

### Prerrequisitos
- Node.js (versión 14 o superior)
- PostgreSQL
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd proyecto-ingenieria
```

### 2. Configurar el Backend
```bash
cd backend
npm install
```

### 3. Configurar la Base de Datos
1. Crear una base de datos PostgreSQL
2. Ejecutar el script de creación de tablas:
```bash
psql -d tu_base_de_datos -f create_recommendations_table.sql
```

### 4. Configurar Variables de Entorno
Actualizar la cadena de conexión en `backend/db.js`:
```javascript
const pool = new Pool({
  connectionString: 'tu_cadena_de_conexion_postgresql'
});
```

### 5. Iniciar el Servidor
```bash
cd backend
npm start
```
El servidor se ejecutará en `http://localhost:3000`

### 6. Abrir el Frontend
Abrir `frontend/Index.html` en un navegador web o usar un servidor local.

## Estructura del Proyecto

```
proyecto-ingenieria/
├── backend/
│   ├── routes/
│   │   └── auth.js          # Rutas de autenticación y recomendaciones
│   ├── db.js                # Configuración de base de datos
│   ├── server.js            # Servidor principal
│   ├── package.json         # Dependencias del backend
│   └── create_recommendations_table.sql
├── frontend/
│   ├── js/
│   │   ├── index.js         # Lógica principal del comparador
│   │   ├── login.js         # Lógica de autenticación
│   │   └── registro.js      # Lógica de registro
│   ├── Index.html           # Página principal
│   ├── login.html           # Página de login
│   ├── registro.html        # Página de registro
│   └── Style.css            # Estilos CSS
└── README.md
```

## Uso del Sistema

### 1. Registro e Inicio de Sesión
- Los usuarios deben registrarse proporcionando información financiera básica
- El sistema utiliza esta información para personalizar las recomendaciones

### 2. Comparación de Opciones
- Ingresar datos para cada tipo de financiamiento
- El sistema calcula automáticamente costos, tasas efectivas y métricas
- Se muestra la mejor opción con análisis detallado

### 3. Recomendaciones
- El sistema recomienda la opción más adecuada basada en:
  - Perfil financiero del usuario
  - Capacidad de pago
  - Nivel de riesgo
  - Objetivos del emprendimiento

### 4. Información de Bancos
- Para cada opción recomendada, se muestran bancos y entidades relevantes
- Incluye características, contactos y enlaces

## API Endpoints

### Autenticación
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión
- `GET /auth/profile/:id` - Obtener perfil de usuario

### Recomendaciones
- `POST /auth/save-recommendation` - Guardar recomendación
- `GET /auth/recommendations/:usuario_id` - Obtener recomendaciones del usuario

## Algoritmo de Recomendación

El sistema utiliza un algoritmo de puntuación que considera:

1. **Factores Financieros**:
   - Tasa de interés
   - Costo total
   - Capacidad de pago del usuario
   - Plazo del financiamiento

2. **Perfil del Usuario**:
   - Ingresos mensuales
   - Nivel de deudas
   - Sector de la empresa
   - Objetivos de financiamiento

3. **Análisis de Riesgo**:
   - Riesgo bajo: Tasas < 12%, capacidad de pago < 25%
   - Riesgo medio: Tasas 12-15%, capacidad de pago 25-30%
   - Riesgo medio-alto: Tasas 15-20%, capacidad de pago 30-40%
   - Riesgo alto: Tasas > 20%, capacidad de pago > 40%

## Contribuciones

Para contribuir al proyecto:

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

Para preguntas o soporte, contactar a: [tu-email@ejemplo.com]

---

**Nota**: Este sistema está diseñado específicamente para el mercado colombiano y utiliza información actualizada de bancos y entidades financieras del país.
