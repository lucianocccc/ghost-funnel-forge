
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Gift, ArrowRight } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-r from-golden/20 to-yellow-600/20">
      <div className="max-w-4xl mx-auto text-center">
        <h3 className="text-4xl font-bold text-white mb-6">
          Pronto a Rivoluzionare il tuo Business?
        </h3>
        <p className="text-xl text-gray-300 mb-8">
          Unisciti a migliaia di aziende che hanno già trasformato la loro strategia di lead generation
        </p>
        <Link to="/auth?subscribe=true">
          <Button size="lg" className="bg-golden hover:bg-yellow-600 text-black text-xl px-12 py-4 font-bold">
            <Gift className="mr-3 w-6 h-6" />
            14 Giorni Gratuiti
            <ArrowRight className="ml-3 w-6 h-6" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
