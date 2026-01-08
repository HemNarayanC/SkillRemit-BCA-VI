import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  // Footer sections with links
  const footerSections = [
    {
      title: 'For Candidates',
      links: [
        { name: 'Find Jobs', path: '/find-jobs' },
        { name: 'Dashboard', path: '/candidate-dashboard' },
        { name: 'My Applications', path: '/applications' },
        { name: 'Favourite Jobs', path: '/favourite-jobs' },
        { name: 'My Inbox', path: '/inbox' },
      ],
    },
    {
      title: 'For Employers',
      links: [
        { name: 'Find Candidates', path: '/find-candidates' },
        { name: 'Company Dashboard', path: '/company-dashboard' },
        { name: 'Post a Job', path: '/post-job' },
        { name: 'Manage Jobs', path: '/manage-jobs' },
      ],
    },
    {
      title: 'Other Demos',
      links: [
        { name: 'Image Rotator', path: '/demos/image-rotator' },
        { name: 'Illustration', path: '/demos/illustration' },
        { name: 'Boxed Hero', path: '/demos/boxed-hero' },
        { name: 'Image Background', path: '/demos/image-bg' },
        { name: 'Top Search', path: '/demos/top-search' },
        { name: 'Image Card', path: '/demos/image-card' },
      ],
    },
    {
      title: 'About Us',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Blog', path: '/blog' },
        { name: 'FAQs', path: '/faqs' },
        { name: 'Contact Us', path: '/contact' },
        { name: '404 Page', path: '/404' },
      ],
    },
  ];

  // Social media icons
  const socialLinks = [
    { icon: Facebook, label: 'Facebook', url: '#' },
    { icon: Twitter, label: 'Twitter', url: '#' },
    { icon: Instagram, label: 'Instagram', url: '#' },
    { icon: Linkedin, label: 'LinkedIn', url: '#' },
  ];

  return (
    <footer className="bg-gradient-to-b from-blue-50 to-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Contact Section */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold text-foreground mb-6">Call us</h3>
            <div className="space-y-3">
              <p className="text-2xl font-bold text-blue-600">(123) 456-7890</p>
              <p className="text-sm text-foreground/70">90 Fifth Avenue, 3rd Floor</p>
              <p className="text-sm text-foreground/70">San Francisco, CA 1980</p>
              <a href="mailto:office@jobster.com" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                office@jobster.com
              </a>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="text-sm font-semibold text-foreground mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-200"
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
        <div className="border-t border-foreground/10"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8">
          {/* Copyright */}
          <p className="text-sm text-foreground/60">
            © 2025 DeshSkill. All Right Reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4 mt-6 md:mt-0">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.url}
                  aria-label={social.label}
                  className="w-8 h-8 flex items-center justify-center text-foreground/60 hover:text-blue-600 transition-colors duration-200 hover:scale-110"
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;