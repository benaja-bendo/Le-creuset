export default function Weights() {
  return (
    <div className="p-8 bg-white rounded-xl border border-secondary-200 shadow-sm">
      <h1 className="text-2xl font-bold text-secondary-900 mb-2">Comptes Poids</h1>
      <p className="text-secondary-500 mb-6">
        Module en cours de développement. Cette section affichera les soldes par métal et les alertes négatives.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        {['Or 18k', 'Argent 925', 'Laiton'].map((metal) => (
          <div key={metal} className="p-4 bg-secondary-50 border border-secondary-200 rounded">
            <p className="text-sm font-medium text-secondary-900">{metal}</p>
            <p className="text-xs text-secondary-500">Solde actuel: —</p>
          </div>
        ))}
      </div>
    </div>
  );
}
