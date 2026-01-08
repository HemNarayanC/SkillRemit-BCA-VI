import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  const footerSections = [
    {
      title: "For Candidates",
      links: [
        { name: "Find Jobs", path: "/find-jobs" },
        { name: "Dashboard", path: "/candidate-dashboard" },
        { name: "My Applications", path: "/applications" },
        { name: "Favourite Jobs", path: "/favourite-jobs" },
        { name: "My Inbox", path: "/inbox" },
      ],
    },
    {
      title: "For Employers",
      links: [
        { name: "Find Candidates", path: "/find-candidates" },
        { name: "Company Dashboard", path: "/company-dashboard" },
        { name: "Post a Job", path: "/post-job" },
        { name: "Manage Jobs", path: "/manage-jobs" },
      ],
    },
    {
      title: "Other Demos",
      links: [
        { name: "Image Rotator", path: "/demos/image-rotator" },
        { name: "Illustration", path: "/demos/illustration" },
        { name: "Boxed Hero", path: "/demos/boxed-hero" },
        { name: "Image Background", path: "/demos/image-bg" },
        { name: "Top Search", path: "/demos/top-search" },
        { name: "Image Card", path: "/demos/image-card" },
      ],
    },
    {
      title: "About Us",
      links: [
        { name: "About Us", path: "/about" },
        { name: "Blog", path: "/blog" },
        { name: "FAQs", path: "/faqs" },
        { name: "Contact Us", path: "/contact" },
        { name: "404 Page", path: "/404" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, label: "Facebook", path: "/facebook" },
    { icon: Twitter, label: "Twitter", path: "/twitter" },
    { icon: Instagram, label: "Instagram", path: "/instagram" },
    { icon: Linkedin, label: "LinkedIn", path: "/linkedin" },
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-foreground">
              Call us
            </h3>
            <p className="text-2xl font-bold text-primary">
              (123) 456-7890
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              90 Fifth Avenue, 3rd Floor
            </p>
            <p className="text-sm text-muted-foreground">
              San Francisco, CA 1980
            </p>
            <Link
              to="/contact"
              className="mt-2 block text-sm text-muted-foreground hover:text-primary transition"
            >
              office@jobster.com
            </Link>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-4 text-sm font-semibold text-foreground">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-primary transition"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-10 border-t border-border" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2025 DeshSkill. All Rights Reserved.
          </p>

          {/* Social Icons */}
          <div className="flex gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <Link
                  key={social.label}
                  to={social.path}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition"
                >
                  <Icon size={18} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
