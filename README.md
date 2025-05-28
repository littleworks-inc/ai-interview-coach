# 🎯 AI Interview Coach

> An intelligent interview preparation platform that generates personalized interview questions and provides expert guidance based on job descriptions.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)

## 📖 Overview

AI Interview Coach helps job seekers prepare for interviews by:
- Generating tailored interview questions from job descriptions
- Providing expert do's and don'ts guidance
- Offering practice modes with AI-powered feedback
- Tracking progress and improvement over time

## ✨ Features

### Current Features
- **Smart Question Generation**: AI-powered interview questions based on job descriptions
- **Interview Tips & Best Practices**: Comprehensive do's and don'ts guidance (Free for all users)
- **Copy & Share**: Easy sharing of questions and answers
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Processing**: Fast AI-powered question generation

### Coming Soon
- **Ad-Supported Free Tier**: Quality content with relevant career advertisements
- **Resume Analysis**: Upload resume for personalized questions and answers
- **User Accounts**: Save progress and track improvement over time
- **Practice Mode**: Record and analyze your interview answers
- **Premium Subscription**: Ad-free experience with advanced features
- **Rate Limiting**: API protection and usage management

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenRouter API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-interview-coach.git
   cd ai-interview-coach
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenRouter API key
   OPENROUTER_API_KEY=your_api_key_here
   PORT=3000
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```

5. **Open the frontend**
   ```bash
   cd ../frontend
   # Open index.html in your browser or serve with a local server
   python -m http.server 8080  # Python 3
   # or
   npx serve .  # Node.js
   ```

6. **Access the application**
   - Frontend: `http://localhost:8080`
   - Backend API: `http://localhost:3000`

## 🏗️ Project Structure

```
ai-interview-coach/
├── README.md
├── ROADMAP.md
├── .gitignore
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── index.html
    ├── app.js
    └── style.css
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | Yes | - |
| `PORT` | Backend server port | No | 3000 |
| `NODE_ENV` | Environment (development/production) | No | development |

### API Configuration

The application uses OpenRouter's API with the following default model:
- **Model**: `qwen/qwen3-30b-a3b:free`
- **Rate Limit**: No current limits (planned implementation)
- **Timeout**: 30 seconds

## 📊 Usage

### Basic Usage

1. **Paste Job Description**: Copy and paste any job description into the text area
2. **Generate Questions**: Click "Generate Questions" to get AI-powered interview questions
3. **Review Answers**: Each question comes with an example answer
4. **Copy & Practice**: Copy individual Q&As or all questions for practice

### API Usage

```javascript
// Generate interview questions
POST /api/generate
Content-Type: application/json

{
  "model": "qwen/qwen3-30b-a3b:free",
  "messages": [
    {
      "role": "system",
      "content": "You are an AI Interview Coach..."
    },
    {
      "role": "user",
      "content": "Job description here..."
    }
  ]
}
```

## 🔐 Security Features

### Current Security Measures
- Environment variable protection for API keys
- CORS enabled for cross-origin requests
- Basic error handling

### Planned Security Enhancements
- **Rate Limiting**: IP and user-based request limits
- **Input Validation**: Sanitization of all user inputs
- **Authentication**: User accounts with JWT tokens
- **HTTPS**: SSL/TLS encryption
- **CSP**: Content Security Policy headers

## 🛠️ Development

### Running in Development Mode

```bash
# Backend (with auto-restart)
cd backend
npm install -g nodemon
nodemon server.js

# Frontend (with live reload)
cd frontend
npx live-server --port=8080
```

### Code Style & Standards

- **JavaScript**: ES6+ syntax
- **CSS**: Modern CSS with flexbox/grid
- **HTML**: Semantic HTML5
- **API**: RESTful design principles

### Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Check security vulnerabilities
npm audit
```

## 📈 Roadmap

See [ROADMAP.md](ROADMAP.md) for detailed development plans and feature priorities.

### Immediate Priorities (Week 1-2)
- [ ] Rate limiting implementation
- [ ] Input validation and sanitization
- [ ] Error handling improvements
- [ ] Security headers

### Short-term Goals (Week 3-4)
- [ ] Interview tips and best practices
- [ ] User authentication system
- [ ] Database integration
- [ ] Mobile optimization

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow our coding standards
4. **Test your changes**: Ensure everything works
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Contribution Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure security best practices
- Test on multiple browsers/devices

## 📝 API Documentation

### Endpoints

#### POST /api/generate
Generate interview questions based on job description.

**Request:**
```json
{
  "model": "string",
  "messages": [
    {
      "role": "system|user|assistant",
      "content": "string"
    }
  ]
}
```

**Response:**
```json
{
  "choices": [
    {
      "message": {
        "content": "string"
      }
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `400`: Bad Request
- `429`: Rate Limit Exceeded (planned)
- `500`: Internal Server Error

## 🐛 Known Issues

- [ ] Large job descriptions may timeout
- [ ] No rate limiting (security risk)
- [ ] Mobile UI needs optimization
- [ ] No offline capability
- [ ] Error messages could be more user-friendly

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/ai-interview-coach/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/ai-interview-coach/discussions)
- **Email**: support@ai-interview-coach.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenRouter for AI API services
- Inter font family by Rasmus Andersson
- Community contributors and feedback
- Open source libraries and dependencies

## 💼 Pricing & Features

### 🆓 Free Tier (Ad-Supported)
- ✅ **5 interview questions** per month
- ✅ **Unlimited interview tips** and best practices
- ✅ **Copy & share** functionality
- ✅ **Mobile responsive** interface
- ⚠️ **Relevant career ads** displayed
- 📈 **Upgrade prompts** for premium features

### 💎 Premium Tier - $9/month
- ✅ **Everything in Free tier**
- ✅ **NO ADS** - Clean, distraction-free experience
- ✅ **Resume analysis** with personalized questions (50/month)
- ✅ **Practice mode** with answer recording and feedback
- ✅ **Progress tracking** and performance analytics
- ✅ **Industry-specific templates**
- ✅ **Priority customer support**

### 🏢 Enterprise Tier - $29/month
- ✅ **Everything in Premium tier**
- ✅ **Unlimited** questions and resume analysis
- ✅ **Team management** and collaboration features
- ✅ **Custom branding** options
- ✅ **API access** for integrations
- ✅ **Advanced analytics** and reporting
- ✅ **Dedicated account manager**

---

## 📊 Revenue Model

Our sustainable business model combines:
- **Ad Revenue**: Career-relevant advertisements for free users
- **Premium Subscriptions**: Advanced features without ads
- **Enterprise Solutions**: Team and organization features

**Projected Growth**: $1K-3K/month (Month 3) → $15K-30K/month (Month 12)

---

## 🔄 Recent Updates

### v1.0.0 (Current)
- Initial release with basic functionality
- AI-powered question generation
- Responsive web interface
- Copy and share features

### Upcoming v1.1.0
- Rate limiting implementation
- Security enhancements
- Interview tips feature
- Mobile optimizations

---

**Made with ❤️ for job seekers worldwide**