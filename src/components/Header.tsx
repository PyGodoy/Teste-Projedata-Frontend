import logo from '../assets/projedata.png';

function Header() {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-logo">
          <img src={logo} alt="Projedata" className="logo-image" />
        </div>
        <div className="header-content">
          <div className="header-title">
            <h1>Production Control System</h1>
            <p className="header-subtitle">Raw Materials & Inventory Management</p>
          </div>
          <div className="header-info">
            <span className="header-badge">Projedata Test Project</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;