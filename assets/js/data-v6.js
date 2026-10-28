(function (root) {
  'use strict';

  const BASE_SERVICE_FEE_USD = 59.99;

  const CURRENCIES = {
    USD: { code: 'USD', symbol: 'US$', rate: 1, name: 'US Dollar' },
    EUR: { code: 'EUR', symbol: '€', rate: 0.92, name: 'Euro' },
    GBP: { code: 'GBP', symbol: '£', rate: 0.79, name: 'British Pound' },
    CAD: { code: 'CAD', symbol: 'CA$', rate: 1.38, name: 'Canadian Dollar' },
    AUD: { code: 'AUD', symbol: 'A$', rate: 1.54, name: 'Australian Dollar' },
    AED: { code: 'AED', symbol: 'AED ', rate: 3.67, name: 'UAE Dirham' },
    SGD: { code: 'SGD', symbol: 'S$', rate: 1.34, name: 'Singapore Dollar' },
    INR: { code: 'INR', symbol: '₹', rate: 84.0, name: 'Indian Rupee' }
  };

  function formatMoney(amountUSD, currencyCode) {
    const code = currencyCode && CURRENCIES[currencyCode] ? currencyCode : 'USD';
    const curr = CURRENCIES[code];
    const num = Number(amountUSD) || 0;
    if (num === 0) {
      return curr.symbol + '0';
    }
    const raw = num * curr.rate;
    const isWhole = Math.abs(raw - Math.round(raw)) < 0.005;
    if (code === 'USD' && !isWhole) {
      return curr.symbol + raw.toFixed(2);
    }
    const rounded = isWhole ? Math.round(raw) : Number(raw.toFixed(2));
    return curr.symbol + rounded.toLocaleString('en-US', isWhole ? {} : { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const NATIONALITIES = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
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
    { code: 'NZ', name: 'New Zealand' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'SG', name: 'Singapore' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'TH', name: 'Thailand' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'PH', name: 'Philippines' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'IN', name: 'India' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'NP', name: 'Nepal' },
    { code: 'CN', name: 'China' },
    { code: 'HK', name: 'Hong Kong SAR' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'AE', name: 'United Arab Emirates' },
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
    { code: 'ZA', name: 'South Africa' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'KE', name: 'Kenya' },
    { code: 'GH', name: 'Ghana' },
    { code: 'ET', name: 'Ethiopia' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'UG', name: 'Uganda' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'TR', name: 'Türkiye' },
    { code: 'MX', name: 'Mexico' },
    { code: 'BR', name: 'Brazil' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'PE', name: 'Peru' },
    { code: 'UA', name: 'Ukraine' },
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
      cleanTitle: 'Vietnam tourist eVisa',
      shortDocName: 'Tourist eVisa',
      region: 'Asia-Pacific',
      visaType: '90-day single-entry electronic tourist visa',
      categoryBadge: 'eVisa',
      govFeeUSD: 25,
      govFeeNative: 'US$25 statutory government fee',
      serviceFeeUSD: BASE_SERVICE_FEE_USD,
      priorityFeeUSD: 20,
      standardReviewTime: 'Within 6–12 hours',
      priorityReviewTime: 'Within 2 hours',
      ourHandlingTime: 'Within 6–12 hours (Priority: within 2 hours)',
      govProcessingTime: '3–5 working days by Vietnam Immigration',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Up to 90 days',
      validity: '90 days from entry date',
      entryType: 'Single entry',
      requiresUploads: true,
      requiresFlightAndHotel: true,
      govPortalName: 'Vietnam National Portal on Immigration',
      govPortal: 'https://evisa.gov.vn',
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Ammie Ngo',
      photoCreditUrl: 'https://unsplash.com/photos/w7ZyuGYNpRQ',
      overview: 'Official 90-day electronic tourist visa accepted at international airports, land borders, and seaports across Vietnam.',
      documents: [
        'Color scan or photo of your passport bio-data page (valid at least 6 months past arrival)',
        'Digital portrait photo on a plain light background (no glasses)',
        'Planned entry checkpoint and initial hotel or accommodation address in Vietnam'
      ],
      faqs: [
        {
          q: 'Which nationalities can apply for the Vietnam 90-day eVisa?',
          a: 'Citizens of all countries and territories are eligible to apply online for the 90-day Vietnam eVisa.'
        },
        {
          q: 'Do some European or ASEAN passports get short visa-free entry?',
          a: 'Yes. Citizens of ASEAN member states and select European/Asian countries (such as the UK, Germany, France, Italy, Spain, Japan, and South Korea) receive 14 to 45 days visa-free entry, and only need the 90-day eVisa for stays longer than their exemption.'
        }
      ],
      visaFreeShortStayFor: ['VN', 'SG', 'TH', 'MY', 'ID', 'PH']
    },
    {
      id: 'thailand-tdac',
      slug: 'thailand-arrival-card',
      name: 'Thailand',
      shortName: 'Thailand TDAC',
      cleanTitle: 'Thailand digital arrival card (TDAC)',
      shortDocName: 'Digital Arrival Card (TDAC)',
      region: 'Asia-Pacific',
      visaType: 'Mandatory pre-arrival digital declaration',
      categoryBadge: 'Arrival Card',
      govFeeUSD: 0,
      govFeeNative: 'Free (US$0 on official government portal)',
      serviceFeeUSD: BASE_SERVICE_FEE_USD,
      priorityFeeUSD: 15,
      standardReviewTime: 'Within 4–6 hours',
      priorityReviewTime: 'Within 1 hour',
      ourHandlingTime: 'Within 4–6 hours (Priority: within 1 hour)',
      govProcessingTime: 'Submitted within the 72-hour pre-arrival window',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Per entry eligibility',
      validity: 'Single arrival trip',
      entryType: 'Single arrival declaration',
      requiresUploads: false,
      requiresFlightAndHotel: true,
      govPortalName: 'Thailand Immigration Bureau TDAC Portal',
      govPortal: 'https://tdac.immigration.go.th',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Sumit Chinchane',
      photoCreditUrl: 'https://unsplash.com/photos/sELcHR_bGVs',
      overview: 'Mandatory electronic arrival card required for foreign travelers entering Thailand. Free when filed directly on the official portal within 72 hours of arrival, or submit early anytime with our review and scheduled-filing service.',
      documents: [
        'Passport details (passport number, issue/expiry dates, valid at least 6 months)',
        'Arrival flight or vessel number and planned arrival date',
        'Hotel or accommodation address in Thailand'
      ],
      faqs: [
        {
          q: 'Is the Thailand Digital Arrival Card (TDAC) free on the government website?',
          a: 'Yes. The Thailand Immigration Bureau does not charge a government fee (US$0) at tdac.immigration.go.th. Our US$59.99 service fee is optional and covers early intake before the 72-hour window opens, specialist review of your passport and flight details, and scheduled filing.'
        },
        {
          q: 'When will my TDAC be submitted if I apply weeks before my trip?',
          a: 'We review your details within 4–6 hours of your order, place your declaration in our scheduled queue, and automatically submit it as soon as the official 72-hour pre-arrival window opens.'
        }
      ],
      visaFreeShortStayFor: ['TH']
    },
    {
      id: 'indonesia',
      slug: 'indonesia-evoa',
      name: 'Indonesia (Bali)',
      shortName: 'Indonesia',
      cleanTitle: 'Indonesia & Bali e-VOA',
      shortDocName: 'Electronic Visa on Arrival (e-VOA)',
      region: 'Asia-Pacific',
      visaType: '30-day B1 Electronic Visa on Arrival',
      categoryBadge: 'eVisa',
      govFeeUSD: 35,
      govFeeNative: 'IDR 500,000 + portal fee (approx. US$35 converted)',
      serviceFeeUSD: BASE_SERVICE_FEE_USD,
      priorityFeeUSD: 20,
      standardReviewTime: 'Within 6–12 hours',
      priorityReviewTime: 'Within 2 hours',
      ourHandlingTime: 'Within 6–12 hours (Priority: within 2 hours)',
      govProcessingTime: '24–48 hours by Indonesian Directorate General of Immigration',
      verifiedDate: '27 Oct 2026',
      maxStay: '30 days (extendable once for 30 days)',
      validity: '90 days to enter from issue date',
      entryType: 'Single entry',
      requiresUploads: true,
      requiresFlightAndHotel: true,
      govPortalName: 'Indonesian Directorate General of Immigration',
      govPortal: 'https://evisa.imigrasi.go.id',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Alfiano Sutianto',
      photoCreditUrl: 'https://unsplash.com/photos/1527pjeb6jg',
      overview: 'Skip airport payment queues in Bali (Denpasar) and Jakarta with a pre-approved B1 Electronic Visa on Arrival allowing automated e-Gate entry.',
      documents: [
        'Color scan or photo of your passport bio-data page (at least 6 months validity)',
        'Digital passport-style portrait photo',
        'Return or onward flight details and hotel address in Bali or Indonesia'
      ],
      faqs: [
        {
          q: 'Can I use the automated e-Gates at Bali Airport with an e-VOA?',
          a: 'Yes. Travelers holding a biometric passport and a pre-approved e-VOA can use the automated immigration e-Gates at Bali Ngurah Rai and Jakarta Soekarno-Hatta airports.'
        }
      ],
      visaFreeShortStayFor: ['ID', 'SG', 'MY', 'TH', 'VN', 'PH']
    },
    {
      id: 'uk',
      slug: 'uk-eta',
      name: 'United Kingdom',
      shortName: 'UK ETA',
      cleanTitle: 'United Kingdom ETA',
      shortDocName: 'Electronic Travel Authorisation (ETA)',
      region: 'Europe',
      visaType: '2-year multiple-entry digital travel permission',
      categoryBadge: 'ETA',
      govFeeUSD: 26,
      govFeeNative: '£20 GBP statutory fee (approx. US$26 converted)',
      serviceFeeUSD: BASE_SERVICE_FEE_USD,
      priorityFeeUSD: 20,
      standardReviewTime: 'Within 6–12 hours',
      priorityReviewTime: 'Within 2 hours',
      ourHandlingTime: 'Within 6–12 hours (Priority: within 2 hours)',
      govProcessingTime: 'Typically within 3 working days by UK Home Office',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Up to 6 months per visit',
      validity: '2 years (or until passport expires)',
      entryType: 'Multiple entry',
      requiresUploads: true,
      requiresFlightAndHotel: false,
      govPortalName: 'GOV.UK Official ETA Portal',
      govPortal: 'https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Benjamin Davies',
      photoCreditUrl: 'https://unsplash.com/photos/Oja2ty_9ZLM',
      overview: 'Mandatory digital travel permission for visa-exempt nationals (including US, Canadian, Australian, EU, and GCC citizens) visiting England, Scotland, Wales, and Northern Ireland.',
      documents: [
        'Color scan or photo of your biometric passport bio-data page from an eligible visa-exempt country',
        'Digital facial portrait photo on a plain light-colored background'
      ],
      faqs: [
        {
          q: 'What is the official UK government fee for the ETA?',
          a: 'GOV.UK charges £20 GBP (displayed as approximately US$26 at current exchange rates). Our US$59.99 service fee covers document and photo compliance review and guided submission.'
        },
        {
          q: 'Who is eligible for the UK ETA vs. a UK Standard Visitor Visa?',
          a: 'Visa-exempt travelers (such as citizens of the US, Canada, Australia, EU/EEA, Japan, and GCC states) apply online for the UK ETA. Other nationalities require an in-person UK Standard Visitor Visa.'
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
      cleanTitle: 'United States ESTA',
      shortDocName: 'ESTA (Visa Waiver Program)',
      region: 'Americas',
      visaType: '2-year multiple-entry travel authorization',
      categoryBadge: 'ETA',
      govFeeUSD: 40.62,
      govFeeNative: 'US$40.62 statutory CBP fee (effective 16 Oct 2026)',
      serviceFeeUSD: BASE_SERVICE_FEE_USD,
      priorityFeeUSD: 20,
      standardReviewTime: 'Within 6–12 hours',
      priorityReviewTime: 'Within 2 hours',
      ourHandlingTime: 'Within 6–12 hours (Priority: within 2 hours)',
      govProcessingTime: 'Up to 72 hours by U.S. Customs and Border Protection',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Up to 90 days per visit',
      validity: '2 years (or until passport expires)',
      entryType: 'Multiple entry',
      requiresUploads: true,
      requiresFlightAndHotel: true,
      govPortalName: 'U.S. Customs and Border Protection ESTA',
      govPortal: 'https://esta.cbp.dhs.gov',
      image: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Michael Discenza',
      photoCreditUrl: 'https://unsplash.com/photos/5omwAMDxmkU',
      overview: 'Electronic System for Travel Authorization (ESTA) for citizens of Visa Waiver Program countries traveling to the United States for tourism, business, or transit.',
      documents: [
        'Valid e-Passport with electronic chip from a Visa Waiver Program country (bio-page scan required)',
        'U.S. point of contact or hotel address and current employment details'
      ],
      faqs: [
        {
          q: 'Why is the official U.S. ESTA government fee US$40.62?',
          a: 'Effective 16 October 2026, U.S. Customs and Border Protection updated the statutory ESTA total fee to US$40.62. Our US$59.99 service fee is added separately for specialist review and guided filing.'
        },
        {
          q: 'What if my passport country is not in the U.S. Visa Waiver Program?',
          a: 'Travelers whose nationality is not in the Visa Waiver Program cannot use ESTA and must apply for a B1/B2 Visitor Visa through a U.S. Embassy or Consulate.'
        }
      ],
      visaFreeShortStayFor: ['US', 'CA'],
      etaEligibleFor: VWP_COUNTRIES
    },
    {
      id: 'india',
      slug: 'india-evisa',
      name: 'India',
      shortName: 'India',
      cleanTitle: 'India tourist eVisa',
      shortDocName: 'Tourist eVisa (30-Day)',
      region: 'Asia-Pacific',
      visaType: '30-day double-entry electronic tourist visa',
      categoryBadge: 'eVisa',
      govFeeUSD: 25,
      govFeeNative: 'US$25 statutory government fee',
      serviceFeeUSD: BASE_SERVICE_FEE_USD,
      priorityFeeUSD: 20,
      standardReviewTime: 'Within 6–12 hours',
      priorityReviewTime: 'Within 2 hours',
      ourHandlingTime: 'Within 6–12 hours (Priority: within 2 hours)',
      govProcessingTime: '72 hours (3 business days) by Indian Bureau of Immigration',
      verifiedDate: '27 Oct 2026',
      maxStay: '30 days',
      validity: '30 days from arrival',
      entryType: 'Double entry',
      requiresUploads: true,
      requiresFlightAndHotel: true,
      govPortalName: 'Government of India e-Visa Portal',
      govPortal: 'https://indianvisaonline.gov.in/evisa/',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Sylwia Bartyzel',
      photoCreditUrl: 'https://unsplash.com/photos/eU4pipU_8HA',
      overview: 'Electronic Tourist Visa (e-TV) for international travelers visiting India for sightseeing, recreation, or visiting friends and relatives.',
      documents: [
        'Clear color scan of passport bio-data page (6+ months validity and 2 blank pages)',
        'Square digital portrait photo on a plain white background',
        'Expected port of arrival and hotel/reference address in India'
      ],
      faqs: [
        {
          q: 'How far in advance should I apply for the India 30-day eVisa?',
          a: 'Applications for the 30-day Tourist eVisa are filed within 30 days of your expected arrival date and at least 4 days before departure.'
        }
      ],
      visaFreeShortStayFor: ['IN', 'NP', 'BT'],
      embassyRequiredFor: ['PK']
    },
    {
      id: 'singapore',
      slug: 'singapore-arrival-card',
      name: 'Singapore',
      shortName: 'Singapore SGAC',
      cleanTitle: 'Singapore digital arrival card (SGAC)',
      shortDocName: 'Digital Arrival Card (SGAC)',
      region: 'Asia-Pacific',
      visaType: 'Mandatory pre-arrival declaration & health form',
      categoryBadge: 'Arrival Card',
      govFeeUSD: 0,
      govFeeNative: 'Free (US$0 on official ICA portal)',
      serviceFeeUSD: BASE_SERVICE_FEE_USD,
      priorityFeeUSD: 15,
      standardReviewTime: 'Within 4–6 hours',
      priorityReviewTime: 'Within 1 hour',
      ourHandlingTime: 'Within 4–6 hours (Priority: within 1 hour)',
      govProcessingTime: 'Submitted within the 72-hour pre-arrival window',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Per entry eligibility',
      validity: 'Single arrival trip',
      entryType: 'Single arrival declaration',
      requiresUploads: false,
      requiresFlightAndHotel: true,
      govPortalName: 'Singapore Immigration & Checkpoints Authority (ICA)',
      govPortal: 'https://eservices.ica.gov.sg/sgarrivalcard',
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Hu Chen',
      photoCreditUrl: 'https://unsplash.com/photos/d6ebY-faOO0',
      overview: 'Mandatory electronic arrival card and health declaration required for visitors arriving in Singapore. Free on the official ICA website, or pre-schedule anytime with our assistance service.',
      documents: [
        'Passport details (valid at least 6 months beyond arrival)',
        'Arrival flight number or land/sea checkpoint details',
        'Hotel or accommodation address in Singapore'
      ],
      faqs: [
        {
          q: 'Is the Singapore Arrival Card (SGAC) a visa?',
          a: 'No. The SGAC is a mandatory pre-arrival declaration, not a visa. Official submission at eservices.ica.gov.sg is free (US$0). Our US$59.99 fee is for optional early scheduling and document review.'
        }
      ],
      visaFreeShortStayFor: ['SG']
    },
    {
      id: 'cambodia',
      slug: 'cambodia-evisa',
      name: 'Cambodia',
      shortName: 'Cambodia',
      cleanTitle: 'Cambodia tourist eVisa',
      shortDocName: 'Tourist eVisa (Type T)',
      region: 'Asia-Pacific',
      visaType: '30-day single-entry electronic tourist visa',
      categoryBadge: 'eVisa',
      govFeeUSD: 30,
      govFeeNative: 'US$30 statutory government fee',
      serviceFeeUSD: BASE_SERVICE_FEE_USD,
      priorityFeeUSD: 20,
      standardReviewTime: 'Within 6–12 hours',
      priorityReviewTime: 'Within 2 hours',
      ourHandlingTime: 'Within 6–12 hours (Priority: within 2 hours)',
      govProcessingTime: '3 business days by Ministry of Foreign Affairs',
      verifiedDate: '27 Oct 2026',
      maxStay: '30 days',
      validity: '90 days from issue date',
      entryType: 'Single entry',
      requiresUploads: true,
      requiresFlightAndHotel: true,
      govPortalName: 'Kingdom of Cambodia Official e-Visa Portal',
      govPortal: 'https://www.evisa.gov.kh',
      image: 'https://images.unsplash.com/photo-1569683795645-b62e50fbf103?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1569683795645-b62e50fbf103?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'vickholius nugroho',
      photoCreditUrl: 'https://unsplash.com/photos/jt6QxZwSOCQ',
      overview: 'Official Type-T electronic tourist visa for visiting Siem Reap (Angkor Wat), Phnom Penh, and Sihanoukville.',
      documents: [
        'Passport bio-page scan (valid at least 6 months from entry)',
        'Digital passport-style color portrait photo',
        'Port of entry and hotel address in Cambodia'
      ],
      faqs: [
        {
          q: 'Which airports accept the Cambodia eVisa?',
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
      cleanTitle: 'UAE tourist eVisa',
      shortDocName: 'Tourist eVisa (30-Day)',
      region: 'Middle East',
      visaType: '30-day single-entry electronic tourist visa',
      categoryBadge: 'eVisa',
      govFeeUSD: 95,
      govFeeNative: 'AED 350 (approx. US$95 converted) statutory fee',
      serviceFeeUSD: BASE_SERVICE_FEE_USD,
      priorityFeeUSD: 25,
      standardReviewTime: 'Within 6–12 hours',
      priorityReviewTime: 'Within 2 hours',
      ourHandlingTime: 'Within 6–12 hours (Priority: within 2 hours)',
      govProcessingTime: '2–4 working days by UAE ICP / GDRFA',
      verifiedDate: '27 Oct 2026',
      maxStay: '30 days',
      validity: '60 days from issue date',
      entryType: 'Single entry',
      requiresUploads: true,
      requiresFlightAndHotel: true,
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
        'Return flight and hotel booking details in the UAE'
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
      cleanTitle: 'Saudi Arabia tourist eVisa',
      shortDocName: 'Tourist eVisa (1-Year Multiple Entry)',
      region: 'Middle East',
      visaType: '1-year multiple-entry electronic tourist visa',
      categoryBadge: 'eVisa',
      govFeeUSD: 108,
      govFeeNative: 'SAR 395 incl. mandatory health insurance (approx. US$108 converted)',
      serviceFeeUSD: BASE_SERVICE_FEE_USD,
      priorityFeeUSD: 25,
      standardReviewTime: 'Within 6–12 hours',
      priorityReviewTime: 'Within 2 hours',
      ourHandlingTime: 'Within 6–12 hours (Priority: within 2 hours)',
      govProcessingTime: '24–72 hours by Saudi Ministry of Tourism',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Up to 90 days per visit',
      validity: '1 year',
      entryType: 'Multiple entry',
      requiresUploads: true,
      requiresFlightAndHotel: true,
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
          q: 'Does the government fee include Saudi medical insurance?',
          a: 'Yes. The statutory Saudi eVisa fee (approx. SAR 395 / US$108 converted) includes both the government visa fee and mandatory emergency medical insurance.'
        }
      ],
      visaFreeShortStayFor: GCC_COUNTRIES
    },
    {
      id: 'turkey',
      slug: 'turkey-evisa',
      name: 'Türkiye',
      shortName: 'Türkiye',
      cleanTitle: 'Türkiye electronic visa',
      shortDocName: 'Electronic Visa (e-Visa)',
      region: 'Europe',
      visaType: 'Electronic entry visa for tourism or business',
      categoryBadge: 'eVisa',
      govFeeUSD: 52,
      govFeeNative: 'US$51.50 statutory government fee',
      serviceFeeUSD: BASE_SERVICE_FEE_USD,
      priorityFeeUSD: 20,
      standardReviewTime: 'Within 6–12 hours',
      priorityReviewTime: 'Within 2 hours',
      ourHandlingTime: 'Within 6–12 hours (Priority: within 2 hours)',
      govProcessingTime: '24–48 hours by Turkish Ministry of Foreign Affairs',
      verifiedDate: '27 Oct 2026',
      maxStay: '30 to 90 days (by nationality)',
      validity: '180 days',
      entryType: 'Single or multiple entry',
      requiresUploads: true,
      requiresFlightAndHotel: true,
      govPortalName: 'Republic of Türkiye e-Visa System',
      govPortal: 'https://www.evisa.gov.tr',
      image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Anna Berdnik',
      photoCreditUrl: 'https://unsplash.com/photos/0n0AHB1fgTQ',
      overview: 'Electronic entry visa for eligible tourists and business visitors traveling to Istanbul, Cappadocia, and Antalya.',
      documents: [
        'Valid passport bio-page scan (6+ months validity)',
        'Supporting valid visa or residence permit from US, UK, Ireland, or Schengen (for conditional nationalities such as India, Pakistan, and Egypt)'
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
      cleanTitle: 'Egypt tourist eVisa',
      shortDocName: 'Tourist eVisa (Single Entry)',
      region: 'Africa',
      visaType: '30-day single-entry electronic tourist visa',
      categoryBadge: 'eVisa',
      govFeeUSD: 25,
      govFeeNative: 'US$25 statutory government fee',
      serviceFeeUSD: BASE_SERVICE_FEE_USD,
      priorityFeeUSD: 20,
      standardReviewTime: 'Within 6–12 hours',
      priorityReviewTime: 'Within 2 hours',
      ourHandlingTime: 'Within 6–12 hours (Priority: within 2 hours)',
      govProcessingTime: '5–7 business days by Egypt Ministry of Interior',
      verifiedDate: '27 Oct 2026',
      maxStay: '30 days',
      validity: '90 days from issue date',
      entryType: 'Single entry',
      requiresUploads: true,
      requiresFlightAndHotel: true,
      govPortalName: 'Arab Republic of Egypt Visa2Egypt Portal',
      govPortal: 'https://visa2egypt.gov.eg',
      image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Spencer Davis',
      photoCreditUrl: 'https://unsplash.com/photos/ONVA6s03hg8',
      overview: 'Official electronic tourist visa for travelers visiting Cairo, the Pyramids of Giza, Luxor, Aswan, and Red Sea resorts.',
      documents: [
        'Color scan of passport bio-data page (at least 6 months validity from arrival)',
        'Digital portrait photo and hotel reservation or host address in Egypt'
      ],
      faqs: [
        {
          q: 'When should I submit my Egypt eVisa application?',
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
      cleanTitle: 'Kenya electronic travel authorisation (eTA)',
      shortDocName: 'Electronic Travel Authorisation (eTA)',
      region: 'Africa',
      visaType: '90-day single-entry pre-travel clearance',
      categoryBadge: 'ETA',
      govFeeUSD: 34,
      govFeeNative: 'US$32.50 + portal processing fee (approx. US$34)',
      serviceFeeUSD: BASE_SERVICE_FEE_USD,
      priorityFeeUSD: 20,
      standardReviewTime: 'Within 6–12 hours',
      priorityReviewTime: 'Within 2 hours',
      ourHandlingTime: 'Within 6–12 hours (Priority: within 2 hours)',
      govProcessingTime: '3 business days by Kenya Directorate of Immigration',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Up to 90 days',
      validity: '90 days',
      entryType: 'Single entry',
      requiresUploads: true,
      requiresFlightAndHotel: true,
      govPortalName: 'Republic of Kenya Official eTA Portal',
      govPortal: 'https://etakenya.go.ke',
      image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Damian Patkowski',
      photoCreditUrl: 'https://unsplash.com/photos/T-LfvX-7IVg',
      overview: 'Mandatory pre-travel digital clearance required for international air travelers visiting Nairobi, Maasai Mara, and Mombasa.',
      documents: [
        'Passport bio-page scan (valid at least 6 months past intended arrival)',
        'Digital portrait photo',
        'Flight details and hotel or safari lodge confirmation in Kenya'
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
      id: 'canada',
      slug: 'canada-eta',
      name: 'Canada',
      shortName: 'Canada eTA',
      cleanTitle: 'Canada electronic travel authorization (eTA)',
      shortDocName: 'Electronic Travel Authorization (eTA)',
      region: 'Americas',
      visaType: '5-year multiple-entry air travel authorization',
      categoryBadge: 'ETA',
      govFeeUSD: 5,
      govFeeNative: 'CAD $7 statutory fee (approx. US$5 converted)',
      serviceFeeUSD: BASE_SERVICE_FEE_USD,
      priorityFeeUSD: 20,
      standardReviewTime: 'Within 6–12 hours',
      priorityReviewTime: 'Within 2 hours',
      ourHandlingTime: 'Within 6–12 hours (Priority: within 2 hours)',
      govProcessingTime: 'Typically minutes to 72 hours by IRCC',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Up to 6 months per visit',
      validity: 'Up to 5 years (or until passport expires)',
      entryType: 'Multiple entry',
      requiresUploads: false,
      requiresFlightAndHotel: false,
      govPortalName: 'Government of Canada IRCC eTA Portal',
      govPortal: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html',
      image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Mwangi Gatheca',
      photoCreditUrl: 'https://unsplash.com/photos/qlKaN7eqay8',
      overview: 'Mandatory electronic entry requirement for visa-exempt foreign nationals flying to or transiting through a Canadian airport.',
      documents: [
        'Valid passport details from a visa-exempt country',
        'Current occupation and home address details'
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
      cleanTitle: 'Australia electronic travel authority (ETA)',
      shortDocName: 'Electronic Travel Authority (ETA)',
      region: 'Asia-Pacific',
      visaType: '12-month multiple-entry travel authorization',
      categoryBadge: 'ETA',
      govFeeUSD: 14,
      govFeeNative: 'AUD $20 service charge (approx. US$14 converted)',
      serviceFeeUSD: BASE_SERVICE_FEE_USD,
      priorityFeeUSD: 20,
      standardReviewTime: 'Within 6–12 hours',
      priorityReviewTime: 'Within 2 hours',
      ourHandlingTime: 'Within 6–12 hours (Priority: within 2 hours)',
      govProcessingTime: '24–72 hours by Australian Department of Home Affairs',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Up to 3 months per visit',
      validity: '12 months',
      entryType: 'Multiple entry',
      requiresUploads: true,
      requiresFlightAndHotel: false,
      govPortalName: 'Australian Department of Home Affairs',
      govPortal: 'https://immi.homeaffairs.gov.au',
      image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Dan Freeman',
      photoCreditUrl: 'https://unsplash.com/photos/7Zb7kUyQg1E',
      overview: 'Digital travel authorization for eligible passport holders visiting Sydney, Melbourne, and Brisbane for tourism or short business trips.',
      documents: [
        'Valid passport bio-page scan from an ETA or eVisitor eligible country',
        'Digital facial portrait photo'
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
      name: 'Malaysia',
      shortName: 'Malaysia MDAC',
      cleanTitle: 'Malaysia digital arrival card (MDAC)',
      shortDocName: 'Digital Arrival Card (MDAC)',
      region: 'Asia-Pacific',
      visaType: 'Mandatory pre-arrival digital registration',
      categoryBadge: 'Arrival Card',
      govFeeUSD: 0,
      govFeeNative: 'Free (US$0 on official Immigration portal)',
      serviceFeeUSD: BASE_SERVICE_FEE_USD,
      priorityFeeUSD: 15,
      standardReviewTime: 'Within 4–6 hours',
      priorityReviewTime: 'Within 1 hour',
      ourHandlingTime: 'Within 4–6 hours (Priority: within 1 hour)',
      govProcessingTime: 'Submitted within the 72-hour pre-arrival window',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Per entry exemption',
      validity: 'Single arrival trip',
      entryType: 'Single arrival declaration',
      requiresUploads: false,
      requiresFlightAndHotel: true,
      govPortalName: 'Immigration Department of Malaysia (MDAC)',
      govPortal: 'https://imigresen-online.imi.gov.my/mdac/main',
      image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Esmonde Yong',
      photoCreditUrl: 'https://unsplash.com/photos/oH2r97772_A',
      overview: 'Mandatory pre-arrival digital registration for international visitors entering Malaysia. Free on the official government website, or schedule in advance with our assistance team.',
      documents: [
        'Passport details (valid at least 6 months)',
        'Arrival flight or transport details and accommodation address in Malaysia'
      ],
      faqs: [
        {
          q: 'Is there a government fee for the Malaysia Digital Arrival Card?',
          a: 'No. Filing directly at imigresen-online.imi.gov.my/mdac/main is free (US$0). Our US$59.99 fee covers optional early queuing, document review, and support.'
        }
      ],
      visaFreeShortStayFor: ['MY', 'SG']
    },
    {
      id: 'thailand-evisa',
      slug: 'thailand-evisa',
      name: 'Thailand',
      shortName: 'Thailand eVisa',
      cleanTitle: 'Thailand 60-day tourist eVisa',
      shortDocName: 'Tourist eVisa (60-Day)',
      region: 'Asia-Pacific',
      visaType: '60-day single-entry electronic tourist visa',
      categoryBadge: 'eVisa',
      govFeeUSD: 40,
      govFeeNative: 'US$40 statutory embassy fee',
      serviceFeeUSD: BASE_SERVICE_FEE_USD,
      priorityFeeUSD: 20,
      standardReviewTime: 'Within 6–12 hours',
      priorityReviewTime: 'Within 2 hours',
      ourHandlingTime: 'Within 6–12 hours (Priority: within 2 hours)',
      govProcessingTime: '5–10 business days by Royal Thai Embassy',
      verifiedDate: '27 Oct 2026',
      maxStay: '60 days (extendable by 30 days)',
      validity: '90 days from issue',
      entryType: 'Single entry',
      requiresUploads: true,
      requiresFlightAndHotel: true,
      govPortalName: 'Thai Official Electronic Visa Portal',
      govPortal: 'https://www.thaievisa.go.th',
      image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Mathew Schwartz',
      photoCreditUrl: 'https://unsplash.com/photos/gsllxmVO4HQ',
      overview: 'Electronic 60-day tourist visa for nationalities requiring a pre-arranged visa or travelers planning a longer stay in Thailand.',
      documents: [
        'Passport bio-page scan (valid 6+ months)',
        'Digital passport photo taken within the last 6 months',
        'Confirmed return flight details and hotel address in Thailand'
      ],
      faqs: [
        {
          q: 'Do US, UK, EU, Indian, and Chinese citizens need a Thailand eVisa for short trips?',
          a: 'Over 90 nationalities (including US, UK, EU, Canada, Australia, India, China, and UAE) can enter Thailand visa-free for up to 60 days and only need the mandatory Thailand Digital Arrival Card (TDAC).'
        }
      ],
      visaFreeShortStayFor: ['TH', 'US', 'GB', 'CA', 'AU', 'NZ', 'IN', 'CN', 'HK', 'TW', 'JP', 'KR', 'SG', 'MY', 'ID', 'PH', 'VN', 'BR', 'MX', 'ZA', 'TR', 'IL', ...GCC_COUNTRIES, ...EU_EEA_COUNTRIES]
    },
    {
      id: 'morocco',
      slug: 'morocco-evisa',
      name: 'Morocco',
      shortName: 'Morocco',
      cleanTitle: 'Morocco tourist eVisa',
      shortDocName: 'Tourist eVisa (30-Day)',
      region: 'Africa',
      visaType: '30-day single-entry electronic tourist visa',
      categoryBadge: 'eVisa',
      govFeeUSD: 77,
      govFeeNative: 'MAD 770 statutory fee (approx. US$77 converted)',
      serviceFeeUSD: BASE_SERVICE_FEE_USD,
      priorityFeeUSD: 20,
      standardReviewTime: 'Within 6–12 hours',
      priorityReviewTime: 'Within 2 hours',
      ourHandlingTime: 'Within 6–12 hours (Priority: within 2 hours)',
      govProcessingTime: '3 business days (72 hours) by Moroccan authorities',
      verifiedDate: '27 Oct 2026',
      maxStay: 'Up to 30 days',
      validity: '180 days',
      entryType: 'Single entry',
      requiresUploads: true,
      requiresFlightAndHotel: true,
      govPortalName: 'Kingdom of Morocco Accès Maroc Portal',
      govPortal: 'https://www.acces-maroc.ma',
      image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=800&q=80&fm=webp',
      imageSmall: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=480&q=75&fm=webp',
      photoCredit: 'Toa Heftiba',
      photoCreditUrl: 'https://unsplash.com/photos/i0p916G-7wU',
      overview: 'Electronic tourist visa for eligible nationals visiting Marrakech, Casablanca, and Fez.',
      documents: [
        'Passport bio-page scan (valid 6+ months)',
        'Digital color passport photo (4×3 cm ratio)',
        'Hotel reservation or host address in Morocco'
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
          headline: `With a ${nat.name} passport, you do not need a foreign visitor arrival card for ${dest.name}.`,
          explanation: `No prior visitor arrival card is required.`,
          dest,
          nat
        };
      }
      return {
        status: 'free-arrival-card',
        canApplyOnline: true,
        badgeText: 'Mandatory Pre-Arrival Card (Official Form is Free)',
        badgeClass: 'badge-blue',
        headline: `${nat.name} passport → ${dest.cleanTitle}`,
        explanation: `This digital arrival declaration is required before entry. The official form at ${dest.govPortalName} is free (US$0), or you can use our review and scheduled-submission service (+US$${dest.serviceFeeUSD}).`,
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
          explanation: `Holders of a ${nat.name} passport can travel to ${dest.name} with a valid passport alone.`,
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
          explanation: `Only visa-exempt nationalities qualify for the online ${dest.shortDocName}. With a ${nat.name} passport, you must apply for a visitor visa directly through ${dest.govPortalName}.`,
          dest,
          nat
        };
      }
      return {
        status: 'eta',
        canApplyOnline: true,
        badgeText: 'Electronic Travel Authorization (ETA) Required',
        badgeClass: 'badge-blue',
        headline: `${nat.name} passport → ${dest.cleanTitle} required before boarding`,
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
          explanation: `You do not need a Thailand tourist eVisa for stays up to 60 days. You only need the mandatory Thailand Digital Arrival Card (TDAC), which is US$0 (free) on the official site or US$${BASE_SERVICE_FEE_USD.toFixed(2)} with our review service.`,
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
        explanation: `${nat.name} citizens receive visa-free entry or a free visa on arrival for short tourist visits. You only need a pre-arranged eVisa if you plan an extended stay.`,
        dest,
        nat
      };
    }

    return {
      status: 'evisa',
      canApplyOnline: true,
      badgeText: 'Online eVisa Required Before Travel',
      badgeClass: 'badge-blue',
      headline: `${nat.name} passport → ${dest.cleanTitle}`,
      explanation: dest.overview,
      dest,
      nat
    };
  }

  function roundMoney(n) {
    return Math.round(n * 100) / 100;
  }

  function calculatePrice(destId, travelersCount, speedTier) {
    const dest = DESTINATIONS.find((d) => d.id === destId) || DESTINATIONS[0];
    const count = Math.max(1, Math.min(20, parseInt(travelersCount, 10) || 1));
    const speedFeePerPerson = speedTier === 'priority' ? dest.priorityFeeUSD : 0;
    const govPerPerson = dest.govFeeUSD;
    const servicePerPerson = roundMoney(dest.serviceFeeUSD + speedFeePerPerson);
    const totalPerPerson = roundMoney(govPerPerson + servicePerPerson);
    return {
      dest,
      travelers: count,
      speedTier: speedTier === 'priority' ? 'priority' : 'standard',
      govPerPersonUSD: govPerPerson,
      servicePerPersonUSD: dest.serviceFeeUSD,
      speedPerPersonUSD: speedFeePerPerson,
      totalServicePerPersonUSD: servicePerPerson,
      totalPerPersonUSD: totalPerPerson,
      govTotalUSD: roundMoney(govPerPerson * count),
      baseServiceTotalUSD: roundMoney(dest.serviceFeeUSD * count),
      priorityTotalUSD: roundMoney(speedFeePerPerson * count),
      serviceTotalUSD: roundMoney(servicePerPerson * count),
      grandTotalUSD: roundMoney(totalPerPerson * count)
    };
  }

  function getFlagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  NATIONALITIES.forEach((n) => {
    n.flag = getFlagEmoji(n.code);
  });

  const DEST_COUNTRY_CODES = {
    'vietnam': 'VN',
    'thailand-tdac': 'TH',
    'indonesia': 'ID',
    'uk': 'GB',
    'usa': 'US',
    'india': 'IN',
    'singapore': 'SG',
    'cambodia': 'KH',
    'uae': 'AE',
    'saudi': 'SA',
    'turkey': 'TR',
    'egypt': 'EG',
    'kenya': 'KE',
    'canada': 'CA',
    'australia': 'AU',
    'malaysia': 'MY',
    'thailand-evisa': 'TH',
    'morocco': 'MA'
  };

  DESTINATIONS.forEach((d) => {
    d.countryCode = DEST_COUNTRY_CODES[d.id] || 'UN';
    d.flag = getFlagEmoji(d.countryCode);
  });

  const EXPORT_DATA = {
    baseServiceFeeUSD: BASE_SERVICE_FEE_USD,
    currencies: CURRENCIES,
    nationalities: NATIONALITIES,
    destinations: DESTINATIONS,
    formatMoney,
    evaluateRequirement,
    calculatePrice
  };

  root.ONEPASS_DATA = EXPORT_DATA;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EXPORT_DATA;
  }
})(typeof window !== 'undefined' ? window : globalThis);
