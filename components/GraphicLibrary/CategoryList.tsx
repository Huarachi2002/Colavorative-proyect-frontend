import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Square, Star, Layout, GitBranch, Palette } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryListProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

// Componente para mostrar el ícono según su nombre
const IconDisplay = ({ name }) => {
  switch (name) {
    case "Square":
      return <Square className='h-4 w-4' />;
    case "StarIcon":
      return <Star className='h-4 w-4' />;
    case "Layout":
      return <Layout className='h-4 w-4' />;
    case "GitBranch":
      return <GitBranch className='h-4 w-4' />;
    case "Palette":
      return <Palette className='h-4 w-4' />;
    default:
      return <Square className='h-4 w-4' />;
  }
};

export default function CategoryList({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryListProps) {
  return (
    <div className='py-2'>
      <Button
        variant='ghost'
        className={cn(
          "w-full justify-start px-2 py-1.5 text-sm font-normal",
          selectedCategory === "all" ? "bg-muted" : "hover:bg-muted/50"
        )}
        onClick={() => onSelectCategory("all")}
      >
        <span className='flex items-center'>
          <Square className='mr-2 h-4 w-4' />
          <span>Todos</span>
        </span>
      </Button>

      {categories.map((category) => (
        <Button
          key={category.id}
          variant='ghost'
          className={cn(
            "w-full justify-start px-2 py-1.5 text-sm font-normal",
            selectedCategory === category.id ? "bg-muted" : "hover:bg-muted/50"
          )}
          onClick={() => onSelectCategory(category.id)}
        >
          <span className='flex items-center'>
            <IconDisplay name={category.icon} />
            <span className='ml-2'>{category.name}</span>
          </span>
        </Button>
      ))}
    </div>
  );
}
