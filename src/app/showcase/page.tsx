import dynamic from "next/dynamic";

const TorusMugMorph = dynamic(() => import("@/components/torus-mug-morph"), { ssr: false });
const ProteinFolding = dynamic(() => import("@/components/protein-folding").then(mod => mod.default), { ssr: false });

export default function ShowcasePage() {
  return (
    <main className="flex flex-col min-h-[100dvh] items-center justify-center py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Torus ↔ Mug Morph</h1>
        <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Interactive 3D morphing between a torus (doughnut) and a coffee mug, demonstrating their topological equivalence.
        </p>
      </div>
      <TorusMugMorph />
      
      <div className="text-center space-y-2 mt-16">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Protein Folding Visualization</h1>
        <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Interactive 3D visualization of protein folding from unfolded polypeptide chain to functional 3D structure.
        </p>
      </div>
      <ProteinFolding />
      

    </main>
  );
} 