import "./Header.css";

export default function Header({ onClear, hasMessages }) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-mark" />
        <span className="app-name">ask anything</span>
      </div>
      {hasMessages && (
        <button className="clear-btn" onClick={onClear} title="Clear conversation">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          clear
        </button>
      )}
    </header>
  );
}
