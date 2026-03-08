import { useEffect, useState } from "react";
import "./App.css";

import { resetAndSeedTransactions } from "./seedDatabase";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Historial from "./pages/Historial";
import Ahorro from "./pages/Ahorro";
import GastosFijos from "./pages/GastosFijos";
import ListaDeseos from "./pages/ListaDeseos";
import { clearTransactions } from "./clearTransactions";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

useEffect(() => {
    async function runSeed() {
     // await resetAndSeedTransactions();
      console.log("Base de datos sembrada");
    }

    runSeed();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "historial":
        return <Historial />;
      case "ahorro":
        return <Ahorro />;
      case "gastos-fijos":
        return <GastosFijos />;
      case "lista-deseos":
        return <ListaDeseos />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;