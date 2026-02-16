import { redirect } from 'next/navigation';

export default function CinematicPage() {
  // Redirect to homepage - the cinematic experience is now integrated into the main homepage
  redirect('/');
}
