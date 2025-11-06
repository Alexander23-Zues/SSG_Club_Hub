/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Masaguisi National High School - South Bongabong, Oriental Mindoro
*/

import db from './database.js';
import https from 'https';

export class Chatbot {
  static async saveConversation(conversationData) {
    const { user_id, user_message, bot_response, session_id } = conversationData;
    
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO chatbot_conversations (user_id, user_message, bot_response, session_id) 
         VALUES (?, ?, ?, ?)`,
        [user_id, user_message, bot_response, session_id],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...conversationData });
        }
      );
    });
  }

  static async getConversationHistory(userId, sessionId = null, limit = 50) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT * FROM chatbot_conversations 
        WHERE user_id = ?
      `;
      let params = [userId];
      
      if (sessionId) {
        query += ` AND session_id = ?`;
        params.push(sessionId);
      }
      
      query += ` ORDER BY created_at DESC LIMIT ?`;
      params.push(limit);
      
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows.reverse()); // Reverse to show oldest first
      });
    });
  }

  static async getFrequentQuestions() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT user_message, COUNT(*) as frequency 
        FROM chatbot_conversations 
        GROUP BY LOWER(user_message) 
        ORDER BY frequency DESC 
        LIMIT 10
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Google search integration for additional information
  static async searchGoogle(query) {
    try {
      // Simple web search simulation - in production, you'd use Google Custom Search API
      const searchQuery = encodeURIComponent(`${query} Masaguisi National High School South Bongabong Oriental Mindoro Philippines`);
      return `Para sa mas detalyadong impormasyon tungkol sa "${query}", pwede ninyong i-search sa Google: "Masaguisi National High School South Bongabong Oriental Mindoro ${query}" o bisitahin ang official social media pages ng school para sa latest updates! 🔍📱`;
    } catch (error) {
      return "Hindi ko ma-access ang Google search ngayon, pero pwede ninyong i-search manually ang 'Masaguisi National High School South Bongabong Oriental Mindoro' sa Google para sa more information! 🔍";
    }
  }

  // Enhanced rule-based chatbot responses for Masaguisi High School
  static generateResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Greetings - Tagalog and English
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || 
        lowerMessage.includes('kumusta') || lowerMessage.includes('kamusta') || lowerMessage.includes('mabuhay') ||
        lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon') || lowerMessage.includes('magandang umaga')) {
      return "Kumusta! Welcome sa Masaguisi National High School ClubHub! 🏫 Ako ang inyong AI assistant na handang tumulong sa lahat ng tanong tungkol sa aming school sa South Bongabong, Oriental Mindoro at sa aming organization management system. Ano ang maitutulong ko sa inyo ngayong araw? 😊";
    }
    
    // About Masaguisi National High School - Comprehensive information
    if (lowerMessage.includes('masaguisi national high school') || lowerMessage.includes('masaguisi') || 
        (lowerMessage.includes('school') && (lowerMessage.includes('about') || lowerMessage.includes('ano')))) {
      return "🏫 Masaguisi National High School ay isang pampublikong paaralan sa South Bongabong, Oriental Mindoro na nag-aalaga sa mga estudyanteng Grade 7-12. Kilala kami sa: 🌟 Quality education at holistic development 📚 Complete Junior & Senior High programs 🎯 Active student organizations 🏆 Academic at extracurricular achievements 💻 Innovation sa technology tulad ng ClubHub system 🏔️ Beautiful campus environment sa Oriental Mindoro 🌾 Strong agricultural community connections";
    }

    // About the ClubHub system
    if ((lowerMessage.includes('what is') || lowerMessage.includes('about') || lowerMessage.includes('ano ang')) && lowerMessage.includes('clubhub')) {
      return "Ang Masaguisi ClubHub ay isang comprehensive web-based platform para sa pag-manage ng school organizations dito sa Masaguisi National High School sa South Bongabong, Oriental Mindoro. 🏫 Features nito: 👥 Role-based access (Admin, Officer, Member) 📢 Real-time announcements 📅 Event management 🤖 AI chatbot assistant 📊 Reports at analytics 📱 Mobile-responsive design. Ginawa ito para mas organized ang mga club activities sa aming school!";
    }
    
    // FYP specific questions
    if (lowerMessage.includes('fyp') || lowerMessage.includes('final year project') || lowerMessage.includes('thesis') || lowerMessage.includes('capstone')) {
      return "This ClubHub system is a Final Year Project showcasing modern web development practices. Key features include: 🔹 Role-based authentication 🔹 Organization management 🔹 Event & announcement system 🔹 AI chatbot integration 🔹 Responsive design 🔹 Real-time data management. Perfect for demonstrating full-stack development skills!";
    }
    
    // Technology stack
    if (lowerMessage.includes('technology') || lowerMessage.includes('tech stack') || lowerMessage.includes('built with') || lowerMessage.includes('programming language')) {
      return "ClubHub is built with: 🔧 Backend: Node.js + Express.js 🔧 Database: SQLite 🔧 Frontend: Handlebars templating + TailwindCSS 🔧 Authentication: Session-based 🔧 AI: Rule-based chatbot 🔧 Architecture: MVC pattern. A modern, scalable solution for educational institutions!";
    }
    
    // Admin features - Specific matching first
    if (lowerMessage.includes('admin') && (lowerMessage.includes('features') || lowerMessage.includes('can do') || lowerMessage.includes('capabilities') || lowerMessage.includes('role'))) {
      return "Admin superpowers in ClubHub: 👑 Approve/reject officer registrations 🏢 Manage all organizations 👥 Oversee all users (members & officers) 📊 Access comprehensive reports 🗑️ Delete inappropriate content 🔧 System-wide management. Admins ensure smooth operation of the entire platform!";
    }
    
    // Officer features - Specific matching first
    if (lowerMessage.includes('officer') && (lowerMessage.includes('features') || lowerMessage.includes('can do') || lowerMessage.includes('capabilities') || lowerMessage.includes('role'))) {
      return "Officer capabilities in ClubHub: 🏢 Create & manage organizations 👥 Approve/reject member applications 📢 Post announcements 📅 Create events 📊 View member lists 🎯 Build active school communities. Officers are the backbone of student organizations!";
    }
    
    // Member features - Specific matching first
    if (lowerMessage.includes('member') && (lowerMessage.includes('features') || lowerMessage.includes('can do') || lowerMessage.includes('capabilities') || lowerMessage.includes('role'))) {
      return "Member benefits in ClubHub: 🏢 Browse & join organizations 📢 Receive announcements 📅 View upcoming events 👤 Manage personal profile 🎯 Connect with like-minded students 🌟 Participate in school activities. Members make organizations vibrant and active!";
    }
    
    // How to join organizations
    if (lowerMessage.includes('join') && (lowerMessage.includes('organization') || lowerMessage.includes('club'))) {
      return "To join an organization: 1️⃣ Register/Login as a member 2️⃣ Navigate to 'Organizations' page 3️⃣ Browse available clubs 4️⃣ Click 'Join' on your preferred organization 5️⃣ Wait for officer approval 6️⃣ Start participating in events & announcements! 🎉";
    }
    
    // How to create organizations
    if (lowerMessage.includes('create') && (lowerMessage.includes('organization') || lowerMessage.includes('club'))) {
      return "To create an organization: 1️⃣ Register as an officer 2️⃣ Get admin approval for officer status 3️⃣ Go to 'Create Organization' page 4️⃣ Fill out organization details 5️⃣ Submit for admin approval 6️⃣ Once approved, start managing your club! 🚀";
    }
    
    // Registration help - Specific matching
    if ((lowerMessage.includes('register') || lowerMessage.includes('sign up') || lowerMessage.includes('create account')) && (lowerMessage.includes('help') || lowerMessage.includes('how'))) {
      return "Registration made easy: 1️⃣ Visit homepage & click 'Register' 2️⃣ Choose your role (Officer/Member) 3️⃣ Fill personal details (name, email, grade level) 4️⃣ For Grades 11-12: Select your strand 5️⃣ Submit & wait for approval 6️⃣ Check email for confirmation 7️⃣ Start exploring ClubHub! 🎉";
    }
    
    // Login help
    if (lowerMessage.includes('login') || lowerMessage.includes('sign in') || lowerMessage.includes('access') || lowerMessage.includes('log in')) {
      return "Login assistance: 🔐 Use registered email & password 🔄 Forgot password? Contact administrator 🚫 Account not approved? Wait for admin/officer approval 📧 Check email for registration confirmation 💡 Try clearing browser cache if issues persist. Need more help? I'm here! 😊";
    }
    
    // Masaguisi National High School specific information
    if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('saan') || lowerMessage.includes('nasaan')) {
      return "📍 Masaguisi National High School ay matatagpuan sa South Bongabong, Oriental Mindoro, Philippines. Kami ay bahagi ng beautiful province ng Oriental Mindoro, kilala sa agricultural communities, natural resources, at scenic mountain views. Ang aming school ay strategically located para ma-serve ang mga estudyante sa buong South Bongabong area at neighboring barangays. 🏔️🌾";
    }

    // School history and achievements
    if (lowerMessage.includes('history') || lowerMessage.includes('achievement') || lowerMessage.includes('kasaysayan') || lowerMessage.includes('tagumpay')) {
      return "🏆 Masaguisi National High School ay may mataas na reputation sa academic excellence at student development sa South Bongabong, Oriental Mindoro. Kilala kami sa: 📚 Consistent academic performance 🎭 Active participation sa cultural activities 🏅 Sports achievements 🌟 Leadership development programs 💻 Innovation sa technology education 🤝 Strong community partnerships 🌾 Agricultural education programs. Proud kami sa mga graduates na naging successful sa iba't ibang larangan!";
    }

    // Grade levels and strands - Enhanced with Filipino
    if (lowerMessage.includes('grade') || lowerMessage.includes('strand') || lowerMessage.includes('level') || 
        lowerMessage.includes('year') || lowerMessage.includes('anong grade') || lowerMessage.includes('baitang')) {
      return "📚 Masaguisi National High School ay nag-aalaga sa Grade 7-12 students: 🎓 Junior High School: Grades 7-10 (exploratory years) 🎓 Senior High School: Grades 11-12 na may specialized strands: 🔬 STEM (Science, Technology, Engineering, Math) - para sa future scientists at engineers 💼 ABM (Accountancy, Business, Management) - para sa business leaders 📖 HUMSS (Humanities & Social Sciences) - para sa social sciences 🎯 GAS (General Academic Strand) - flexible program 🔧 TVL (Technical-Vocational-Livelihood) - practical skills sa ICT, Home Economics, Industrial Arts, Agriculture (perfect para sa agricultural community ng Oriental Mindoro!)";
    }

    // School facilities and environment
    if (lowerMessage.includes('facilities') || lowerMessage.includes('campus') || lowerMessage.includes('building') || 
        lowerMessage.includes('pasilidad') || lowerMessage.includes('gusali')) {
      return "🏫 Masaguisi National High School facilities: 📚 Well-equipped classrooms 💻 Computer laboratories 🔬 Science laboratories 📖 Library with updated resources 🏃‍♂️ Sports facilities 🎭 Audio-visual rooms 🍽️ Canteen area 🌳 Green campus environment 🚌 Transportation access 🌾 Agricultural demonstration areas 🏔️ Beautiful mountain view surroundings. Lahat ng facilities ay designed para sa comfortable at effective learning experience ng mga estudyante sa Oriental Mindoro!";
    }
    
    // School events and activities - Comprehensive
    if (lowerMessage.includes('event') || lowerMessage.includes('announcement') || lowerMessage.includes('activity') ||
        lowerMessage.includes('programa') || lowerMessage.includes('gawain') || lowerMessage.includes('okasyon')) {
      return "🎉 Masaguisi National High School ay puno ng exciting events at activities! Sa ClubHub makikita ninyo ang: 📢 Daily announcements 📅 Upcoming school events 🎭 Cultural programs 🏆 Academic competitions 🏃‍♂️ Sports tournaments 🎨 Arts festivals 🔬 Science fairs 📚 Reading programs 🤝 Community outreach 🌾 Agricultural shows 🏔️ Environmental programs. Officers pwedeng mag-create ng events, at lahat ng members ay makakakuha ng real-time updates!";
    }

    // School organizations and clubs
    if (lowerMessage.includes('organization') || lowerMessage.includes('club') || lowerMessage.includes('grupo') ||
        lowerMessage.includes('samahan') || lowerMessage.includes('anong clubs')) {
      return "🏢 Sa Masaguisi National High School, maraming active organizations na pwedeng salihan: 📚 Academic clubs (Math, Science, English, Filipino) 🎭 Cultural groups (Drama, Dance, Music) 🏃‍♂️ Sports clubs 🎨 Arts at crafts 💻 Technology clubs 🌱 Environmental groups 🤝 Service organizations 👥 Student government 🌾 Agriculture clubs 🏔️ Mountaineering groups. Sa ClubHub, madaling mag-browse at sumali sa mga organizations na aligned sa inyong interests!";
    }

    // Teachers and staff
    if (lowerMessage.includes('teacher') || lowerMessage.includes('faculty') || lowerMessage.includes('staff') ||
        lowerMessage.includes('guro') || lowerMessage.includes('maestro')) {
      return "👩‍🏫 Masaguisi National High School ay may dedicated at qualified teachers na committed sa student success: 🎓 Licensed professional teachers 📚 Subject matter experts 💡 Innovative teaching methods 🤝 Caring at supportive approach 📈 Continuous professional development 🏆 Award-winning educators 🌾 Agricultural education specialists. Ang mga guro namin ay hindi lang nagtuturo, kundi naging mentors din sa personal growth ng mga estudyante sa Oriental Mindoro!";
    }

    // School schedule and calendar
    if (lowerMessage.includes('schedule') || lowerMessage.includes('calendar') || lowerMessage.includes('time') ||
        lowerMessage.includes('oras') || lowerMessage.includes('takdang-aralin') || lowerMessage.includes('klase')) {
      return "📅 Masaguisi National High School schedule information: 🕐 Regular class hours: 7:00 AM - 5:00 PM 📚 Monday-Friday classes 🎯 Flexible scheduling para sa different strands 📋 Quarterly examination periods 🎉 School breaks at holidays 📢 Special programs at events 🌾 Agricultural practicum schedules. Para sa specific schedules ng mga organizations at events, check ninyo ang ClubHub announcements section!";
    }
    
    // Security and privacy - Specific matching
    if ((lowerMessage.includes('security') || lowerMessage.includes('privacy') || lowerMessage.includes('safe')) && (lowerMessage.includes('features') || lowerMessage.includes('help') || lowerMessage.includes('protection'))) {
      return "ClubHub security features: 🔐 Secure session-based authentication 🛡️ Role-based access control 🔒 Protected user data 👥 Admin oversight of all activities 🚫 Content moderation capabilities 📊 Audit trails for accountability. Your safety and privacy are our priorities!";
    }
    
    // Mobile and accessibility - Specific matching
    if ((lowerMessage.includes('mobile') || lowerMessage.includes('phone') || lowerMessage.includes('responsive')) && (lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('device'))) {
      return "ClubHub mobile experience: 📱 Fully responsive design 💻 Works on all devices (phone, tablet, desktop) 🎨 TailwindCSS ensures beautiful UI 🚀 Fast loading times ♿ Accessible design principles 🔄 Consistent experience across platforms. Access ClubHub anywhere, anytime!";
    }
    
    // Project development
    if (lowerMessage.includes('development') || lowerMessage.includes('code') || lowerMessage.includes('programming') || lowerMessage.includes('architecture')) {
      return "ClubHub development highlights: 💻 MVC architecture for maintainability 🔧 RESTful API design 📦 Modular code structure 🧪 Error handling & validation 📊 Database optimization 🎨 Modern UI/UX principles 🚀 Scalable for future enhancements. A showcase of professional development practices!";
    }
    
    // School information - Enhanced
    if (lowerMessage.includes('masaguisi') || lowerMessage.includes('school') || lowerMessage.includes('institution')) {
      return "About Masaguisi National High School: 🏫 Committed to quality education & student development sa South Bongabong, Oriental Mindoro 🌟 Fostering leadership through organizations 📚 Serving Grades 7-12 with diverse programs 🎯 Supporting student growth through technology 💡 ClubHub represents our commitment to innovation in education 🌾 Strong focus on agricultural education para sa local community!";
    }
    
    // General features overview - After specific role features
    if (lowerMessage.includes('features') || lowerMessage.includes('what can') || lowerMessage.includes('capabilities') || lowerMessage.includes('functions')) {
      return "ClubHub offers comprehensive features: 👥 Multi-role user management (Admin/Officer/Member) 🏢 Organization creation & management 📢 Announcements & events system 🤖 24/7 AI assistant 📊 Admin reports & analytics 🔐 Secure authentication 📱 Mobile-responsive design 🎯 Grade & strand-specific organization";
    }
    
    // Technical support - General help
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('problem') || lowerMessage.includes('error') || lowerMessage.includes('issue')) {
      return "Technical support for ClubHub: 🔧 Common fixes: Clear browser cache, check internet connection, try incognito mode 🔄 Login issues: Verify email/password, contact admin for password reset 📱 Mobile issues: Use updated browser, check responsive design 💬 Still stuck? Use this chatbot or contact system administrator!";
    }
    
    // General registration - After specific registration help
    if (lowerMessage.includes('register') || lowerMessage.includes('sign up') || lowerMessage.includes('account') || lowerMessage.includes('create')) {
      return "Registration made easy: 1️⃣ Visit homepage & click 'Register' 2️⃣ Choose your role (Officer/Member) 3️⃣ Fill personal details (name, email, grade level) 4️⃣ For Grades 11-12: Select your strand 5️⃣ Submit & wait for approval 6️⃣ Check email for confirmation 7️⃣ Start exploring ClubHub! 🎉";
    }
    
    // Thanks and goodbye
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('salamat')) {
      return "You're welcome! Salamat din! I'm always here to help with any questions about Masaguisi National High School ClubHub. Feel free to ask me anything anytime! Have a great day sa South Bongabong, Oriental Mindoro! 😊🎉";
    }
    
    // Enrollment and admission
    if (lowerMessage.includes('enroll') || lowerMessage.includes('admission') || lowerMessage.includes('paano mag-enroll') ||
        lowerMessage.includes('requirements') || lowerMessage.includes('pag-enroll')) {
      return "📝 Masaguisi National High School enrollment information: 📋 Requirements: Birth certificate, Report cards, Good moral certificate 📅 Enrollment period: Usually May-June 🎯 Available slots para sa lahat ng grade levels 💰 Affordable tuition fees 📞 Contact school office para sa specific requirements 🏫 Visit campus sa South Bongabong para sa personal assistance. Para sa Grade 11 students, piliin ang strand na aligned sa future career goals ninyo, especially TVL-Agriculture para sa local opportunities!";
    }

    // School contact and communication
    if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email') ||
        lowerMessage.includes('makipag-ugnayan') || lowerMessage.includes('tawagan')) {
      return "📞 Masaguisi National High School contact information: 🏫 Visit us personally sa South Bongabong, Oriental Mindoro 📧 Official communications through school office 📱 Follow our social media pages para sa updates 💻 Use ClubHub system para sa organization communications 📢 Check school bulletin boards 🤝 Talk to teachers at staff. Para sa urgent concerns, personal visit sa school office ang best option!";
    }

    // Current school year and updates
    if (lowerMessage.includes('current') || lowerMessage.includes('ngayon') || lowerMessage.includes('school year') ||
        lowerMessage.includes('latest') || lowerMessage.includes('update')) {
      return "📅 Current School Year 2024-2025 updates: 🎯 Active enrollment ongoing 📚 Full face-to-face classes 🏆 Various competitions at events 💻 ClubHub system fully operational 📢 Regular announcements sa system 🎉 Exciting programs planned 🤝 Active student organizations. Para sa real-time updates, regular na mag-check sa ClubHub announcements at school bulletin boards!";
    }

    // Weather and location specific
    if (lowerMessage.includes('weather') || lowerMessage.includes('climate') || lowerMessage.includes('panahon') ||
        lowerMessage.includes('oriental mindoro') || lowerMessage.includes('mindoro')) {
      return "🌴 South Bongabong, Oriental Mindoro climate: ☀️ Tropical climate year-round 🌧️ Rainy season: May-October 🌞 Dry season: November-April 🏔️ Beautiful mountain views 🌿 Lush green agricultural environment 🌾 Perfect for farming activities. Perfect environment para sa outdoor school activities, agricultural practicum, at field trips! Always ready lang kayo sa rain gear during rainy season! 🌂";
    }

    // Search suggestion for unknown queries
    if (lowerMessage.includes('search') || lowerMessage.includes('google') || lowerMessage.includes('find') ||
        lowerMessage.includes('hanap') || lowerMessage.includes('hinahanap')) {
      return this.searchGoogle(message);
    }

    // Default response - Enhanced with Filipino
    return "Ako ang inyong Masaguisi National High School ClubHub AI assistant! 🤖 Pwede kong tulungan kayo sa: 🏫 Masaguisi National High School information (South Bongabong, Oriental Mindoro) 🏢 Organization management 👥 User roles at features 📚 Grade levels at strands 🔧 Technical support 💡 System features 📱 Mobile usage 🎓 School activities at events 📞 Contact information 🌾 Agricultural programs. Ano ang gusto ninyong malaman tungkol sa Masaguisi National High School o ClubHub system? Tanong lang kayo! 😊";
  }
}