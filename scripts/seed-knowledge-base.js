const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/envirocare';

// FAQ Schema
const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true, maxlength: 400 },
  answer: { type: String, required: true, trim: true, maxlength: 4000 },
  category: { type: String, trim: true, maxlength: 120 }
}, { timestamps: true });

// Article Schema
const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 240 },
  content: { type: String, required: true, trim: true, maxlength: 100000 },
  author: { type: String, trim: true, maxlength: 160 },
  tags: { type: [String], default: [] }
}, { timestamps: true });

const Faq = mongoose.models.Faq || mongoose.model('Faq', faqSchema);
const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);

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
    answer: 'Envirocare Labs serves clients across India with our main laboratory. We have sample collection services in major cities and can arrange logistics for samples from remote locations. International clients can also avail our services through our partner network.',
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
    title: 'Understanding Water Quality Parameters',
    content: 'Water quality testing is essential for ensuring safe drinking water. Key parameters include pH (6.5-8.5), turbidity, TDS, hardness, chlorine, heavy metals, and microbiological indicators like E. coli. Regular testing helps identify contamination early and ensures compliance with IS 10500 standards. Envirocare Labs provides NABL-accredited water testing services.',
    author: 'Envirocare Labs',
    tags: ['Water Testing', 'Water Quality', 'Safety']
  },
  {
    title: 'Food Safety Testing Guide',
    content: 'Food safety testing protects public health and ensures FSSAI compliance. Key tests include microbiological analysis (pathogens, shelf-life), chemical analysis (pesticides, heavy metals, additives), and physical testing. Regular testing is mandatory for food businesses and helps maintain quality standards from farm to table.',
    author: 'Envirocare Labs',
    tags: ['Food Testing', 'FSSAI', 'Food Safety']
  },
  {
    title: 'Environmental Testing Services',
    content: 'Environmental testing monitors air, water, and soil quality for regulatory compliance. Services include ambient air monitoring (PM2.5, PM10, gases), effluent testing (BOD, COD, heavy metals), soil contamination assessment, and noise level monitoring. Regular testing ensures compliance with CPCB guidelines and protects public health.',
    author: 'Envirocare Labs',
    tags: ['Environmental Testing', 'Air Quality', 'Compliance']
  },
  {
    title: 'NABL Accreditation Explained',
    content: 'NABL accreditation ensures laboratory testing quality and reliability. It signifies technical competence, quality management, and international recognition. NABL-accredited reports are accepted by regulatory authorities and legal proceedings. Envirocare Labs maintains NABL accreditation for water, food, and environmental testing.',
    author: 'Envirocare Labs',
    tags: ['NABL', 'Accreditation', 'Quality']
  },
  {
    title: 'Swimming Pool Water Testing',
    content: 'Pool water testing ensures swimmer safety. Critical parameters include pH (7.2-7.8), free chlorine (1-3 ppm), alkalinity, and microbiological indicators. Test daily during season and maintain proper chemical balance. Professional laboratory testing should be done weekly for public pools and quarterly for residential pools.',
    author: 'Envirocare Labs',
    tags: ['Swimming Pool', 'Water Testing', 'Safety']
  }
];

async function seedKnowledgeBase() {
  try {
    console.log('🌱 Starting knowledge base seeding...');
    console.log('📡 Connecting to MongoDB:', MONGODB_URI.replace(/\/\/.*@/, '//***@'));
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check existing data
    const existingFaqCount = await Faq.countDocuments();
    const existingArticleCount = await Article.countDocuments();

    console.log(`\n📊 Current database status:`);
    console.log(`   FAQs: ${existingFaqCount}`);
    console.log(`   Articles: ${existingArticleCount}`);

    // Insert FAQs
    console.log('\n📝 Inserting FAQs...');
    let faqsAdded = 0;
    let faqsSkipped = 0;
    
    for (const faq of defaultFaqs) {
      const existingFaq = await Faq.findOne({ question: faq.question });
      if (!existingFaq) {
        await Faq.create(faq);
        console.log(`   ✅ Added: ${faq.question.substring(0, 60)}...`);
        faqsAdded++;
      } else {
        console.log(`   ⏭️  Skipped: ${faq.question.substring(0, 60)}...`);
        faqsSkipped++;
      }
    }

    // Insert Articles
    console.log('\n📚 Inserting Articles...');
    let articlesAdded = 0;
    let articlesSkipped = 0;
    
    for (const article of defaultArticles) {
      const existingArticle = await Article.findOne({ title: article.title });
      if (!existingArticle) {
        await Article.create(article);
        console.log(`   ✅ Added: ${article.title}`);
        articlesAdded++;
      } else {
        console.log(`   ⏭️  Skipped: ${article.title}`);
        articlesSkipped++;
      }
    }

    // Summary
    const finalFaqCount = await Faq.countDocuments();
    const finalArticleCount = await Article.countDocuments();

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Seeding completed successfully!');
    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   FAQs added: ${faqsAdded}`);
    console.log(`   FAQs skipped: ${faqsSkipped}`);
    console.log(`   Articles added: ${articlesAdded}`);
    console.log(`   Articles skipped: ${articlesSkipped}`);
    console.log(`\n📊 Total in database:`);
    console.log(`   FAQs: ${finalFaqCount}`);
    console.log(`   Articles: ${finalArticleCount}`);
    console.log('\n✨ Your knowledge base is ready!');
    console.log('🌐 Visit /dashboard/admin/knowledge-base to manage content\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding knowledge base:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. MongoDB is running');
    console.error('   2. MONGODB_URI environment variable is set correctly');
    console.error('   3. You have network access to the database\n');
    process.exit(1);
  }
}

// Run the seed function
seedKnowledgeBase();
