import { connectMongo } from '../lib/mongo';
import Faq from '../lib/models/Faq';
import Article from '../lib/models/Article';

const defaultFaqs = [
  {
    question: 'What testing services does Envirocare Labs provide?',
    answer: 'Envirocare Labs offers comprehensive testing services including Water Testing (drinking water, FSSAI compliance, swimming pool), Food Testing (across 16+ categories), Environmental Testing (ETP, STP, air quality, noise), and specialized testing for various industries. Our NABL-accredited laboratory ensures accurate and reliable results.',
    category: 'Services'
  },
  {
    question: 'How long does it take to get test results?',
    answer: 'Standard test results are typically available within 3-5 business days. For urgent requirements, we offer express testing services with results in 24-48 hours. Complex or specialized tests may take 7-10 business days. You will receive email notifications when your results are ready.',
    category: 'Timing'
  },
  {
    question: 'How do I schedule a sample collection?',
    answer: 'You can schedule sample collection through our chatbot, by calling our customer service team, or by submitting a request through our website. Our trained technicians will visit your location at your preferred time to collect samples following proper protocols.',
    category: 'Scheduling'
  },
  {
    question: 'What certifications does Envirocare Labs have?',
    answer: 'Envirocare Labs is NABL (National Accreditation Board for Testing and Calibration Laboratories) accredited, ISO 17025 certified, and follows FSSAI guidelines for food testing. We maintain the highest quality standards and participate in regular proficiency testing programs.',
    category: 'Certification'
  },
  {
    question: 'Do you provide reports for regulatory compliance?',
    answer: 'Yes, all our test reports are designed to meet regulatory requirements and are accepted by government agencies, certification bodies, and regulatory authorities. Reports include detailed methodology, results, and compliance status with relevant standards.',
    category: 'Compliance'
  },
  {
    question: 'What is the cost of testing services?',
    answer: 'Testing costs vary based on the type of test, number of parameters, and turnaround time required. We offer competitive pricing and package deals for multiple tests. Please contact us or use our quotation system for detailed pricing information tailored to your specific requirements.',
    category: 'Pricing'
  },
  {
    question: 'Can I track my sample status online?',
    answer: 'Yes, once your sample is registered in our system, you will receive a unique tracking ID. You can use this ID to check the status of your sample, view preliminary results, and download final reports through our online portal.',
    category: 'Tracking'
  },
  {
    question: 'Do you offer on-site testing services?',
    answer: 'Yes, we provide on-site testing services for certain parameters that require immediate analysis or cannot be transported. Our mobile laboratory units are equipped with advanced instruments for field testing of water, air quality, and environmental parameters.',
    category: 'Services'
  },
  {
    question: 'What areas do you serve?',
    answer: 'Envirocare Labs serves clients across India with our main laboratory in [Location]. We have sample collection services in major cities and can arrange logistics for samples from remote locations. International clients can also avail our services through our partner network.',
    category: 'Coverage'
  },
  {
    question: 'How should I prepare samples for testing?',
    answer: 'Sample preparation depends on the type of test. For water samples, use clean, sterile containers provided by us. For food samples, maintain cold chain if required. Our team will provide detailed instructions when you schedule collection, or you can download our sample preparation guide from the website.',
    category: 'Sample Preparation'
  }
];

const defaultArticles = [
  {
    title: 'Understanding Water Quality Parameters: A Comprehensive Guide',
    content: `Water quality testing is essential for ensuring safe drinking water and environmental protection. This guide covers the key parameters tested in water analysis.

**Physical Parameters:**
- pH: Measures acidity or alkalinity (ideal range: 6.5-8.5)
- Turbidity: Indicates water clarity and suspended particles
- Temperature: Affects chemical reactions and biological activity
- Color and Odor: Indicators of contamination or treatment issues

**Chemical Parameters:**
- Total Dissolved Solids (TDS): Measures dissolved minerals and salts
- Hardness: Calcium and magnesium content affecting water use
- Chlorine: Disinfection residual in treated water
- Heavy Metals: Lead, arsenic, mercury, and other toxic elements
- Nitrates and Nitrites: Indicators of agricultural or sewage contamination

**Microbiological Parameters:**
- Total Coliform: Indicates potential fecal contamination
- E. coli: Specific indicator of fecal pollution
- Total Plate Count: Overall bacterial load

**Why Regular Testing Matters:**
Regular water testing helps identify contamination early, ensures compliance with drinking water standards (IS 10500), protects public health, and maintains water treatment system efficiency.

**Testing Frequency:**
- Drinking water: Quarterly for households, monthly for commercial establishments
- Swimming pools: Weekly during operation season
- Industrial water: As per regulatory requirements

For comprehensive water testing services, contact Envirocare Labs. Our NABL-accredited laboratory provides accurate results with detailed analysis reports.`,
    author: 'Envirocare Labs Team',
    tags: ['Water Testing', 'Water Quality', 'Parameters', 'Safety', 'Health']
  },
  {
    title: 'Food Safety Testing: Ensuring Quality from Farm to Table',
    content: `Food safety is paramount in protecting public health and maintaining consumer confidence. Understanding food testing requirements helps businesses comply with regulations and deliver safe products.

**Key Food Testing Categories:**

1. **Microbiological Testing:**
   - Pathogen detection (Salmonella, E. coli, Listeria)
   - Total plate count and yeast/mold analysis
   - Shelf-life studies

2. **Chemical Analysis:**
   - Pesticide residue testing
   - Heavy metal contamination
   - Preservatives and additives verification
   - Nutritional labeling validation

3. **Physical Testing:**
   - Foreign matter detection
   - Texture and consistency analysis
   - Packaging integrity

**FSSAI Compliance:**
The Food Safety and Standards Authority of India (FSSAI) mandates regular testing for food businesses. Requirements vary based on:
- Type of food product
- Scale of operation
- Distribution channels

**Common Tests by Food Category:**

**Dairy Products:**
- Fat content, protein analysis
- Adulterant detection (urea, melamine)
- Antibiotic residues

**Fruits & Vegetables:**
- Pesticide residue screening
- Heavy metal analysis
- Microbial contamination

**Processed Foods:**
- Nutritional profiling
- Preservative levels
- Shelf-life validation

**Benefits of Regular Testing:**
- Ensures product safety and quality
- Maintains regulatory compliance
- Protects brand reputation
- Reduces recall risks
- Builds consumer trust

**Testing Frequency:**
- Raw materials: Every batch or as per risk assessment
- Finished products: Regular sampling based on production volume
- Periodic comprehensive testing: Quarterly or annually

Envirocare Labs offers comprehensive food testing services across all categories with NABL accreditation and FSSAI-compliant reporting.`,
    author: 'Envirocare Labs Team',
    tags: ['Food Testing', 'Food Safety', 'FSSAI', 'Quality Control', 'Compliance']
  },
  {
    title: 'Environmental Testing: Monitoring Air, Water, and Soil Quality',
    content: `Environmental testing plays a crucial role in protecting ecosystems, ensuring regulatory compliance, and safeguarding public health. This guide covers essential environmental monitoring services.

**Air Quality Testing:**

**Ambient Air Monitoring:**
- Particulate Matter (PM2.5, PM10)
- Gaseous pollutants (SO2, NO2, CO, O3)
- Volatile Organic Compounds (VOCs)
- Heavy metals in air

**Indoor Air Quality (IAQ):**
- CO2 levels and ventilation assessment
- Biological contaminants (mold, bacteria)
- Chemical pollutants (formaldehyde, VOCs)
- Temperature and humidity monitoring

**Stack Emission Testing:**
- Industrial chimney emissions
- Compliance with pollution control norms
- Particulate matter and gaseous emissions

**Water Quality Monitoring:**

**Effluent Testing (ETP/STP):**
- BOD (Biological Oxygen Demand)
- COD (Chemical Oxygen Demand)
- pH, TDS, TSS
- Heavy metals and toxic substances
- Compliance with discharge standards

**Groundwater Monitoring:**
- Contamination assessment
- Seasonal variation studies
- Impact of industrial activities

**Soil Testing:**

**Contamination Assessment:**
- Heavy metal analysis
- Petroleum hydrocarbon testing
- Pesticide residues
- pH and nutrient analysis

**Site Investigation:**
- Pre-construction soil analysis
- Contaminated land assessment
- Remediation monitoring

**Noise Level Monitoring:**
- Ambient noise assessment
- Workplace noise exposure
- Construction site monitoring
- Compliance with noise pollution standards

**Regulatory Framework:**
- Central Pollution Control Board (CPCB) guidelines
- State Pollution Control Board requirements
- Environmental Impact Assessment (EIA) norms
- ISO 14001 environmental management standards

**Why Environmental Testing Matters:**
- Ensures regulatory compliance
- Protects worker and public health
- Prevents environmental degradation
- Supports sustainable operations
- Demonstrates corporate responsibility

**Testing Frequency:**
- Continuous monitoring: For critical parameters
- Monthly: Effluent discharge monitoring
- Quarterly: Ambient air and noise monitoring
- Annual: Comprehensive environmental audit

Envirocare Labs provides end-to-end environmental testing services with on-site sampling, advanced laboratory analysis, and detailed compliance reporting.`,
    author: 'Envirocare Labs Team',
    tags: ['Environmental Testing', 'Air Quality', 'Water Quality', 'Soil Testing', 'Compliance']
  },
  {
    title: 'NABL Accreditation: What It Means for Your Test Results',
    content: `NABL (National Accreditation Board for Testing and Calibration Laboratories) accreditation is a mark of quality and reliability in laboratory testing. Understanding its significance helps you make informed decisions.

**What is NABL Accreditation?**

NABL is India's premier accreditation body operating under the Quality Council of India. It accredits laboratories based on ISO/IEC 17025 standards, ensuring:
- Technical competence
- Quality management systems
- Reliable and accurate results
- International recognition

**Benefits of NABL-Accredited Testing:**

1. **Reliability:**
   - Rigorous quality control procedures
   - Regular proficiency testing
   - Validated testing methods
   - Calibrated equipment

2. **Acceptance:**
   - Reports accepted by regulatory authorities
   - Recognized in legal proceedings
   - International mutual recognition
   - Reduces need for retesting

3. **Compliance:**
   - Meets statutory requirements
   - Supports certification processes
   - Facilitates export documentation
   - Ensures audit readiness

**NABL Accreditation Process:**

The accreditation involves:
- Document review of quality systems
- On-site assessment by technical experts
- Evaluation of technical competence
- Proficiency testing participation
- Regular surveillance assessments

**Scope of Accreditation:**

Laboratories are accredited for specific:
- Test methods and parameters
- Types of samples
- Measurement ranges
- Testing standards followed

**Quality Assurance Measures:**

NABL-accredited labs maintain:
- Standard Operating Procedures (SOPs)
- Equipment calibration records
- Quality control charts
- Trained and qualified personnel
- Traceability of measurements
- Document control systems

**How to Verify NABL Accreditation:**

1. Check the NABL logo on test reports
2. Verify certificate number on NABL website
3. Review scope of accreditation
4. Check validity period

**Choosing an NABL-Accredited Laboratory:**

Consider:
- Scope of accreditation matches your needs
- Experience in your industry
- Turnaround time
- Technical expertise
- Customer service

**Envirocare Labs' NABL Accreditation:**

Our laboratory is NABL-accredited for:
- Water and wastewater testing
- Food and agricultural products
- Environmental monitoring
- Chemical analysis

We maintain the highest quality standards through:
- Regular internal audits
- Continuous staff training
- Equipment maintenance programs
- Participation in proficiency testing
- Customer feedback integration

**Conclusion:**

NABL accreditation ensures that your test results are accurate, reliable, and widely accepted. When choosing a testing laboratory, always verify their NABL accreditation status and scope to ensure your specific testing needs are covered.

For NABL-accredited testing services across water, food, and environmental parameters, trust Envirocare Labs for accurate and reliable results.`,
    author: 'Envirocare Labs Team',
    tags: ['NABL', 'Accreditation', 'Quality', 'Standards', 'Certification', 'ISO 17025']
  },
  {
    title: 'Swimming Pool Water Testing: Maintaining Safe and Healthy Water',
    content: `Proper swimming pool water testing is essential for swimmer safety and pool maintenance. This guide covers key parameters and testing frequencies.

**Critical Water Quality Parameters:**

**1. pH Level (7.2-7.8):**
- Affects chlorine effectiveness
- Impacts swimmer comfort
- Influences equipment corrosion
- Test frequency: Daily

**2. Free Chlorine (1-3 ppm):**
- Primary disinfectant
- Kills bacteria and viruses
- Prevents algae growth
- Test frequency: 2-3 times daily

**3. Total Alkalinity (80-120 ppm):**
- Buffers pH changes
- Stabilizes water chemistry
- Prevents pH fluctuations
- Test frequency: Weekly

**4. Calcium Hardness (200-400 ppm):**
- Prevents equipment damage
- Avoids scale formation
- Protects pool surfaces
- Test frequency: Monthly

**5. Cyanuric Acid (30-50 ppm):**
- Protects chlorine from UV degradation
- Stabilizes outdoor pools
- Test frequency: Monthly

**Microbiological Testing:**

**Total Coliform Count:**
- Indicates fecal contamination
- Should be absent in pool water
- Test frequency: Weekly during season

**E. coli:**
- Specific fecal indicator
- Must be zero
- Test frequency: Weekly

**Pseudomonas aeruginosa:**
- Causes skin and ear infections
- Common pool pathogen
- Test frequency: Bi-weekly

**Physical Parameters:**

**Turbidity:**
- Water clarity indicator
- Should allow visibility of main drain
- Test frequency: Daily visual check

**Temperature:**
- Affects chemical balance
- Influences bacterial growth
- Ideal: 26-28°C for recreational pools

**Common Pool Water Problems:**

**Cloudy Water:**
- Causes: Poor filtration, high pH, low chlorine
- Solution: Shock treatment, adjust pH, improve filtration

**Algae Growth:**
- Causes: Low chlorine, poor circulation
- Solution: Algaecide treatment, increase chlorine, brush surfaces

**Eye Irritation:**
- Causes: Incorrect pH, chloramines
- Solution: Balance pH, shock treatment

**Regulatory Requirements:**

**Public Pools:**
- Daily testing and record-keeping
- Weekly microbiological testing
- Monthly comprehensive analysis
- Annual water quality audit

**Residential Pools:**
- Regular testing recommended
- Professional testing quarterly
- Pre-season comprehensive testing

**Testing Methods:**

**On-Site Testing:**
- Test strips for quick checks
- Digital meters for accuracy
- Reagent-based test kits

**Laboratory Testing:**
- Comprehensive parameter analysis
- Microbiological examination
- Compliance reporting

**Best Practices:**

1. **Regular Testing:**
   - Test before opening
   - Test during peak usage
   - Test after heavy rain
   - Test after pool parties

2. **Record Keeping:**
   - Maintain test logs
   - Track chemical additions
   - Document maintenance activities

3. **Professional Testing:**
   - Quarterly laboratory analysis
   - Pre-season comprehensive testing
   - Problem diagnosis

**Water Treatment:**

**Shock Treatment:**
- Weekly during season
- After heavy use
- When water appears cloudy

**Chemical Balance:**
- Adjust pH first
- Then balance chlorine
- Check alkalinity
- Monitor stabilizer levels

**Filtration:**
- Run filter 8-12 hours daily
- Backwash regularly
- Clean filter media seasonally

**Safety Tips:**

- Never mix chemicals
- Add chemicals to water, not vice versa
- Store chemicals properly
- Follow manufacturer instructions
- Keep records of all treatments

**Conclusion:**

Regular swimming pool water testing ensures safe, clean, and enjoyable swimming conditions. Combine daily on-site testing with periodic laboratory analysis for comprehensive water quality management.

Envirocare Labs offers complete swimming pool water testing services including microbiological analysis, chemical parameter testing, and compliance reporting. Contact us for professional pool water testing and consultation.`,
    author: 'Envirocare Labs Team',
    tags: ['Swimming Pool', 'Water Testing', 'Pool Maintenance', 'Safety', 'Chlorine']
  }
];

async function seedKnowledgeBase() {
  try {
    console.log('🌱 Starting knowledge base seeding...');
    
    await connectMongo();
    console.log('✅ Connected to MongoDB');

    // Check if data already exists
    const existingFaqCount = await Faq.countDocuments();
    const existingArticleCount = await Article.countDocuments();

    if (existingFaqCount > 0 || existingArticleCount > 0) {
      console.log(`⚠️  Database already contains ${existingFaqCount} FAQs and ${existingArticleCount} articles`);
      console.log('Do you want to add more data? (This will not delete existing data)');
    }

    // Insert FAQs
    console.log('\n📝 Inserting FAQs...');
    for (const faq of defaultFaqs) {
      const existingFaq = await Faq.findOne({ question: faq.question });
      if (!existingFaq) {
        await Faq.create(faq);
        console.log(`✅ Added FAQ: ${faq.question.substring(0, 50)}...`);
      } else {
        console.log(`⏭️  Skipped existing FAQ: ${faq.question.substring(0, 50)}...`);
      }
    }

    // Insert Articles
    console.log('\n📚 Inserting Articles...');
    for (const article of defaultArticles) {
      const existingArticle = await Article.findOne({ title: article.title });
      if (!existingArticle) {
        await Article.create(article);
        console.log(`✅ Added Article: ${article.title}`);
      } else {
        console.log(`⏭️  Skipped existing Article: ${article.title}`);
      }
    }

    // Summary
    const finalFaqCount = await Faq.countDocuments();
    const finalArticleCount = await Article.countDocuments();

    console.log('\n🎉 Seeding completed successfully!');
    console.log(`📊 Total FAQs in database: ${finalFaqCount}`);
    console.log(`📊 Total Articles in database: ${finalArticleCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding knowledge base:', error);
    process.exit(1);
  }
}

// Run the seed function
seedKnowledgeBase();
