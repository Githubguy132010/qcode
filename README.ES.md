
# QCode - Gestor de códigos de descuento

Una moderna Progressive Web App (PWA) para almacenar y gestionar códigos de descuento, construida con Next.js 15, TypeScript y Tailwind CSS.

## ✨ Funcionalidades

### 🎯 Funcionalidades principales
- **Almacenar códigos de descuento** - Guarda todos tus códigos con sus detalles
- **Búsqueda inteligente** - Busca por código, tienda, categoría o descripción
- **Categorización** - Organiza los códigos por categoría (Ropa, Electrónica, etc.)
- **Seguimiento de fechas de vencimiento** - Recibe alertas para códigos próximos a vencer
- **Favoritos** - Marca los códigos importantes como favoritos
- **Seguimiento de uso** - Rastrea con qué frecuencia usas tus códigos

### 📱 Progressive Web App
- **Funcionalidad offline** - Funciona sin conexión a internet
- **Instalable** - Instala como una app en tu teléfono/ordenador
- **Diseño responsive** - Perfecto en todos los dispositivos
- **Experiencia nativa** - Se siente como una app real

### 🎨 Experiencia de usuario
- **Diseño moderno** - Interfaz limpia y fácil de usar
- **Modo oscuro/claro** - Soporte automático de temas
- **Amigable al tacto** - Optimizado para controles táctiles
- **Accesibilidad** - Accesible para todos

## 🛠️ Stack técnico

- **Framework** : Next.js 15 con App Router
- **Lenguaje** : TypeScript para seguridad de tipos
- **Estilo** : Tailwind CSS para diseño responsive
- **Iconos** : Lucide React para iconografía consistente
- **Datos** : LocalStorage con soporte de sincronización en la nube
- **PWA** : Service Worker para funcionalidad offline
- **Build** : Turbopack para desarrollo rápido

## 🚀 Inicio rápido

### Desarrollo
```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm run dev

# Abrir navegador en http://localhost:3000
```

### Producción
```bash
# Construir la aplicación
pnpm run build

# Iniciar servidor de producción
pnpm start
```

## 📁 Estructura del proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout raíz con configuración PWA
│   ├── page.tsx           # Página principal
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   ├── Header.tsx         # Header de la app con navegación
│   ├── StatsOverview.tsx  # Resumen de estadísticas
│   ├── SearchAndFilter.tsx # Interfaz de búsqueda y filtro
│   ├── DiscountCodeCard.tsx # Tarjeta individual de código
│   ├── AddCodeModal.tsx   # Modal para nuevos códigos
│   ├── SyncStatusIndicator.tsx # Indicador de estado de sincronización
│   └── EmptyState.tsx     # Visualización de estado vacío
├── hooks/                 # Hooks React personalizados
│   ├── useDiscountCodes.ts # Gestión de estado para códigos
├── types/                 # Definiciones TypeScript
│   ├── discount-code.ts   # Interfaces y tipos de códigos
└── utils/                 # Funciones utilitarias
    ├── storage.ts         # Helpers de LocalStorage
    └── sync-utils.ts      # Utilidades de sincronización
```

## 💾 Modelo de datos

```typescript
interface DiscountCode {
  id: string              // Identificador único
  code: string           // El código de descuento mismo
  store: string          // Nombre de la tienda
  discount: string       // Cantidad/porcentaje de descuento
  expiryDate?: Date      // Fecha de vencimiento (opcional)
  category: string       // Categoría
  description?: string   // Descripción adicional
  isFavorite: boolean    // Estado de favorito
  isArchived: boolean    // Estado archivado
  dateAdded: Date        // Fecha de agregado
  timesUsed: number      // Número de usos
  // Metadatos de sincronización
  lastModified?: Date    // Última modificación
  syncVersion?: number   // Versión para resolución de conflictos
  deviceCreated?: string // Dispositivo donde se creó el código
}
```

## 🎨 Sistema de diseño

### Colores
- **Primario** : Azul (#3b82f6) - Acciones principales y enlaces
- **Éxito** : Verde (#10b981) - Códigos activos y éxito
- **Advertencia** : Naranja (#f59e0b) - Códigos próximos a vencer
- **Error** : Rojo (#ef4444) - Códigos vencidos y errores
- **Gris** : Varios tonos para texto y fondos

### Categorías
- Ropa
- Electrónica
- Comida y bebidas
- Deporte y fitness
- Libros y medios
- Viajes
- Belleza y cuidado personal
- Hogar y jardín
- Juguetes
- Otro

## 🔄 Gestión de estado

La app utiliza hooks React personalizados para gestión centralizada de estado:

### useDiscountCodes
- LocalStorage para persistencia
- Actualizaciones optimistas para UX rápida
- Seguimiento de metadatos de sincronización

## 📱 Funcionalidades PWA

### Instalación
La app se puede instalar en:
- iOS (Safari)
- Android (Chrome/Edge)
- Escritorio (Chrome/Edge/Safari)

### Funcionalidad offline
- Todos los códigos guardados están disponibles offline
- Los nuevos códigos se almacenan localmente

### Notificaciones
- Alertas para códigos próximos a vencer
- Actualizaciones sobre nuevas funcionalidades

## 🎯 Funcionalidades futuras

- [ ] Escaneo de códigos QR para entrada automática
- [ ] Soporte de códigos de barras
- [ ] Códigos compartidos entre usuarios
- [ ] Integraciones de tiendas para códigos automáticos
- [ ] Notificaciones push para ofertas
- [x] Funcionalidad de exportar/importar
- [x] Panel de análisis
- [ ] Personalización de tema
- [x] Soporte multilingüe
- [ ] Cifrado de extremo a extremo para códigos sensibles

## 📄 Licencia

Licencia MIT - ver archivo [LICENSE](LICENSE) para detalles.

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Abre un issue o envía un pull request.

## 📞 Contacto

Para preguntas o comentarios, abre un issue en GitHub.