
# ClientStream - AI Marketing Automation per Studi Legali

[![License: Proprietario](https://img.shields.io/badge/License-Proprietario-blue.svg)](https://clientstream.legal)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

ClientStream è la prima piattaforma italiana di AI Marketing Automation specializzata per studi legali e consulenti commerciali. Trasforma consulenze in clienti attraverso funnel intelligenti GDPR-compliant.

## ⚖️ Funzionalità Specializzate

### Marketing Automation Legale
- **Funnel Compliance**: Template conformi alla deontologia forense
- **Lead Qualification**: Scoring basato su valore caso e urgenza procedurale
- **GDPR Protection**: Gestione sicura dati sensibili e segreto professionale
- **Legal Templates**: Strutture ottimizzate per divorzio, societario, penale
- **CRM Integration**: Connessione con software gestionali per studi

### AI Settoriale  
- **Prompt Legali**: AI addestrata su terminologia e processi professionali
- **Document Analysis**: Analisi contratti e documentazione legale
- **Case Scoring**: Valutazione automatica potenziale economico pratiche
- **Compliance Check**: Verifica conformità normative deontologiche

### Studi Professionali
- **Multi-Sede**: Gestione network studi e sedi operative
- **White-Label**: Personalizzazione completa con brand studio
- **API Dedicate**: Integrazione con software di settore (Zucchetti, TeamSystem)
- **Analytics Legali**: KPI specifici per performance studio

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for responsive design
- **Shadcn/ui** component library
- **Framer Motion** for animations
- **React Router** for navigation
- **TanStack Query** for data fetching

### Backend & Database
- **Supabase** for backend services
- **PostgreSQL** database with RLS policies
- **Edge Functions** for serverless compute
- **Real-time subscriptions** for live updates

### AI & Servizi Legali
- **OpenAI GPT-4** per generazione contenuti legali
- **Resend** per email professionali
- **Legal APIs** per verifica albi e normative
- **Compliance Engine** per GDPR e deontologia

## 📋 Requisiti

- Node.js 18+ e npm
- Account Supabase
- Chiave API OpenAI
- Licenza studio professionale
- Certificazione GDPR (consigliata)

## 🔧 Installation

1. **Clone del repository**
   ```bash
   git clone https://github.com/clientstream/legal-automation.git
   cd clientstream
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations (see Database Setup)
   - Configure authentication providers

4. **Configure environment variables**
   All sensitive data is managed through Supabase Secrets:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `RESEND_API_KEY`: Your Resend API key
   - `SUPABASE_SERVICE_ROLE_KEY`: Auto-configured by Supabase

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

L'applicazione usa PostgreSQL con politiche RLS per sicurezza. Tabelle principali:

- `profiles`: Profili studi professionali
- `legal_funnels`: Configurazioni funnel settoriali
- `qualified_leads`: Lead qualificati con scoring legale
- `case_analytics`: Analisi performance per tipo pratica
- `compliance_logs`: Audit trail per conformità GDPR
- `legal_templates`: Template specializzati per area diritto

Run the SQL migrations in your Supabase dashboard to set up the database schema.

## 🚦 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── pages/              # Page components
├── types/              # TypeScript type definitions
└── utils/              # Utility functions

supabase/
├── functions/          # Edge functions
└── migrations/         # Database migrations
```

### Componenti Chiave
- **Auth Professionale**: Autenticazione con verifica albo avvocati
- **Studio Dashboard**: Interfaccia principale per studi legali
- **Legal Funnel Builder**: Creazione funnel conformi normative
- **Compliance Center**: Centro controllo conformità GDPR
- **Case Analytics**: Analytics specializzate per performance pratiche

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Write comprehensive tests
- Document complex logic

## 🔐 Security

- All sensitive data managed through Supabase Secrets
- Row Level Security (RLS) policies on all tables
- JWT-based authentication
- Input validation and sanitization
- API rate limiting

## 📊 Monitoring & Analytics

- User behavioral tracking
- Performance metrics
- Error logging
- Usage analytics
- A/B testing capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [documentation](docs/)
- Contact the development team

## 🎯 Roadmap Legale

### Fase 1 (Corrente)
- [x] Funnel specializzati per studi legali
- [x] AI con prompt settoriali
- [x] Analytics per performance casi

### Fase 2 (Prossima)
- [ ] Integrazione software gestionali
- [ ] App mobile per avvocati
- [ ] CRM nativo per studi

### Fase 3 (Futuro)
- [ ] Network studi affiliati
- [ ] Marketplace template legali
- [ ] AI giuridica avanzata

---

**Sviluppato con ⚖️ per gli Studi Professionali Italiani**

*ClientStream - Trasforma consulenze in clienti*
