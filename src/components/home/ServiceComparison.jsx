import { Check, X } from 'lucide-react';

export default function ServiceComparison() {
  const features = [
    {
      name: "Délai d'intervention",
      ai: '60 secondes',
      remote: '15-30 min',
      mobile: '1-2 heures',
      garage: 'Sur RDV',
    },
    {
      name: 'Réparation sur place',
      ai: false,
      remote: false,
      mobile: true,
      garage: true,
    },
    {
      name: 'Rapport détaillé',
      ai: true,
      remote: true,
      mobile: true,
      garage: true,
    },
    {
      name: 'Garantie service',
      ai: false,
      remote: false,
      mobile: true,
      garage: true,
    },
    {
      name: 'Équipement pro',
      ai: false,
      remote: false,
      mobile: true,
      garage: true,
    },
    {
      name: 'Prix moyen',
      ai: 'Gratuit',
      remote: '15-30 TND',
      mobile: '50-150 TND',
      garage: '100-300+ TND',
    },
  ];

  const renderValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-emerald mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-300 mx-auto" />
      );
    }
    return <span className="text-sm text-gray-700">{value}</span>;
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-brand-navy mb-4">Comparaison des Services</h2>
          <p className="text-lg text-gray-600">Choisissez le service adapté à votre situation</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-brand-navy">
                  Fonctionnalités
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-brand-blue">
                  Diagnostic IA
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-brand-blue">
                  Service Distant
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-brand-orange bg-brand-orange/5">
                  Technicien Mobile
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-emerald">
                  Garage Partenaire
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={feature.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{feature.name}</td>
                  <td className="px-6 py-4 text-center">{renderValue(feature.ai)}</td>
                  <td className="px-6 py-4 text-center">{renderValue(feature.remote)}</td>
                  <td className="px-6 py-4 text-center bg-brand-orange/5">
                    {renderValue(feature.mobile)}
                  </td>
                  <td className="px-6 py-4 text-center">{renderValue(feature.garage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center bg-brand-blue/5 rounded-lg p-4 max-w-3xl mx-auto">
          <p className="text-sm text-brand-navy">
            <strong className="text-brand-orange">Recommandation :</strong> Le Technicien Mobile
            offre le meilleur rapport qualité/prix pour la plupart des réparations
          </p>
        </div>
      </div>
    </section>
  );
}
