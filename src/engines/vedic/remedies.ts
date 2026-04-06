import { Rashi, Nakshatra, DashaPeriod, DashaPlanet, Remedy } from '../../types/astrology';

/**
 * Vedic remedies based on planetary influences.
 *
 * These are presented as "cosmic enhancements" -- ways to align with and amplify
 * beneficial planetary energies, not as fixes for problems.
 *
 * Primary references:
 * - Brihat Parashara Hora Shastra (BPHS)
 * - Lal Kitab
 * - Phaladeepika by Mantreshwara
 */

interface PlanetaryRemedy {
  gemstone: { name: string; description: string };
  mantra: { name: string; description: string };
  color: { name: string; description: string };
  day: { name: string; description: string };
  ritual: { name: string; description: string };
  charity: { name: string; description: string };
}

/**
 * Remedies associated with each Dasha planet.
 * Each entry provides gemstone, mantra, color, favorable day, ritual, and charity recommendations.
 */
const PLANETARY_REMEDIES: Record<DashaPlanet, PlanetaryRemedy> = {
  Sun: {
    gemstone: {
      name: 'Ruby (Manikya)',
      description:
        'Wearing a ruby enhances confidence, vitality, and leadership qualities. Set in gold on the ring finger for maximum solar resonance.',
    },
    mantra: {
      name: 'Om Hraam Hreem Hraum Sah Suryaya Namah',
      description:
        'Chanting the Surya mantra 108 times during sunrise amplifies inner radiance, clarity of purpose, and connection to your highest self.',
    },
    color: {
      name: 'Deep Red / Orange',
      description:
        'Incorporating deep red or bright orange into your attire on Sundays channels the Sun\'s empowering and vitalizing energy.',
    },
    day: {
      name: 'Sunday (Ravivaar)',
      description:
        'Sunday is the Sun\'s day -- ideal for new beginnings, leadership activities, and practices that strengthen self-expression.',
    },
    ritual: {
      name: 'Surya Namaskar at sunrise',
      description:
        'Practicing Sun Salutations at dawn harmonizes body and spirit with solar energy, inviting vitality and clarity into your day.',
    },
    charity: {
      name: 'Donate wheat or jaggery on Sundays',
      description:
        'Sharing wheat, jaggery, or copper items on Sundays amplifies the Sun\'s generous, life-giving blessings in your life.',
    },
  },
  Moon: {
    gemstone: {
      name: 'Pearl (Moti)',
      description:
        'A natural pearl enhances emotional balance, intuition, and inner peace. Set in silver on the little finger to attune with lunar energy.',
    },
    mantra: {
      name: 'Om Shraam Shreem Shraum Sah Chandraya Namah',
      description:
        'Chanting the Chandra mantra 108 times on Monday evenings deepens emotional intelligence, nurturing capacity, and mental serenity.',
    },
    color: {
      name: 'White / Silver',
      description:
        'Wearing white or silver on Mondays invites the Moon\'s calming, receptive, and intuitively empowering vibrations.',
    },
    day: {
      name: 'Monday (Somvaar)',
      description:
        'Monday is the Moon\'s day -- perfect for self-care, emotional reflection, and nurturing your relationships and creative projects.',
    },
    ritual: {
      name: 'Offer milk to a Shiva Lingam',
      description:
        'Offering milk or water to a Shiva Lingam on Mondays cultivates emotional clarity and strengthens your connection to inner peace.',
    },
    charity: {
      name: 'Donate rice or white cloth on Mondays',
      description:
        'Sharing rice, milk, or white fabrics on Mondays enhances the Moon\'s blessings of emotional abundance and mental calm.',
    },
  },
  Mars: {
    gemstone: {
      name: 'Red Coral (Moonga)',
      description:
        'Red coral amplifies courage, physical vitality, and decisive action. Set in gold or copper on the ring finger to channel Mars\'s dynamic energy.',
    },
    mantra: {
      name: 'Om Kraam Kreem Kraum Sah Bhaumaya Namah',
      description:
        'Chanting the Mangal mantra 108 times on Tuesdays strengthens willpower, protective instincts, and the drive to overcome obstacles.',
    },
    color: {
      name: 'Red / Coral',
      description:
        'Wearing red or coral on Tuesdays activates Mars\'s courageous, protective, and energizing vibrations.',
    },
    day: {
      name: 'Tuesday (Mangalvaar)',
      description:
        'Tuesday is Mars\'s day -- ideal for physical challenges, courageous endeavors, and standing firm in your convictions.',
    },
    ritual: {
      name: 'Hanuman Chalisa recitation',
      description:
        'Reciting the Hanuman Chalisa on Tuesdays invokes protective strength, fearless resolve, and the power to overcome any challenge.',
    },
    charity: {
      name: 'Donate red lentils or jaggery on Tuesdays',
      description:
        'Sharing red lentils, jaggery, or red cloth on Tuesdays magnifies Mars\'s gifts of courage, energy, and protective power.',
    },
  },
  Mercury: {
    gemstone: {
      name: 'Emerald (Panna)',
      description:
        'An emerald enhances intellectual clarity, communication skills, and business acumen. Set in gold on the little finger for mercurial brilliance.',
    },
    mantra: {
      name: 'Om Braam Breem Braum Sah Budhaya Namah',
      description:
        'Chanting the Budha mantra 108 times on Wednesdays sharpens intellect, eloquence, and the ability to connect ideas creatively.',
    },
    color: {
      name: 'Green',
      description:
        'Wearing green on Wednesdays aligns with Mercury\'s vibrations of mental agility, adaptability, and clear communication.',
    },
    day: {
      name: 'Wednesday (Budhvaar)',
      description:
        'Wednesday is Mercury\'s day -- perfect for learning, writing, business negotiations, and all forms of creative communication.',
    },
    ritual: {
      name: 'Offer green moong dal at a temple',
      description:
        'Offering green gram (moong dal) at a Vishnu temple on Wednesdays enhances Mercury\'s blessings of wisdom and eloquent speech.',
    },
    charity: {
      name: 'Donate green vegetables or books on Wednesdays',
      description:
        'Sharing green vegetables, books, or educational materials on Wednesdays amplifies Mercury\'s gifts of knowledge and communication.',
    },
  },
  Jupiter: {
    gemstone: {
      name: 'Yellow Sapphire (Pukhraj)',
      description:
        'Yellow sapphire expands wisdom, prosperity, and spiritual growth. Set in gold on the index finger to resonate with Jupiter\'s benevolent energy.',
    },
    mantra: {
      name: 'Om Graam Greem Graum Sah Gurave Namah',
      description:
        'Chanting the Guru mantra 108 times on Thursdays attracts wisdom, prosperity, and the guidance of benevolent teachers.',
    },
    color: {
      name: 'Yellow / Gold',
      description:
        'Wearing yellow or gold on Thursdays attracts Jupiter\'s expansive blessings of abundance, wisdom, and good fortune.',
    },
    day: {
      name: 'Thursday (Guruvaar)',
      description:
        'Thursday is Jupiter\'s day -- ideal for spiritual study, seeking mentorship, and endeavors that expand your horizons.',
    },
    ritual: {
      name: 'Visit a temple and offer yellow flowers',
      description:
        'Offering yellow flowers, turmeric, or bananas at a temple on Thursdays invites Jupiter\'s blessings of growth and spiritual elevation.',
    },
    charity: {
      name: 'Donate yellow items or food to teachers on Thursdays',
      description:
        'Sharing yellow sweets, turmeric, or chana dal on Thursdays magnifies Jupiter\'s gifts of wisdom, abundance, and dharmic living.',
    },
  },
  Venus: {
    gemstone: {
      name: 'Diamond (Heera)',
      description:
        'A diamond enhances love, artistic talent, and material prosperity. Set in platinum or white gold on the middle finger for Venusian grace.',
    },
    mantra: {
      name: 'Om Draam Dreem Draum Sah Shukraya Namah',
      description:
        'Chanting the Shukra mantra 108 times on Fridays elevates creativity, romantic harmony, and appreciation for beauty in all forms.',
    },
    color: {
      name: 'White / Pastel / Pink',
      description:
        'Wearing white, pastel shades, or pink on Fridays invites Venus\'s harmonious, artistic, and love-attracting vibrations.',
    },
    day: {
      name: 'Friday (Shukravaar)',
      description:
        'Friday is Venus\'s day -- perfect for artistic pursuits, romance, beautifying your surroundings, and celebrating life\'s pleasures.',
    },
    ritual: {
      name: 'Offer white flowers to Lakshmi',
      description:
        'Offering white flowers, perfume, or sweets to Goddess Lakshmi on Fridays cultivates love, beauty, and material grace.',
    },
    charity: {
      name: 'Donate white items or sweets on Fridays',
      description:
        'Sharing white silk, sugar, rice, or fragrant items on Fridays amplifies Venus\'s blessings of love, prosperity, and creative abundance.',
    },
  },
  Saturn: {
    gemstone: {
      name: 'Blue Sapphire (Neelam)',
      description:
        'Blue sapphire strengthens discipline, focus, and karmic awareness. Set in silver or iron on the middle finger to channel Saturn\'s transformative power.',
    },
    mantra: {
      name: 'Om Praam Preem Praum Sah Shanaischaraya Namah',
      description:
        'Chanting the Shani mantra 108 times on Saturdays builds inner resilience, patience, and the wisdom born of life\'s deepest lessons.',
    },
    color: {
      name: 'Dark Blue / Black',
      description:
        'Wearing dark blue or black on Saturdays aligns with Saturn\'s energy of discipline, perseverance, and karmic mastery.',
    },
    day: {
      name: 'Saturday (Shanivaar)',
      description:
        'Saturday is Saturn\'s day -- ideal for disciplined practice, long-term planning, and acts of service that build lasting foundations.',
    },
    ritual: {
      name: 'Light a sesame oil lamp for Shani',
      description:
        'Lighting a sesame oil lamp under a Peepal tree on Saturdays transforms challenges into wisdom and strengthens karmic resilience.',
    },
    charity: {
      name: 'Donate black sesame, iron items, or blankets on Saturdays',
      description:
        'Sharing black sesame seeds, iron utensils, or warm blankets on Saturdays invites Saturn\'s blessings of endurance and karmic grace.',
    },
  },
  Rahu: {
    gemstone: {
      name: 'Hessonite Garnet (Gomed)',
      description:
        'Hessonite garnet clarifies ambition, dissolves confusion, and amplifies worldly success. Set in silver on the middle finger for Rahu\'s forward-moving energy.',
    },
    mantra: {
      name: 'Om Bhraam Bhreem Bhraum Sah Rahave Namah',
      description:
        'Chanting the Rahu mantra 108 times on Saturdays harnesses Rahu\'s power to break through limitations and manifest bold aspirations.',
    },
    color: {
      name: 'Smoky Grey / Ultraviolet',
      description:
        'Incorporating smoky grey or deep ultraviolet tones channels Rahu\'s boundary-dissolving, innovation-inspiring vibrations.',
    },
    day: {
      name: 'Saturday (shared with Saturn)',
      description:
        'Saturday evening, during Rahu Kaal, is especially potent for Rahu-aligned practices that expand vision and dissolve limiting patterns.',
    },
    ritual: {
      name: 'Durga Chalisa or Rahu Kaal meditation',
      description:
        'Meditating during Rahu Kaal or reciting Durga Chalisa transforms Rahu\'s restless energy into focused ambition and spiritual insight.',
    },
    charity: {
      name: 'Donate blue or black cloth on Saturdays',
      description:
        'Sharing blue cloth, mustard oil, or coconuts on Saturdays enhances Rahu\'s gifts of innovation, worldly success, and fearless exploration.',
    },
  },
  Ketu: {
    gemstone: {
      name: 'Cat\'s Eye (Lehsunia)',
      description:
        'Cat\'s eye chrysoberyl deepens spiritual perception, protects against hidden obstacles, and strengthens intuitive wisdom. Set in silver on the little finger.',
    },
    mantra: {
      name: 'Om Sraam Sreem Sraum Sah Ketave Namah',
      description:
        'Chanting the Ketu mantra 108 times on Tuesdays or Saturdays awakens spiritual insight, liberation, and profound inner knowing.',
    },
    color: {
      name: 'Grey / Earthy Brown',
      description:
        'Wearing grey or earthy brown tones attunes to Ketu\'s energy of detachment, spiritual wisdom, and transcendent awareness.',
    },
    day: {
      name: 'Tuesday (shared with Mars)',
      description:
        'Tuesday is favorable for Ketu practices -- ideal for meditation, spiritual study, and activities that cultivate inner liberation.',
    },
    ritual: {
      name: 'Ganesha worship or silent meditation',
      description:
        'Worshipping Lord Ganesha or practicing silent meditation on Tuesdays aligns with Ketu\'s gifts of obstacle removal and spiritual awakening.',
    },
    charity: {
      name: 'Donate blankets or sesame to the needy on Tuesdays',
      description:
        'Sharing warm blankets, seven-grain mixtures, or sesame on Tuesdays amplifies Ketu\'s blessings of spiritual liberation and inner peace.',
    },
  },
};

/**
 * Rashi-specific enhancement recommendations.
 */
const RASHI_ENHANCEMENTS: Partial<Record<Rashi, Remedy>> = {
  Mesha: {
    type: 'ritual',
    name: 'Mars-aligned morning practice',
    description:
      'Begin your day with vigorous physical activity and a brief Mars meditation to channel your innate courage and pioneering energy.',
    source: 'Phaladeepika, Chapter 2 (Mars as Mesha lord)',
  },
  Vrishabha: {
    type: 'ritual',
    name: 'Venus-aligned creative ritual',
    description:
      'Engage in artistic or musical activities on Friday evenings to amplify your natural Venusian gifts of beauty and abundance.',
    source: 'Brihat Parashara Hora Shastra, Chapter 3 (Venus as Vrishabha lord)',
  },
  Mithuna: {
    type: 'ritual',
    name: 'Mercury-aligned learning practice',
    description:
      'Dedicate Wednesday mornings to learning something new -- a language, skill, or idea -- to amplify your mercurial gift of communication.',
    source: 'Brihat Parashara Hora Shastra, Chapter 3 (Mercury as Mithuna lord)',
  },
  Karka: {
    type: 'ritual',
    name: 'Moon-aligned nurturing practice',
    description:
      'Practice a calming moonlit meditation on Monday evenings and nurture a garden or creative project to honor your lunar essence.',
    source: 'Phaladeepika, Chapter 2 (Moon as Karka lord)',
  },
  Simha: {
    type: 'ritual',
    name: 'Solar empowerment practice',
    description:
      'Practice Surya Namaskar at sunrise each Sunday and affirm your natural leadership to amplify your radiant solar gifts.',
    source: 'Brihat Parashara Hora Shastra, Chapter 3 (Sun as Simha lord)',
  },
  Kanya: {
    type: 'ritual',
    name: 'Mercury-aligned service practice',
    description:
      'Channel your analytical brilliance into a service-oriented project on Wednesdays to honor your Mercurial precision and care.',
    source: 'Phaladeepika, Chapter 2 (Mercury as Kanya lord)',
  },
  Tula: {
    type: 'ritual',
    name: 'Venus-aligned harmony practice',
    description:
      'Create beauty in your environment on Fridays -- arrange flowers, play music, or meditate on balance to amplify your Venusian grace.',
    source: 'Brihat Parashara Hora Shastra, Chapter 3 (Venus as Tula lord)',
  },
  Vrischika: {
    type: 'ritual',
    name: 'Mars-aligned transformation practice',
    description:
      'Practice deep breathing or journaling on Tuesday evenings to channel your transformative Mars energy into profound self-renewal.',
    source: 'Phaladeepika, Chapter 2 (Mars as Vrischika lord)',
  },
  Dhanu: {
    type: 'ritual',
    name: 'Jupiter-aligned wisdom practice',
    description:
      'Study a philosophical or spiritual text on Thursdays to amplify your Jupiterian wisdom and expansive vision.',
    source: 'Brihat Parashara Hora Shastra, Chapter 3 (Jupiter as Dhanu lord)',
  },
  Makara: {
    type: 'ritual',
    name: 'Saturn-aligned discipline practice',
    description:
      'Set structured intentions on Saturday mornings and commit to a disciplined routine to honor your Saturnian gift of endurance.',
    source: 'Phaladeepika, Chapter 2 (Saturn as Makara lord)',
  },
  Kumbha: {
    type: 'ritual',
    name: 'Saturn-aligned innovation practice',
    description:
      'Dedicate Saturday afternoons to humanitarian projects or innovative ideas that channel your visionary Saturnian energy.',
    source: 'Brihat Parashara Hora Shastra, Chapter 3 (Saturn as Kumbha lord)',
  },
  Meena: {
    type: 'ritual',
    name: 'Jupiter-aligned spiritual practice',
    description:
      'Practice meditation or devotional music on Thursday evenings to deepen your Jupiterian connection to universal compassion.',
    source: 'Phaladeepika, Chapter 2 (Jupiter as Meena lord)',
  },
};

/**
 * Generate personalized Vedic remedies (cosmic enhancements) based on a person's
 * Rashi, Nakshatra, and current Dasha period.
 *
 * These remedies are curated to amplify beneficial energies rather than "fix" problems.
 *
 * @param rashi - The person's Moon sign (Rashi)
 * @param nakshatra - The person's birth Nakshatra
 * @param currentDasha - The currently active Mahadasha period
 * @returns Array of personalized Remedy objects
 */
export function getRemedies(
  rashi: Rashi,
  nakshatra: Nakshatra,
  currentDasha: DashaPeriod,
): Remedy[] {
  const remedies: Remedy[] = [];
  const dashaPlanet = currentDasha.planet;
  const planetRemedy = PLANETARY_REMEDIES[dashaPlanet];

  // Gemstone recommendation for the current Dasha lord
  remedies.push({
    type: 'gemstone',
    name: planetRemedy.gemstone.name,
    description: planetRemedy.gemstone.description,
    source: 'Brihat Parashara Hora Shastra, Chapter 83 (Ratna Adhyaya - Gemstone Chapter)',
  });

  // Mantra for the current Dasha lord
  remedies.push({
    type: 'mantra',
    name: planetRemedy.mantra.name,
    description: planetRemedy.mantra.description,
    source: 'Brihat Parashara Hora Shastra, Chapter 97 (Graha Shanti - Planetary Propitiation)',
  });

  // Favorable color
  remedies.push({
    type: 'color',
    name: planetRemedy.color.name,
    description: planetRemedy.color.description,
    source: 'Phaladeepika by Mantreshwara, Chapter 2 (Planetary Characteristics)',
  });

  // Favorable day
  remedies.push({
    type: 'day',
    name: planetRemedy.day.name,
    description: planetRemedy.day.description,
    source: 'Brihat Parashara Hora Shastra, Chapter 3 (Planetary Portfolios)',
  });

  // Ritual recommendation
  remedies.push({
    type: 'ritual',
    name: planetRemedy.ritual.name,
    description: planetRemedy.ritual.description,
    source: 'Lal Kitab (Remedial Measures)',
  });

  // Charity recommendation
  remedies.push({
    type: 'charity',
    name: planetRemedy.charity.name,
    description: planetRemedy.charity.description,
    source: 'Lal Kitab (Charitable Remedies)',
  });

  // Add Rashi-specific enhancement if available
  const rashiEnhancement = RASHI_ENHANCEMENTS[rashi];
  if (rashiEnhancement) {
    remedies.push(rashiEnhancement);
  }

  return remedies;
}
