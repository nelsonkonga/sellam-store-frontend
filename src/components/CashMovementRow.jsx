export default function CashMovementRow({ movement }) {
  const amount = Number(movement.amount ?? 0);
  const isPositive = amount >= 0;
  const sign = isPositive ? '+' : '-';

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{movement.type}</span>
          <span className="text-[10px] text-gray-400">{movement.timestamp ? new Date(movement.timestamp).toLocaleString('fr-FR') : ''}</span>
        </div>
        <p className="mt-1 text-xs text-gray-400">{movement.reason || 'Aucun motif'}</p>
      </div>

      <div className="text-right">
        <p className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {sign}{Math.abs(amount).toLocaleString('fr-FR')} FCFA
        </p>
        <p className="text-[10px] text-gray-500">{movement.effectueParName || 'Système'}</p>
      </div>
    </div>
  );
}
