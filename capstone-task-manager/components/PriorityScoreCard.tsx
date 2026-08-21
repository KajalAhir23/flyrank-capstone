export interface ScoreResult {
  title: string;
  urgency: "low" | "medium" | "high";
  score: number;
  estimatedMinutes: number;
  category: string;
  reasoning: string;
}

function urgencyColor(urgency: string) {
  if (urgency === "high") return "#ef4444";
  if (urgency === "medium") return "#f59e0b";
  return "#22c55e";
}

export function PriorityScoreCard({ result }: { result: ScoreResult }) {
  return (
    <div className="tool-card tool-card-result">
      <div className="tool-card-header">
        <span
          className="tool-card-dot"
          style={{ background: urgencyColor(result.urgency) }}
        />
        <p className="tool-card-title">{result.title}</p>
      </div>

      <div className="tool-card-score-row">
        <div className="tool-card-score-ring">
          <span>{result.score}</span>
        </div>
        <div className="tool-card-meta">
          <p>
            <strong>{result.urgency}</strong> urgency
          </p>
          <p>~{result.estimatedMinutes} min · {result.category}</p>
        </div>
      </div>

      <p className="tool-card-reasoning">{result.reasoning}</p>
    </div>
  );
}