"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface ResultPreviewProps {
  result: {
    elements: any[];
    preview: string;
  };
}

export function ResultPreview({ result }: ResultPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewMode, setPreviewMode] = useState<"canvas" | "json">("canvas");

  useEffect(() => {
    if (!canvasRef.current || previewMode !== "canvas") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (result.preview) {
      const image = new Image();
      image.onload = () => {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      image.src = result.preview;
      return;
    }

    result.elements.forEach((element) => {
      renderElement(ctx, element);
    });
  }, [result, previewMode]);

  const renderElement = (ctx: CanvasRenderingContext2D, element: any) => {
    ctx.beginPath();
    ctx.strokeStyle = element.strokeColor || "#000";
    ctx.lineWidth = element.strokeWidth || 2;

    switch (element.type) {
      case "rectangle":
        ctx.rect(element.x, element.y, element.width, element.height);
        break;
      case "circle":
        ctx.arc(
          element.x + element.radius,
          element.y + element.radius,
          element.radius,
          0,
          Math.PI * 2
        );
        break;
      case "line":
        ctx.moveTo(element.x1, element.y1);
        ctx.lineTo(element.x2, element.y2);
        break;
      case "text":
        ctx.font = `${element.fontSize || 16}px sans-serif`;
        ctx.fillStyle = element.color || "#000";
        ctx.fillText(element.text, element.x, element.y);
        return; // No stroke for text
    }

    if (element.fill) {
      ctx.fillStyle = element.fillColor || "#fff";
      ctx.fill();
    }
    ctx.stroke();
  };

  return (
    <div className='space-y-4'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-lg font-medium'>Vista Previa del Resultado</h3>

        <div className='flex items-center space-x-2'>
          <Button
            onClick={() => setPreviewMode("canvas")}
            className={`rounded px-3 py-1 text-sm ${
              previewMode === "canvas"
                ? "bg-primary-blue text-white"
                : "bg-gray-100"
            }`}
          >
            Visual
          </Button>
          <Button
            onClick={() => setPreviewMode("json")}
            className={`rounded px-3 py-1 text-sm ${
              previewMode === "json"
                ? "bg-primary-blue text-white"
                : "bg-gray-100"
            }`}
          >
            JSON
          </Button>
        </div>
      </div>
      {previewMode === "canvas" ? (
        <div className='overflow-hidden rounded-lg border bg-white'>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className='h-auto w-full'
          ></canvas>
        </div>
      ) : (
        <Card className='max-h-96 overflow-auto bg-gray-50 p-4'>
          <pre className='whitespace-pre-wrap text-xs'>
            {JSON.stringify(result.elements, null, 2)}
          </pre>
        </Card>
      )}

      <div className='text-sm text-gray-500'>
        <p>Se han detectado {result.elements.length} elementos en tu boceto.</p>
        <p>
          Puedes crear un nuevo proyecto con estos elementos o modificarlos
          después.
        </p>
      </div>
    </div>
  );
}
