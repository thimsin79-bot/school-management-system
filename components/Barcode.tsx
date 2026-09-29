"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeProps {
  value: string;
  className?: string;
  height?: number;
  width?: number;
  lineColor?: string;
  background?: string;
}

export function Barcode({
  value,
  className,
  height = 26,
  width = 1.6,
  lineColor = "#ffffff",
  background = "transparent",
}: BarcodeProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    try {
      JsBarcode(svg, value, {
        format: "CODE128",
        displayValue: false,
        height,
        width,
        margin: 0,
        lineColor,
        background,
      });
    } catch {
      /* value not encodable as CODE128 — leave the cell blank */
    }
  }, [value, height, width, lineColor, background]);

  return <svg ref={ref} className={className} />;
}
