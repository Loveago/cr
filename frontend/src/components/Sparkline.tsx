'use client';
export function Sparkline({ data, positive = true, width = 96, height = 32 }: {
  data: number[]; positive?: boolean; width?: number; height?: number;
}) {
  if (!data || data.length < 2) return <div className="h-8 w-24 bg-bg-border/30 rounded" />;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => `${i * stepX},${height - ((v - min) / range) * height}`).join(' ');
  const stroke = positive ? '#22c55e' : '#ef4444';
  const fill = positive ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)';
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polygon points={`0,${height} ${points} ${width},${height}`} fill={fill} />
      <polyline points={points} fill="none" stroke={stroke} strokeWidth={1.5} />
    </svg>
  );
}
