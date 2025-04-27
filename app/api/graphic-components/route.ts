import { NextResponse } from "next/server";

// Componentes gráficos de ejemplo
const components = [
  // Iconos
  {
    id: "arrow-right",
    name: "Flecha Derecha",
    category: "icons",
    type: "icon",
    preview:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTMuMTcyIDEyTDguMjIyIDcuMDVMOS42MzYgNS42MzZMMTYgMTJMOS42MzYgMTguMzY0TDguMjIyIDE2Ljk1TDEzLjE3MiAxMloiIGZpbGw9ImJsYWNrIi8+PC9zdmc+",
    data: {
      path: "M13.172 12L8.222 7.05L9.636 5.636L16 12L9.636 18.364L8.222 16.95L13.172 12Z",
      width: 24,
      height: 24,
      fill: "#000000",
    },
  },
  {
    id: "star-icon",
    name: "Estrella",
    category: "icons",
    type: "icon",
    preview:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMTcuMjdMMTguMTggMjFMMTYuNTQgMTMuOTdMMjIgOS4yNEwxNC44MSA4LjYzTDEyIDIgOS4xOSA4LjYzTDIgOS4yNEw3LjQ2IDEzLjk3TDUuODIgMjFMMTIgMTcuMjdaIiBmaWxsPSIjRkZDQzAwIi8+PC9zdmc+",
    data: {
      path: "M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z",
      width: 24,
      height: 24,
      fill: "#FFCC00",
    },
  },
  {
    id: "heart-icon",
    name: "Corazón",
    category: "icons",
    type: "icon",
    preview:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMjFMMTAuNSAxOS41M0M1LjQgMTQuOTIgMiAxMS44NiAyIDhDMiA0LjY5IDQuNjkgMiA4IDJDOS4zOCAyIDEwLjc0IDIuNSAxMiA0QzEzLjI2IDIuNSAxNC42MiAyIDE2IDJDMTkuMzEgMiAyMiA0LjY5IDIyIDhDMjIgMTEuODYgMTguNiAxNC45MiAxMy41IDE5LjUzTDEyIDIxWiIgZmlsbD0iI0ZGMzMzMyIvPjwvc3ZnPg==",
    data: {
      path: "M12 21L10.5 19.53C5.4 14.92 2 11.86 2 8C2 4.69 4.69 2 8 2C9.38 2 10.74 2.5 12 4C13.26 2.5 14.62 2 16 2C19.31 2 22 4.69 22 8C22 11.86 18.6 14.92 13.5 19.53L12 21Z",
      width: 24,
      height: 24,
      fill: "#FF3333",
    },
  },
  {
    id: "check-icon",
    name: "Verificación",
    category: "icons",
    type: "icon",
    preview:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOSAxNi4xN0w0LjgzIDEyTDMuNDEgMTMuNDFMOSAxOUwyMSA3TDE5LjU5IDUuNTlMOSAxNi4xN1oiIGZpbGw9IiM0Q0FGNTAiLz48L3N2Zz4=",
    data: {
      path: "M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z",
      width: 24,
      height: 24,
      fill: "#4CAF50",
    },
  },
  {
    id: "close-icon",
    name: "Cerrar",
    category: "icons",
    type: "icon",
    preview: "/assets/close.svg",
    data: {
      path: "M5,5 L15,15 M15,5 L5,15",
      width: 24,
      height: 24,
      fill: "",
      stroke: "#EF4444",
      strokeWidth: 2,
    },
  },

  // Elementos UI
  {
    id: "button-primary",
    name: "Botón Primario",
    category: "ui",
    type: "ui",
    preview:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIHJ4PSI0IiBmaWxsPSIjNEM3QkY0Ii8+PHRleHQgeD0iNjAiIHk9IjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNGRkZGRkYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJvdMOzbjwvdGV4dD48L3N2Zz4=",
    data: {
      element: "button",
      width: 120,
      height: 40,
      label: "Botón",
      fill: "#4C7BF4",
      borderRadius: 4,
      fontSize: 16,
      textColor: "#FFFFFF",
      fontFamily: "Arial",
    },
  },
  {
    id: "input-field-1",
    name: "Campo de Texto",
    category: "ui",
    type: "ui",
    preview:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMjAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iNDAiIHJ4PSI0IiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjQ0NDQ0NDIi8+PHRleHQgeD0iMTAiIHk9IjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiPkluZ3Jlc2UgdGV4dG8uLi48L3RleHQ+PC9zdmc+",
    data: {
      element: "input",
      width: 200,
      height: 40,
      placeholder: "Ingrese texto...",
    },
  },
  {
    id: "navbar",
    name: "Barra de Navegación",
    category: "ui",
    type: "ui",
    preview:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMzAwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNjAiIGZpbGw9IiMzMzMzMzMiLz48dGV4dCB4PSIyMCIgeT0iMzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiPkhvbWU8L3RleHQ+PHRleHQgeD0iOTAiIHk9IjM1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIj5BYm91dDwvdGV4dD48dGV4dCB4PSIxNjAiIHk9IjM1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIj5Db250YWN0PC90ZXh0Pjwvc3ZnPg==",
    data: {
      element: "navbar",
      width: 800,
      height: 60,
      fill: "#333333",
      items: ["Inicio", "Productos", "Servicios", "Contacto"],
    },
  },

  // Widgets
  {
    id: "slider-widget",
    name: "Deslizador",
    category: "custom",
    type: "widget",
    preview:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwIiB2aWV3Qm94PSIwIDAgMjAwIDIwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHk9IjgiIHdpZHRoPSIyMDAiIGhlaWdodD0iNCIgcng9IjIiIGZpbGw9IiNERERERkQiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMCIgcj0iMTAiIGZpbGw9IiM0QzdCRjQiLz48L3N2Zz4=",
    data: {
      widget: "slider",
      width: 200,
      value: 0.5,
    },
  },
  {
    id: "toggle-switch",
    name: "Interruptor Toggle",
    category: "custom",
    type: "widget",
    preview:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA1MCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iMjQiIHJ4PSIxMiIgZmlsbD0iIzRDN0JGNCIvPjxjaXJjbGUgY3g9IjM2IiBjeT0iMTIiIHI9IjEwIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==",
    data: {
      widget: "toggle",
      active: true,
    },
  },
  {
    id: "selector-widget",
    name: "Selector",
    category: "custom",
    type: "widget",
    preview: "/assets/selector.png",
    data: {
      widget: "selector",
      width: 200,
      selected: "Opción 1",
      options: ["Opción 1", "Opción 2", "Opción 3"],
    },
  },
  {
    id: "dropdown-selector",
    name: "Selector Desplegable",
    category: "custom",
    type: "widget",
    preview:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMjAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iNDAiIHJ4PSI0IiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjQ0NDQ0NDIi8+PHRleHQgeD0iMTAiIHk9IjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzMzMzMzMiPlNlbGVjY2lvbmFyLi4uPC90ZXh0Pjxwb2x5Z29uIHBvaW50cz0iMTgwLDE1IDE5MCwxNSAxODUsMjUiIGZpbGw9IiM5OTk5OTkiLz48L3N2Zz4=",
    data: {
      widget: "selector",
      width: 200,
      height: 40,
      selected: "Seleccionar...",
    },
  },
  {
    id: "card-ui",
    name: "Tarjeta",
    category: "ui",
    type: "svg",
    preview:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDI0MCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSIxNjAiIHJ4PSI4IiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjRUVFRUVFIi8+PHJlY3QgeD0iMTYiIHk9IjE2IiB3aWR0aD0iMjA4IiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjVGNUY1Ii8+PHRleHQgeD0iMTYiIHk9IjExOCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzMzMzMzMyI+VMOtdHVsbyBkZSBUYXJqZXRhPC90ZXh0Pjx0ZXh0IHg9IjE2IiB5PSIxNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiI+RGVzY3JpcGNpw7NuIGRlIGxhIHRhcmpldGE8L3RleHQ+PC9zdmc+",
    data: {
      svg: '<svg width="240" height="160" viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="240" height="160" rx="8" fill="white" stroke="#EEEEEE"/><rect x="16" y="16" width="208" height="80" fill="#F5F5F5"/><text x="16" y="118" font-family="Arial" font-size="16" font-weight="bold" fill="#333333">Título de Tarjeta</text><text x="16" y="140" font-family="Arial" font-size="12" fill="#666666">Descripción de la tarjeta</text></svg>',
      scale: 0.5,
    },
  },
  {
    id: "profile-avatar",
    name: "Avatar de Perfil",
    category: "ui",
    type: "svg",
    preview:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI0RERURGNyIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMTYiIHI9IjgiIGZpbGw9IiM5MkIwQ0YiLz48cGF0aCBkPSJNOCAzNkMxMiAyOCAxNiAyNCAxOCAyNEgyMkMyNCwyNCAyOCAyOCAzMiAzNkM0MCAzNiAzNiAyOCAyMCAyOEM0IDI4IDAgMzYgOCAzNloiIGZpbGw9IiM5MkIwQ0YiLz48L3N2Zz4=",
    data: {
      svg: '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="20" fill="#DDEDF7"/><circle cx="20" cy="16" r="8" fill="#92B0CF"/><path d="M8 36C12 28 16 24 18 24H22C24,24 28 28 32 36C40 36 36 28 20 28C4 28 0 36 8 36Z" fill="#92B0CF"/></svg>',
      scale: 1.5,
    },
  },
  {
    id: "device-mobile",
    name: "Móvil",
    category: "icons",
    type: "svg",
    preview:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUgM0g5QzguMjA0MzUgMyA3LjQ0MTI5IDMuMzE2MDcgNi44Nzg2OCAzLjg3ODY4QzYuMzE2MDcgNC40NDEyOSA2IDUuMjA0MzUgNiA2VjE4QzYgMTguNzk1NiA2LjMxNjA3IDE5LjU1ODcgNi44Nzg2OCAyMC4xMjEzQzcuNDQxMjkgMjAuNjgzOSA4LjIwNDM1IDIxIDkgMjFIMTVDMTUuNzk1NiAyMSAxNi41NTg3IDIwLjY4MzkgMTcuMTIxMyAyMC4xMjEzQzE3LjY4MzkgMTkuNTU4NyAxOCAxOC43OTU2IDE4IDE4VjZDMTggNS4yMDQzNSAxNy42ODM5IDQuNDQxMjkgMTcuMTIxMyAzLjg3ODY4QzE2LjU1ODcgMy4zMTYwNyAxNS43OTU2IDMgMTUgM1pNMTIgMTguNzVDMTEuODA1NSAxOC43NSAxMS42MTYyIDE4LjcwMzMgMTEuNDU4NCAxOC42MTQ0QzExLjMwMDUgMTguNTI1NiAxMS4xODIzIDE4LjM5ODkgMTEuMTE2NiAxOC4yNDk1QzExLjA1MDggMTguMSAxMS4wNDA5IDE3LjkzNDggMTEuMDg4MiAxNy43NzkzQzExLjEzNTQgMTcuNjIzOSAxMS4yMjc5IDE3LjQ4NTggMTEuMzUzNSAxNy4zODA1QzExLjQ3OTIgMTcuMjc1MiAxMS42MzI3IDE3LjIwNzIgMTEuNzkzNSAxNy4xODU4QzExLjk1NDQgMTcuMTY0NSAxMi4xMTgyIDE3LjE5MDQgMTIuMjY0OSAxNy4yNjAxQzEyLjQxMTcgMTcuMzI5OSAxMi41MzQ4IDE3LjQ0MTMgMTIuNjE3NyAxNy41ODAxQzEyLjcwMDYgMTcuNzE5IDEyLjc0IDE3Ljg3ODcgMTIuNzMxMSAxOC4wMzg2QzEyLjcyMjEgMTguMTk4NSAxMi42NjUgMTguMzUyNiAxMi41Njc3IDE4LjQ4MUMxMi40NzA1IDE4LjYwOTQgMTIuMzM3MyAxOC43MDY1IDEyLjE4NTcgMTguNzYwMUMxMi4wMzQgMTguODEzNyAxMS44Njk2IDE4LjgyMTMgMTEuNzEzMyAxOC43ODFDMTEuNTU3IDE4Ljc0MDggMTEuNDE1NSAxOC42NTUgMTEuMyAxOC41MzUxQzExLjE4NDYgMTguNDE1MyAxMS4xIDE4LjI2NyAxMS4wNjE2IDE4LjEwMjJDMTEuMDIzMyAxNy45Mzc0IDExLjAzMjggMTcuNzY0MyAxMS4wODg4IDE3LjYwNEMxMS4xNDQ3IDE3LjQ0MzggMTEuMjQ0OCAxNy4zMDIxIDExLjM3NjQgMTcuMTk0N0MxMS41MDggMTcuMDg3NCAxMS42NjUyIDE3LjAxODUgMTEuODMxIDE2Ljk5NzVDMTEuODg2NiAxNi45OTA2IDExLjk0MzIgMTYuOTkwNiAxMS45OTg4IDE2Ljk5NzVDMTIuMDcyNiAxNi45OTU0IDEyLjE0NjEgMTcuMDA0MyAxMi4yMTU5IDE3LjAyNEMxMi4yODU2IDE3LjA0MzggMTIuMzUwMSAxNy4wNzQyIDEyLjQwNTkgMTcuMTEzOUMxMi40NjE3IDE3LjE1MzUgMTIuNTA3NyAxNy4yMDEzIDEyLjU0MTMgMTcuMjU0OEMxMi41NzQ5IDE3LjMwODIgMTIuNTk1OCAxNy4zNjYyIDEyLjYwMyAxNy40MjY5QzEyLjYxMDIgMTcuNDg3NiAxMi42MDM3IDE3LjU0OTQgMTIuNTgzNyAxNy42MDc4QzEyLjU2MzggMTcuNjY2MyAxMi41MzA4IDE3LjcyMDEgMTIuNDg2OSAxNy43NjY0QzEyLjQ0MyAxNy44MTI3IDEyLjM4OSAxNy44NTA2IDEyLjMyOTIgMTcuODc4MUMxMi4yNjkzIDE3LjkwNTUgMTIuMjA1MiAxNy45MjE4IDEyLjE0IDE3LjkyNTlDMTIuMDc0OCAxNy45MyAxMi4wMDk2IDE3LjkyMTggMTEuOTQ3MyAxNy45MDE2QzExLjgxOTEgMTcuODcxNSAxMS43MDczIDE3Ljc5NDQgMTEuNjQyMyAxNy42ODhDMTEuNTc3MiAxNy41ODE2IDExLjU2NDQgMTcuNDU0NSAxMS42MDcxIDE3LjMzNzVDMTEuNjQ5OSAxNy4yMjA1IDExLjc0MzggMTcuMTI0MiAxMS44NjQzIDE3LjA2NjFDMTEuOTg0OSAxNy4wMDgxIDEyLjEyMDkgMTYuOTkyNiAxMi4yNDg4IDE3LjAyMjdDMTIuMjk0OCAxNy4wMzE4IDEyLjMzOTEgMTcuMDQ2OCAxMi4zODA2IDE3LjA2N0MxMi40MjIgMTcuMDg3MiAxMi40NjAxIDE3LjExMjcgMTIuNDkzNSAxNy4xNDI5QzEyLjUyNjggMTcuMTczMSAxMi41NTQ5IDE3LjIwNzcgMTIuNTc2OSAxNy4yNDVDMTIuNTk5IDE3LjI4MjMgMTIuNjE0NyAxNy4zMjIyIDEyLjYyMzQgMTcuMzYzN0MxMi42MzIyIDE3LjQwNTMgMTIuNjMzNyAxNy40NDggMTIuNjI4MSAxNy40ODk4QzEyLjYyMjQgMTcuNTMxNyAxMi42MDk4IDE3LjU3MjMgMTIuNTkxIDE3LjYwOTlDMTIuNTcyMyAxNy42NDc1IDEyLjU0NzYgMTcuNjgxMyAxMi41MTgxIDE3LjcwOTZDMTIuNDg4NSAxNy43MzggMTIuNDU0NyAxNy43NjA2IDEyLjQxODIgMTcuNzc2NUMxMi4zODE2IDE3Ljc5MjUgMTIuMzQyOCAxNy44MDE1IDEyLjMwMzQgMTcuODAyOUMxMi4yNjQgMTcuODA0NCAxMi4yMjQ2IDE3Ljc5ODMgMTIuMTg3MyAxNy43ODVDMTIuMTUwMSAxNy43NzE3IDEyLjExNTYgMTcuNzUxNyAxMi4wODU2IDE3LjcyNjJDMTIuMDU1NSAxNy43MDA3IDEyLjAzMDQgMTcuNjcwMiAxMi4wMTE2IDE3LjYzNjFDMTEuOTkyNyAxNy42MDIgMTEuOTgwMSAxNy41NjQ5IDExLjk3NDggMTcuNTI2NUMxMS45Njk1IDE3LjQ4OCAxMS45NzE4IDE3LjQ0OSAxMS45ODEyIDE3LjQxMTRDMTEuOTkwNyAxNy4zNzM3IDEyLjAwNzEgMTcuMzM4IDEyLjAyOTYgMTcuMzA2N0MxMi4wNTIxIDE3LjI3NTQgMTIuMDgwNCAxNy4yNDkgMTIuMTEyOCAxNy4yMjk0QzEyLjE0NTIgMTcuMjA5OSAxMi4xODEgMTcuMTk3NSAxMi4yMTg0IDE3LjE5MzJDMTIuMjU1OSAxNy4xODg4IDEyLjI5NDEgMTcuMTkyNyAxMi4zMjk5IDE3LjIwNDZDMTIuMzY1NiAxNy4yMTY1IDEyLjM5OCAxNy4yMzYgMTIuNDI0OCAxNy4yNjFDMTIuNDUxNSAxNy4yODU5IDEyLjQ3MiAxNy4zMTU5IDEyLjQ4NDcgMTcuMzQ5QzEyLjQ5NzQgMTcuMzgyMSAxMi41MDIgMTcuNDE3NiAxMi40OTggMTcuNDUyNkMxMi40OTM5IDE3LjQ4NzYgMTIuNDgxNSAxNy41MjEgMTIuNDYxOCAxNy41NTAzQzEyLjQ0MjIgMTcuNTc5NiAxMi40MTU4IDE3LjYwMzggMTIuMzg1IDIuNjU5N00xMi4zODUgMTcuNjIxN0MxMi4zMDY1IDE3LjY5MjggMTIuMTk1OCAxNy43MjE0IDEyLjA4ODkgMTcuNjk3M0MxMS45ODIgMTcuNjczMSAxMS44OTQ2IDE3LjU5OTUgMTEuODUzNyAxNy41QzExLjgxMjkgMTcuNDAwNSAxMS44MjQ1IDE3LjI4OTggMTEuODg0NSAxNy4xOTk3QzExLjk0NDUgMTcuMTA5NiAxMi4wNDQzIDE3LjA1MjkgMTIuMTUgMTcuMDVDMTIuMTg2NCAxNy4wNDg4IDEyLjIyMjkgMTcuMDU0MyAxMi4yNTc2IDE3LjA2NjNDMTIuMjkyMyAxNy4wNzgzIDEyLjMyNDUgMTcuMDk2NSAxMi4zNTIyIDE3LjEyQzEyLjM3OTkgMTcuMTQzNSAxMi40MDI1IDE3LjE3MTkgMTIuNDE4NSAxNy4yMDM3QzEyLjQzNDYgMTcuMjM1NiAxMi40NDM4IDE3LjI3MDMgMTIuNDQ1NCAxNy4zMDU5QzEyLjQ0NzEgMTcuMzQxNSAxMi40NDExIDE3LjM3NzEgMTIuNDI3OSAxNy40MTAzQzEyLjQxNDcgMTcuNDQzNiAxMi4zOTQ2IDE3LjQ3MzYgMTIuMzY5MSAxNy40OThDMTIuMzQzNiAxNy41MjI0IDEyLjMxMzEgMTcuNTQwOCAxMi4yNzkxIDE3LjU1MTlDMTIuMjQ1MiAxNy41NjMgMTIuMjA5MSAxNy41NjY1IDEyLjE3MzUgMTcuNTYyQzEyLjEzNzkgMTcuNTU3NSAxMi4xMDM5IDE3LjU0NTEgMTIuMDc0MSAxNy41MjU3QzEyLjA0NDMgMTcuNTA2MyAxMi4wMTkzIDE3LjQ4MDQgMTIuMDAxMiAxNy40NDk3QzExLjk4MzIgMTcuNDE5MSAxMS45NzI1IDE3LjM4NDcgMTEuOTcwMSAxNy4zNDkxQzExLjk2NzYgMTcuMzEzNCAxMS45NzM1IDE3Ljc3NzQgMTEuOTg3IDc2QzExLjUgMTYuNSAxMi41IDE2LjUgMTIgMThaTTggNUgxNlYxOkg4VjVaIiBmaWxsPSIjMzk0MjRFIi8+PC9zdmc+",
    data: {
      svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 3H9C8.20435 3 7.44129 3.31607 6.87868 3.87868C6.31607 4.44129 6 5.20435 6 6V18C6 18.7956 6.31607 19.5587 6.87868 20.1213C7.44129 20.6839 8.20435 21 9 21H15C15.7956 21 16.5587 20.6839 17.1213 20.1213C17.6839 19.5587 18 18.7956 18 18V6C18 5.20435 17.6839 4.44129 17.1213 3.87868C16.5587 3.31607 15.7956 3 15 3ZM8 5H16V19H8V5Z" fill="#39424E"/></svg>',
      scale: 2,
    },
  },
];

// API endpoint para obtener los componentes gráficos
export async function GET() {
  return NextResponse.json({
    components,
    success: true,
  });
}
