import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Rajesh Shrestha",
    role: "Owner, Himalayan Coffee House",
    location: "Thamel, Kathmandu",
    text: "NUVLYX cut our order processing time by 40%. The real-time kitchen sync and eSewa integration are game-changers."
  },
  {
    name: "Sita Gurung",
    role: "Manager, Garden Bistro",
    location: "Pokhara",
    text: "Managing three branches from one dashboard is incredible. The staff metrics help us improve service every week."
  },
  {
    name: "Anil Tamang",
    role: "Owner, Mountain View Cafe",
    location: "Boudha",
    text: "Best investment for our café. Offline mode saved us during outages, and VAT auto-calculation is a lifesaver."
  },
  {
    name: "Priya Maharjan",
    role: "Owner, Newari Kitchen",
    location: "Patan",
    text: "Customers love the QR ordering. Revenue is up 25% and wait times are way down. Support team is excellent."
  },
  {
    name: "Bikash Thapa",
    role: "Manager, Urban Cafe",
    location: "Lalitpur",
    text: "The analytics give us insights we never had. We optimized our menu based on data and sales jumped."
  },
  {
    name: "Anita Rai",
    role: "Owner, Tea Garden",
    location: "Thamel",
    text: "Setup took 2 hours. Entire team trained the same day. The tablet UI is so intuitive it just clicks."
  }
];

const Testimonials = () => {
  return (
    <section className="nv-section" id="testimonials">
      <div className="nv-container">

        <div className="nv-section-header">
          <div className="nv-eyebrow">Testimonials</div>
          <h2 className="nv-section-title">
            Loved by cafés <span className="nv-gradient-text">across Nepal</span>
          </h2>
          <p className="nv-section-subtitle">
            Real stories from real owners using NUVLYX every day.
          </p>
        </div>

        <div className="nv-testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="nv-testimonial-card nv-glass">
              <Quote size={24} className="nv-testimonial-quote" />
              <div className="nv-testimonial-stars">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} size={14} fill="var(--nv-gold)" color="var(--nv-gold)" />
                ))}
              </div>
              <p className="nv-testimonial-text">"{t.text}"</p>
              <div className="nv-testimonial-author">
                <div className="nv-testimonial-avatar">
                  {t.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <strong>{t.name}</strong>
                  <small>{t.role}</small>
                  <small style={{ opacity: 0.5 }}>{t.location}</small>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;