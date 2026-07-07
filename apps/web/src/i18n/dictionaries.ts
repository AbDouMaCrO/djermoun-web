export type Language = "en" | "fr" | "ar";

export const languages: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "ar", label: "AR" },
];

export const rtlLanguages: Language[] = ["ar"];

export const dictionaries = {
  en: {
    nav: {
      inventory: "Inventory",
      howItWorks: "How It Works",
      aboutUs: "About Us",
      contact: "Contact",
      account: "Account",
    },
    howItWorks: {
      heroTitle: "Your Dream Car, Delivered Safely",
      stepLabel: "Step",
      steps: [
        {
          title: "Selection & Reservation",
          description: "Browse our live inventory and reserve your vehicle with a click.",
        },
        {
          title: "Contract & Deposit",
          description: "Complete your KYC profile and sign the binding purchase agreement.",
        },
        {
          title: "Global Logistics",
          description:
            "We handle export paperwork and secure sea freight to your destination port.",
        },
        {
          title: "Customs & Handover",
          description: "Clear customs with our provided documents and drive away.",
        },
      ],
    },
    aboutUs: {
      heading: "About Us",
      missionEyebrow: "Our Mission",
      missionText:
        "DJERMOUN AUTO bridges the gap between global auto markets and buyers, delivering transparent pricing and rigorous vehicle inspections on every purchase.",
      trustEyebrow: "Why Trust Us",
      trustStats: ["Licensed Exporters", "Verified Bank Escrow", "100% Insured Shipping"],
    },
    contact: {
      heading: "Get In Touch",
      officeLabel: "Office Address",
      officeValue: "16 Rue des Frères Bouadou, Algiers, Algeria",
      portLabel: "Port Operations",
      portValue: "Djen Djen Port, Jijel, Algeria",
      whatsappLabel: "WhatsApp",
      emailLabel: "Email",
      form: {
        name: "Name",
        email: "Email",
        phone: "Phone",
        message: "Message",
        submit: "Send Message",
      },
    },
  },
  fr: {
    nav: {
      inventory: "Inventaire",
      howItWorks: "Comment ça marche",
      aboutUs: "À propos",
      contact: "Contact",
      account: "Mon Compte",
    },
    howItWorks: {
      heroTitle: "Votre voiture de rêve, livrée en toute sécurité",
      stepLabel: "Étape",
      steps: [
        {
          title: "Sélection & Réservation",
          description: "Parcourez notre inventaire et réservez votre véhicule en un clic.",
        },
        {
          title: "Contrat & Acompte",
          description: "Complétez votre profil et signez le contrat d'achat.",
        },
        {
          title: "Logistique Mondiale",
          description: "Nous gérons les formalités d'exportation et le fret maritime vers votre port.",
        },
        {
          title: "Douane & Remise",
          description: "Dédouanez avec nos documents et récupérez vos clés.",
        },
      ],
    },
    aboutUs: {
      heading: "À propos de nous",
      missionEyebrow: "Notre Mission",
      missionText:
        "DJERMOUN AUTO comble l'écart entre les marchés automobiles mondiaux et les acheteurs, en garantissant des prix transparents et des inspections rigoureuses sur chaque achat.",
      trustEyebrow: "Pourquoi Nous Faire Confiance",
      trustStats: [
        "Exportateurs Agréés",
        "Compte Séquestre Bancaire Vérifié",
        "Expédition Assurée à 100%",
      ],
    },
    contact: {
      heading: "Contactez-nous",
      officeLabel: "Adresse du Bureau",
      officeValue: "16 Rue des Frères Bouadou, Alger, Algérie",
      portLabel: "Opérations Portuaires",
      portValue: "Port de Djen Djen, Jijel, Algérie",
      whatsappLabel: "WhatsApp",
      emailLabel: "Email",
      form: {
        name: "Nom",
        email: "Email",
        phone: "Téléphone",
        message: "Message",
        submit: "Envoyer le Message",
      },
    },
  },
  ar: {
    nav: {
      inventory: "السيارات",
      howItWorks: "كيف نعمل",
      aboutUs: "من نحن",
      contact: "اتصل بنا",
      account: "حسابي",
    },
    howItWorks: {
      heroTitle: "سيارة أحلامك، تصلك بأمان",
      stepLabel: "الخطوة",
      steps: [
        {
          title: "الاختيار والحجز",
          description: "تصفح سياراتنا المتاحة واحجز سيارتك بضغطة زر.",
        },
        {
          title: "العقد والعربون",
          description: "أكمل ملفك وقم بتوقيع عقد الشراء لضمان حقك.",
        },
        {
          title: "الخدمات اللوجستية العالمية",
          description: "نتكفل بجميع أوراق التصدير والشحن البحري حتى ميناء وصولك.",
        },
        {
          title: "الجمارك والتسليم",
          description: "استلم أوراقك، قم بالتخليص الجمركي، واستلم مفاتيحك.",
        },
      ],
    },
    aboutUs: {
      heading: "من نحن",
      missionEyebrow: "مهمتنا",
      missionText:
        "تقوم DJERMOUN AUTO بسد الفجوة بين أسواق السيارات العالمية والمشترين، وتضمن أسعارًا شفافة وفحوصات دقيقة لكل سيارة.",
      trustEyebrow: "لماذا تثق بنا",
      trustStats: ["مصدرون مرخصون", "ضمان بنكي موثق", "شحن مؤمن بنسبة 100%"],
    },
    contact: {
      heading: "تواصل معنا",
      officeLabel: "عنوان المكتب",
      officeValue: "16 شارع الإخوة بوعادو، الجزائر العاصمة، الجزائر",
      portLabel: "عمليات الميناء",
      portValue: "ميناء جن جن، جيجل، الجزائر",
      whatsappLabel: "واتساب",
      emailLabel: "البريد الإلكتروني",
      form: {
        name: "الاسم",
        email: "البريد الإلكتروني",
        phone: "الهاتف",
        message: "الرسالة",
        submit: "إرسال الرسالة",
      },
    },
  },
} satisfies Record<
  Language,
  {
    nav: Record<string, string>;
    howItWorks: {
      heroTitle: string;
      stepLabel: string;
      steps: { title: string; description: string }[];
    };
    aboutUs: {
      heading: string;
      missionEyebrow: string;
      missionText: string;
      trustEyebrow: string;
      trustStats: string[];
    };
    contact: {
      heading: string;
      officeLabel: string;
      officeValue: string;
      portLabel: string;
      portValue: string;
      whatsappLabel: string;
      emailLabel: string;
      form: { name: string; email: string; phone: string; message: string; submit: string };
    };
  }
>;
