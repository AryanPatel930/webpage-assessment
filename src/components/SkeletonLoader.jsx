import "./SkeletonLoader.css";

export default function SkeletonLoader() {
  return (
    <div className="skeleton-wrapper">
      <div className="skeleton-role">
        <div className="spinner" />
        <span>ai</span>
      </div>
      <div className="skeleton-lines">
        <div className="skeleton-line skeleton-line--90" />
        <div className="skeleton-line skeleton-line--75" />
        <div className="skeleton-line skeleton-line--55" />
      </div>
    </div>
  );
}
