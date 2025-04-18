import { NextResponse } from "next/server";

let projects = [
  {
    id: "1",
    name: "Diseño de UI Dashboard",
    description: "Wireframes para el dashboard principal",
    ownerId: "1",
    collaborators: ["2", "3"],
    createdAt: "2025-04-10T12:00:00Z",
    updatedAt: "2025-04-15T14:30:00Z",
  },
  {
    id: "2",
    name: "Wireframes App Móvil",
    description: "Diseño de interfaces para la app móvil",
    ownerId: "1",
    collaborators: ["2", "4", "5", "6", "7"],
    createdAt: "2025-04-05T09:15:00Z",
    updatedAt: "2025-04-10T16:45:00Z",
  },
  {
    id: "3",
    name: "Logo empresa XYZ",
    description: "Diseño de logo y manual de marca",
    ownerId: "1",
    collaborators: ["3"],
    createdAt: "2025-04-01T10:30:00Z",
    updatedAt: "2025-04-05T11:20:00Z",
  },
];

export async function GET() {
  try {
    //TODO: En caso real se haría una consulta a la base de datos para obtener los proyectos del usuario autenticado
    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { message: "Error fetching projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json();

    if (!name || !description) {
      return NextResponse.json(
        { message: "Name and description are required" },
        { status: 400 }
      );
    }

    const newProject = {
      id: (projects.length + 1).toString(),
      name,
      description,
      ownerId: "1", //TODO:  En un caso real, sería el ID del usuario autenticado
      collaborators: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.push(newProject);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { message: "Error creating project" },
      { status: 500 }
    );
  }
}
