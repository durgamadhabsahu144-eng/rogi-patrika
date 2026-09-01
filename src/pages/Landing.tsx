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
  CheckCircle2,
  Lock,
} from "lucide-react";

const languages = [
  { code: "en" as const, label: "English" },
  { code: "hi" as const, label: "हिन्दी" },
  { code: "or" as const, label: "ଓଡ଼ିଆ" },
];

const features = [
  {
    icon: FileText,
    color: "bg-health-blue-light text-health-blue",
    title: { en: "Patient Case-Taking", hi: "रोगी केस-टेकिंग", or: "ରୋଗୀ କେସ୍-ଟେକିଂ" },
    desc: {
      en: "Structured Ayurvedic case-taking with Prakriti & Vikriti assessment",
      hi: "प्रकृति और विकृति मूल्यांकन के साथ संरचित आयुर्वेदिक केस-टेकिंग",
      or: "ପ୍ରକୃତି ଏବଂ ବିକୃତି ମୂଲ୍ୟାୟନ ସହ ସଂଗଠିତ ଆୟୁର୍ବେଦିକ କେସ୍-ଟେକିଂ",
    },
  },
  {
    icon: Calendar,
    color: "bg-health-green-light text-health-green",
    title: { en: "Smart Scheduling", hi: "स्मार्ट शेड्यूलिंग", or: "ସ୍ମାର୍ଟ ସେଡ୍ୟୁଲିଂ" },
    desc: {
      en: "Manage appointments, follow-ups, and treatment plans",
      hi: "अपॉइंटमेंट, फॉलो-अप और उपचार योजनाओं का प्रबंधन करें",
      or: "ଅପଏଣ୍ଟମେଣ୍ଟ, ଫଲୋ-ଅପ୍ ଏବଂ ଚିକିତ୍ସା ଯୋଜନା ପରିଚାଳନା କରନ୍ତୁ",
    },
  },
  {
    icon: Pill,
    color: "bg-health-amber-light text-health-amber",
    title: { en: "Herb & Medicine Tracking", hi: "जड़ी-बूटी और दवा ट्रैकिंग", or: "ଔଷଧ ଏବଂ ଔଷଧ ଟ୍ରାକିଂ" },
    desc: {
      en: "Digital prescriptions with herb & medicine suggestions",
      hi: "जड़ी-बूटी और दवा सुझावों के साथ डिजिटल प्रिस्क्रिप्शन",
      or: "ଔଷଧ ଏବଂ ଔଷଧ ସୁଝାଇ ସହ ଡିଜିଟାଲ ପ୍ରେସକ୍ରିପସନ",
    },
  },
  {
    icon: Brain,
    color: "bg-health-purple-light text-health-purple",
    title: { en: "AI-Assisted Summary", hi: "AI-सहायित सारांश", or: "AI-ସହାୟିତ ସାରାଂଶ" },
    desc: {
      en: "AI-powered patient history summaries for better diagnosis",
      hi: "बेहतर निदान के लिए AI-संचालित रोगी इतिहास सारांश",
      or: "ଉତ୍ତମ ରୋଗ ନିର୍ଣ୍ଣୟ ପାଇଁ AI-ଚାଳିତ ରୋଗୀ ଇତିହାସ ସାରାଂଶ",
    },
  },
  {
    icon: Mic,
    color: "bg-health-teal-light text-health-teal",
    title: { en: "Voice Accessibility", hi: "वॉइस एक्सेसिबिलिटी", or: "ଭଏସ୍ ଏକ୍ସେସିବିଲିଟି" },
    desc: {
      en: "Voice-first interface for patients with limited literacy",
      hi: "सीमित साक्षरता वाले मरीज़ों के लिए वॉइस-फर्स्ट इंटरफेस",
      or: "ସୀମିତ ସାକ୍ଷରତା ଥିବା ରୋଗୀମାନଙ୍କ ପାଇଁ ଭଏସ୍-ଫାର୍ଷ୍ଟ ଇଣ୍ଟରଫେସ୍",
    },
  },
  {
    icon: Globe,
    color: "bg-health-blue-light text-health-blue",
    title: { en: "Multilingual Support", hi: "बहुभाषी समर्थन", or: "ବହୁଭାଷୀ ସମର୍ଥନ" },
    desc: {
      en: "English, Hindi, and Odia language support",
      hi: "अंग्रेजी, हिन्दी और ओडिया भाषा समर्थन",
      or: "ଇଂରାଜୀ, ହିନ୍ଦୀ ଏବଂ ଓଡ଼ିଆ ଭାଷା ସମର୍ଥନ",
    },
  },
  {
    icon: Wifi,
    color: "bg-health-green-light text-health-green",
    title: { en: "Low-Connectivity Ready", hi: "कम कनेक्टिविटी रेडी", or: "କମ୍ ସଂଯୋଗ ପ୍ରସ୍ତୁତ" },
    desc: {
      en: "Works offline with sync when connected",
      hi: "ऑफलाइन काम करता है, कनेक्ट होने पर सिंक होता है",
      or: "ଅଫଲାଇନ୍ କାମ କରେ, ସଂଯୁକ୍ତ ହେଲେ ସିଙ୍କ ହୁଏ",
    },
  },
  {
    icon: ClipboardList,
    color: "bg-health-amber-light text-health-amber",
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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#2563EB] rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-[#0F172A]">
                RogiPatrika
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#F1F5F9] rounded-lg p-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    language === lang.code
                      ? "bg-white text-[#2563EB] shadow-sm"
                      : "text-[#64748B] hover:text-[#334155]"
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
      <section className="py-16 sm:py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EFF6FF] text-[#1E40AF] rounded-full font-semibold text-xs mb-6">
                <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full" />
                SIH 2026 — Problem Statement 47
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-[#0F172A] mb-4">
                {t("landing.heroTitle")}
              </h1>
              <p className="text-xl sm:text-2xl font-semibold text-[#2563EB] mb-4">
                {t("landing.heroSubtitle")}
              </p>
              <p className="text-base leading-relaxed text-[#64748B] mb-8 max-w-lg">
                {t("landing.heroDescription")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="health-btn bg-[#2563EB] text-white font-semibold text-base px-8 py-6 rounded-xl hover:bg-[#1D4ED8]"
                  onClick={() => navigate("/auth?role=doctor")}
                >
                  <Stethoscope className="w-5 h-5 mr-2" />
                  {t("landing.doctorLogin")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  className="health-btn bg-white text-[#0F172A] font-semibold text-base px-8 py-6 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]"
                  onClick={() => navigate("/auth?role=patient")}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  {t("landing.patientLogin")}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="health-btn bg-white text-[#64748B] font-semibold text-base px-8 py-6 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]"
                  onClick={() => navigate("/auth?role=admin")}
                >
                  <Shield className="w-5 h-5 mr-2" />
                  {t("landing.adminLogin")}
                </Button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:block">
              <div className="health-card-static p-8 bg-white relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E2E8F0]">
                    <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center mb-3">
                      <Stethoscope className="w-5 h-5 text-[#2563EB]" />
                    </div>
                    <p className="font-semibold text-sm text-[#0F172A]">Doctor Portal</p>
                    <p className="text-xs text-[#64748B] mt-1">
                      Case-taking & Treatment
                    </p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E2E8F0]">
                    <div className="w-10 h-10 bg-[#D1FAE5] rounded-lg flex items-center justify-center mb-3">
                      <Heart className="w-5 h-5 text-[#059669]" />
                    </div>
                    <p className="font-semibold text-sm text-[#0F172A]">Patient Portal</p>
                    <p className="text-xs text-[#64748B] mt-1">
                      Health Records & Voice
                    </p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E2E8F0]">
                    <div className="w-10 h-10 bg-[#EDE9FE] rounded-lg flex items-center justify-center mb-3">
                      <Brain className="w-5 h-5 text-[#7C3AED]" />
                    </div>
                    <p className="font-semibold text-sm text-[#0F172A]">AI Assistant</p>
                    <p className="text-xs text-[#64748B] mt-1">
                      Smart Summaries
                    </p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-6 border border-[#E2E8F0]">
                    <div className="w-10 h-10 bg-[#CCFBF1] rounded-lg flex items-center justify-center mb-3">
                      <Globe className="w-5 h-5 text-[#0D9488]" />
                    </div>
                    <p className="font-semibold text-sm text-[#0F172A]">3 Languages</p>
                    <p className="text-xs text-[#64748B] mt-1">
                      EN / HI / OR
                    </p>
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-3 bg-[#D1FAE5] text-[#059669] px-4 py-2 rounded-lg font-semibold text-sm border border-[#A7F3D0]">
                  Ayurveda-Aligned
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-white border-y border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-3 gap-8">
            {impacts.map((item) => (
              <div key={item.num} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-[#2563EB]">{item.num}</p>
                <p className="text-sm font-medium text-[#64748B] mt-1">
                  {item.label[language]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
              {t("landing.featuresTitle")}
            </h2>
            <p className="text-[#64748B] mt-3 max-w-2xl mx-auto">
              Everything healthcare professionals need to manage patient care efficiently
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="health-card p-5 hover:shadow-md transition-all"
              >
                <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center mb-3`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-[#0F172A] mb-1.5">
                  {feature.title[language]}
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {feature.desc[language]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact & Benefits */}
      <section className="py-16 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight mb-10 text-center text-[#0F172A]">
            {t("landing.impactTitle")}
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: FileText,
                color: "bg-[#DBEAFE] text-[#2563EB]",
                title: { en: "Standardized Case-Taking", hi: "मानकीकृत केस-टेकिंग", or: "ମାନକୀକୃତ କେସ୍-ଟେକିଂ" },
                desc: {
                  en: "Consistent Ayurvedic assessment across all practitioners",
                  hi: "सभी चिकित्सकों में संगत आयुर्वेदिक मूल्यांकन",
                  or: "ସମସ୍ତ ଚିକିତ୍ସକମାନଙ୍କରେ ସୁସଙ୍ଗତ ଆୟୁର୍ବେଦିକ ମୂଲ୍ୟାୟନ",
                },
              },
              {
                icon: Users,
                color: "bg-[#D1FAE5] text-[#059669]",
                title: { en: "Centralized Patient Data", hi: "केंद्रीकृत रोगी डेटा", or: "କେନ୍ଦ୍ରୀକୃତ ରୋଗୀ ତଥ୍ୟ" },
                desc: {
                  en: "All patient information in one secure platform",
                  hi: "सभी रोगी जानकारी एक सुरक्षित प्लेटफॉर्म पर",
                  or: "ସମସ୍ତ ରୋଗୀ ସୂଚନା ଗୋଟିଏ ସୁରକ୍ଷିତ ପ୍ଲାଟଫର୍ମରେ",
                },
              },
              {
                icon: Brain,
                color: "bg-[#EDE9FE] text-[#7C3AED]",
                title: { en: "Better Diagnostic Outcomes", hi: "बेहतर निदान परिणाम", or: "ଉତ୍ତମ ରୋଗ ନିର୍ଣ୍ଣୟ ଫଳାଫଳ" },
                desc: {
                  en: "AI-assisted summaries help doctors make informed decisions",
                  hi: "AI-सहायित सारांश डॉक्टरों को सूचित निर्णय लेने में मदद करता है",
                  or: "AI-ସହାୟିତ ସାରାଂଶ ଡାକ୍ତରମାନଙ୍କୁ ସୂଚିତ ନିର୍ଣ୍ଣୟ ନେବାରେ ସାହାଯ୍ୟ କରେ",
                },
              },
              {
                icon: Globe,
                color: "bg-[#CCFBF1] text-[#0D9488]",
                title: { en: "Multi-Language Access", hi: "बहुभाषी पहुंच", or: "ବହୁଭାଷୀ ପ୍ରବେଶ" },
                desc: {
                  en: "Patients can interact in their preferred language",
                  hi: "मरीज़ अपनी पसंदीदा भाषा में बातचीत कर सकते हैं",
                  or: "ରୋଗୀମାନେ ସେମାନଙ୍କ ପସନ୍ଦ ଭାଷାରେ ଯୋଗାଯୋଗ କରିପାରିବେ",
                },
              },
              {
                icon: Mic,
                color: "bg-[#FEF3C7] text-[#D97706]",
                title: { en: "Voice-First Design", hi: "वॉइस-फर्स्ट डिज़ाइन", or: "ଭଏସ୍-ଫାର୍ଷ୍ଟ ଡିଜାଇନ୍" },
                desc: {
                  en: "Designed for patients with limited digital literacy",
                  hi: "सीमित डिजिटल साक्षरता वाले मरीज़ों के लिए डिज़ाइन",
                  or: "ସୀମିତ ଡିଜିଟାଲ ସାକ୍ଷରତା ଥିବା ରୋଗୀମାନଙ୍କ ପାଇଁ ଡିଜାଇନ୍",
                },
              },
              {
                icon: Shield,
                color: "bg-[#DBEAFE] text-[#2563EB]",
                title: { en: "Data-Driven Decisions", hi: "डेटा-संचालित निर्णय", or: "ତଥ୍ୟ-ଚାଳିତ ନିର୍ଣ୍ଣୟ" },
                desc: {
                  en: "Research-friendly with exportable reports",
                  hi: "निर्यात योग्य रिपोर्ट के साथ अनुसंधान-अनुकूल",
                  or: "ରପ୍ତାନି ଯୋଗ୍ୟ ରିପୋର୍ଟ ସହ ଗବେଷଣା-ଅନୁକୂଳ",
                },
              },
            ].map((item, i) => (
              <div key={i} className="health-card p-5">
                <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center mb-3`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-1.5 text-[#0F172A]">{item.title[language]}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {item.desc[language]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight mb-10 text-center text-[#0F172A]">
            {t("landing.securityTitle")}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: { en: "Role-Based Access", hi: "रोल-बेस्ड एक्सेस", or: "ରୋଲ୍-ବେସ୍ଡ ପ୍ରବେଶ" }, desc: "Only authorized users can access patient data" },
              { icon: Lock, title: { en: "Protected Records", hi: "सुरक्षित रिकॉर्ड", or: "ସୁରକ୍ଷିତ ରେକର୍ଡ" }, desc: "Encrypted storage and secure API communication" },
              { icon: CheckCircle2, title: { en: "Secure APIs", hi: "सुरक्षित APIs", or: "ସୁରକ୍ଷିତ APIs" }, desc: "Every request is authenticated and validated" },
            ].map((item, i) => (
              <div
                key={i}
                className="health-card p-5 text-center"
              >
                <div className="w-10 h-10 bg-[#EFF6FF] rounded-lg flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-5 h-5 text-[#2563EB]" />
                </div>
                <p className="font-semibold text-sm text-[#0F172A]">{item.title[language]}</p>
                <p className="text-xs text-[#64748B] mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] mb-4">
            Ready to get started?
          </h2>
          <p className="text-[#64748B] mb-8 max-w-lg mx-auto">
            Join healthcare professionals who are transforming patient care with RogiPatrika.
          </p>
          <Button
            size="lg"
            className="health-btn bg-[#2563EB] text-white font-semibold text-base px-10 py-6 rounded-xl hover:bg-[#1D4ED8]"
            onClick={() => navigate("/auth?role=doctor")}
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">RogiPatrika</span>
          </div>
          <p className="text-sm text-[#94A3B8] mb-4">
            Connected Patient Care for Ayurvedic Practitioners
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-[#94A3B8]">
            <Brain className="w-3.5 h-3.5" />
            AI assists healthcare professionals; it does not replace medical judgment.
          </div>
          <p className="text-xs text-[#475569] mt-6">© 2026 RogiPatrika · SIH 2026</p>
        </div>
      </footer>
    </div>
  );
}
