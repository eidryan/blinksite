import React from "react";
import { DitheringShader } from "./dithering-shader";

export default function DemoOne() {
  return (
    <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-dark/50 border border-white/10 my-10">
      <div className="absolute inset-0 z-0">
          <DitheringShader 
            shape="ripple"
            type="2x2"
            colorBack="#330000"
            colorFront="#ffff00"
            pxSize={2}
            speed={1.2}
          />
      </div>
      <span className="pointer-events-none z-10 text-center text-7xl leading-none absolute font-display font-semibold text-white tracking-tighter whitespace-pre-wrap mix-blend-difference">
        Simplex
      </span>
    </div>
  )
}
