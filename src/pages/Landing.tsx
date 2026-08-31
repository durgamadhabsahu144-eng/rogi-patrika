import { useNavigate } from "react-router";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Stethoscope,
  FileText,
  Mic,
  Globe,
  Wifi,
  Brain,
  Calendar,
  Pill,
  ClipboardList,
  Users,
  Shield,
  ArrowRight,
  Leaf,
} from "lucide-react";

const languages = [
  { code: "en" as const, label: "English" },
  { code: "hi" as const, label: "हिन्दी" },
  { code: "or" as const, label: "ଓଡ଼ିଆ" },
];

const features = [
  {
    icon: FileText,
    title: { en: "Patient Case-Taking", hi: "रोगी केस-टेकिंग", or: "ରୋଗୀ କେସ୍-ଟେକିଂ" },
    desc: {
      en: "Structured Ayurvedic case-taking with Prakriti & Vikriti assessment",
      hi: "प्रकृति और विकृति मूल्यांकन के साथ संरचित आयुर्वेदिक केस-टेकिंग",
      or: "ପ୍ରକୃତି ଏବଂ ବିକୃତି ମୂଲ୍ୟାୟନ ସହ ସଂଗଠିତ ଆୟୁର୍ବେଦିକ କେସ୍-ଟେକିଂ",
    },
  },
  {
    icon: Calendar,
    title: { en: "Smart Scheduling", hi: "स्मार्ट शेड्यूलिंग", or: "ସ୍ମାର୍ଟ ସେଡ୍ୟୁଲିଂ" },
    desc: {
      en: "Manage appointments, follow-ups, and treatment plans",
      hi: "अपॉइंटमेंट, फॉलो-अप और उपचार योजनाओं का प्रबंधन करें",
      or: "ଅପଏଣ୍ଟମେଣ୍ଟ, ଫଲୋ-ଅପ୍ ଏବଂ ଚିକିତ୍ସା ଯୋଜନା ପରିଚାଳନା କରନ୍ତୁ",
    },
  },
  {
    icon: Pill,
    title: { en: "Herb & Medicine Tracking", hi: "जड़ी-बूटी और दवा ट्रैकिंग", or: "ଔଷଧ ଏବଂ ଔଷଧ ଟ୍ରାକିଂ" },
    desc: {
      en: "Digital prescriptions with herb & medicine suggestions",
      hi: "जड़ी-बूटी और दवा सुझावों के साथ डिजिटल प्रिस्क्रिप्शन",
      or: "ଔଷଧ ଏବଂ ଔଷଧ ସୁଝାଇ ସହ ଡିଜିଟାଲ ପ୍ରେସକ୍ରିପସନ",
    },
  },
  {
    icon: Brain,
    title: { en: "AI-Assisted Summary", hi: "AI-सहायित सारांश", or: "AI-ସହାୟିତ ସାରାଂଶ" },
    desc: {
      en: "AI-powered patient history summaries for better diagnosis",
      hi: "बेहतर निदान के लिए AI-संचालित रोगी इतिहास सारांश",
      or: "ଉତ୍ତମ ରୋଗ ନିର୍ଣ୍ଣୟ ପାଇଁ AI-ଚାଳିତ ରୋଗୀ ଇତିହାସ ସାରାଂଶ",
    },
  },
  {
    icon: Mic,
    title: { en: "Voice Accessibility", hi: "वॉइस एक्सेसिबिलिटी", or: "ଭଏସ୍ ଏକ୍ସେସିବିଲିଟି" },
    desc: {
      en: "Voice-first interface for patients with limited literacy",
      hi: "सीमित साक्षरता वाले मरीज़ों के लिए वॉइस-फर्स्ट इंटरफेस",
      or: "ସୀମିତ ସାକ୍ଷରତା ଥିବା ରୋଗୀମାନଙ୍କ ପାଇଁ ଭଏସ୍-ଫାର୍ଷ୍ଟ ଇଣ୍ଟରଫେସ୍",
    },
  },
  {
    icon: Globe,
    title: { en: "Multilingual Support", hi: "बहुभाषी समर्थन", or: "ବହୁଭାଷୀ ସମର୍ଥନ" },
    desc: {
      en: "English, Hindi, and Odia language support",
      hi: "अंग्रेजी, हिन्दी और ओडिया भाषा समर्थन",
      or: "ଇଂରାଜୀ, ହିନ୍ଦୀ ଏବଂ ଓଡ଼ିଆ ଭାଷା ସମର୍ଥନ",
    },
  },
  {
    icon: Wifi,
    title: { en: "Low-Connectivity Ready", hi: "कम कनेक्टिविटी रेडी", or: "କମ୍ ସଂଯୋଗ ପ୍ରସ୍ତୁତ" },
    desc: {
      en: "Works offline with sync when connected",
      hi: "ऑफलाइन काम करता है, कनेक्ट होने पर सिंक होता है",
      or: "ଅଫଲାଇନ୍ କାମ କରେ, ସଂଯୁକ୍ତ ହେଲେ ସିଙ୍କ ହୁଏ",
    },
  },
  {
    icon: ClipboardList,
    title: { en: "Follow-up Reminders", hi: "फॉलो-अप रिमाइंडर", or: "ଫଲୋ-ଅପ୍ ରିମାଇଣ୍ଡର" },
    desc: {
      en: "Never miss a follow-up with smart reminders",
      hi: "स्मार्ट रिमाइंडर के साथ फॉलो-अप कभी न छोड़ें",
      or: "ସ୍ମାର୍ଟ ରିମାଇଣ୍ଡର ସହ ଫଲୋ-ଅପ୍ କେବେ ଛାଡ଼ନ୍ତୁ ନାହିଁ",
    },
  },
];

const impacts = [
  { num: "80%", label: { en: "Reduction in paperwork", hi: "कागजी काम में कमी", or: "କାଗଜ କାମରେ ହ୍ରାସ" } },
  { num: "3×", label: { en: "Faster diagnosis", hi: "तेज़ निदान", or: "ଦ୍ରୁତ ରୋଗ ନିର୍ଣ୍ଣୟ" } },
  { num: "100%", label: { en: "Patient data access", hi: "रोगी डेटा एक्सेस", or: "ରୋଗୀ ତଥ୍ୟ ପ୍ରବେଶ" } },
];

export default function Landing() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-foreground sticky top-0 bg-background z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neo-yellow border-2 border-foreground flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">CareSync Pro</span>
            </div>

            <div className="flex items-center gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-1.5 text-xs font-semibold border-2 border-foreground transition-all ${
                    language === lang.code
                      ? "bg-neo-yellow shadow-[2px_2px_0px_#0A0A0A]"
                      : "bg-background hover:bg-secondary"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b-2 border-foreground py-16 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-neo-yellow border-2 border-foreground font-bold text-sm mb-6 neo-badge">
                SIH 2026 — Problem Statement 47
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-4">
                {t("landing.heroTitle")}
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-muted-foreground mb-6">
                {t("landing.heroSubtitle")}
              </p>
              <p className="text-base leading-relaxed text-muted-foreground mb-8 max-w-lg">
                {t("landing.heroDescription")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="neo-btn bg-background text-foreground font-bold text-base px-8 py-6 hover:bg-neo-yellow"
                  onClick={() => navigate("/auth?role=doctor")}
                >
                  <Stethoscope className="w-5 h-5 mr-2" />
                  {t("landing.doctorLogin")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  className="neo-btn bg-background text-foreground font-bold text-base px-8 py-6 hover:bg-neo-green"
                  onClick={() => navigate("/auth?role=patient")}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  {t("landing.patientLogin")}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="neo-btn bg-background text-foreground font-bold text-base px-8 py-6"
                  onClick={() => navigate("/auth?role=admin")}
                >
                  <Shield className="w-5 h-5 mr-2" />
                  {t("landing.adminLogin")}
                </Button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:block">
              <div className="neo-card bg-neo-yellow p-8 relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background border-2 border-foreground p-6">
                    <Stethoscope className="w-10 h-10 mb-3" />
                    <p className="font-bold text-sm">Doctor Portal</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Case-taking & Treatment
                    </p>
                  </div>
                  <div className="bg-background border-2 border-foreground p-6">
                    <Heart className="w-10 h-10 mb-3" />
                    <p className="font-bold text-sm">Patient Portal</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Health Records & Voice
                    </p>
                  </div>
                  <div className="bg-background border-2 border-foreground p-6">
                    <Brain className="w-10 h-10 mb-3" />
                    <p className="font-bold text-sm">AI Assistant</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Smart Summaries
                    </p>
                  </div>
                  <div className="bg-background border-2 border-foreground p-6">
                    <Globe className="w-10 h-10 mb-3" />
                    <p className="font-bold text-sm">3 Languages</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      EN / HI / OR
                    </p>
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-3 bg-neo-green border-2 border-foreground px-4 py-2 font-bold text-sm">
                  Ayurveda-Aligned
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="border-b-2 border-foreground bg-neo-yellow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-3 gap-0 divide-x-2 divide-foreground">
            {impacts.map((item) => (
              <div key={item.num} className="text-center px-6">
                <p className="text-3xl sm:text-4xl font-black">{item.num}</p>
                <p className="text-sm font-bold mt-1">
                  {item.label[language]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b-2 border-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              {t("landing.featuresTitle")}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0">
            {features.map((feature, i) => (
              <div
                key={i}
                className="border-2 border-foreground p-6 hover:bg-neo-yellow transition-colors"
              >
                <feature.icon className="w-8 h-8 mb-4" />
                <h3 className="font-bold text-sm mb-2">
                  {feature.title[language]}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.desc[language]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact & Benefits */}
      <section className="border-b-2 border-foreground py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black tracking-tight mb-10 text-center">
            {t("landing.impactTitle")}
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: { en: "Standardized Case-Taking", hi: "मानकीकृत केस-टेकिंग", or: "ମାନକୀକୃତ କେସ୍-ଟେକିଂ" },
                desc: {
                  en: "Consistent Ayurvedic assessment across all practitioners",
                  hi: "सभी चिकित्सकों में संगत आयुर्वेदिक मूल्यांकन",
                  or: "ସମସ୍ତ ଚିକିତ୍ସକମାନଙ୍କରେ ସୁସଙ୍ଗତ ଆୟୁର୍ବେଦିକ ମୂଲ୍ୟାୟନ",
                },
              },
              {
                icon: Users,
                title: { en: "Centralized Patient Data", hi: "केंद्रीकृत रोगी डेटा", or: "କେନ୍ଦ୍ରୀକୃତ ରୋଗୀ ତଥ୍ୟ" },
                desc: {
                  en: "All patient information in one secure platform",
                  hi: "सभी रोगी जानकारी एक सुरक्षित प्लेटफॉर्म पर",
                  or: "ସମସ୍ତ ରୋଗୀ ସୂଚନା ଗୋଟିଏ ସୁରକ୍ଷିତ ପ୍ଲାଟଫର୍ମରେ",
                },
              },
              {
                icon: Brain,
                title: { en: "Better Diagnostic Outcomes", hi: "बेहतर निदान परिणाम", or: "ଉତ୍ତମ ରୋଗ ନିର୍ଣ୍ଣୟ ଫଳାଫଳ" },
                desc: {
                  en: "AI-assisted summaries help doctors make informed decisions",
                  hi: "AI-सहायित सारांश डॉक्टरों को सूचित निर्णय लेने में मदद करता है",
                  or: "AI-ସହାୟିତ ସାରାଂଶ ଡାକ୍ତରମାନଙ୍କୁ ସୂଚିତ ନିର୍ଣ୍ଣୟ ନେବାରେ ସାହାଯ୍ୟ କରେ",
                },
              },
              {
                icon: Globe,
                title: { en: "Multi-Language Access", hi: "बहुभाषी पहुंच", or: "ବହୁଭାଷୀ ପ୍ରବେଶ" },
                desc: {
                  en: "Patients can interact in their preferred language",
                  hi: "मरीज़ अपनी पसंदीदा भाषा में बातचीत कर सकते हैं",
                  or: "ରୋଗୀମାନେ ସେମାନଙ୍କ ପସନ୍ଦ ଭାଷାରେ ଯୋଗାଯୋଗ କରିପାରିବେ",
                },
              },
              {
                icon: Mic,
                title: { en: "Voice-First Design", hi: "वॉइस-फर्स्ट डिज़ाइन", or: "ଭଏସ୍-ଫାର୍ଷ୍ଟ ଡିଜାଇନ୍" },
                desc: {
                  en: "Designed for patients with limited digital literacy",
                  hi: "सीमित डिजिटल साक्षरता वाले मरीज़ों के लिए डिज़ाइन",
                  or: "ସୀମିତ ଡିଜିଟାଲ ସାକ୍ଷରତା ଥିବା ରୋଗୀମାନଙ୍କ ପାଇଁ ଡିଜାଇନ୍",
                },
              },
              {
                icon: Shield,
                title: { en: "Data-Driven Decisions", hi: "डेटा-संचालित निर्णय", or: "ତଥ୍ୟ-ଚାଳିତ ନିର୍ଣ୍ଣୟ" },
                desc: {
                  en: "Research-friendly with exportable reports",
                  hi: "निर्यात योग्य रिपोर्ट के साथ अनुसंधान-अनुकूल",
                  or: "ରପ୍ତାନି ଯୋଗ୍ୟ ରିପୋର୍ଟ ସହ ଗବେଷଣା-ଅନୁକୂଳ",
                },
              },
            ].map((item, i) => (
              <div key={i} className="neo-card bg-background p-6">
                <item.icon className="w-8 h-8 mb-4" />
                <h3 className="font-bold mb-2">{item.title[language]}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.desc[language]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="border-b-2 border-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black tracking-tight mb-10 text-center">
            {t("landing.securityTitle")}
          </h2>
          <div className="grid sm:grid-cols-3 gap-0">
            {[
              { icon: Shield, title: { en: "Role-Based Access", hi: "रोल-बेस्ड एक्सेस", or: "ରୋଲ୍-ବେସ୍ଡ ପ୍ରବେଶ" } },
              { icon: Users, title: { en: "Protected Records", hi: "सुरक्षित रिकॉर्ड", or: "ସୁରକ୍ଷିତ ରେକର୍ଡ" } },
              { icon: Lock, title: { en: "Secure APIs", hi: "सुरक्षित APIs", or: "ସୁରକ୍ଷିତ APIs" } },
            ].map((item, i) => (
              <div
                key={i}
                className="border-2 border-foreground p-6 text-center"
              >
                <item.icon className="w-8 h-8 mx-auto mb-3" />
                <p className="font-bold text-sm">{item.title[language]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-bold text-sm mb-2">CareSync Pro — SIH 2026</p>
          <p className="text-xs opacity-70 mb-4">
            Connected Patient Care for Ayurvedic Practitioners
          </p>
          <div className="inline-block px-4 py-2 border border-background/30 text-xs">
            AI assists healthcare professionals; it does not replace medical
            judgment.
          </div>
        </div>
      </footer>
    </div>
  );
}

function Lock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
