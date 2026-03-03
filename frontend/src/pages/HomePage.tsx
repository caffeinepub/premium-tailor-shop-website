import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Scissors, Calendar, Ruler, Sparkles } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Sparkles,
      title: 'Premium Tailoring',
      description: 'Expertly crafted garments with attention to every detail',
    },
    {
      icon: Scissors,
      title: 'Alterations',
      description: 'Professional alterations to perfect the fit of your garments',
    },
    {
      icon: Calendar,
      title: 'Home Visits',
      description: 'Convenient at-home measurements and consultations',
    },
    {
      icon: Ruler,
      title: 'Custom Measurements',
      description: 'Precise measurements for the perfect fit every time',
    },
  ];

  return (
    <div>
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/generated/tailor-shop-hero.dim_1200x600.jpg"
            alt="Tailor Shop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/50" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">Atelier Elegance</h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Where craftsmanship meets elegance. Experience bespoke tailoring at its finest.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" onClick={() => navigate({ to: '/products' })}>
              Shop Collection
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate({ to: '/appointments' })}>
              Book Appointment
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/assets/generated/tailor-measuring.dim_800x600.jpg"
                alt="Tailor Measuring"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Craftsmanship That Speaks</h2>
              <p className="text-lg text-muted-foreground mb-6">
                With over 30 years of experience, our master tailors bring unparalleled expertise to every stitch. We
                believe in the art of tailoring, where precision meets passion.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                From bespoke suits to elegant dresses, we create garments that reflect your unique style and personality.
              </p>
              <Button size="lg" onClick={() => navigate({ to: '/products' })}>
                Explore Our Work
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Personalized Service</h2>
              <p className="text-lg text-muted-foreground mb-6">
                We understand that every client is unique. That's why we offer personalized consultations, home visits,
                and custom measurements to ensure the perfect fit.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Book an appointment today and experience the difference of truly bespoke tailoring.
              </p>
              <Button size="lg" onClick={() => navigate({ to: '/appointments' })}>
                Schedule a Visit
              </Button>
            </div>
            <div className="order-1 md:order-2">
              <img
                src="/assets/generated/fabric-swatches.dim_600x400.jpg"
                alt="Fabric Swatches"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
