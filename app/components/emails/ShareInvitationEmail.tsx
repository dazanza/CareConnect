import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'

interface ShareInvitationEmailProps {
  patientName: string
  accessLevel: string
  invitedBy: string
  signUpUrl: string
  expiresInDays?: number
}

export default function ShareInvitationEmail({
  patientName,
  accessLevel,
  invitedBy,
  signUpUrl,
  expiresInDays = 7,
}: ShareInvitationEmailProps) {
  const previewText = `You've been invited by ${invitedBy} to access medical records`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-8 px-4">
            <Heading className="text-2xl font-bold text-gray-900 text-center mb-4">
              Medical Records Access Invitation
            </Heading>
            
            <Section className="bg-gray-50 rounded-lg p-6 mb-6">
              <Text className="text-gray-700 mb-4">
                Hello,
              </Text>
              
              <Text className="text-gray-700 mb-4">
                {invitedBy} has invited you to access medical records for patient <strong>{patientName}</strong>. 
                You will have <strong>{accessLevel}</strong> access to these records.
              </Text>

              <Text className="text-gray-700 mb-6">
                To maintain patient privacy and security, this invitation will expire in {expiresInDays} days.
              </Text>

              <Button
                className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium text-center block w-full"
                href={signUpUrl}
              >
                Accept Invitation
              </Button>
            </Section>

            <Hr className="border-gray-200 my-6" />

            <Text className="text-sm text-gray-500 mb-4">
              If you already have an account, you can sign in directly and the share will be automatically activated.
            </Text>

            <Text className="text-sm text-gray-500">
              If you believe you received this invitation in error, please ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
} 