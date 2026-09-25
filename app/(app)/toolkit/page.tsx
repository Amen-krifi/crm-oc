import { getResources, getAnnouncements } from '@/lib/store/committee-store';
import ToolkitComponent from '@/components/toolkit/ToolkitComponent';

export default function ToolkitPage() {
  const resources = getResources();
  const announcements = getAnnouncements();

  return (
    <div>
      <ToolkitComponent initialResources={resources} initialAnnouncements={announcements} />
    </div>
  );
}
