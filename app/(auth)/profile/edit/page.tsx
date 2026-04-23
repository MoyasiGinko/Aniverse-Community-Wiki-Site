import { redirect } from 'next/navigation';

export default function EditProfilePage() {
  redirect('/settings?tab=profile');
}
