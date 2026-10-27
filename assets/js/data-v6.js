(function (root) {
  'use strict';

  const CURRENCIES = {
    USD: { symbol: '$', rate: 1, code: 'USD' },
    EUR: { symbol: '€', rate: 0.92, code: 'EUR' },
    GBP: { symbol: '£', rate: 0.79, code: 'GBP' },
    AED: { symbol: 'AED ', rate: 3.67, code: 'AED' },
    INR: { symbol: '₹', rate: 84.0, code: 'INR' },
    CAD: { symbol: 'CA$', rate: 1.38, code: 'CAD' },
    AUD: { symbol: 'A$', rate: 1.52, code: 'AUD' }
  };

  const NATIONALITIES = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'IN', name: 'India' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'IE', name: 'Ireland' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'AT', name: 'Austria' },
    { code: 'BE', name: 'Belgium' },
    { code: 'PT', name: 'Portugal' },
    { code: 'GR', name: 'Greece' },
    { code: 'PL', name: 'Poland' },
    { code: 'CZ', name: 'Czechia' },
    { code: 'HU', name: 'Hungary' },
    { code: 'RO', name: 'Romania' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'HR', name: 'Croatia' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'EE', name: 'Estonia' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'MT', name: 'Malta' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'IS', name: 'Iceland' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'SG', name: 'Singapore' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'PE', name: 'Peru' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'PH', name: 'Philippines' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'TH', name: 'Thailand' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'CN', name: 'China' },
    { code: 'HK', name: 'Hong Kong SAR' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'QA', name: 'Qatar' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'OM', name: 'Oman' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'JO', name: 'Jordan' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'EG', name: 'Egypt' },
    { code: 'MA', name: 'Morocco' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'TR', name: 'Türkiye' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'NP', name: 'Nepal' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'KE', name: 'Kenya' },
    { code: 'GH', name: 'Ghana' },
    { code: 'ET', name: 'Ethiopia' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'UG', name: 'Uganda' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'MU', name: 'Mauritius' },
    { code: 'SC', name: 'Seychelles' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'GE', name: 'Georgia' },
    { code: 'AM', name: 'Armenia' },
    { code: 'AZ', name: 'Azerbaijan' },
    { code: 'KZ', name: 'Kazakhstan' },
    { code: 'UZ', name: 'Uzbekistan' },
    { code: 'IL', name: 'Israel' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'PA', name: 'Panama' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'TT', name: 'Trinidad and Tobago' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'BB', name: 'Barbados' }
  ];

  const VWP_COUNTRIES = [
    'GB','DE','FR','IT','ES','NL','SE','NO','DK','FI','IE','CH','AT','BE','PT',
    'GR','PL','CZ','HU','SK','SI','EE','LV','LT','LU','MT','IS','JP','KR','SG',
    'AU','NZ','TW','IL','CL','QA'
  ];

  const EU_EEA_COUNTRIES = [
    'DE','FR','IT','ES','NL','SE','NO','DK','FI','IE','CH','AT','BE','PT','GR',
    'PL','CZ','HU','RO','BG','HR','SK','SI','EE','LV','LT','LU','MT','CY','IS'
  ];

  const GCC_COUNTRIES = ['AE', 'SA', 'QA', 'KW', 'OM', 'BH'];

  const DESTINATIONS = [
    {
      id: 'vietnam',
      slug: 'vietnam-evisa',
      name: 'Vietnam',
      shortName: 'Vietnam',
      region: 'Asia-Pacific',
      visaType: 'Vietnam Tourist e-Visa (Single Entry)',
      categoryBadge: 'eVisa',
      govFeeUSD: 25,
      govFeeNative: '$25 USD statutory government fee',
      serviceFeeUSD: 34,
      priorityFeeUSD: 20,
      ourHandlingTime: 'Standard review: 6–12 hrs (Priority: within 2 hrs)',
      govProcessingTime: '3–5 working days by Vietnam Immigration',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Up to 90 Days',
      validity: '90 Days from entry date',
      entryType: 'Single Entry (Multiple entry available)',
      govPortalName: 'Vietnam National Portal on Immigration',
      govPortal: 'https://evisa.gov.vn',
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Ammie Ngo',
      photoCreditUrl: 'https://unsplash.com/photos/w7ZyuGYNpRQ',
      overview: 'Official 90-day electronic tourist visa accepted at all international airports, land borders, and seaports across Vietnam.',
      documents: [
        'Color scan of passport bio-data page (valid at least 6 months past arrival)',
        'Digital portrait photo (4×6 cm ratio, plain white background, no glasses)',
        'Intended entry/exit checkpoint and initial hotel or accommodation address'
      ],
      faqs: [
        {
          q: 'Which nationalities can apply for the Vietnam 90-day e-Visa?',
          a: 'Since August 2023, citizens of all countries and territories are eligible to apply online for the 90-day Vietnam e-Visa.'
        },
        {
          q: 'Do some European or ASEAN passports get short visa-free entry?',
          a: 'Yes. Citizens of ASEAN nations and select European/Asian countries (such as the UK, Germany, France, Italy, Spain, Japan, and South Korea) enjoy 14 to 45 days visa-free entry, and only need the 90-day e-Visa for longer stays.'
        }
      ],
      visaFreeShortStayFor: ['VN', 'SG', 'TH', 'MY', 'ID', 'PH']
    },
    {
      id: 'thailand-tdac',
      slug: 'thailand-arrival-card',
      name: 'Thailand (Arrival Card)',
      shortName: 'Thailand TDAC',
      region: 'Asia-Pacific',
      visaType: 'Thailand Digital Arrival Card (TDAC)',
      categoryBadge: 'Arrival Card',
      govFeeUSD: 0,
      govFeeNative: 'Free ($0 on official government portal)',
      serviceFeeUSD: 29,
      priorityFeeUSD: 15,
      ourHandlingTime: 'Reviewed & queued within 4–6 hrs (Priority: within 1 hr)',
      govProcessingTime: 'Issued within the 72-hour pre-arrival window',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Per visa / exemption (up to 60 days)',
      validity: 'Single arrival entry',
      entryType: 'Single Entry',
      govPortalName: 'Thailand Immigration Bureau TDAC Portal',
      govPortal: 'https://tdac.immigration.go.th',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Sumit Chinchane',
      photoCreditUrl: 'https://unsplash.com/photos/sELcHR_bGVs',
      overview: 'Mandatory electronic arrival card required for foreign travelers entering Thailand by air, land, or sea. Free on the official government site, or file early with our guided review service.',
      documents: [
        'Valid passport details (minimum 6 months validity recommended)',
        'Confirmed arrival flight number and travel dates',
        'Hotel or residential address in Thailand'
      ],
      faqs: [
        {
          q: 'Is the Thailand Digital Arrival Card (TDAC) free on the government website?',
          a: 'Yes. The Thailand Immigration Bureau does not charge a government fee ($0) for the TDAC at tdac.immigration.go.th. Our $29 service fee covers early submission queuing, passport verification, and 24/7 support.'
        },
        {
          q: 'When is the TDAC submitted?',
          a: 'You can complete our form anytime before your trip. We review your details immediately and submit your declaration as soon as the official 3-day arrival window opens.'
        }
      ],
      visaFreeShortStayFor: ['TH']
    },
    {
      id: 'indonesia',
      slug: 'indonesia-evoa',
      name: 'Indonesia (Bali)',
      shortName: 'Indonesia',
      region: 'Asia-Pacific',
      visaType: 'Indonesia & Bali Electronic Visa on Arrival (B1 e-VOA)',
      categoryBadge: 'eVisa',
      govFeeUSD: 35,
      govFeeNative: 'IDR 500,000 + card fee (~$35 USD)',
      serviceFeeUSD: 34,
      priorityFeeUSD: 20,
      ourHandlingTime: 'Standard review: 4–8 hrs (Priority: within 2 hrs)',
      govProcessingTime: '24–48 hours by Indonesian Directorate General of Immigration',
      verifiedDate: '27 Oct 2026',
      maxStay: '30 Days (Extendable once for 30 days)',
      validity: '90 Days to enter from issue date',
      entryType: 'Single Entry',
      govPortalName: 'Indonesian Directorate General of Immigration',
      govPortal: 'https://evisa.imigrasi.go.id',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Alfiano Sutianto',
      photoCreditUrl: 'https://unsplash.com/photos/1527pjeb6jg',
      overview: 'Skip the airport VOA payment queues in Bali (Denpasar) and Jakarta with a pre-approved B1 Electronic Visa on Arrival allowing automated e-Gate access.',
      documents: [
        'Clear color scan of passport bio-data page (at least 6 months validity)',
        'Digital passport-style portrait photo',
        'Return or onward flight ticket details and Bali/Indonesia hotel address'
      ],
      faqs: [
        {
          q: 'Can I use the automated e-Gates at Bali Airport with an e-VOA?',
          a: 'Yes. Travelers with a biometric passport and a pre-approved e-VOA can walk straight through the automated immigration e-Gates at Bali Ngurah Rai and Jakarta Soekarno-Hatta airports.'
        }
      ],
      visaFreeShortStayFor: ['ID', 'SG', 'MY', 'TH', 'VN', 'PH']
    },
    {
      id: 'singapore',
      slug: 'singapore-arrival-card',
      name: 'Singapore (SGAC)',
      shortName: 'Singapore',
      region: 'Asia-Pacific',
      visaType: 'Singapore Digital Arrival Card (SGAC) & Health Declaration',
      categoryBadge: 'Arrival Card',
      govFeeUSD: 0,
      govFeeNative: 'Free ($0 on official ICA portal)',
      serviceFeeUSD: 29,
      priorityFeeUSD: 15,
      ourHandlingTime: 'Reviewed & queued within 4 hrs (Priority: within 1 hr)',
      govProcessingTime: 'Processed within 3 days before arrival',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Per entry eligibility (typically 30–90 days)',
      validity: 'Single arrival trip',
      entryType: 'Single Entry',
      govPortalName: 'Singapore Immigration & Checkpoints Authority (ICA)',
      govPortal: 'https://eservices.ica.gov.sg/sgarrivalcard',
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Hu Chen',
      photoCreditUrl: 'https://unsplash.com/photos/d6ebY-faOO0',
      overview: 'Mandatory electronic arrival card and health declaration required for visitors arriving in Singapore. Free on the official ICA website, or pre-schedule anytime with our assistance service.',
      documents: [
        'Passport bio-page details (valid at least 6 months beyond arrival)',
        'Flight number or land/sea arrival details',
        'Accommodation details in Singapore'
      ],
      faqs: [
        {
          q: 'Is the Singapore Arrival Card (SGAC) a visa?',
          a: 'No. The SGAC is a mandatory pre-arrival declaration, not a visa. Official submission at eservices.ica.gov.sg is free ($0). Our $29 fee is for optional early scheduling and document review.'
        }
      ],
      visaFreeShortStayFor: ['SG']
    },
    {
      id: 'india',
      slug: 'india-evisa',
      name: 'India',
      shortName: 'India',
      region: 'Asia-Pacific',
      visaType: 'India Tourist e-Visa (30-Day Double Entry)',
      categoryBadge: 'eVisa',
      govFeeUSD: 25,
      govFeeNative: '$25 USD statutory government fee',
      serviceFeeUSD: 39,
      priorityFeeUSD: 20,
      ourHandlingTime: 'Standard review: 6–12 hrs (Priority: within 2 hrs)',
      govProcessingTime: '72 hours (3 business days) by Indian Bureau of Immigration',
      verifiedDate: '27 Oct 2026',
      maxStay: '30 Days',
      validity: '30 Days from arrival',
      entryType: 'Double Entry',
      govPortalName: 'Government of India e-Visa Portal',
      govPortal: 'https://indianvisaonline.gov.in/evisa/',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Sylwia Bartyzel',
      photoCreditUrl: 'https://unsplash.com/photos/eU4pipU_8HA',
      overview: 'Electronic Tourist Visa (e-TV) for international travelers visiting India for sightseeing, recreation, or visiting friends and relatives.',
      documents: [
        'Clear color scan of passport bio-data page (6+ months validity and 2 blank pages)',
        'Square digital photograph (2×2 inch ratio, white background, we format automatically)',
        'Port of arrival and reference/hotel details in India'
      ],
      faqs: [
        {
          q: 'How far in advance should I apply for the India 30-day e-Visa?',
          a: 'Applications for the 30-day Tourist e-Visa are submitted within 30 days of your expected arrival date and at least 4 days before departure.'
        }
      ],
      visaFreeShortStayFor: ['IN', 'NP', 'BT'],
      embassyRequiredFor: ['PK']
    },
    {
      id: 'cambodia',
      slug: 'cambodia-evisa',
      name: 'Cambodia',
      shortName: 'Cambodia',
      region: 'Asia-Pacific',
      visaType: 'Cambodia Tourist e-Visa (Type T)',
      categoryBadge: 'eVisa',
      govFeeUSD: 30,
      govFeeNative: '$30 USD statutory government fee',
      serviceFeeUSD: 34,
      priorityFeeUSD: 20,
      ourHandlingTime: 'Standard review: 6–12 hrs (Priority: within 2 hrs)',
      govProcessingTime: '3 business days by Ministry of Foreign Affairs',
      verifiedDate: '27 Oct 2026',
      maxStay: '30 Days',
      validity: '90 Days from issue date',
      entryType: 'Single Entry',
      govPortalName: 'Kingdom of Cambodia Official e-Visa Portal',
      govPortal: 'https://www.evisa.gov.kh',
      image: 'https://images.unsplash.com/photo-1569683795645-b62e50fbf103?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1569683795645-b62e50fbf103?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'vickholius nugroho',
      photoCreditUrl: 'https://unsplash.com/photos/jt6QxZwSOCQ',
      overview: 'Official Type-T electronic tourist visa for visiting Siem Reap (Angkor Wat), Phnom Penh, and Sihanoukville.',
      documents: [
        'Passport bio-page scan (valid at least 6 months from entry)',
        'Digital passport-style color photo',
        'Port of entry and hotel address in Cambodia'
      ],
      faqs: [
        {
          q: 'Which airports accept the Cambodia e-Visa?',
          a: 'Phnom Penh International Airport, Siem Reap-Angkor International Airport, Sihanoukville International Airport, and major land borders with Thailand and Vietnam.'
        }
      ],
      visaFreeShortStayFor: ['SG', 'TH', 'VN', 'MY', 'ID', 'PH']
    },
    {
      id: 'uae',
      slug: 'uae-evisa',
      name: 'United Arab Emirates',
      shortName: 'UAE (Dubai)',
      region: 'Middle East',
      visaType: 'UAE 30-Day Tourist eVisa',
      categoryBadge: 'eVisa',
      govFeeUSD: 95,
      govFeeNative: 'AED 350 (~$95 USD) statutory fee',
      serviceFeeUSD: 44,
      priorityFeeUSD: 25,
      ourHandlingTime: 'Standard review: 4–8 hrs (Priority: within 2 hrs)',
      govProcessingTime: '2–4 working days by UAE ICP / GDRFA',
      verifiedDate: '27 Oct 2026',
      maxStay: '30 Days',
      validity: '60 Days from issue date',
      entryType: 'Single Entry',
      govPortalName: 'UAE Federal Authority for Identity & Citizenship (ICP)',
      govPortal: 'https://icp.gov.ae',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'ZQ Lee',
      photoCreditUrl: 'https://unsplash.com/photos/Fr6zexbmjmc',
      overview: 'Pre-approved electronic tourist visa for travelers visiting Dubai, Abu Dhabi, Sharjah, and all seven emirates.',
      documents: [
        'Color scan of passport bio-data page (6+ months validity)',
        'Recent color passport photograph on a white background',
        'Return flight and hotel booking details'
      ],
      faqs: [
        {
          q: 'Do US, UK, and EU citizens need a pre-arranged UAE eVisa?',
          a: 'No. Passport holders from the US, UK, EU, Canada, Australia, Japan, and GCC countries receive a free visa on arrival at UAE airports and do not need to apply in advance.'
        }
      ],
      visaFreeShortStayFor: ['AE', 'SA', 'QA', 'KW', 'OM', 'BH', 'US', 'GB', 'CA', 'AU', 'NZ', 'JP', 'KR', 'SG', 'MY', ...EU_EEA_COUNTRIES]
    },
    {
      id: 'saudi',
      slug: 'saudi-evisa',
      name: 'Saudi Arabia',
      shortName: 'Saudi Arabia',
      region: 'Middle East',
      visaType: 'Saudi 1-Year Multiple-Entry Tourist eVisa',
      categoryBadge: 'eVisa',
      govFeeUSD: 108,
      govFeeNative: 'SAR 395 incl. mandatory health insurance (~$108 USD)',
      serviceFeeUSD: 44,
      priorityFeeUSD: 25,
      ourHandlingTime: 'Standard review: 4–8 hrs (Priority: within 2 hrs)',
      govProcessingTime: '24–72 hours by Saudi Ministry of Tourism',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Up to 90 Days per visit',
      validity: '1 Year',
      entryType: 'Multiple Entry',
      govPortalName: 'Visit Saudi Official eVisa Portal',
      govPortal: 'https://visa.visitsaudi.com',
      image: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'NEOM',
      photoCreditUrl: 'https://unsplash.com/photos/wTmGtmGQCjQ',
      overview: '1-year multiple-entry electronic visa for tourism, family visits, events, and Umrah (outside Hajj season), including mandatory visitor medical insurance.',
      documents: [
        'Passport bio-page scan (valid at least 6 months from entry)',
        'Digital passport-style color photo on a white background',
        'Accommodation address in Saudi Arabia'
      ],
      faqs: [
        {
          q: 'Does the $108 government fee include Saudi medical insurance?',
          a: 'Yes. The statutory Saudi eVisa fee (approx. SAR 395 / $108 USD) includes both the government visa fee and mandatory emergency medical insurance.'
        }
      ],
      visaFreeShortStayFor: GCC_COUNTRIES
    },
    {
      id: 'turkey',
      slug: 'turkey-evisa',
      name: 'Türkiye',
      shortName: 'Türkiye',
      region: 'Europe',
      visaType: 'Republic of Türkiye Electronic Visa (e-Visa)',
      categoryBadge: 'eVisa',
      govFeeUSD: 52,
      govFeeNative: '$51.50 USD statutory fee',
      serviceFeeUSD: 34,
      priorityFeeUSD: 20,
      ourHandlingTime: 'Standard review: 4–8 hrs (Priority: within 2 hrs)',
      govProcessingTime: '24–48 hours by Turkish Ministry of Foreign Affairs',
      verifiedDate: '27 Oct 2026',
      maxStay: '30 to 90 Days (by nationality)',
      validity: '180 Days',
      entryType: 'Single or Multiple Entry',
      govPortalName: 'Republic of Türkiye e-Visa System',
      govPortal: 'https://www.evisa.gov.tr',
      image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Anna Berdnik',
      photoCreditUrl: 'https://unsplash.com/photos/0n0AHB1fgTQ',
      overview: 'Electronic entry visa for eligible tourists and business visitors traveling to Istanbul, Cappadocia, and Antalya.',
      documents: [
        'Valid passport bio-page scan (6+ months validity)',
        'Supporting valid visa or residence permit from US, UK, Ireland, or Schengen (required for conditional nationalities such as India, Pakistan, and Egypt)'
      ],
      faqs: [
        {
          q: 'Do US, UK, Canadian, and EU citizens need a Türkiye e-Visa?',
          a: 'No. Citizens of the United States, United Kingdom, Canada, EU member states, and UAE can enter Türkiye visa-free for short tourist stays up to 90 days.'
        }
      ],
      visaFreeShortStayFor: ['TR', 'US', 'GB', 'CA', 'AE', 'SA', 'QA', 'KW', 'OM', 'BH', 'JP', 'KR', 'SG', 'MY', 'NZ', 'BR', 'AR', 'CL', ...EU_EEA_COUNTRIES]
    },
    {
      id: 'egypt',
      slug: 'egypt-evisa',
      name: 'Egypt',
      shortName: 'Egypt',
      region: 'Africa',
      visaType: 'Egypt Tourist e-Visa (Single Entry)',
      categoryBadge: 'eVisa',
      govFeeUSD: 25,
      govFeeNative: '$25 USD statutory government fee',
      serviceFeeUSD: 34,
      priorityFeeUSD: 20,
      ourHandlingTime: 'Standard review: 6–12 hrs (Priority: within 2 hrs)',
      govProcessingTime: '5–7 business days by Egypt Ministry of Interior',
      verifiedDate: '27 Oct 2026',
      maxStay: '30 Days',
      validity: '90 Days from issue date',
      entryType: 'Single Entry',
      govPortalName: 'Arab Republic of Egypt Visa2Egypt Portal',
      govPortal: 'https://visa2egypt.gov.eg',
      image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Spencer Davis',
      photoCreditUrl: 'https://unsplash.com/photos/ONVA6s03hg8',
      overview: 'Official electronic tourist visa for travelers visiting Cairo, the Pyramids of Giza, Luxor, Aswan, and Red Sea resorts.',
      documents: [
        'Color scan of passport bio-data page (at least 6 months validity from arrival)',
        'Hotel reservation or host address in Egypt and travel dates'
      ],
      faqs: [
        {
          q: 'When should I submit my Egypt e-Visa application?',
          a: 'Egyptian immigration recommends applying at least 7 days prior to your scheduled departure flight.'
        }
      ],
      visaFreeShortStayFor: ['EG', 'SA', 'AE', 'KW', 'BH', 'OM', 'JO', 'MY', 'HK']
    },
    {
      id: 'kenya',
      slug: 'kenya-eta',
      name: 'Kenya',
      shortName: 'Kenya',
      region: 'Africa',
      visaType: 'Kenya Electronic Travel Authorisation (eTA)',
      categoryBadge: 'ETA',
      govFeeUSD: 34,
      govFeeNative: '$32.50 USD + processing charge (~$34 USD)',
      serviceFeeUSD: 35,
      priorityFeeUSD: 20,
      ourHandlingTime: 'Standard review: 6–12 hrs (Priority: within 2 hrs)',
      govProcessingTime: '3 business days by Kenya Directorate of Immigration',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Up to 90 Days',
      validity: '90 Days',
      entryType: 'Single Entry',
      govPortalName: 'Republic of Kenya Official eTA Portal',
      govPortal: 'https://etakenya.go.ke',
      image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Damian Patkowski',
      photoCreditUrl: 'https://unsplash.com/photos/T-LfvX-7IVg',
      overview: 'Mandatory pre-travel digital clearance required for international air travelers visiting Nairobi, Maasai Mara, and Mombasa.',
      documents: [
        'Passport bio-page scan (valid at least 6 months past intended arrival)',
        'Digital selfie or passport-style photo',
        'Flight itinerary and hotel/safari booking confirmation'
      ],
      faqs: [
        {
          q: 'Did the Kenya eTA replace the old Kenya eVisa?',
          a: 'Yes. Kenya replaced its traditional visa system with the mandatory Electronic Travel Authorisation (eTA) for international visitors.'
        }
      ],
      visaFreeShortStayFor: ['KE', 'TZ', 'UG', 'RW', 'ET', 'ZA', 'GH']
    },
    {
      id: 'uk',
      slug: 'uk-eta',
      name: 'United Kingdom',
      shortName: 'UK ETA',
      region: 'Europe',
      visaType: 'UK Electronic Travel Authorisation (ETA)',
      categoryBadge: 'ETA',
      govFeeUSD: 21,
      govFeeNative: '£16 GBP (~$21 USD) statutory fee',
      serviceFeeUSD: 34,
      priorityFeeUSD: 20,
      ourHandlingTime: 'Standard review: 4–8 hrs (Priority: within 2 hrs)',
      govProcessingTime: 'Typically within 3 working days by UK Home Office',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Up to 6 Months per visit',
      validity: '2 Years (or until passport expires)',
      entryType: 'Multiple Entry',
      govPortalName: 'GOV.UK Official ETA Portal',
      govPortal: 'https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Benjamin Davies',
      photoCreditUrl: 'https://unsplash.com/photos/Oja2ty_9ZLM',
      overview: 'Mandatory digital travel permission for visa-exempt nationals (including US, Canadian, Australian, EU, and GCC citizens) visiting England, Scotland, Wales, and Northern Ireland.',
      documents: [
        'Biometric passport scan from an eligible visa-exempt country',
        'Digital facial photo on a plain light background'
      ],
      faqs: [
        {
          q: 'Who is eligible for the UK ETA vs. a UK Standard Visitor Visa?',
          a: 'Visa-exempt travelers (such as citizens of the US, Canada, Australia, EU/EEA, Japan, and GCC states) apply online for the UK ETA. Other nationalities require an in-person UK Standard Visitor Visa with biometrics.'
        }
      ],
      visaFreeShortStayFor: ['GB', 'IE'],
      etaEligibleFor: ['US', 'CA', 'AU', 'NZ', 'JP', 'KR', 'SG', 'MY', 'HK', 'TW', 'IL', 'BR', 'AR', 'CL', 'MX', 'CR', 'PA', 'UY', ...GCC_COUNTRIES, ...EU_EEA_COUNTRIES]
    },
    {
      id: 'usa',
      slug: 'us-esta',
      name: 'United States',
      shortName: 'US ESTA',
      region: 'Americas',
      visaType: 'United States ESTA (Visa Waiver Program)',
      categoryBadge: 'ETA',
      govFeeUSD: 21,
      govFeeNative: '$21 USD statutory CBP fee',
      serviceFeeUSD: 38,
      priorityFeeUSD: 20,
      ourHandlingTime: 'Standard review: 4–8 hrs (Priority: within 2 hrs)',
      govProcessingTime: 'Up to 72 hours by U.S. Customs and Border Protection',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Up to 90 Days per visit',
      validity: '2 Years (or until passport expires)',
      entryType: 'Multiple Entry',
      govPortalName: 'U.S. Customs and Border Protection ESTA',
      govPortal: 'https://esta.cbp.dhs.gov',
      image: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Michael Discenza',
      photoCreditUrl: 'https://unsplash.com/photos/5omwAMDxmkU',
      overview: 'Electronic System for Travel Authorization (ESTA) for citizens of the 42 Visa Waiver Program countries traveling to the United States for tourism, business, or transit.',
      documents: [
        'Valid e-Passport with electronic chip from a Visa Waiver Program country',
        'U.S. point of contact/hotel address and current employment details'
      ],
      faqs: [
        {
          q: 'What if my passport country is not in the U.S. Visa Waiver Program?',
          a: 'Travelers whose nationality is not in the Visa Waiver Program cannot use ESTA and must apply for a B1/B2 Visitor Visa through a U.S. Embassy or Consulate with an in-person interview.'
        }
      ],
      visaFreeShortStayFor: ['US', 'CA'],
      etaEligibleFor: VWP_COUNTRIES
    },
    {
      id: 'canada',
      slug: 'canada-eta',
      name: 'Canada',
      shortName: 'Canada eTA',
      region: 'Americas',
      visaType: 'Canada Electronic Travel Authorization (eTA)',
      categoryBadge: 'ETA',
      govFeeUSD: 5,
      govFeeNative: 'CAD $7 (~$5 USD) statutory fee',
      serviceFeeUSD: 34,
      priorityFeeUSD: 20,
      ourHandlingTime: 'Standard review: 4–8 hrs (Priority: within 2 hrs)',
      govProcessingTime: 'Typically minutes to 72 hours by IRCC',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Up to 6 Months per visit',
      validity: 'Up to 5 Years (or until passport expires)',
      entryType: 'Multiple Entry',
      govPortalName: 'Government of Canada IRCC eTA Portal',
      govPortal: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html',
      image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Mwangi Gatheca',
      photoCreditUrl: 'https://unsplash.com/photos/qlKaN7eqay8',
      overview: 'Mandatory electronic entry requirement for visa-exempt foreign nationals flying to or transiting through a Canadian airport.',
      documents: [
        'Valid passport from a visa-exempt country',
        'Occupation and residential address details'
      ],
      faqs: [
        {
          q: 'Do U.S. citizens need a Canada eTA?',
          a: 'No. U.S. citizens are exempt from the Canada eTA requirement and can travel to Canada using their valid U.S. passport alone.'
        }
      ],
      visaFreeShortStayFor: ['CA', 'US'],
      etaEligibleFor: ['GB', 'AU', 'NZ', 'JP', 'KR', 'SG', 'HK', 'TW', 'IL', 'AE', 'CL', 'MX', 'BR', ...EU_EEA_COUNTRIES]
    },
    {
      id: 'australia',
      slug: 'australia-eta',
      name: 'Australia',
      shortName: 'Australia ETA',
      region: 'Asia-Pacific',
      visaType: 'Australia Electronic Travel Authority (Subclass 601 / eVisitor 651)',
      categoryBadge: 'ETA',
      govFeeUSD: 14,
      govFeeNative: 'AUD $20 (~$14 USD) statutory charge',
      serviceFeeUSD: 35,
      priorityFeeUSD: 20,
      ourHandlingTime: 'Standard review: 4–8 hrs (Priority: within 2 hrs)',
      govProcessingTime: '24–72 hours by Australian Department of Home Affairs',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Up to 3 Months per visit',
      validity: '12 Months',
      entryType: 'Multiple Entry',
      govPortalName: 'Australian Department of Home Affairs',
      govPortal: 'https://immi.homeaffairs.gov.au',
      image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Dan Freeman',
      photoCreditUrl: 'https://unsplash.com/photos/7Zb7kUyQg1E',
      overview: 'Digital travel authorization for eligible passport holders visiting Sydney, Melbourne, and Brisbane for tourism or short business trips.',
      documents: [
        'Valid passport from an ETA or eVisitor eligible country',
        'Digital facial photo and contact information'
      ],
      faqs: [
        {
          q: 'How long can I stay in Australia on an ETA or eVisitor?',
          a: 'You may enter Australia multiple times over 12 months and stay up to 3 months on each visit.'
        }
      ],
      visaFreeShortStayFor: ['AU', 'NZ'],
      etaEligibleFor: ['US', 'CA', 'GB', 'JP', 'KR', 'SG', 'MY', 'HK', 'TW', ...EU_EEA_COUNTRIES]
    },
    {
      id: 'malaysia',
      slug: 'malaysia-arrival-card',
      name: 'Malaysia (MDAC)',
      shortName: 'Malaysia MDAC',
      region: 'Asia-Pacific',
      visaType: 'Malaysia Digital Arrival Card (MDAC)',
      categoryBadge: 'Arrival Card',
      govFeeUSD: 0,
      govFeeNative: 'Free ($0 on official Immigration portal)',
      serviceFeeUSD: 29,
      priorityFeeUSD: 15,
      ourHandlingTime: 'Reviewed & queued within 4 hrs (Priority: within 1 hr)',
      govProcessingTime: 'Submitted within 3 days before arrival',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Per entry exemption (typically 30–90 days)',
      validity: 'Single arrival trip',
      entryType: 'Single Entry',
      govPortalName: 'Immigration Department of Malaysia (MDAC)',
      govPortal: 'https://imigresen-online.imi.gov.my/mdac/main',
      image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Esmonde Yong',
      photoCreditUrl: 'https://unsplash.com/photos/oH2r97772_A',
      overview: 'Mandatory pre-arrival digital registration for international visitors entering Malaysia. Free on the official government website, or schedule in advance with our assistance team.',
      documents: [
        'Passport bio-page details (valid at least 6 months)',
        'Arrival and departure dates and accommodation address in Malaysia'
      ],
      faqs: [
        {
          q: 'Is there a government fee for the Malaysia Digital Arrival Card?',
          a: 'No. Filing directly at imigresen-online.imi.gov.my/mdac/main is free ($0). Our $29 fee covers optional early queuing, document review, and support.'
        }
      ],
      visaFreeShortStayFor: ['MY', 'SG']
    },
    {
      id: 'thailand-evisa',
      slug: 'thailand-evisa',
      name: 'Thailand (Tourist e-Visa)',
      shortName: 'Thailand e-Visa',
      region: 'Asia-Pacific',
      visaType: 'Thailand 60-Day Tourist e-Visa',
      categoryBadge: 'eVisa',
      govFeeUSD: 40,
      govFeeNative: '$40 USD statutory embassy fee',
      serviceFeeUSD: 39,
      priorityFeeUSD: 20,
      ourHandlingTime: 'Standard review: 6–12 hrs (Priority: within 2 hrs)',
      govProcessingTime: '5–10 business days by Royal Thai Embassy',
      verifiedDate: '27 Oct 2026',
      maxStay: '60 Days (Extendable by 30 days)',
      validity: '90 Days from issue',
      entryType: 'Single Entry',
      govPortalName: 'Thai Official Electronic Visa Portal',
      govPortal: 'https://www.thaievisa.go.th',
      image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Mathew Schwartz',
      photoCreditUrl: 'https://unsplash.com/photos/gsllxmVO4HQ',
      overview: 'Electronic 60-day tourist visa for nationalities requiring a pre-arranged visa or travellers planning an extended stay in Thailand.',
      documents: [
        'Passport bio-page scan (valid 6+ months)',
        'Digital passport photo taken within the last 6 months',
        'Confirmed return flight ticket and hotel booking in Thailand'
      ],
      faqs: [
        {
          q: 'Do US, UK, EU, Indian, and Chinese citizens need a Thailand e-Visa for short trips?',
          a: 'Over 90 nationalities (including US, UK, EU, Canada, Australia, India, China, and UAE) can enter Thailand visa-free for up to 60 days and only need the free Thailand Digital Arrival Card (TDAC).'
        }
      ],
      visaFreeShortStayFor: ['TH', 'US', 'GB', 'CA', 'AU', 'NZ', 'IN', 'CN', 'HK', 'TW', 'JP', 'KR', 'SG', 'MY', 'ID', 'PH', 'VN', 'BR', 'MX', 'ZA', 'TR', 'IL', ...GCC_COUNTRIES, ...EU_EEA_COUNTRIES]
    },
    {
      id: 'morocco',
      slug: 'morocco-evisa',
      name: 'Morocco',
      shortName: 'Morocco',
      region: 'Africa',
      visaType: 'Kingdom of Morocco Tourist eVisa',
      categoryBadge: 'eVisa',
      govFeeUSD: 77,
      govFeeNative: 'MAD 770 (~$77 USD) statutory fee',
      serviceFeeUSD: 39,
      priorityFeeUSD: 20,
      ourHandlingTime: 'Standard review: 6–12 hrs (Priority: within 2 hrs)',
      govProcessingTime: '3 business days (72 hours) by Moroccan authorities',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Up to 30 Days',
      validity: '180 Days',
      entryType: 'Single Entry',
      govPortalName: 'Kingdom of Morocco Accès Maroc Portal',
      govPortal: 'https://www.acces-maroc.ma',
      image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Toa Heftiba',
      photoCreditUrl: 'https://unsplash.com/photos/i0p916G-7wU',
      overview: 'Electronic tourist visa for eligible nationals (and holders of valid US, UK, or Schengen visas/residence permits) visiting Marrakech, Casablanca, and Fez.',
      documents: [
        'Passport bio-page scan (valid 6+ months)',
        'Digital color passport photo (4×3 cm ratio)',
        'Supporting valid residence permit or multiple-entry visa where applicable'
      ],
      faqs: [
        {
          q: 'Do US, UK, EU, Canadian, and Australian citizens need a Morocco eVisa?',
          a: 'No. Passport holders from the US, UK, EU, Canada, Australia, Japan, UAE, and Saudi Arabia can enter Morocco visa-free for up to 90 days.'
        }
      ],
      visaFreeShortStayFor: ['MA', 'US', 'GB', 'CA', 'AU', 'NZ', 'JP', 'KR', 'SG', 'MY', 'ID', 'PH', 'BR', 'AR', 'CL', 'MX', 'TR', ...GCC_COUNTRIES, ...EU_EEA_COUNTRIES]
    }
  ];

  function evaluateRequirement(passportCode, destId) {
    const nat = NATIONALITIES.find((n) => n.code === passportCode) || { code: passportCode, name: passportCode };
    const dest = DESTINATIONS.find((d) => d.id === destId) || DESTINATIONS[0];

    if (dest.embassyRequiredFor && dest.embassyRequiredFor.includes(passportCode)) {
      return {
        status: 'embassy',
        canApplyOnline: false,
        badgeText: 'In-Person Embassy Visa Required',
        badgeClass: 'badge-amber',
        headline: `${nat.name} passport holders require an in-person embassy visa for ${dest.name}.`,
        explanation: `Travelers with a ${nat.name} passport are not eligible for an online eVisa for ${dest.name} and must apply in person through the official embassy or consulate.`,
        dest,
        nat
      };
    }

    if (dest.categoryBadge === 'Arrival Card') {
      if (dest.visaFreeShortStayFor && dest.visaFreeShortStayFor.includes(passportCode)) {
        return {
          status: 'visa-free',
          canApplyOnline: false,
          badgeText: 'Citizen / Exempt — No Arrival Card Needed',
          badgeClass: 'badge-emerald',
          headline: `With a ${nat.name} passport, you do not need a foreign visitor arrival card for ${dest.shortName}.`,
          explanation: `No prior travel authorization or visitor arrival card is required.`,
          dest,
          nat
        };
      }
      return {
        status: 'free-arrival-card',
        canApplyOnline: true,
        badgeText: 'Mandatory Pre-Arrival Card (Official Form is Free)',
        badgeClass: 'badge-blue',
        headline: `${nat.name} passport → ${dest.name}: ${dest.visaType}`,
        explanation: `This digital arrival declaration is mandatory before entry. The official government form at ${dest.govPortalName} is free ($0), or you can use our private review and early-queuing service (+$${dest.serviceFeeUSD}).`,
        dest,
        nat
      };
    }

    if (dest.categoryBadge === 'ETA') {
      if (dest.visaFreeShortStayFor && dest.visaFreeShortStayFor.includes(passportCode)) {
        return {
          status: 'visa-free',
          canApplyOnline: false,
          badgeText: 'Visa-Free / Exempt — No ETA Required',
          badgeClass: 'badge-emerald',
          headline: `With a ${nat.name} passport, you do not need an ETA for ${dest.name}.`,
          explanation: `Holders of a ${nat.name} passport can travel to ${dest.name} with a valid passport alone and do not need to apply for ${dest.visaType}.`,
          dest,
          nat
        };
      }
      if (dest.etaEligibleFor && !dest.etaEligibleFor.includes(passportCode)) {
        return {
          status: 'embassy',
          canApplyOnline: false,
          badgeText: 'Embassy / Consular Visa Required (Not Eligible for Online ETA)',
          badgeClass: 'badge-amber',
          headline: `${nat.name} passport holders require a consular visa for ${dest.name}.`,
          explanation: `Only visa-exempt nationalities qualify for the online ${dest.visaType}. With a ${nat.name} passport, you must apply for a visitor visa directly through ${dest.govPortalName} with an in-person biometric appointment.`,
          dest,
          nat
        };
      }
      return {
        status: 'eta',
        canApplyOnline: true,
        badgeText: 'Electronic Travel Authorization (ETA) Required',
        badgeClass: 'badge-blue',
        headline: `${nat.name} passport → ${dest.name}: ${dest.visaType} required before boarding.`,
        explanation: dest.overview,
        dest,
        nat
      };
    }

    if (dest.visaFreeShortStayFor && dest.visaFreeShortStayFor.includes(passportCode)) {
      if (dest.id === 'thailand-evisa') {
        const tdac = DESTINATIONS.find((d) => d.id === 'thailand-tdac');
        return {
          status: 'visa-free-with-card',
          canApplyOnline: true,
          targetDest: tdac,
          badgeText: 'Visa-Free up to 60 Days (Only Free Arrival Card Needed)',
          badgeClass: 'badge-emerald',
          headline: `${nat.name} passport holders enter Thailand visa-free for up to 60 days.`,
          explanation: `You do not need a Thailand Tourist e-Visa for stays up to 60 days. You only need to complete the mandatory Thailand Digital Arrival Card (TDAC), which is $0 (free) on the official government site or $29 with our assistance service.`,
          dest: tdac,
          nat
        };
      }
      return {
        status: 'visa-free',
        canApplyOnline: false,
        badgeText: 'Visa-Free for Short Tourist Stays',
        badgeClass: 'badge-emerald',
        headline: `With a ${nat.name} passport, you do not need a prior tourist visa for short stays in ${dest.name}.`,
        explanation: `${nat.name} citizens receive visa-free entry or a free visa on arrival at the airport for short tourist visits. You only need a pre-arranged visa if you plan a longer stay.`,
        dest,
        nat
      };
    }

    return {
      status: 'evisa',
      canApplyOnline: true,
      badgeText: 'Online eVisa Required Before Travel',
      badgeClass: 'badge-blue',
      headline: `${nat.name} passport → ${dest.name}: ${dest.visaType}`,
      explanation: dest.overview,
      dest,
      nat
    };
  }

  function calculatePrice(destId, travelersCount, speedTier) {
    const dest = DESTINATIONS.find((d) => d.id === destId) || DESTINATIONS[0];
    const count = Math.max(1, Math.min(20, parseInt(travelersCount, 10) || 1));
    const speedFeePerPerson = speedTier === 'priority' ? dest.priorityFeeUSD : 0;
    const govPerPerson = dest.govFeeUSD;
    const servicePerPerson = dest.serviceFeeUSD + speedFeePerPerson;
    const totalPerPerson = govPerPerson + servicePerPerson;
    return {
      dest,
      travelers: count,
      speedTier: speedTier === 'priority' ? 'priority' : 'standard',
      govPerPersonUSD: govPerPerson,
      servicePerPersonUSD: dest.serviceFeeUSD,
      speedPerPersonUSD: speedFeePerPerson,
      totalServicePerPersonUSD: servicePerPerson,
      totalPerPersonUSD: totalPerPerson,
      govTotalUSD: govPerPerson * count,
      serviceTotalUSD: servicePerPerson * count,
      grandTotalUSD: totalPerPerson * count
    };
  }

  const EXPORT_DATA = {
    currencies: CURRENCIES,
    nationalities: NATIONALITIES,
    destinations: DESTINATIONS,
    evaluateRequirement,
    calculatePrice
  };

  root.ONEPASS_DATA = EXPORT_DATA;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EXPORT_DATA;
  }
})(typeof window !== 'undefined' ? window : globalThis);
