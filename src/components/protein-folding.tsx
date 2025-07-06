"use client";

import React, { useState, useEffect, useRef } from 'react';

// PAE Plot Component (Predicted Aligned Error)
function PAEPlot({ morph }: { morph: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, size, size);
    const resolution = 20;
    const cellSize = size / resolution;
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        let baseError = 15 - morph * 10;
        const noise = (Math.random() - 0.5) * 3;
        const error = Math.max(0, Math.min(30, baseError + noise));
        const intensity = 1 - (error / 30);
        const r = Math.round(255 * (1 - intensity));
        const g = Math.round(255 * intensity);
        const b = 0;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }, [morph]);
  return (
    <div style={{ textAlign: 'center' }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          border: '1px solid rgba(255,255,255,0.2)', 
          borderRadius: '8px',
          maxWidth: '100%',
          height: 'auto'
        }} 
      />
      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
        PAE Plot: Green = Low Error, Red = High Error
      </p>
    </div>
  );
}

export default function ProteinFolding() {
  const [morph, setMorph] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setMorph(prev => {
        if (prev >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return prev + 0.01;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);
  return (
    <div style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ 
        width: "100%", 
        background: "rgba(255,255,255,0.1)", 
        borderRadius: 12, 
        padding: 16, 
        marginBottom: 20,
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)", 
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.2)"
      }}>
        <label style={{ fontWeight: 500, fontSize: 16, display: "block", textAlign: "center", color: "#374151" }}>
          <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>AlphaFold Protein Folding: {morph.toFixed(2)}</span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                background: isPlaying ? "#ef4444" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "4px 12px",
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              {isPlaying ? "⏸️ Pause" : "▶️ Play"}
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={morph}
            onChange={e => setMorph(Number(e.target.value))}
            style={{ 
              width: "100%", 
              height: "8px", 
              borderRadius: "4px", 
              background: "linear-gradient(to right, #4ade80 0%, #3b82f6 100%)", 
              outline: "none", 
              cursor: "pointer",
              WebkitAppearance: "none",
              appearance: "none"
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 8, color: "#6b7280" }}>
            <span>Unfolded</span>
            <span>Folded</span>
          </div>
        </label>
      </div>
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        <div style={{ flex: 1, height: 400, borderRadius: "12px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#6b7280" }}>3D Protein Model (Coming Soon)</p>
        </div>
        <div style={{ width: 220 }}>
          <PAEPlot morph={morph} />
        </div>
      </div>
      <div style={{ 
        marginTop: 20, 
        padding: 16, 
        background: "rgba(255,255,255,0.05)", 
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <h3 style={{ margin: "0 0 12px 0", color: "#374151", fontSize: 18 }}>
          AlphaFold-Inspired Protein Folding Visualization
        </h3>
        <p style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: 14, lineHeight: 1.5 }}>
          This visualization demonstrates protein folding inspired by Google DeepMind&apos;s AlphaFold, using their confidence metrics to color the structure.
        </p>
        <div style={{ margin: "12px 0", display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "16px", height: "16px", backgroundColor: "#0053D6", borderRadius: "2px" }}></div>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>Very High (&gt;90)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "16px", height: "16px", backgroundColor: "#65CBF3", borderRadius: "2px" }}></div>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>Confident (70-90)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "16px", height: "16px", backgroundColor: "#FFD300", borderRadius: "2px" }}></div>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>Low (50-70)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "16px", height: "16px", backgroundColor: "#FF7D45", borderRadius: "2px" }}></div>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>Very Low (&lt;50)</span>
          </div>
        </div>
        <p style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: 14, lineHeight: 1.5 }}>
          <strong>pLDDT Score:</strong> The color of each amino acid indicates AlphaFold&apos;s confidence in its predicted position. Dark blue shows very high confidence, while orange indicates low confidence often found in flexible regions.
        </p>
        <p style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: 14, lineHeight: 1.5 }}>
          <strong>PAE Plot:</strong> Shows the Predicted Aligned Error between different parts of the protein. Green squares indicate well-predicted relative positions, while red shows higher uncertainty.
        </p>
      </div>
    </div>
  );
} 