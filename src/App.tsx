import VirtualizedList from "./components/VirtualizedList";

function App() {
  return (
    <>
      <main className="min-h-screen">
        <div className="p-16 flex flex-col gap-8">
          <h1 className="text-4xl font-bold text-center">
            {"Virtualized List Example"}
          </h1>

          <VirtualizedList />
          {/* <RecyclerListExample /> */}
        </div>
      </main>
    </>
  );
}

export default App;
