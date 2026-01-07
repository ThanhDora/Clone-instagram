import { ChevronDown } from "lucide-react";

export default function Footer() {
  const language = "English";

  const links = [
    "Meta",
    "About",
    "Blog",
    "Jobs",
    "Help",
    "API",
    "Privacy",
    "Terms",
    "Locations",
    "Instagram Lite",
    "Meta AI",
    "Threads",
    "Contact Uploading & Non-Users",
    "Meta Verified",
  ];

  return (
    <footer className="mt-auto bg-background py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Top Row - Links */}
        <div className="mb-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {links.map((link, index) => (
            <a
              key={index}
              href="#"
              className="hover:text-foreground hover:underline transition-colors"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Bottom Row - Language and Copyright */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
          {/* Language Selector */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>{language}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {/* Dropdown menu would go here */}
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Instagram from Meta
          </div>
        </div>
      </div>
    </footer>
  );
}
