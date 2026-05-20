import { Star, Quote } from 'lucide-react';
import './Testimonials.css';

const testimonials = [
  {
    name: "Rajesh Shrestha",
    role: "Owner, Himalayan Coffee House",
    location: "Thamel, Kathmandu",
    image: "👨‍💼",
    rating: 5,
    text: "Garden & Cafe POS transformed our operations. The real-time kitchen display and eSewa integration are game-changers. Our order processing time reduced by 40%!"
  },
  {
    name: "Sita Gurung",
    role: "Manager, Garden Bistro",
    location: "Pokhara",
    image: "👩‍💼",
    rating: 5,
    text: "Managing multiple branches was a nightmare before. Now I can see everything from one dashboard. The staff performance metrics help us improve service quality."
  },
  {
    name: "Anil Tamang",
    role: "Owner, Mountain View Cafe",
    location: "Boudha, Kathmandu",
    image: "👨‍🍳",
    rating: 5,
    text: "Best investment for our cafe! The offline mode saved us during internet issues, and the automatic VAT calculation makes accounting so much easier."
  },
  {
    name: "Priya Maharjan",
    role: "Owner, Newari Kitchen",
    location: "Patan",
    image: "👩‍🍳",
    rating: 5,
    text: "Our customers love the QR ordering feature. It reduced wait times and increased our revenue by 25%. The support team is also very responsive!"
  },
  {
    name: "Bikash Thapa",
    role: "Manager, Urban Cafe",
    location: "Lalitpur",
    image: "👨",
    rating: 5,
    text: "The analytics dashboard gives us insights we never had before. We can now track which items sell best and optimize our menu accordingly."
  },
  {
    name: "Anita Rai",
    role: "Owner, Tea Garden",
    location: "Thamel",
    image: "👩",
    rating: 5,
    text: "Setup was incredibly easy. Within 2 hours, our entire team was trained and using the system. The tablet interface is so intuitive!"
  }
];

const Testimonials = () => {
  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="section-header">
          <h2 className="section-title">Loved by Cafe Owners Across Nepal</h2>
          <p className="section-subtitle">
            Join hundreds of satisfied customers transforming their business
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-quote">
                <Quote size={32} />
              </div>

              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--gold)" color="var(--gold)" />
                ))}
              </div>

              <p className="testimonial-text">"{testimonial.text}"</p>

              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.image}</div>
                <div className="author-info">
                  <p className="author-name">{testimonial.name}</p>
                  <p className="author-role">{testimonial.role}</p>
                  <p className="author-location">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="testimonials-cta">
          <h3>Ready to join them?</h3>
          <a href="/signup" className="cta-btn">Start Your Free Trial</a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;