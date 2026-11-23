import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, QrCode, Download } from 'lucide-react';

export default function AppDownload() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  const insuranceAppUrl = 'https://platform.mallouliauto.com';

  // Generate QR code URL using api.qrserver.com
  const insuranceQR = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(insuranceAppUrl)}`;

  return (
    <section className="py-20 xl:py-24 bg-gradient-to-br from-brand-blue to-brand-navy text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Téléchargez l'Application MALLOULIAUTO</h2>
          <p className="text-xl text-white/80">
            Diagnostic IA, technicien mobile, suivi GPS et plus
          </p>
        </div>

        {/* Single Customer App Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-12 text-center max-w-2xl mx-auto"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-orange flex items-center justify-center">
            <Smartphone className="w-10 h-10" />
          </div>

          <h3 className="text-3xl font-bold mb-4">Application Client</h3>
          <p className="text-white/80 mb-8 text-lg">Tous nos services dans une seule application</p>

          {!isMobile && (
            <>
              <div className="bg-white p-6 rounded-2xl inline-block mb-6 shadow-xl">
                <img
                  src={insuranceQR}
                  alt="QR Code MALLOULIAUTO"
                  loading="lazy"
                  className="w-64 h-64"
                />
              </div>
              <div className="flex items-center justify-center text-white/70 mb-6">
                <QrCode className="w-5 h-5 mr-2" />
                <span>Scannez le QR code avec votre smartphone</span>
              </div>
            </>
          )}

          <a
            href={insuranceAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-10 py-4 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-lg font-semibold transition-colors text-lg shadow-lg"
          >
            <Download className="w-6 h-6 mr-3" />
            Commencer Maintenant
          </a>

          <p className="text-white/60 text-sm mt-8">Compatible iOS, Android et navigateurs web</p>
        </motion.div>
      </div>
    </section>
  );
}
