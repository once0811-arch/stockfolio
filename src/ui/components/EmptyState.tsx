type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="ds-empty-state">
      <p className="ds-empty-title">{title}</p>
      {description ? <p className="ds-empty-description">{description}</p> : null}
    </div>
  );
}
