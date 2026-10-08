import Footer from '../components/Footer';
import SuggestionButton from '../components/SuggestionButton';
import Navbar from '../components/Navbar';
import StudentLogin from '../components/StudentLogin';

export default function StudentLoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto flex w-full max-w-5xl flex-1 justify-center px-4 py-10 sm:py-16">
        <StudentLogin />
      </main>
      <div className="pb-2 text-center"><SuggestionButton className="text-sm text-ink-soft underline hover:text-ink" /></div>
      <Footer />
    </div>
  );
}
