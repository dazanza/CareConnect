# CareConnect Mobile

CareConnect Mobile is a comprehensive healthcare management application built with React Native and TypeScript. It enables patients to manage their medical records, track vital signs, schedule appointments, and communicate with healthcare providers securely.

## Features

- 🏥 **Medical Records Management**
  - View and manage medical history
  - Track lab results
  - Store and organize medical documents
  - Search and filter records

- 📊 **Vitals Tracking**
  - Monitor blood pressure, heart rate, temperature
  - Track oxygen saturation and blood sugar
  - View trends and analytics
  - Set alerts for abnormal values

- 📅 **Appointment Management**
  - Schedule in-person and video appointments
  - View upcoming appointments
  - Receive reminders
  - Manage cancellations and rescheduling

- 🔒 **Security**
  - HIPAA compliant
  - Biometric authentication
  - End-to-end encryption
  - Secure data storage

## Tech Stack

- React Native
- TypeScript
- Next.js
- ShadCN UI
- Supabase
- React Query
- Zod
- Jest

## Prerequisites

- Node.js 18+
- npm or yarn
- iOS Simulator / Android Emulator
- Xcode (for iOS development)
- Android Studio (for Android development)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/careconnect-mobile.git
cd careconnect-mobile
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

6. Run on iOS:
```bash
npm run ios
# or
yarn ios
```

7. Run on Android:
```bash
npm run android
# or
yarn android
```

## Project Structure

```
careconnect-mobile/
├── app/                   # Next.js app directory
├── components/           # Reusable components
├── lib/                  # Core utilities
├── types/               # TypeScript types
├── utils/               # Helper functions
├── documentation/       # Project documentation
├── public/              # Static assets
└── tests/               # Test files
```

## Development

### Code Style

- Use TypeScript for all `.ts` and `.tsx` files
- Follow the established project structure
- Use ShadCN UI components for consistency
- Write unit tests for new features
- Document code changes

### Testing

Run tests:
```bash
npm test
# or
yarn test
```

Run tests with coverage:
```bash
npm test:coverage
# or
yarn test:coverage
```

### Documentation

- Check `documentation/` for detailed guides
- Review `IMPLEMENTATION_PRD.md` for requirements
- See `todolist.md` for project status

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Security

- Follow HIPAA compliance guidelines
- Implement proper authentication
- Use secure data transmission
- Handle sensitive data carefully
- Report security issues privately

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Version Information
Version: 1.0.0
Last Updated: March 2024 