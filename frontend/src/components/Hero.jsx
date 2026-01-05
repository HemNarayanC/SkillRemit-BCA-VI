import { useEffect, useRef } from "react"
import { Search, MapPin, ChevronDown } from "lucide-react"
import gsap from "gsap"

const tags = [
  "designer",
  "web developer",
  "Writer",
  "Team leader",
  "Fullstack",
  "Web",
  "Financial Analyst",
  "Senior",
  "Software",
  "Techn",
]

const Hero = () => {
  const heroRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-content > *", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      })

      gsap.from(".hero-image-stack", {
        x: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center pt-24 px-6 md:px-12 lg:px-24 overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full -z-10 hidden lg:block pointer-events-none">
        <svg
          viewBox="0 0 1440 1024"
          fill="none"
          preserveAspectRatio="none"
          className="absolute right-0 top-0 h-full w-[40%]"
        >
          <path
            d="M500 0H1440V1024H700C700 1100 200 950 100 750C0 550 500 100 300 0Z"
            fill="#001F3F"
            className="fill-navy"
          />
        </svg>
      </div>
      {/* Background Navy Shape */}
      <div className="absolute top-0 right-0 w-[45%] h-full bg-navy rounded-bl-[15rem] -z-10 hidden lg:block" />

      <div className="grid lg:grid-cols-[4fr_2fr] gap-4 items-center w-full">
        <div className="hero-content space-y-8">
          <h1 className="text-6xl md:text-[56px] font-bold text-navy leading-tight md:leading-[1.25] font-audiowide text-center">
            Bridging Borders, Building Careers:
            <br />
            <span>Your Global Skills, Local Opportunities.</span>
          </h1>

          <p className="text-md text-center w-[80%] mx-auto text-navy/60 leading-relaxed md:leading-[1.7]">
            SkillLink Remit connects Nepalese migrant workers with employers in Nepal through AI-powered skill matching and training
          </p>

          <div className="flex justify-center mt-20">
            <div className="bg-card p-0.5 rounded-full shadow-md shadow-[var(--blue-glow)] flex items-center gap-3 w-full max-w-2xl border border-border overflow-hidden">

              {/* Job input */}
              <div className="flex-1 flex items-center gap-3 px-5">
                <Search className="w-5 h-5 text-primary/70" />
                <input type="text" placeholder="Job title or keyword" className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
              </div>

              {/* Divider */}
              <div className="h-10 w-px bg-border" />

              {/* Location */}
              <button className="flex items-center gap-2 px-5 text-sm text-foreground hover:text-primary transition-colors">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium">All Locations</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Search button */}
              <button className="bg-primary hover:bg-primary p-4 text-primary-foreground transition-all shadow-md hover:cursor-pointer">
                <Search className="w-5 h-5" />
              </button>

            </div>
          </div>

          {/* <div className="space-y-4">
            <p className="text-sm font-bold text-navy/80 uppercase tracking-wider">Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  className="px-5 py-2 rounded-full bg-secondary/10 text-primary font-medium hover:bg-secondary hover:text-white transition-all text-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div> */}

          {/* Logos */}
          {/* <div className="pt-12 flex flex-wrap gap-8 items-center opacity-40">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-2 grayscale">
                <div className="w-6 h-6 bg-navy rounded-sm" />
                <span className="font-bold text-navy">LOGOIPSUM</span>
              </div>
            ))}
          </div> */}
        </div>

        <div className="hero-image-stack relative h-150 flex items-center justify-center -left-32">
          {/* Blue decorative layered cards */}
          <div className="absolute w-113.5 h-145.5 bg-secondary-foreground rounded-[3rem] rotate-[-8deg] opacity-90 translate-x-12" />
          <div className="absolute w-113.5 h-145.5 bg-accent rounded-[3rem] rotate-[-4deg] opacity-70 translate-x-6" />

          {/* Main Image Container */}
          <div className="relative w-113.5 h-145.5 rounded-[3rem] overflow-hidden shadow-2xl">
            <img
              src="hero-professional.png"
              alt="Professional Profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Floating Stats Card with Glassmorphism */}
          <div className="absolute bottom-12 -right-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-4xl shadow-lg max-w-70 p-8 animate-float">
            <div className="space-y-6">
              {[
                { count: 319, title: "job offers", sub: "in Business Development" },
                { count: 265, title: "job offers", sub: "in Marketing & Communication" },
                { count: 324, title: "job offers", sub: "Project Management" },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    {/* Count */}
                    <span className="text-3xl font-bold text-navy font-quantico">
                      {item.count}
                    </span>
                    {/* Title */}
                    <span className="font-bold text-navy font-exo">
                      {item.title}
                    </span>
                  </div>
                  {/* Subtitle */}
                  <p className="text-xs text-navy/40 font-medium font-exo">
                    {item.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default Hero