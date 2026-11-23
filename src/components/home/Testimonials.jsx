import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Amira Maaloul',
      location: 'Tunis',
      rating: 5,
      comment:
        "Service excellent ! Le diagnostic IA était précis et m'a évité un déplacement inutile au garage. Gain de temps et d'argent.",
      avatar: 'AM',
    },
    {
      name: 'Tarek Hamdi',
      location: 'Ariana',
      rating: 5,
      comment:
        'Très pratique, le technicien mobile est venu chez moi et a réparé ma voiture en 1h. Professionnel et efficace.',
      avatar: 'TH',
    },
    {
      name: 'Leila Ben Salem',
      location: 'La Marsa',
      rating: 5,
      comment:
        'Prix transparents et service professionnel. Le suivi en temps réel est rassurant. Je recommande vivement MALLOULIAUTO !',
      avatar: 'LB',
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-navy mb-4">Ce Que Disent Nos Clients</h2>
          <p className="text-xl text-gray-600">
            Ils nous font confiance pour l'entretien de leurs véhicules
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-8 relative"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 text-brand-orange/20">
                <Quote className="w-12 h-12" fill="currentColor" />
              </div>

              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-brand-orange fill-current" />
                ))}
              </div>

              {/* Comment */}
              <p className="text-gray-700 mb-6 relative z-10">"{testimonial.comment}"</p>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-blue to-brand-navy flex items-center justify-center text-white font-bold mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-brand-navy">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
