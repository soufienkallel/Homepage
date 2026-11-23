import { motion } from 'framer-motion';
import { CheckCircle, Users, Star, TrendingUp, Shield, TrendingDown } from 'lucide-react';

export default function StatsBar() {
  const stats = [
    {
      icon: <Shield className="w-8 h-8 text-brand-blue" />,
      value: '3',
      label: 'Assureurs Partenaires',
    },
    {
      icon: <TrendingDown className="w-8 h-8 text-emerald" />,
      value: '-28%',
      label: 'Réduction Fraude',
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-brand-orange" />,
      value: '15K+',
      label: 'Diagnostics Réalisés',
    },
    {
      icon: <Users className="w-8 h-8 text-brand-blue" />,
      value: '50+',
      label: 'Garages Partenaires',
    },
    {
      icon: <Star className="w-8 h-8 text-brand-orange" />,
      value: '4.8/5',
      label: 'Note Moyenne',
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-emerald" />,
      value: '98%',
      label: 'Clients Satisfaits',
    },
  ];

  return (
    <section id="stats" className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold text-brand-navy mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
