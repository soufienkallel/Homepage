import { motion } from 'framer-motion';
import { Linkedin } from 'lucide-react';
import wassimPhoto from '../../assets/team/wassim_mallouli.jpeg';
import marwaPhoto from '../../assets/team/marwa_maalej.jpeg';
import soufiénPhoto from '../../assets/team/soufien_kallel.jpeg';

export default function TeamSection() {
  const team = [
    {
      name: 'Wassim Mallouli',
      title: 'Founder & CEO',
      bio: "Expert en systèmes embarqués et IoT. 10+ ans d'expérience dans l'automobile connectée.",
      photo: wassimPhoto,
      linkedin: '#',
    },
    {
      name: 'Marwa Maalej',
      title: 'CFO & Operations',
      bio: "Spécialiste en finance et gestion d'opérations. Optimise nos processus pour un service de qualité.",
      photo: marwaPhoto,
      linkedin: '#',
    },
    {
      name: 'Soufien Kallel',
      title: 'CTO',
      bio: "Développeur full-stack passionné. Architecture notre plateforme et nos algorithmes d'IA.",
      photo: soufiénPhoto,
      linkedin: '#',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-navy mb-4">L'Équipe MALLOULIAUTO</h2>
          <p className="text-xl text-gray-600">
            Une équipe passionnée au service de l'innovation automobile
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              {/* Team member photo */}
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 shadow-lg ring-4 ring-brand-blue/20">
                <img
                  src={member.photo}
                  alt={member.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-xl font-bold text-brand-navy mb-1">{member.name}</h3>
              <p className="text-brand-orange font-semibold mb-3">{member.title}</p>
              <p className="text-gray-600 text-sm mb-4">{member.bio}</p>

              {/* LinkedIn link */}
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-blue text-white hover:bg-brand-navy transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Une initiative de{' '}
            <a
              href="https://malloulinova.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-blue font-semibold hover:underline"
            >
              MALLOULINOVA
            </a>
            , pionnier de l'IoT en Tunisie
          </p>
        </div>
      </div>
    </section>
  );
}
