function Layout({ currentPage, setCurrentPage, children }) {
  const menuItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "historial", label: "Historial" },
    { key: "ahorro", label: "Ahorro" },
    { key: "gastos-fijos", label: "Gastos fijos" },
    { key: "lista-deseos", label: "Lista de deseos" },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h1 className="logo">Control Gastos</h1>

        <nav className="menu">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`menu-button ${
                currentPage === item.key ? "active" : ""
              }`}
              onClick={() => setCurrentPage(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}

export default Layout;