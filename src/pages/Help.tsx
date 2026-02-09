import { Link } from 'react-router-dom'
import { Activity, HelpCircle, Book, Phone, Mail, MessageCircle } from 'lucide-react'

export default function Help() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-cyan-50 dark:to-cyan-950">
            {/* Navigation */}
            <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <Activity className="h-8 w-8 text-primary" />
                            <span className="font-bold text-xl">SEHAI</span>
                        </Link>
                        <Link
                            to="/"
                            className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <HelpCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                        <h1 className="text-4xl font-bold mb-4">Help & Support</h1>
                        <p className="text-lg text-muted-foreground">
                            Find answers to common questions and get support
                        </p>
                    </div>

                    {/* FAQ Section */}
                    <div className="bg-card border rounded-xl p-8 shadow-sm mb-8">
                        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                            <Book className="h-6 w-6 text-primary" />
                            Frequently Asked Questions
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">How do I use voice input?</h3>
                                <p className="text-muted-foreground">
                                    Click the "Voice Input" button next to the symptoms field. Speak clearly in your
                                    preferred language (English, Hindi, or regional languages). The AI will transcribe
                                    and understand your input.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">How do I refer a patient to PHC/CHC?</h3>
                                <p className="text-muted-foreground">
                                    After entering patient details, click the "Refer to PHC" or "Refer to CHC" button.
                                    The system will automatically notify the receiving facility and create a referral
                                    record.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">What languages are supported?</h3>
                                <p className="text-muted-foreground">
                                    SEHAI supports English, Hindi, and major regional languages including Tamil,
                                    Telugu, Bengali, Marathi, and more. The voice assistant can understand and respond
                                    in these languages.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">How do I access patient records?</h3>
                                <p className="text-muted-foreground">
                                    From your dashboard, click on any patient ID or "View Case" button to access
                                    detailed patient records including symptoms, vitals, medical history, and referral
                                    information.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">What if I forget my password?</h3>
                                <p className="text-muted-foreground">
                                    Click on "Forgot Password" on the login page. Enter your registered email address,
                                    and we'll send you instructions to reset your password.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">How does the AI triage system work?</h3>
                                <p className="text-muted-foreground">
                                    The AI analyzes patient symptoms and vital signs to suggest an initial assessment
                                    and priority level. It helps identify urgent cases and provides guidance on
                                    appropriate care or referral.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="bg-card border rounded-xl p-8 shadow-sm">
                        <h2 className="text-2xl font-semibold mb-6">Contact Support</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-6 rounded-lg bg-muted/50">
                                <Phone className="h-8 w-8 text-primary mx-auto mb-3" />
                                <h3 className="font-semibold mb-2">Phone Support</h3>
                                <p className="text-sm text-muted-foreground mb-2">Available 24/7</p>
                                <a href="tel:1800-123-4567" className="text-primary hover:underline">
                                    1800-123-4567
                                </a>
                            </div>

                            <div className="text-center p-6 rounded-lg bg-muted/50">
                                <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
                                <h3 className="font-semibold mb-2">Email Support</h3>
                                <p className="text-sm text-muted-foreground mb-2">Response within 24 hours</p>
                                <a href="mailto:support@sehai.in" className="text-primary hover:underline">
                                    support@sehai.in
                                </a>
                            </div>

                            <div className="text-center p-6 rounded-lg bg-muted/50">
                                <MessageCircle className="h-8 w-8 text-primary mx-auto mb-3" />
                                <h3 className="font-semibold mb-2">Live Chat</h3>
                                <p className="text-sm text-muted-foreground mb-2">Mon-Fri, 9 AM - 6 PM</p>
                                <button className="text-primary hover:underline">Start Chat</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
